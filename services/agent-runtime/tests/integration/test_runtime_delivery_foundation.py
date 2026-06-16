from __future__ import annotations

# mypy: disable-error-code="untyped-decorator"
import hashlib
import json
from collections.abc import Iterator
from copy import deepcopy
from typing import Any, cast
from urllib.request import Request

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import (
    AnalysisTaskRepository,
    ConversationRepository,
    DecisionRepository,
    MessageRepository,
    ModelCallRepository,
    ReportRepository,
    RunEventRepository,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRepository,
    ToolCallRepository,
)
from src.infrastructure.model_gateway.gateway import ModelGateway
from src.infrastructure.model_gateway.readiness import UrlopenCallable
from src.infrastructure.tool_registry.registry import ToolRegistry
from src.modules.analysis_runs.worker_service import AnalysisRunExecutionWorker
from tests.integration.conftest import login_client, seed_runtime_foundation

DELIVERY_PRODUCER_ID = "delivery-producer-runtime"
EXPECTED_SOURCE_IDS = [
    "knowledge-document-channel-weekly-17",
    "knowledge-document-inventory-east-04",
    "table-sales-order",
    "table-refund-order",
    "metric-recognized-revenue",
]
EXPECTED_REPORT_SECTION_TITLES = ["核心结论", "证据引用", "下一步动作"]


def build_context_node(
    *,
    node_id: str,
    kind: str,
    title: str,
    summary: str,
    source_ref: dict[str, str] | None,
) -> dict[str, Any]:
    node: dict[str, Any] = {
        "nodeId": node_id,
        "kind": kind,
        "role": "inputContext",
        "owner": {"type": "analysisTask"},
        "title": title,
        "summary": summary,
    }
    if source_ref is not None:
        node["sourceRef"] = source_ref
    return node


def build_context_pack(include_source_refs: bool) -> dict[str, Any]:
    def maybe_source_ref(source_ref: dict[str, str]) -> dict[str, str] | None:
        return source_ref if include_source_refs else None

    children: list[dict[str, Any]] = [
        build_context_node(
            node_id="context-metric-recognized-revenue",
            kind="metric",
            title="确认收入",
            summary="当前异常指标来源。",
            source_ref=maybe_source_ref(
                {
                    "type": "metric",
                    "metricId": "metric-recognized-revenue",
                }
            ),
        ),
        build_context_node(
            node_id="context-table-sales-order",
            kind="dataTable",
            title="销售订单表",
            summary="用于核对确认收入的订单明细。",
            source_ref=maybe_source_ref(
                {
                    "type": "dataTable",
                    "tableId": "table-sales-order",
                }
            ),
        ),
        build_context_node(
            node_id="context-table-refund-order",
            kind="dataTable",
            title="退款订单表",
            summary="用于排除退款激增是否主导收入异常。",
            source_ref=maybe_source_ref(
                {
                    "type": "dataTable",
                    "tableId": "table-refund-order",
                }
            ),
        ),
        build_context_node(
            node_id="context-knowledge-document-channel-weekly-17",
            kind="knowledgeDocument",
            title="渠道周报第 17 期",
            summary="华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
            source_ref=maybe_source_ref(
                {
                    "type": "knowledgeDocument",
                    "knowledgeDocumentId": "knowledge-document-channel-weekly-17",
                }
            ),
        ),
        build_context_node(
            node_id="context-knowledge-document-inventory-east-04",
            kind="knowledgeDocument",
            title="华东库存复核记录",
            summary="促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
            source_ref=maybe_source_ref(
                {
                    "type": "knowledgeDocument",
                    "knowledgeDocumentId": "knowledge-document-inventory-east-04",
                }
            ),
        ),
    ]

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
    "contextPack": build_context_pack(include_source_refs=True),
    "title": "收入增速异常",
}


