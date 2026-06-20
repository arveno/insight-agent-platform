#!/usr/bin/env python3
# ruff: noqa: E402, I001
from __future__ import annotations

import argparse
import json
import os
import shutil
import socket
import subprocess
import sys
import tempfile
import uuid
from copy import deepcopy
from pathlib import Path
from typing import Any, cast

REPO_ROOT = Path(__file__).resolve().parents[2]
ECS_HOST_CURRENT_ROOT = Path("/opt/insight-agent-platform/current")
RUNTIME_ROOT = REPO_ROOT / "services" / "agent-runtime"
if str(RUNTIME_ROOT) not in sys.path:
    sys.path.insert(0, str(RUNTIME_ROOT))

from fastapi.testclient import TestClient

from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import RuntimeFoundationMysqlCli
from src.infrastructure.model_gateway.gateway import ModelGateway
from src.infrastructure.tool_registry.registry import ToolRegistry
from src.modules.analysis_runs.worker_service import AnalysisRunExecutionWorker

RUNTIME_FOUNDATION_SCRIPT = REPO_ROOT / "scripts" / "migration" / "runtime_foundation.sh"
RUNTIME_EXECUTION_VERIFY_SCRIPT = (
    REPO_ROOT / "scripts" / "migration" / "runtime_execution_verify.sh"
)
MODEL_GATEWAY_FAILURE_VERIFY_SCRIPT = (
    REPO_ROOT / "scripts" / "migration" / "model_gateway_failure_verify.sh"
)
RUNTIME_RESULT_DELIVERY_VERIFY_SCRIPT = (
    REPO_ROOT / "scripts" / "migration" / "runtime_result_delivery_verify.sh"
)
LOGIN_EMAIL = "zoe@northstar.example.com"
LOGIN_PASSWORD = "zoe-password"
DELIVERY_PRODUCER_ID = "delivery-producer-runtime"

TASK_PAYLOAD = {
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": {
        "version": 1,
        "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-12T10:28:00+08:00",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": {
                "type": "analysisTask",
            },
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {
                "key": "this_quarter",
                "label": "2026 Q2",
            },
            "capturedAt": "2026-06-12T10:28:00+08:00",
            "children": [
                {
                    "nodeId": "context-metric-recognized-revenue",
                    "kind": "metric",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                    },
                    "title": "确认收入",
                    "summary": "当前异常指标来源。",
                    "sourceRef": {
                        "type": "metric",
                        "metricId": "metric-recognized-revenue",
                    },
                },
                {
                    "nodeId": "context-table-sales-order",
                    "kind": "dataTable",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                    },
                    "title": "销售订单表",
                    "summary": "用于核对确认收入的订单明细。",
                    "sourceRef": {
                        "type": "dataTable",
                        "tableId": "table-sales-order",
                    },
                },
                {
                    "nodeId": "context-table-refund-order",
                    "kind": "dataTable",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                    },
                    "title": "退款订单表",
                    "summary": "用于排除退款激增是否主导收入异常。",
                    "sourceRef": {
                        "type": "dataTable",
                        "tableId": "table-refund-order",
                    },
                },
                {
                    "nodeId": "context-knowledge-document-channel-weekly-17",
                    "kind": "knowledgeDocument",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                    },
                    "title": "渠道周报第 17 期",
                    "summary": "华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
                    "sourceRef": {
                        "type": "knowledgeDocument",
                        "knowledgeDocumentId": "knowledge-document-channel-weekly-17",
                    },
                },
                {
                    "nodeId": "context-knowledge-document-inventory-east-04",
                    "kind": "knowledgeDocument",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask",
                    },
                    "title": "华东库存复核记录",
                    "summary": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
                    "sourceRef": {
                        "type": "knowledgeDocument",
                        "knowledgeDocumentId": "knowledge-document-inventory-east-04",
                    },
                },
            ],
        },
    },
    "title": "收入增速异常",
}


def load_env_file(env_file: Path) -> None:
    for raw_line in env_file.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ[key.strip()] = value.strip()


def response_json_dict(payload: object) -> dict[str, Any]:
    return cast(dict[str, Any], payload)


def parse_sse_events(response: Any) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    current: dict[str, Any] = {}

    def flush_current() -> None:
        if not current:
            return
        parsed = dict(current)
        if "data" in parsed:
            parsed["json"] = json.loads(parsed["data"])
        events.append(parsed)
        current.clear()

    for line in response.iter_lines():
        if line == "":
            flush_current()
            continue
        key, _, value = line.partition(":")
        current[key] = value.lstrip()
    flush_current()
    return events


