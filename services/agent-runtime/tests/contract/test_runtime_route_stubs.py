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
    ("get", "/analysis-runs/analysis-q2-revenue-gap/events", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/tool-calls", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/model-calls", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/source-evidence", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/reports", None, None),
    ("get", "/analysis-runs/analysis-q2-revenue-gap/approvals", None, None),
    ("post", "/analysis-runs/analysis-q2-revenue-gap/cancel", None, None),
    ("post", "/analysis-runs/analysis-q2-revenue-gap/retry", None, None),
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