TASK_PAYLOAD_WITHOUT_DELIVERY_SOURCES = {
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": build_context_pack(include_source_refs=False),
    "title": "收入增速异常",
}


def build_payload_with_duplicate_source_refs() -> tuple[dict[str, Any], str]:
    special_source_id = "table/sales order #1"
    payload = deepcopy(TASK_PAYLOAD_WITH_DELIVERY_SOURCES)
    context_pack = cast(dict[str, Any], payload["contextPack"])
    root = cast(dict[str, Any], context_pack["root"])
    root["children"] = [
        build_context_node(
            node_id="context-table-sales-order-special-1",
            kind="dataTable",
            title="销售订单特殊快照",
            summary="用于验证重复 sourceRef 会去重，且 ID 需要安全编码。",
            source_ref={
                "type": "dataTable",
                "tableId": special_source_id,
            },
        ),
        build_context_node(
            node_id="context-table-sales-order-special-2",
            kind="dataTable",
            title="销售订单特殊快照副本",
            summary="与前一个节点引用同一个 dataTable sourceRef。",
            source_ref={
                "type": "dataTable",
                "tableId": special_source_id,
            },
        ),
        build_context_node(
            node_id="context-metric-recognized-revenue",
            kind="metric",
            title="确认收入",
            summary="保留一个独立 sourceRef，避免只剩单条证据。",
            source_ref={
                "type": "metric",
                "metricId": "metric-recognized-revenue",
            },
        ),
    ]
    return payload, special_source_id


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
    expect_placeholder_assistant: bool = False,
) -> None:
    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}

    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    if not expect_placeholder_assistant:
        assert [message["role"] for message in messages] == ["user"]
        return

    assert [message["role"] for message in messages] == ["user", "assistant"]
    assistant_message = messages[-1]
    assert assistant_message["status"] == "streaming"
    assert assistant_message["reportId"] is None
    assert assistant_message["sourceEvidenceIds"] == []
    assert assistant_message["completedAt"] is None


def runtime_database() -> RuntimeFoundationMysqlCli:
    return RuntimeFoundationMysqlCli()


def select_workspace(client: TestClient, workspace_id: str) -> None:
    response = client.post("/auth/select-workspace", json={"workspaceId": workspace_id})
    assert response.status_code == 200, response.text


def overwrite_analysis_task(
    analysis_task_id: str,
    *,
    conversation_id: str | None = None,
    user_id: str | None = None,
    workspace_id: str | None = None,
) -> None:
    repository = AnalysisTaskRepository(runtime_database())
    analysis_task = repository.get_by_analysis_task_id(analysis_task_id)
    repository.create(
        {
            **analysis_task,
            "conversationId": conversation_id or analysis_task["conversationId"],
            "userId": user_id or analysis_task["userId"],
            "workspaceId": workspace_id or analysis_task["workspaceId"],
        }
    )


def overwrite_conversation(
    conversation_id: str,
    *,
    current_run_id: str | None = None,
    user_id: str | None = None,
    workspace_id: str | None = None,
) -> None:
    repository = ConversationRepository(runtime_database())
    conversation = repository.get_by_conversation_id(conversation_id)
    repository.create(
        {
            **conversation,
            "currentRunId": current_run_id or conversation["currentRunId"],
            "userId": user_id or conversation["userId"],
            "workspaceId": workspace_id or conversation["workspaceId"],
        }
    )


def persist_existing_source_evidence(run_id: str) -> None:
    SourceEvidenceRepository(runtime_database()).create(
        {
            "sourceEvidenceId": f"source-evidence-{run_id}-preexisting",
            "runId": run_id,
            "sourceType": "metric",
            "sourceId": "metric-preexisting",
            "title": "Preexisting SourceEvidence",
            "snippet": "preexisting artifact",
            "metadata": {},
            "confidence": 0.8,
            "createdAt": "2026-06-12T11:30:00Z",
        }
    )


