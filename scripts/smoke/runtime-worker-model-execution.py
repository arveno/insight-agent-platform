#!/usr/bin/env python3
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
RUNTIME_EXECUTION_VERIFY_SCRIPT = REPO_ROOT / "scripts" / "migration" / "runtime_execution_verify.sh"
LOGIN_EMAIL = "zoe@northstar.example.com"
LOGIN_PASSWORD = "zoe-password"

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


def pick_free_port() -> str:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return str(sock.getsockname()[1])


def build_runtime_foundation_env(data_dir: Path) -> dict[str, str]:
    project_suffix = uuid.uuid4().hex[:8]
    mysql_host_port = pick_free_port()
    return {
        "IAP_MIGRATION_TARGET": "local",
        "IAP_MIGRATION_COMPOSE_PROJECT_NAME": f"iap-runtime-smoke-{project_suffix}",
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


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Local smoke for #240 worker LangGraph tool/model execution."
    )
    parser.add_argument("--env-file", type=Path, help="Optional env file with real provider config.")
    parser.add_argument("--keep-db", action="store_true", help="Keep local MySQL container after run.")
    args = parser.parse_args()

    if args.env_file is not None:
        if not args.env_file.exists():
            print(f"status=missing_env_file path={args.env_file}", file=sys.stderr)
            return 2
        load_env_file(args.env_file)

    temp_dir = Path(tempfile.mkdtemp(prefix="iap-runtime-worker-smoke-"))
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

            result = build_worker().execute_run(run_id)
            messages_response = client.get(f"/conversations/{conversation_id}/messages")
            if messages_response.status_code != 200:
                raise RuntimeError(
                    f"conversations/{conversation_id}/messages failed: "
                    f"{messages_response.status_code} {messages_response.text}"
                )
            message_items = response_json_dict(messages_response.json())["items"]

        analysis_run = result["analysisRun"]
        execution_attempt = result["executionAttempt"]
        tool_call = result["toolCall"]
        model_call = result["modelCall"]

        print(f"runId={analysis_run['runId']}")
        print(f"status={analysis_run['status']}")
        print(f"phase={analysis_run['phase']}")
        print(f"executionAttempt.status={execution_attempt['status']}")
        print(f"toolCall.toolName={tool_call['toolName']}")
        print(f"toolCall.status={tool_call['status']}")
        print(f"modelCall.provider={model_call['provider']}")
        print(f"modelCall.modelId={model_call['modelId']}")
        print(f"modelCall.status={model_call['status']}")
        print(f"modelCall.inputTokens={model_call['inputTokens']}")
        print(f"modelCall.outputTokens={model_call['outputTokens']}")
        print(f"userMessageCount={len(message_items)}")
        print(
            "assistantMessageCount="
            f"{sum(1 for message in message_items if message['role'] == 'assistant')}"
        )

        if (
            analysis_run["status"] != "running"
            or analysis_run["phase"] != "synthesis"
            or execution_attempt["status"] != "released"
            or tool_call["status"] != "succeeded"
            or model_call["status"] != "succeeded"
        ):
            print("status=failed", file=sys.stderr)
            return 1

        verify_env = os.environ.copy()
        verify_env.update(env_overrides)
        verify_env["IAP_RUNTIME_VERIFY_RUN_ID"] = analysis_run["runId"]
        verify_result = subprocess.run(
            [str(RUNTIME_EXECUTION_VERIFY_SCRIPT)],
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
        if args.keep_db:
            return_code = 0
        else:
            run_runtime_foundation_command("down", env_overrides=env_overrides, check=False)
            return_code = 0
        get_settings.cache_clear()
        if not args.keep_db:
            shutil.rmtree(temp_dir, ignore_errors=True)
        _ = return_code


if __name__ == "__main__":
    raise SystemExit(main())
