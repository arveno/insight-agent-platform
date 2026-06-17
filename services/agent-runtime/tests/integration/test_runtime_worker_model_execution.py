from __future__ import annotations

import io
import json
import os
import ssl
import subprocess
from collections.abc import Iterator
from copy import deepcopy
from http.client import HTTPMessage
from pathlib import Path
from typing import Any, cast
from urllib.error import HTTPError, URLError
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

REPO_ROOT = Path(__file__).resolve().parents[4]
MODEL_GATEWAY_FAILURE_VERIFY_SCRIPT = (
    REPO_ROOT / "scripts" / "migration" / "model_gateway_failure_verify.sh"
)

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
        hdrs=_http_headers({"Retry-After": "12", "X-Request-Id": "request-rate-limit-429"}),
        fp=io.BytesIO(
            b'{"error":{"message":"rate limit exceeded","code":"rate_limit_exceeded"}}'
        ),
    )


def fake_model_http_401(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=401,
        msg="Unauthorized",
        hdrs=_http_headers({"X-Request-Id": "request-auth-401"}),
        fp=io.BytesIO(b'{"error":{"message":"invalid api key","code":"invalid_api_key"}}'),
    )


def fake_model_http_404_model_not_found(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=404,
        msg="Not Found",
        hdrs=_http_headers({"X-Request-Id": "request-model-404"}),
        fp=io.BytesIO(b'{"error":{"message":"model not found","code":"model_not_found"}}'),
    )


def fake_model_http_503(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=503,
        msg="Service Unavailable",
        hdrs=_http_headers({"Retry-After": "30", "X-Request-Id": "request-server-503"}),
        fp=io.BytesIO(b'{"error":{"message":"service unavailable","code":"server_overloaded"}}'),
    )