def persist_existing_report(run_id: str, *, workspace_id: str) -> None:
    ReportRepository(runtime_database()).create(
        {
            "reportId": f"report-{run_id}-preexisting",
            "runId": run_id,
            "workspaceId": workspace_id,
            "title": "Preexisting Report",
            "summary": "preexisting artifact",
            "sections": [
                {
                    "reportSectionId": f"report-section-{run_id}-preexisting",
                    "reportId": f"report-{run_id}-preexisting",
                    "title": "核心结论",
                    "content": "preexisting artifact",
                    "createdAt": "2026-06-12T11:30:00Z",
                }
            ],
            "sourceEvidence": [f"source-evidence-{run_id}-preexisting"],
            "createdAt": "2026-06-12T11:30:00Z",
        }
    )


def persist_existing_decision(run_id: str, *, workspace_id: str) -> None:
    DecisionRepository(runtime_database()).create(
        {
            "decisionId": f"decision-{run_id}-preexisting",
            "workspaceId": workspace_id,
            "runId": run_id,
            "reportId": f"report-{run_id}-preexisting",
            "title": "Preexisting Decision",
            "status": "proposed",
            "createdAt": "2026-06-12T11:30:00Z",
        }
    )


def persist_existing_assistant_message(
    *,
    analysis_task_id: str,
    conversation_id: str,
    run_id: str,
    turn_id: str,
) -> None:
    MessageRepository(runtime_database()).create(
        {
            "messageId": f"message-{run_id}-assistant-preexisting",
            "conversationId": conversation_id,
            "analysisTaskId": analysis_task_id,
            "turnId": turn_id,
            "runId": run_id,
            "role": "assistant",
            "content": "preexisting artifact",
            "status": "completed",
            "sourceEvidenceIds": [],
            "toolCallIds": [],
            "reportId": None,
            "createdAt": "2026-06-12T11:30:00Z",
            "completedAt": "2026-06-12T11:30:00Z",
        }
    )


def persist_existing_run_completed_event(run_id: str) -> None:
    run_events = RunEventRepository(runtime_database()).list_by_run_id(run_id)
    sequence = int(run_events[-1]["sequence"]) + 1
    RunEventRepository(runtime_database()).create(
        {
            "eventId": f"event-{run_id}-run-completed-preexisting",
            "runId": run_id,
            "eventType": "run.completed",
            "status": "succeeded",
            "phase": "delivery",
            "sequence": sequence,
            "actor": "analysis_runtime",
            "occurredAt": "2026-06-12T11:30:00Z",
            "summary": "preexisting artifact",
            "parentEventId": None,
            "refType": None,
            "refId": None,
            "errorCode": None,
            "errorMessage": None,
            "nodeName": "run.completed",
            "agentName": "analysis_runtime",
            "toolName": None,
            "startedAt": "2026-06-12T11:30:00Z",
            "completedAt": "2026-06-12T11:30:00Z",
        }
    )


def persist_existing_source_evidence_case(
    run_id: str,
    workspace_id: str,
    analysis_task_id: str,
    conversation_id: str,
    turn_id: str,
) -> None:
    _ = (workspace_id, analysis_task_id, conversation_id, turn_id)
    persist_existing_source_evidence(run_id)


def persist_existing_report_case(
    run_id: str,
    workspace_id: str,
    analysis_task_id: str,
    conversation_id: str,
    turn_id: str,
) -> None:
    _ = (analysis_task_id, conversation_id, turn_id)
    persist_existing_report(run_id, workspace_id=workspace_id)


def persist_existing_decision_case(
    run_id: str,
    workspace_id: str,
    analysis_task_id: str,
    conversation_id: str,
    turn_id: str,
) -> None:
    _ = (analysis_task_id, conversation_id, turn_id)
    persist_existing_decision(run_id, workspace_id=workspace_id)