def pick_free_port() -> str:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return str(sock.getsockname()[1])


def build_runtime_foundation_env(data_dir: Path) -> dict[str, str]:
    project_suffix = uuid.uuid4().hex[:8]
    mysql_host_port = pick_free_port()
    return {
        "IAP_MIGRATION_TARGET": "local",
        "IAP_MIGRATION_COMPOSE_PROJECT_NAME": f"iap-runtime-delivery-smoke-{project_suffix}",
        "IAP_MIGRATION_DATA_DIR": str(data_dir),
        "IAP_MIGRATION_MYSQL_HOST_PORT": mysql_host_port,
        "MYSQL_HOST": "127.0.0.1",
        "MYSQL_PORT": mysql_host_port,
        "MYSQL_DATABASE": "insight_agent_platform",
        "MYSQL_USER": "iap_preview",
        "MYSQL_PASSWORD": "iap_preview_password",
    }


def run_runtime_foundation_command(
    *args: str,
    env_overrides: dict[str, str],
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    env = os.environ.copy()
    env.update(env_overrides)
    return subprocess.run(
        [str(RUNTIME_FOUNDATION_SCRIPT), *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=check,
        env=env,
    )


def login_client(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": LOGIN_EMAIL, "password": LOGIN_PASSWORD},
    )
    if response.status_code != 200:
        raise RuntimeError(f"auth/login failed: {response.status_code} {response.text}")


def submit_and_dispatch(client: TestClient) -> tuple[str, str]:
    submit_response = client.post("/analysis-tasks/submit", json=deepcopy(TASK_PAYLOAD))
    if submit_response.status_code != 201:
        raise RuntimeError(
            f"analysis-tasks/submit failed: {submit_response.status_code} {submit_response.text}"
        )
    submit_payload = response_json_dict(submit_response.json())
    run_id = cast(str, submit_payload["analysisRun"]["runId"])
    conversation_id = cast(str, submit_payload["conversation"]["conversationId"])

    dispatch_response = client.post(f"/analysis-runs/{run_id}/dispatch")
    if dispatch_response.status_code != 202:
        raise RuntimeError(
            f"analysis-runs/{run_id}/dispatch failed: "
            f"{dispatch_response.status_code} {dispatch_response.text}"
        )

    return run_id, conversation_id


def build_worker() -> AnalysisRunExecutionWorker:
    settings = get_settings()
    return AnalysisRunExecutionWorker(
        database=RuntimeFoundationMysqlCli(),
        model_gateway=ModelGateway(settings=settings.model_gateway),
        tool_registry=ToolRegistry(),
    )


def missing_provider_env() -> list[str]:
    active_provider = os.environ.get("IAP_MODEL_ACTIVE_PROVIDER", "").strip()
    if not active_provider:
        return ["IAP_MODEL_ACTIVE_PROVIDER"]

    provider_prefix = f"IAP_MODEL_PROVIDER_{active_provider.upper()}"
    required_keys = [
        "IAP_MODEL_ACTIVE_PROVIDER",
        f"{provider_prefix}_API_KEY",
        f"{provider_prefix}_BASE_URL",
        f"{provider_prefix}_DEFAULT_MODEL",
    ]
    return [key for key in required_keys if not os.environ.get(key, "").strip()]


def guard_ecs_host_full_smoke() -> int | None:
    if REPO_ROOT != ECS_HOST_CURRENT_ROOT:
        return None

    if os.environ.get("IAP_ALLOW_ECS_HOST_FULL_SMOKE", "").strip() == "1":
        return None

    print("status=blocked reason=preview_small_ecs_host_full_smoke_denied", file=sys.stderr)
    print("当前 ECS preview-small 禁止 host-side full runtime smoke。", file=sys.stderr)
    print(
        "请在本机运行，或显式设置 IAP_ALLOW_ECS_HOST_FULL_SMOKE=1 由 human 授权。",
        file=sys.stderr,
    )
    return 2


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Local smoke for #233a MessageStream replay, #232 delivery promotion, "
            "and #248 structured failure verification."
        )
    )
    parser.add_argument(
        "--env-file", type=Path, help="Optional env file with real provider config."
    )
    parser.add_argument(
        "--keep-db", action="store_true", help="Keep local MySQL container after run."
    )
    args = parser.parse_args()

    blocked = guard_ecs_host_full_smoke()
    if blocked is not None:
        return blocked

    if args.env_file is not None:
        if not args.env_file.exists():
            print(f"status=missing_env_file path={args.env_file}", file=sys.stderr)
            return 2
        load_env_file(args.env_file)

    missing_keys = missing_provider_env()
    if missing_keys:
        print(
            "status=skipped reason=missing_real_model_provider_config "
            f"missing_keys={','.join(missing_keys)}"
        )
        return 0

    temp_dir = Path(tempfile.mkdtemp(prefix="iap-runtime-delivery-smoke-"))
    env_overrides = build_runtime_foundation_env(temp_dir / "mysql-data")
    os.environ.update(env_overrides)
    get_settings.cache_clear()

    try:
        migrate_result = run_runtime_foundation_command("migrate", env_overrides=env_overrides)
        if migrate_result.returncode != 0:
            print(migrate_result.stderr, file=sys.stderr)
            return migrate_result.returncode

        seed_result = run_runtime_foundation_command("seed", env_overrides=env_overrides)
        if seed_result.returncode != 0:
            print(seed_result.stderr, file=sys.stderr)
            return seed_result.returncode

        with TestClient(create_app()) as client:
            login_client(client)
            run_id, conversation_id = submit_and_dispatch(client)

            execution_result = build_worker().execute_run(run_id)
            execution_attempt = execution_result["executionAttempt"]
            verify_env = os.environ.copy()
            verify_env.update(env_overrides)
            verify_env["IAP_RUNTIME_VERIFY_RUN_ID"] = run_id
            if (
                execution_result["analysisRun"]["status"] != "running"
                or execution_result["analysisRun"]["phase"] != "synthesis"
                or execution_attempt["status"] != "released"
            ):
                failure_verify_result = subprocess.run(
                    [str(MODEL_GATEWAY_FAILURE_VERIFY_SCRIPT)],
                    cwd=REPO_ROOT,
                    text=True,
                    capture_output=True,
                    check=False,
                    env=verify_env,
                )
                if failure_verify_result.stdout:
                    print(failure_verify_result.stdout, end="")
                if failure_verify_result.stderr:
                    print(failure_verify_result.stderr, file=sys.stderr, end="")
                return failure_verify_result.returncode or 1

            pre_delivery_messages = response_json_dict(
                client.get(f"/conversations/{conversation_id}/messages").json()
            )["items"]
            pre_delivery_conversations = response_json_dict(client.get("/conversations").json())[
                "items"
            ]
            pre_delivery_projection = next(
                item
                for item in pre_delivery_conversations
                if item["conversationId"] == conversation_id
            )
            assistant_message = next(
                message
                for message in pre_delivery_messages
                if message["messageId"] == pre_delivery_projection["latestAssistantMessageId"]
            )
            pre_delivery_replay_items = response_json_dict(
                client.get(
                    f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
                    headers={"accept": "application/json"},
                ).json()
            )["items"]
            if not pre_delivery_replay_items:
                raise RuntimeError("MessageStream replay returned no persisted rows before delivery.")

            execution_verify_result = subprocess.run(
                [str(RUNTIME_EXECUTION_VERIFY_SCRIPT)],
                cwd=REPO_ROOT,
                text=True,
                capture_output=True,
                check=False,
                env=verify_env,
            )
            if execution_verify_result.stdout:
                print(execution_verify_result.stdout, end="")
            if execution_verify_result.returncode != 0:
                if execution_verify_result.stderr:
                    print(execution_verify_result.stderr, file=sys.stderr)
                return execution_verify_result.returncode

            delivery_response = client.post(
                f"/analysis-runs/{run_id}/delivery/complete",
                json={"producerId": DELIVERY_PRODUCER_ID},
            )
            if delivery_response.status_code != 202:
                raise RuntimeError(
                    f"analysis-runs/{run_id}/delivery/complete failed: "
                    f"{delivery_response.status_code} {delivery_response.text}"
                )

            source_evidence_items = response_json_dict(
                client.get(f"/analysis-runs/{run_id}/source-evidence").json()
            )["items"]
            report_items = response_json_dict(
                client.get(f"/analysis-runs/{run_id}/reports").json()
            )["items"]
            decision_items = response_json_dict(
                client.get(f"/analysis-runs/{run_id}/decisions").json()
            )["items"]
            message_items = response_json_dict(
                client.get(f"/conversations/{conversation_id}/messages").json()
            )["items"]
            post_delivery_conversations = response_json_dict(client.get("/conversations").json())[
                "items"
            ]
            post_delivery_projection = next(
                item
                for item in post_delivery_conversations
                if item["conversationId"] == conversation_id
            )
            final_assistant_message = next(
                message
                for message in message_items
                if message["messageId"] == post_delivery_projection["latestAssistantMessageId"]
            )
            post_delivery_replay_items = response_json_dict(
                client.get(
                    f"/conversations/{conversation_id}/messages/{final_assistant_message['messageId']}/stream",
                    headers={"accept": "application/json"},
                ).json()
            )["items"]
            with client.stream(
                "GET",
                (
                    f"/conversations/{conversation_id}/messages/"
                    f"{final_assistant_message['messageId']}/stream"
                ),
                headers={"accept": "text/event-stream"},
            ) as sse_response:
                if sse_response.status_code != 200:
                    raise RuntimeError(
                        "message stream SSE replay failed: "
                        f"{sse_response.status_code} {sse_response.text}"
                    )
                sse_events = parse_sse_events(sse_response)

        analysis_run = response_json_dict(delivery_response.json())
        sse_terminal_events = [
            event["event"]
            for event in sse_events
            if event["event"] in {"stream.completed", "stream.failed", "stream.cancelled"}
        ]
        print(f"runId={analysis_run['runId']}")
        print(f"status={analysis_run['status']}")
        print(f"phase={analysis_run['phase']}")
        print(f"executionAttempt.status={execution_attempt['status']}")
        print(f"sourceEvidenceCount={len(source_evidence_items)}")
        print(f"reportCount={len(report_items)}")
        print(f"decisionCount={len(decision_items)}")
        print(f"preDeliveryMessageStreamCount={len(pre_delivery_replay_items)}")
        print(f"postDeliveryMessageStreamCount={len(post_delivery_replay_items)}")
        print(f"sseReplayCount={len(sse_events)}")
        print(f"sseFirstEvent={sse_events[0]['event'] if sse_events else '<none>'}")
        print(
            "sseTerminalEvent="
            f"{sse_terminal_events[0] if len(sse_terminal_events) == 1 else '<invalid>'}"
        )
        print(f"assistantMessageId={assistant_message['messageId']}")
        print(f"assistantMessageIdAfterDelivery={final_assistant_message['messageId']}")
        print(
            "conversationListAssistantMessageIdBeforeDelivery="
            f"{pre_delivery_projection['latestAssistantMessageId']}"
        )
        print(
            "conversationListAssistantMessageIdAfterDelivery="
            f"{post_delivery_projection['latestAssistantMessageId']}"
        )
        print(
            "assistantMessageCount="
            f"{sum(1 for message in message_items if message['role'] == 'assistant')}"
        )

        if (
            analysis_run["status"] != "completed"
            or analysis_run["phase"] != "delivery"
            or execution_result["analysisRun"]["status"] != "running"
            or execution_result["analysisRun"]["phase"] != "synthesis"
            or execution_attempt["status"] != "released"
            or pre_delivery_projection["activeRunId"] != run_id
            or pre_delivery_projection["activeRunStatus"] != "running"
            or post_delivery_projection["activeRunId"] is not None
            or post_delivery_projection["latestAssistantMessageStatus"] != "completed"
            or assistant_message["messageId"] != final_assistant_message["messageId"]
            or pre_delivery_replay_items != post_delivery_replay_items
            or len(sse_events) != len(post_delivery_replay_items)
            or [event["event"] for event in sse_events]
            != [item["eventType"] for item in post_delivery_replay_items]
            or [event["json"] for event in sse_events] != post_delivery_replay_items
            or [int(event["id"]) for event in sse_events] != list(range(len(sse_events)))
            or not sse_events
            or sse_events[0]["event"] != "stream.started"
            or sse_terminal_events != ["stream.completed"]
        ):
            print("status=failed", file=sys.stderr)
            return 1

        verify_env["IAP_RUNTIME_VERIFY_RUN_ID"] = analysis_run["runId"]
        verify_result = subprocess.run(
            [str(RUNTIME_RESULT_DELIVERY_VERIFY_SCRIPT)],
            cwd=REPO_ROOT,
            text=True,
            capture_output=True,
            check=False,
            env=verify_env,
        )
        if verify_result.stdout:
            print(verify_result.stdout, end="")
        if verify_result.returncode != 0:
            if verify_result.stderr:
                print(verify_result.stderr, file=sys.stderr)
            return verify_result.returncode

        print("status=ok")
        return 0
    finally:
        if not args.keep_db:
            run_runtime_foundation_command("down", env_overrides=env_overrides, check=False)
            shutil.rmtree(temp_dir, ignore_errors=True)
        get_settings.cache_clear()


if __name__ == "__main__":
    raise SystemExit(main())
