from __future__ import annotations

import json
from collections.abc import Iterator
from copy import deepcopy
from typing import Any, cast
from urllib.error import HTTPError
from urllib.request import Request

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import (
    ExecutionAttemptRepository,
    ModelCallRepository,
    ReportRepository,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRepository,
    ToolCallRepository,
)
from src.infrastructure.model_gateway.gateway import ModelGateway
from src.infrastructure.tool_registry.registry import ToolRegistry
from src.modules.analysis_runs.worker_service import AnalysisRunExecutionWorker
from tests.integration.conftest import login_client, seed_runtime_foundation

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
                "type": "analysisTask"
            },
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {
                "key": "this_quarter",
                "label": "2026 Q2"
            },
            "capturedAt": "2026-06-12T10:28:00+08:00",
            "children": [
                {
                    "nodeId": "context-metric-recognized-revenue",
                    "kind": "metric",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask"
                    },
                    "title": "确认收入",
                    "summary": "当前异常指标来源。",
                    "sourceRef": {
                        "type": "metric",
                        "metricId": "metric-recognized-revenue"
                    }
                },
                {
                    "nodeId": "context-table-sales-order",
                    "kind": "dataTable",
                    "role": "inputContext",
                    "owner": {
                        "type": "analysisTask"
                    },
                    "title": "销售订单表",
                    "summary": "用于核对确认收入的订单明细。",
                    "sourceRef": {
                        "type": "dataTable",
                        "tableId": "table-sales-order"
                    }
                }
            ]
        }
    },
    "title": "收入增速异常"
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
            "choices": [
                {
                    "message": {
                        "content": "华东收入增速放缓与渠道确认延迟、库存错配有关。"
                    }
                }
            ],
            "usage": {
                "prompt_tokens": 42,
                "completion_tokens": 18,
                "total_tokens": 60
            }
        }
    )


def fake_model_http_429(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=429,
        msg="Too Many Requests",
        hdrs=None,
        fp=None,
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


def submit_analysis_draft(client: TestClient) -> dict[str, Any]:
    response = client.post("/analysis-tasks/submit", json=deepcopy(TASK_PAYLOAD))
    assert response.status_code == 201, response.text
    return response_json_dict(response.json())


def create_dispatched_submit_run(client: TestClient) -> dict[str, Any]:
    submit_payload = submit_analysis_draft(client)
    run_id = submit_payload["analysisRun"]["runId"]

    dispatch_response = client.post(f"/analysis-runs/{run_id}/dispatch")
    assert dispatch_response.status_code == 202, dispatch_response.text

    return {
        "submit": submit_payload,
        "analysisRun": response_json_dict(dispatch_response.json()),
    }


def build_worker(*, urlopen: object) -> AnalysisRunExecutionWorker:
    database = RuntimeFoundationMysqlCli()
    return AnalysisRunExecutionWorker(
        database=database,
        model_gateway=ModelGateway(settings=get_settings().model_gateway, urlopen=urlopen),
        tool_registry=ToolRegistry(),
    )


def test_worker_execution_runs_langgraph_and_stops_in_running_synthesis(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_model_gateway_env(monkeypatch)
    dispatched = create_dispatched_submit_run(client)
    run_id = dispatched["analysisRun"]["runId"]

    worker = build_worker(urlopen=fake_model_success)
    result = worker.execute_run(run_id)

    assert result["analysisRun"]["runId"] == run_id
    assert result["analysisRun"]["status"] == "running"
    assert result["analysisRun"]["phase"] == "synthesis"
    assert result["analysisRun"]["completedAt"] is None
    assert result["analysisRun"]["failedAt"] is None
    assert result["executionAttempt"]["runId"] == run_id
    assert result["executionAttempt"]["status"] == "released"
    assert result["toolCall"]["runId"] == run_id
    assert result["toolCall"]["toolName"] == "analysis_context_summary"
    assert result["toolCall"]["status"] == "succeeded"
    assert result["modelCall"]["runId"] == run_id
    assert result["modelCall"]["provider"] == "siliconflow"
    assert result["modelCall"]["modelId"] == "Qwen/Qwen3.5-4B"
    assert result["modelCall"]["status"] == "succeeded"
    assert result["modelCall"]["inputTokens"] == 42
    assert result["modelCall"]["outputTokens"] == 18
    assert result["modelCall"]["latencyMs"] >= 0

    run_response = client.get(f"/analysis-runs/{run_id}")
    assert run_response.status_code == 200
    persisted_run = response_json_dict(run_response.json())
    assert persisted_run["status"] == "running"
    assert persisted_run["phase"] == "synthesis"
    assert persisted_run["completedAt"] is None

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [item["eventType"] for item in events]
    assert event_types[-11:] == [
        "worker.lease_acquired",
        "run.started",
        "context.bound",
        "tool_call.requested",
        "tool_call.policy_checked",
        "tool_call.started",
        "tool_call.completed",
        "model_call.started",
        "model_call.completed",
        "synthesis.started",
        "worker.lease_released",
    ]
    completed_tool_event = next(
        item for item in events if item["eventType"] == "tool_call.completed"
    )
    completed_model_event = next(
        item for item in events if item["eventType"] == "model_call.completed"
    )
    assert completed_tool_event["refType"] == "toolCall"
    assert completed_tool_event["refId"] == result["toolCall"]["toolCallId"]
    assert completed_model_event["refType"] == "modelCall"
    assert completed_model_event["refId"] == result["modelCall"]["modelCallId"]

    tool_calls = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/tool-calls").json()
    )["items"]
    assert len(tool_calls) == 1
    assert tool_calls[0]["toolCallId"] == result["toolCall"]["toolCallId"]

    model_calls = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/model-calls").json()
    )["items"]
    assert len(model_calls) == 1
    assert model_calls[0]["modelCallId"] == result["modelCall"]["modelCallId"]

    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}
    conversation_id = dispatched["submit"]["conversation"]["conversationId"]
    messages = response_json_dict(
        client.get(f"/conversations/{conversation_id}/messages").json()
    )["items"]
    assert [message["role"] for message in messages] == ["user"]

    database = RuntimeFoundationMysqlCli()
    assert len(ExecutionAttemptRepository(database).list_by_run_id(run_id)) == 1
    assert len(ToolCallRepository(database).list_by_run_id(run_id)) == 1
    assert len(ModelCallRepository(database).list_by_run_id(run_id)) == 1
    assert SourceEvidenceRepository(database).list_by_run_id(run_id) == []
    assert ReportRepository(database).list_by_run_id(run_id) == []


def test_worker_execution_persists_failed_model_call_without_fake_completion(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    configure_model_gateway_env(monkeypatch)
    dispatched = create_dispatched_submit_run(client)
    run_id = dispatched["analysisRun"]["runId"]

    worker = build_worker(urlopen=fake_model_http_429)
    result = worker.execute_run(run_id)

    assert result["analysisRun"]["runId"] == run_id
    assert result["analysisRun"]["status"] == "failed"
    assert result["analysisRun"]["phase"] == "synthesis"
    assert result["analysisRun"]["outcome"] == "model_failure"
    assert result["executionAttempt"]["status"] == "failed"
    assert result["toolCall"]["status"] == "succeeded"
    assert result["modelCall"]["status"] == "failed"
    assert result["modelCall"]["errorType"] == "http_429"

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [item["eventType"] for item in events]
    assert "model_call.failed" in event_types
    assert event_types[-1] == "run.failed"
    assert "run.completed" not in event_types

    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}