def persist_existing_assistant_message_case(
    run_id: str,
    workspace_id: str,
    analysis_task_id: str,
    conversation_id: str,
    turn_id: str,
) -> None:
    _ = workspace_id
    persist_existing_assistant_message(
        analysis_task_id=analysis_task_id,
        conversation_id=conversation_id,
        run_id=run_id,
        turn_id=turn_id,
    )


def persist_existing_run_completed_case(
    run_id: str,
    workspace_id: str,
    analysis_task_id: str,
    conversation_id: str,
    turn_id: str,
) -> None:
    _ = (workspace_id, analysis_task_id, conversation_id, turn_id)
    persist_existing_run_completed_event(run_id)


def overwrite_tool_call_status(
    run_id: str,
    *,
    status: str,
    error_message: str | None,
) -> None:
    repository = ToolCallRepository(runtime_database())
    [tool_call] = repository.list_by_run_id(run_id)
    repository.create(
        {
            **tool_call,
            "status": cast(Any, status),
            "errorType": "tool_failure" if error_message else None,
            "errorMessage": error_message,
        }
    )


def overwrite_model_call_status(
    run_id: str,
    *,
    status: str,
    error_message: str | None,
) -> None:
    repository = ModelCallRepository(runtime_database())
    [model_call] = repository.list_by_run_id(run_id)
    repository.create(
        {
            **model_call,
            "status": cast(Any, status),
            "errorType": "model_failure" if error_message else None,
            "errorMessage": error_message,
        }
    )


def remove_run_event(run_id: str, *, event_type: str) -> None:
    runtime_database().execute_sql(
        f"""
DELETE FROM run_events
WHERE run_id = '{run_id}'
  AND event_type = '{event_type}';
"""
    )


def detach_submit_user_message_turn_binding(
    *,
    conversation_id: str,
    run_id: str,
) -> None:
    repository = MessageRepository(runtime_database())
    user_message = next(
        message
        for message in repository.list_by_conversation_id(conversation_id)
        if message["role"] == "user" and message["runId"] == run_id
    )
    repository.create(
        {
            **user_message,
            "runId": None,
        }
    )


def get_run_payload(client: TestClient, run_id: str) -> dict[str, Any]:
    response = client.get(f"/analysis-runs/{run_id}")
    assert response.status_code == 200, response.text
    return response_json_dict(response.json())


def test_runtime_execution_persists_placeholder_and_non_empty_json_replay_before_delivery(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )

    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    user_message = messages[0]
    assistant_message = messages[-1]
    assert assistant_message["messageId"] == f"message-{run_id}-assistant"
    assert assistant_message["analysisTaskId"] == submit_payload["analysisTask"]["analysisTaskId"]
    assert assistant_message["turnId"] == user_message["turnId"]
    assert assistant_message["toolCallIds"]
    assert assistant_message["content"] == "华东收入增速放缓与渠道确认延迟、库存错配有关。"

    replay_items = response_json_dict(
        client.get(
            f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
            headers={"accept": "application/json"},
        ).json()
    )["items"]
    assert len(replay_items) >= 2
    assert [item["sequence"] for item in replay_items] == list(range(len(replay_items)))
    assert replay_items[0]["eventType"] == "stream.started"
    assert replay_items[-1]["eventType"] == "stream.completed"
    assert replay_items[-1]["status"] == "completed"
    assert all(item["messageId"] == assistant_message["messageId"] for item in replay_items)
    assert all(item["conversationId"] == conversation_id for item in replay_items)
    assert all(item["runId"] == run_id for item in replay_items)

    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )


def test_message_stream_replay_requires_owned_conversation(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]
    assistant_message_id = f"message-{run_id}-assistant"

    select_workspace(client, "workspace-northstar-retail-sea")
    response = client.get(
        f"/conversations/{conversation_id}/messages/{assistant_message_id}/stream",
        headers={"accept": "application/json"},
    )

    assert response.status_code == 404
    assert response.json()["errorCode"] == "NOT_FOUND"


