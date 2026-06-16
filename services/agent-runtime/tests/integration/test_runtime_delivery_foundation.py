from __future__ import annotations

# mypy: disable-error-code="untyped-decorator"
import json
from collections.abc import Iterator
from copy import deepcopy
from typing import Any, cast
from urllib.request import Request

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import RuntimeFoundationMysqlCli
from src.infrastructure.model_gateway.gateway import ModelGateway
from src.infrastructure.model_gateway.readiness import UrlopenCallable
from src.infrastructure.tool_registry.registry import ToolRegistry
from src.modules.analysis_runs.worker_service import AnalysisRunExecutionWorker
from tests.integration.conftest import login_client, seed_runtime_foundation

DELIVERY_PRODUCER_ID = "delivery-producer-runtime"


def build_context_pack(include_delivery_sources: bool) -> dict[str, Any]:
    children: list[dict[str, Any]] = [
        {
            "nodeId": "context-metric-recognized-revenue",
            "kind": "metric",
            "role": "inputContext",
            "owner": {"type": "analysisTask"},
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
            "owner": {"type": "analysisTask"},
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
            "owner": {"type": "analysisTask"},
            "title": "退款订单表",
            "summary": "用于排除退款激增是否主导收入异常。",
            "sourceRef": {
                "type": "dataTable",
                "tableId": "table-refund-order",
            },
        },
    ]

    if include_delivery_sources:
        children.extend(
            [
                {
                    "nodeId": "context-knowledge-document-channel-weekly-17",
                    "kind": "knowledgeDocument",
                    "role": "inputContext",
                    "owner": {"type": "analysisTask"},
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
                    "owner": {"type": "analysisTask"},
                    "title": "华东库存复核记录",
                    "summary": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
                    "sourceRef": {
                        "type": "knowledgeDocument",
                        "knowledgeDocumentId": "knowledge-document-inventory-east-04",
                    },
                },
            ]
        )

    return {
        "version": 1,
        "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-12T10:28:00+08:00",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": {"type": "analysisTask"},
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {
                "key": "this_quarter",
                "label": "2026 Q2",
            },
            "capturedAt": "2026-06-12T10:28:00+08:00",
            "children": children,
        },
    }


TASK_PAYLOAD_WITH_DELIVERY_SOURCES = {
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": build_context_pack(include_delivery_sources=True),
    "title": "收入增速异常",
}

TASK_PAYLOAD_WITHOUT_DELIVERY_SOURCES = {
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": build_context_pack(include_delivery_sources=False),
    "title": "收入增速异常",
}


def response_json_dict(payload: object) -> dict[str, Any]:
    return cast(dict[str, Any], payload)


class FakeUrlopenResponse:
    def __init__(self, payload: dict[str, object], *, status: int = 200) -> None:
        self._payload = payload
        self.status = status

    def read(self) -> bytes:
        return json.dumps(self._payload).encode("utf-8")

    def __enter__(self) -> FakeUrlopenResponse:
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> bool | None:
        return None


def fake_model_success(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    return FakeUrlopenResponse(
        {
            "choices": [{"message": {"content": "华东收入增速放缓与渠道确认延迟、库存错配有关。"}}],
            "usage": {
                "prompt_tokens": 42,
                "completion_tokens": 18,
                "total_tokens": 60,
            },
        }
    )


def configure_model_gateway_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IAP_MODEL_ACTIVE_PROVIDER", "siliconflow")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT",
        "openai_chat_completions",
    )
    monkeypatch.setenv("IAP_MODEL_PROVIDER_SILICONFLOW_BASE_URL", "https://api.siliconflow.cn/v1")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_CHAT_COMPLETIONS_PATH",
        "/chat/completions",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_DEFAULT_MODEL",
        "Qwen/Qwen3.5-4B",
    )
    monkeypatch.setenv("IAP_MODEL_PROVIDER_SILICONFLOW_API_KEY", "test-siliconflow-key")
    monkeypatch.setenv("IAP_MODEL_MAX_TOKENS", "128")
    monkeypatch.setenv("IAP_MODEL_TIMEOUT_MS", "30000")
    monkeypatch.setenv("IAP_MODEL_TEMPERATURE", "0.1")
    monkeypatch.setenv("IAP_MODEL_REAL_API_REQUIRED", "true")
    get_settings.cache_clear()


@pytest.fixture()
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    get_settings.cache_clear()
    seed_runtime_foundation()
    with TestClient(create_app()) as test_client:
        login_client(test_client)
        yield test_client


def submit_and_dispatch(
    client: TestClient,
    *,
    task_payload: dict[str, Any],
) -> dict[str, Any]:
    submit_response = client.post("/analysis-tasks/submit", json=deepcopy(task_payload))
    assert submit_response.status_code == 201, submit_response.text
    submit_payload = response_json_dict(submit_response.json())
    run_id = cast(str, submit_payload["analysisRun"]["runId"])

    dispatch_response = client.post(f"/analysis-runs/{run_id}/dispatch")
    assert dispatch_response.status_code == 202, dispatch_response.text

    return {
        "submit": submit_payload,
        "analysisRun": response_json_dict(dispatch_response.json()),
    }


def build_worker(*, urlopen: UrlopenCallable) -> AnalysisRunExecutionWorker:
    settings = get_settings()
    return AnalysisRunExecutionWorker(
        database=RuntimeFoundationMysqlCli(),
        model_gateway=ModelGateway(settings=settings.model_gateway, urlopen=urlopen),
        tool_registry=ToolRegistry(),
    )