def fake_model_timeout(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    raise TimeoutError("The read operation timed out")


def fake_model_invalid_json(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    return FakeRawResponse(b"{not-json")


def fake_model_quota_429(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=429,
        msg="Too Many Requests",
        hdrs=_http_headers({"X-Request-Id": "request-quota-429"}),
        fp=io.BytesIO(
            b'{"error":{"message":"insufficient quota for current account",'
            b'"code":"insufficient_quota"}}'
        ),
    )


def fake_model_http_400_sensitive_message(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (timeout, context)
    raise HTTPError(
        url=request.full_url,
        code=400,
        msg="Bad Request",
        hdrs=_http_headers({"X-Request-Id": "request-sensitive-400"}),
        fp=io.BytesIO(
            b'{"error":{"message":"Authorization: Bearer siliconflow-secret '
            b'should not leak","code":"bad_request"}}'
        ),
    )


def fake_model_cert_error(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    raise URLError(ssl.SSLCertVerificationError("certificate verify failed"))


def fake_model_network_error(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    raise URLError("connection reset by peer")


def fake_model_worker_integration_bug(
    request: Request,
    timeout: float,
    context: object,
) -> FakeUrlopenResponse:
    _ = (request, timeout, context)
    raise RuntimeError("worker integration contract broke")


class FakeRawResponse:
    def __init__(self, payload: bytes, *, status: int = 200) -> None:
        self._payload = payload
        self.status = status

    def read(self) -> bytes:
        return self._payload

    def __enter__(self) -> FakeRawResponse:
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> bool | None:
        return None


def _http_headers(values: dict[str, str]) -> HTTPMessage:
    headers = HTTPMessage()
    for key, value in values.items():
        headers[key] = value
    return headers


def configure_model_gateway_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("IAP_MODEL_ACTIVE_PROVIDER", "siliconflow")
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_API_FORMAT",
        "openai_chat_completions",
    )
    monkeypatch.setenv(
        "IAP_MODEL_PROVIDER_SILICONFLOW_BASE_URL",
        "https://api.siliconflow.cn/v1",
    )
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


def build_worker_with_gateway(*, model_gateway: ModelGateway) -> AnalysisRunExecutionWorker:
    return AnalysisRunExecutionWorker(
        database=RuntimeFoundationMysqlCli(),
        model_gateway=model_gateway,
        tool_registry=ToolRegistry(),
    )


def execute_worker(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    *,
    urlopen: object,
) -> tuple[dict[str, Any], str]:
    configure_model_gateway_env(monkeypatch)
    dispatched = create_dispatched_submit_run(client)
    run_id = dispatched["analysisRun"]["runId"]
    worker = build_worker(urlopen=urlopen)
    return worker.execute_run(run_id), run_id


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
    assert result["modelCall"]["failureClass"] is None
    assert result["modelCall"]["retryable"] is None
    assert result["modelCall"]["rawErrorRedacted"] is None

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


@pytest.mark.parametrize(
    ("urlopen", "expected"),
    [
        (
            fake_model_timeout,
            {
                "failureClass": "provider_timeout",
                "errorType": "timeout_error",
                "httpStatus": None,
                "providerErrorCode": None,
                "providerRequestId": None,
                "timeoutMs": 30000,
                "retryable": True,
                "retryAfterMs": None,
            },
        ),
        (
            fake_model_http_400_sensitive_message,
            {
                "failureClass": "unknown",
                "errorType": "http_400",
                "httpStatus": 400,
                "providerErrorCode": "bad_request",
                "providerRequestId": "request-sensitive-400",
                "timeoutMs": None,
                "retryable": False,
                "retryAfterMs": None,
            },
        ),
        (
            fake_model_http_429,
            {
                "failureClass": "provider_rate_limit",
                "errorType": "http_429",
                "httpStatus": 429,
                "providerErrorCode": "rate_limit_exceeded",
                "providerRequestId": "request-rate-limit-429",
                "timeoutMs": None,
                "retryable": True,
                "retryAfterMs": 12000,
            },
        ),
        (
            fake_model_http_401,
            {
                "failureClass": "provider_auth_error",
                "errorType": "http_401",
                "httpStatus": 401,
                "providerErrorCode": "invalid_api_key",
                "providerRequestId": "request-auth-401",
                "timeoutMs": None,
                "retryable": False,
                "retryAfterMs": None,
            },
        ),
        (
            fake_model_http_404_model_not_found,
            {
                "failureClass": "provider_model_not_found",
                "errorType": "http_404",
                "httpStatus": 404,
                "providerErrorCode": "model_not_found",
                "providerRequestId": "request-model-404",
                "timeoutMs": None,
                "retryable": False,
                "retryAfterMs": None,
            },
        ),
        (
            fake_model_http_503,
            {
                "failureClass": "provider_5xx",
                "errorType": "http_503",
                "httpStatus": 503,
                "providerErrorCode": "server_overloaded",
                "providerRequestId": "request-server-503",
                "timeoutMs": None,
                "retryable": True,
                "retryAfterMs": 30000,
            },
        ),
        (
            fake_model_invalid_json,
            {
                "failureClass": "provider_response_schema_error",
                "errorType": "invalid_response_json",
                "httpStatus": None,
                "providerErrorCode": None,
                "providerRequestId": None,
                "timeoutMs": None,
                "retryable": False,
                "retryAfterMs": None,
            },
        ),
    ],
)
def test_worker_execution_classifies_failed_model_calls(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
    urlopen: object,
    expected: dict[str, object],
) -> None:
    result, run_id = execute_worker(client, monkeypatch, urlopen=urlopen)

    assert result["analysisRun"]["runId"] == run_id
    assert result["analysisRun"]["status"] == "failed"
    assert result["analysisRun"]["phase"] == "synthesis"
    assert result["analysisRun"]["outcome"] == "model_failure"
    assert result["analysisRun"]["failureCode"] == expected["failureClass"]
    assert result["analysisRun"]["retryable"] == expected["retryable"]
    assert result["executionAttempt"]["status"] == "failed"
    assert result["executionAttempt"]["failureCode"] == expected["failureClass"]
    assert result["toolCall"]["status"] == "succeeded"
    assert result["modelCall"]["status"] == "failed"
    assert result["modelCall"]["failureClass"] == expected["failureClass"]
    assert result["modelCall"]["errorType"] == expected["errorType"]
    assert result["modelCall"]["httpStatus"] == expected["httpStatus"]
    assert result["modelCall"]["providerErrorCode"] == expected["providerErrorCode"]
    assert result["modelCall"]["providerRequestId"] == expected["providerRequestId"]
    assert result["modelCall"]["timeoutMs"] == expected["timeoutMs"]
    assert result["modelCall"]["retryable"] == expected["retryable"]
    assert result["modelCall"]["retryAfterMs"] == expected["retryAfterMs"]
    assert result["modelCall"]["rawErrorRedacted"] is not None
    assert result["modelCall"]["errorMessage"] is not None
    assert "Authorization" not in result["modelCall"]["errorMessage"]
    assert "Bearer" not in result["modelCall"]["errorMessage"]
    assert "siliconflow-secret" not in result["modelCall"]["errorMessage"]
    assert "Authorization" not in result["modelCall"]["rawErrorRedacted"]
    assert "Bearer" not in result["modelCall"]["rawErrorRedacted"]
    assert "siliconflow-secret" not in result["modelCall"]["rawErrorRedacted"]

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    event_types = [item["eventType"] for item in events]
    assert "model_call.failed" in event_types
    assert event_types[-1] == "run.failed"
    assert "run.completed" not in event_types
    model_failed_event = next(item for item in events if item["eventType"] == "model_call.failed")
    run_failed_event = next(item for item in events if item["eventType"] == "run.failed")
    assert model_failed_event["errorCode"] == expected["failureClass"]
    assert run_failed_event["errorCode"] == expected["failureClass"]
    assert model_failed_event["errorMessage"] == result["modelCall"]["errorMessage"]
    assert run_failed_event["errorMessage"] == result["modelCall"]["errorMessage"]
    assert "Authorization" not in model_failed_event["errorMessage"]
    assert "Bearer" not in model_failed_event["errorMessage"]
    assert "siliconflow-secret" not in model_failed_event["errorMessage"]
    assert "Authorization" not in run_failed_event["errorMessage"]
    assert "Bearer" not in run_failed_event["errorMessage"]
    assert "siliconflow-secret" not in run_failed_event["errorMessage"]

    persisted_model_call = response_json_dict(
        client.get(f"/analysis-runs/{run_id}/model-calls").json()
    )["items"][0]
    assert persisted_model_call == result["modelCall"]

    assert client.get(f"/analysis-runs/{run_id}/source-evidence").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/reports").json() == {"items": []}
    assert client.get(f"/analysis-runs/{run_id}/decisions").json() == {"items": []}


def test_worker_execution_classifies_worker_integration_bug(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FakeWorkerIntegrationGateway:
        def describe_target(self) -> object:
            return type(
                "Target",
                (),
                {"provider": "siliconflow", "model_id": "Qwen/Qwen3.5-4B"},
            )()

        def generate_text(self, **_: object) -> object:
            raise RuntimeError("worker integration contract broke")

    configure_model_gateway_env(monkeypatch)
    dispatched = create_dispatched_submit_run(client)
    run_id = dispatched["analysisRun"]["runId"]
    worker = build_worker_with_gateway(
        model_gateway=cast(ModelGateway, FakeWorkerIntegrationGateway())
    )
    result = worker.execute_run(run_id)

    assert result["analysisRun"]["status"] == "failed"
    assert result["analysisRun"]["failureCode"] == "worker_integration_bug"
    assert result["analysisRun"]["retryable"] is False
    assert result["executionAttempt"]["failureCode"] == "worker_integration_bug"
    assert result["modelCall"]["failureClass"] == "worker_integration_bug"
    assert result["modelCall"]["errorType"] == "worker_integration_error"
    assert result["modelCall"]["errorMessage"] == "worker integration contract broke"
    assert result["modelCall"]["retryable"] is False

    events = response_json_dict(client.get(f"/analysis-runs/{run_id}/events").json())["items"]
    model_failed_event = next(item for item in events if item["eventType"] == "model_call.failed")
    run_failed_event = next(item for item in events if item["eventType"] == "run.failed")
    assert model_failed_event["errorCode"] == "worker_integration_bug"
    assert run_failed_event["errorCode"] == "worker_integration_bug"


def test_worker_failure_query_verify_reports_structured_timeout_classification(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _, run_id = execute_worker(client, monkeypatch, urlopen=fake_model_timeout)

    verify_result = subprocess.run(
        [str(MODEL_GATEWAY_FAILURE_VERIFY_SCRIPT), run_id, "provider_timeout"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        env=os.environ.copy(),
        check=False,
    )

    assert verify_result.returncode == 0, verify_result.stderr
    assert "failureClass=provider_timeout" in verify_result.stdout
    assert "analysisRun.failureCode=provider_timeout" in verify_result.stdout
    assert "run_events.model_call.failed.errorCode=provider_timeout" in verify_result.stdout
    assert "run_events.run.failed.errorCode=provider_timeout" in verify_result.stdout
    assert "retryable=1" in verify_result.stdout
    assert "secrets.authorization.exposed=0" in verify_result.stdout
    assert "suggestedAction=retry_and_compare_baseline_provider_health" in verify_result.stdout