def test_message_stream_replay_rejects_same_owner_cross_conversation_mismatch(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    assistant_message_id = f"message-{run_id}-assistant"

    other_conversation_response = client.post(
        "/conversations",
        json={"title": "同 owner 但不同 conversation"},
    )
    assert other_conversation_response.status_code == 201, other_conversation_response.text
    other_conversation_id = response_json_dict(other_conversation_response.json())["conversationId"]

    response = client.get(
        f"/conversations/{other_conversation_id}/messages/{assistant_message_id}/stream",
        headers={"accept": "application/json"},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "mismatched the owned Conversation / Message binding" in response.json()["message"]


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
    pre_delivery_messages = response_json_dict(
        client.get(f"/conversations/{conversation_id}/messages").json()
    )["items"]
    pre_delivery_assistant_message = pre_delivery_messages[-1]
    pre_delivery_replay_items = response_json_dict(
        client.get(
            f"/conversations/{conversation_id}/messages/{pre_delivery_assistant_message['messageId']}/stream",
            headers={"accept": "application/json"},
        ).json()
    )["items"]
    assert pre_delivery_assistant_message["status"] == "streaming"
    assert pre_delivery_replay_items

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
    assert tool_calls[0]["status"] == "succeeded"

    model_calls = response_json_dict(client.get(f"/analysis-runs/{run_id}/model-calls").json())[
        "items"
    ]
    assert len(model_calls) == 1
    assert model_calls[0]["provider"] == "siliconflow"
    assert model_calls[0]["modelId"] == "Qwen/Qwen3.5-4B"
    assert model_calls[0]["status"] == "succeeded"

    source_evidence_items = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/source-evidence").json()
    )["items"]
    assert len(source_evidence_items) == len(EXPECTED_SOURCE_IDS)
    assert [item["sourceId"] for item in source_evidence_items] == EXPECTED_SOURCE_IDS
    assert [item["sourceType"] for item in source_evidence_items] == [
        "knowledge_document",
        "knowledge_document",
        "data_table",
        "data_table",
        "metric",
    ]
    for item in source_evidence_items:
        metadata = item["metadata"]
        assert metadata["nodeId"].startswith("context-")
        assert metadata["sourceRef"]["type"] in {
            "knowledgeDocument",
            "dataTable",
            "metric",
        }
        assert metadata["toolCallIds"] == [tool_calls[0]["toolCallId"]]
        assert metadata["modelCallIds"] == [model_calls[0]["modelCallId"]]
        assert metadata["traceability"] == "direct_refs"

    reports = response_json_dict(client.get(f"/analysis-runs/{run_id}/reports").json())["items"]
    assert len(reports) == 1
    report = reports[0]
    assert report["reportId"] == f"report-{run_id}"
    assert report["runId"] == run_id
    assert report["title"] == "收入增速异常 分析报告"
    assert report["summary"] == (
        "围绕“收入增速异常”整理了 5 条可追溯来源，"
        "并结合 1 次 ToolCall 与 1 次 ModelCall 形成正式交付结论。"
    )
    assert [section["title"] for section in report["sections"]] == EXPECTED_REPORT_SECTION_TITLES
    assert [section["reportId"] for section in report["sections"]] == [report["reportId"]] * 3
    assert report["sourceEvidence"] == [
        item["sourceEvidenceId"] for item in source_evidence_items
    ]

    decisions = response_json_dict(client.get(f"/analysis-runs/{run_id}/decisions").json())["items"]
    assert len(decisions) == 1
    decision = decisions[0]
    assert decision["decisionId"] == f"decision-{run_id}"
    assert decision["workspaceId"] == completed_run["workspaceId"]
    assert decision["runId"] == run_id
    assert decision["reportId"] == report["reportId"]
    assert decision["title"] == "收入增速异常 下一步决策"
    assert decision["status"] == "proposed"

    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    assert [message["role"] for message in messages] == ["user", "assistant"]
    user_message = messages[0]
    assistant_message = messages[-1]
    assert assistant_message["messageId"] == pre_delivery_assistant_message["messageId"]
    assert assistant_message["analysisTaskId"] == analysis_task_id
    assert assistant_message["runId"] == run_id
    assert assistant_message["turnId"] == user_message["turnId"]
    assert assistant_message["status"] == "completed"
    assert assistant_message["reportId"] == report["reportId"]
    assert assistant_message["sourceEvidenceIds"] == report["sourceEvidence"]
    assert assistant_message["toolCallIds"] == [tool_calls[0]["toolCallId"]]
    assert "收入增速异常" in assistant_message["content"]

    message_stream = response_json_dict(
        client.get(
            f"/conversations/{conversation_id}/messages/{assistant_message['messageId']}/stream",
            headers={"accept": "application/json"},
        ).json()
    )["items"]
    assert message_stream == pre_delivery_replay_items

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [event["eventType"] for event in events]
    assert event_types.count("tool_call.completed") == 1
    assert event_types.count("model_call.completed") == 1
    assert event_types.count("verification.started") == 1
    assert event_types.count("verification.passed") == 1
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
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
    )


