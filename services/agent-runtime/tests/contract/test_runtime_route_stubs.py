from collections.abc import Mapping

import pytest
from fastapi.testclient import TestClient
from src.app.main import app

ROUTE_STUB_ERROR = {
    "errorCode": "NOT_IMPLEMENTED",
    "message": "Runtime route stub is registered; real implementation is pending.",
}

RouteCase = tuple[str, str, Mapping[str, object] | None, Mapping[str, str] | None]

ROUTE_CASES: list[RouteCase] = [
    ("get", "/conversations/conversation-revenue-gap-q2/messages", None, None),
    (
        "get",
        "/conversations/conversation-revenue-gap-q2/messages/message-revenue-gap-q2-user",
        None,
        None,
    ),
    (
        "get",
        "/conversations/conversation-revenue-gap-q2/messages/message-revenue-gap-q2-assistant/stream",
        None,
        {"accept": "text/event-stream"},
    ),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/tool-calls", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/model-calls", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/approvals", None, None),
    (
        "post",
        "/analysis-runs/analysis-q2-revenue-gap/approvals/approval-revenue-gap-q2/decision",
        {"status": "granted", "decisionReason": "Finance lead approved the retry."},
        None,
    ),
]


@pytest.mark.parametrize(("method", "path", "payload", "headers"), ROUTE_CASES)
def test_runtime_route_stubs_return_structured_not_implemented_error(
    method: str,
    path: str,
    payload: Mapping[str, object] | None,
    headers: Mapping[str, str] | None,
) -> None:
    client = TestClient(app)

    response = client.request(method.upper(), path, json=payload, headers=headers)

    assert response.status_code == 501
    assert response.json() == ROUTE_STUB_ERROR


REQUEST_VALIDATION_CASES: list[tuple[str, Mapping[str, object], list[str]]] = [
    (
        "/analysis-runs/analysis-q2-revenue-gap/worker-claim",
        {},
        ["workerId"],
    ),
    (
        "/analysis-runs/analysis-q2-revenue-gap/worker-heartbeat",
        {"workerId": "worker-runtime-dispatch-foundation"},
        ["attemptId"],
    ),
    (
        "/analysis-runs/analysis-q2-revenue-gap/worker-failure",
        {
            "attemptId": "attempt-1",
            "workerId": "worker-runtime-dispatch-foundation",
        },
        ["failureCode", "failureMessage"],
    ),
    (
        "/analysis-runs/analysis-q2-revenue-gap/worker-lost",
        {
            "attemptId": "attempt-1",
            "workerId": "worker-runtime-dispatch-foundation",
        },
        ["lostReason"],
    ),
    (
        "/analysis-runs/analysis-q2-revenue-gap/worker-release",
        {"workerId": "worker-runtime-dispatch-foundation"},
        ["attemptId"],
    ),
    (
        "/analysis-runs/analysis-q2-revenue-gap/cancel",
        {"reason": None, "payload": "unexpected"},
        ["payload"],
    ),
]


@pytest.mark.parametrize(("path", "payload", "expected_fields"), REQUEST_VALIDATION_CASES)
def test_worker_control_plane_routes_enforce_request_contracts(
    path: str,
    payload: Mapping[str, object],
    expected_fields: list[str],
) -> None:
    client = TestClient(app)

    response = client.post(path, json=payload)

    assert response.status_code == 422
    detail = response.json()["detail"]
    detail_fields = [item["loc"][-1] for item in detail]
    for expected_field in expected_fields:
        assert expected_field in detail_fields