def execute_to_persisted_synthesis_state(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    *,
    task_payload: dict[str, Any],
) -> dict[str, Any]:
    configure_model_gateway_env(monkeypatch)
    dispatched = submit_and_dispatch(client, task_payload=task_payload)
    run_id = dispatched["analysisRun"]["runId"]

    worker_result = build_worker(urlopen=fake_model_success).execute_run(run_id)
    assert worker_result["analysisRun"]["status"] == "running"
    assert worker_result["analysisRun"]["phase"] == "synthesis"

    return {
        "submit": dispatched["submit"],
        "workerResult": worker_result,
    }


def assert_no_delivery_outputs(
    client: TestClient,
    *,
    run_id: str,
    conversation_id: str,
) -> None:
    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}

    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    assert [message["role"] for message in messages] == ["user"]


def test_delivery_complete_persists_artifacts_from_persisted_execution_state(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    worker_result = execution_state["workerResult"]
    run_id = worker_result["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]
    analysis_task_id = submit_payload["analysisTask"]["analysisTaskId"]

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 202, response.text
    completed_run = response_json_dict(response.json())
    assert completed_run["runId"] == run_id
    assert completed_run["status"] == "completed"
    assert completed_run["phase"] == "delivery"
    assert completed_run["outcome"] == "success"
    assert completed_run["completedAt"] is not None

    tool_calls = response_json_dict(client.get(f"/analysis-runs/{run_id}/tool-calls").json())[
        "items"
    ]
    assert len(tool_calls) == 1
    assert tool_calls[0]["toolName"] == "analysis_context_summary"

    model_calls = response_json_dict(client.get(f"/analysis-runs/{run_id}/model-calls").json())[
        "items"
    ]
    assert len(model_calls) == 1
    assert model_calls[0]["provider"] == "siliconflow"
    assert model_calls[0]["modelId"] == "Qwen/Qwen3.5-4B"

    source_evidence_items = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/source-evidence").json()
    )["items"]
    assert [item["sourceEvidenceId"] for item in source_evidence_items] == [
        "source-evidence-channel-weekly-17",
        "source-evidence-inventory-note-east-04",
    ]
    assert [item["sourceType"] for item in source_evidence_items] == [
        "knowledge_document",
        "knowledge_document",
    ]
    assert [item["sourceId"] for item in source_evidence_items] == [
        "knowledge-document-channel-weekly-17",
        "knowledge-document-inventory-east-04",
    ]

    reports = response_json_dict(client.get(f"/analysis-runs/{run_id}/reports").json())["items"]
    assert len(reports) == 1
    report = reports[0]
    assert report["reportId"] == "report-revenue-gap-q2"
    assert report["runId"] == run_id
    assert report["title"] == "收入异常分析摘要"
    assert report["summary"] == "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作"
    assert [section["title"] for section in report["sections"]] == [
        "核心结论",
        "证据引用",
        "下一步动作",
    ]
    assert report["sourceEvidence"] == [
        "source-evidence-channel-weekly-17",
        "source-evidence-inventory-note-east-04",
    ]

    decisions = response_json_dict(client.get(f"/analysis-runs/{run_id}/decisions").json())["items"]
    assert len(decisions) == 1
    decision = decisions[0]
    assert decision["decisionId"] == "decision-revenue-gap-q2"
    assert decision["workspaceId"] == completed_run["workspaceId"]
    assert decision["runId"] == run_id
    assert decision["reportId"] == report["reportId"]
    assert decision["status"] == "proposed"

    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    assert [message["role"] for message in messages] == ["user", "assistant"]
    assistant_message = messages[-1]
    assert assistant_message["analysisTaskId"] == analysis_task_id
    assert assistant_message["runId"] == run_id
    assert assistant_message["status"] == "completed"
    assert assistant_message["reportId"] == report["reportId"]
    assert assistant_message["sourceEvidenceIds"] == report["sourceEvidence"]
    assert assistant_message["toolCallIds"] == [tool_calls[0]["toolCallId"]]

    message_stream = response_json_dict(
        client.get(
            f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
            headers={"accept": "application/json"},
        ).json()
    )["items"]
    assert message_stream == []

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [event["eventType"] for event in events]
    assert event_types.count("tool_call.completed") == 1
    assert event_types.count("model_call.completed") == 1
    assert event_types[-5:] == [
        "verification.started",
        "verification.passed",
        "delivery.started",
        "artifact.persisted",
        "run.completed",
    ]
    assert event_types.index("artifact.persisted") < event_types.index("run.completed")


def test_delivery_complete_rejects_execution_state_before_persisted_synthesis(
    client: TestClient,
) -> None:
    dispatched = submit_and_dispatch(client, task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES)
    run_id = dispatched["analysisRun"]["runId"]
    conversation_id = dispatched["submit"]["conversation"]["conversationId"]

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert_no_delivery_outputs(client, run_id=run_id, conversation_id=conversation_id)


def test_delivery_complete_fails_honestly_when_required_canonical_sources_are_missing(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITHOUT_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    worker_result = execution_state["workerResult"]
    run_id = worker_result["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "knowledge document source refs" in response.json()["message"]
    assert_no_delivery_outputs(client, run_id=run_id, conversation_id=conversation_id)

    persisted_run = response_json_dict(client.get(f"/analysis-runs/{run_id}").json())
    assert persisted_run["status"] == "running"
    assert persisted_run["phase"] == "synthesis"

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [event["eventType"] for event in events]
    assert "verification.started" not in event_types
    assert "artifact.persisted" not in event_types
    assert "run.completed" not in event_types