def test_delivery_complete_fails_honestly_when_context_pack_has_no_traceable_source_refs(
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
    assert "usable sourceRef" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )

    persisted_run = get_run_payload(client, run_id)
    assert persisted_run["status"] == "running"
    assert persisted_run["phase"] == "synthesis"

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [event["eventType"] for event in events]
    assert "verification.started" not in event_types
    assert "artifact.persisted" not in event_types
    assert "run.completed" not in event_types


def test_delivery_complete_rejects_failed_tool_call_status(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    overwrite_tool_call_status(
        run_id,
        status="failed",
        error_message="tool failed after persisted synthesis state setup",
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "succeeded ToolCall" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["status"] == "running"


def test_delivery_complete_rejects_failed_model_call_status(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    overwrite_model_call_status(
        run_id,
        status="failed",
        error_message="model failed after persisted synthesis state setup",
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "succeeded ModelCall" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["status"] == "running"


@pytest.mark.parametrize(
    "event_type",
    ["tool_call.completed", "model_call.completed", "synthesis.started"],
)
def test_delivery_complete_requires_completed_tool_and_model_run_events(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    event_type: str,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    remove_run_event(run_id, event_type=event_type)

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert event_type in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


def test_delivery_complete_requires_authenticated_owner_workspace(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    select_workspace(client, "workspace-northstar-retail-sea")
    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )
    assert response.status_code == 404
    assert response.json()["errorCode"] == "NOT_FOUND"

    select_workspace(client, "workspace-northstar-retail-china")
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


def test_delivery_complete_rejects_cross_object_workspace_or_identity_mismatch(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]
    analysis_task_id = submit_payload["analysisTask"]["analysisTaskId"]

    overwrite_analysis_task(
        analysis_task_id,
        workspace_id="workspace-northstar-retail-sea",
        user_id="user-mismatch",
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "workspaceId" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


def test_delivery_complete_rejects_cross_object_conversation_binding_mismatch(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    overwrite_conversation(
        conversation_id,
        current_run_id="analysis-run-unrelated",
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "currentRunId" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


def test_delivery_complete_requires_original_user_turn_binding(
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

    detach_submit_user_message_turn_binding(
        conversation_id=conversation_id,
        run_id=run_id,
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert "user submit message turnId" in response.json()["message"]
    assert_no_delivery_outputs(
        client,
        run_id=run_id,
        conversation_id=conversation_id,
        expect_placeholder_assistant=True,
    )
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


@pytest.mark.parametrize(
    ("artifact_type", "persist_artifact"),
    [
        ("source_evidence", persist_existing_source_evidence_case),
        ("report", persist_existing_report_case),
        ("decision", persist_existing_decision_case),
        ("assistant_message", persist_existing_assistant_message_case),
        ("run_completed", persist_existing_run_completed_case),
    ],
)
def test_delivery_complete_rejects_preexisting_delivery_artifacts(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    artifact_type: str,
    persist_artifact: Any,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]
    analysis_task_id = submit_payload["analysisTask"]["analysisTaskId"]
    workspace_id = execution_state["workerResult"]["analysisRun"]["workspaceId"]

    persist_artifact(
        run_id,
        workspace_id,
        analysis_task_id,
        conversation_id,
        submit_payload["userMessage"]["turnId"],
    )

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )

    assert response.status_code == 409
    assert response.json()["errorCode"] == "INVALID_STATE"
    assert artifact_type in response.json()["message"]
    assert get_run_payload(client, run_id)["phase"] == "synthesis"


def test_delivery_complete_rejects_repeat_completion_without_duplicate_artifacts(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=TASK_PAYLOAD_WITH_DELIVERY_SOURCES,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    first_response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )
    assert first_response.status_code == 202, first_response.text

    second_response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )
    assert second_response.status_code == 409
    assert second_response.json()["errorCode"] == "INVALID_STATE"

    source_evidence_items = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/source-evidence").json()
    )["items"]
    reports = response_json_dict(client.get(f"/analysis-runs/{run_id}/reports").json())["items"]
    decisions = response_json_dict(client.get(f"/analysis-runs/{run_id}/decisions").json())["items"]
    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]
    assert len(source_evidence_items) == len(EXPECTED_SOURCE_IDS)
    assert len(reports) == 1
    assert len(decisions) == 1
    assert [message["role"] for message in messages] == ["user", "assistant"]


def test_delivery_complete_deduplicates_source_refs_and_generates_safe_ids(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    task_payload, special_source_id = build_payload_with_duplicate_source_refs()
    execution_state = execute_to_persisted_synthesis_state(
        client,
        monkeypatch,
        task_payload=task_payload,
    )
    submit_payload = execution_state["submit"]
    run_id = execution_state["workerResult"]["analysisRun"]["runId"]
    conversation_id = submit_payload["conversation"]["conversationId"]

    response = client.post(
        f"/analysis-runs/{run_id}/delivery/complete",
        json={"producerId": DELIVERY_PRODUCER_ID},
    )
    assert response.status_code == 202, response.text

    source_evidence_items = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/source-evidence").json()
    )["items"]
    reports = response_json_dict(client.get(f"/analysis-runs/{run_id}/reports").json())["items"]
    messages = response_json_dict(client.get(f"/conversations/{conversation_id}/messages").json())[
        "items"
    ]

    special_items = [
        item for item in source_evidence_items if item["sourceId"] == special_source_id
    ]
    assert len(special_items) == 1
    special_item = special_items[0]
    expected_hash = hashlib.sha1(f"data_table:{special_source_id}".encode()).hexdigest()[:16]
    expected_source_evidence_id = f"source-evidence-{run_id}-{expected_hash}"

    assert special_item["sourceEvidenceId"] == expected_source_evidence_id
    assert special_item["sourceEvidenceId"].startswith(f"source-evidence-{run_id}-")
    assert "/" not in special_item["sourceEvidenceId"]
    assert " " not in special_item["sourceEvidenceId"]
    assert special_item["metadata"]["nodeId"] == "context-table-sales-order-special-1"
    assert special_item["metadata"]["sourceId"] == special_source_id
    assert special_item["metadata"]["sourceType"] == "data_table"

    [report] = reports
    [assistant_message] = [message for message in messages if message["role"] == "assistant"]
    assert report["sourceEvidence"].count(expected_source_evidence_id) == 1
    assert assistant_message["sourceEvidenceIds"].count(expected_source_evidence_id) == 1
    assert len(report["sourceEvidence"]) == len(source_evidence_items)
