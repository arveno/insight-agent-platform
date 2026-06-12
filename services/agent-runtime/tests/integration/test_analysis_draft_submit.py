from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.app.main import create_app


BLANK_SUBMIT_PAYLOAD = {
    "workspaceId": "workspace-northstar-retail-china",
    "userId": "user-zoe",
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速放缓的主要原因，并给出下一步建议。",
    "contextPack": None,
}

CONTEXT_SUBMIT_PAYLOAD = {
    **BLANK_SUBMIT_PAYLOAD,
    "contextPack": {
        "chips": ["Northstar Retail China", "Last 7 days", "3 条证据"],
        "sourceId": "report-weekly-operations-review",
        "sourceTitle": "周经营分析报告",
        "sourceType": "report",
        "suggestedPrompt": "请继续分析华东收入增速放缓的主要原因。",
        "summary": "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
    },
}


@pytest.fixture()
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


def create_conversation(
    client: TestClient,
    *,
    workspace_id: str = BLANK_SUBMIT_PAYLOAD["workspaceId"],
    user_id: str = BLANK_SUBMIT_PAYLOAD["userId"],
    title: str = "既有分析会话",
) -> dict[str, Any]:
    response = client.post(
        "/conversations",
        json={
            "workspaceId": workspace_id,
            "userId": user_id,
            "title": title,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_submit_analysis_draft_creates_conversation_task_run_and_user_message(
    client: TestClient,
) -> None:
    response = client.post("/analysis-tasks/submit", json=BLANK_SUBMIT_PAYLOAD)

    assert response.status_code == 201, response.text
    payload = response.json()

    conversation = payload["conversation"]
    analysis_task = payload["analysisTask"]
    analysis_run = payload["analysisRun"]
    user_message = payload["userMessage"]

    assert conversation["conversationId"].startswith("conversation-")
    assert conversation["workspaceId"] == BLANK_SUBMIT_PAYLOAD["workspaceId"]
    assert conversation["userId"] == BLANK_SUBMIT_PAYLOAD["userId"]
    assert conversation["currentRunId"] == analysis_run["runId"]
    assert conversation["title"]

    assert analysis_task["analysisTaskId"].startswith("analysis-task-")
    assert analysis_task["conversationId"] == conversation["conversationId"]
    assert analysis_task["workspaceId"] == BLANK_SUBMIT_PAYLOAD["workspaceId"]
    assert analysis_task["userId"] == BLANK_SUBMIT_PAYLOAD["userId"]
    assert analysis_task["businessDomainId"] == BLANK_SUBMIT_PAYLOAD["businessDomainId"]
    assert analysis_task["question"] == BLANK_SUBMIT_PAYLOAD["question"]
    assert analysis_task["contextPack"] is None

    assert analysis_run["runId"].startswith("analysis-run-")
    assert analysis_run["analysisTaskId"] == analysis_task["analysisTaskId"]
    assert analysis_run["workspaceId"] == BLANK_SUBMIT_PAYLOAD["workspaceId"]
    assert analysis_run["userId"] == BLANK_SUBMIT_PAYLOAD["userId"]
    assert analysis_run["status"] == "created"
    assert analysis_run["phase"] == "intake"

    assert user_message["messageId"].startswith("message-")
    assert user_message["conversationId"] == conversation["conversationId"]
    assert user_message["analysisTaskId"] == analysis_task["analysisTaskId"]
    assert user_message["runId"] == analysis_run["runId"]
    assert user_message["role"] == "user"
    assert user_message["status"] == "completed"
    assert user_message["content"] == BLANK_SUBMIT_PAYLOAD["question"]

    messages_response = client.get(f"/conversations/{conversation['conversationId']}/messages")
    assert messages_response.status_code == 200, messages_response.text
    assert messages_response.json()["items"] == [user_message]

    run_events_response = client.get(f"/analysis-runs/{analysis_run['runId']}/events")
    assert run_events_response.status_code == 200, run_events_response.text
    run_events = run_events_response.json()["items"]
    assert len(run_events) == 1
    assert run_events[0]["eventType"] == "run.created"

    for path in ("reports", "decisions", "source-evidence", "tool-calls", "model-calls"):
        surface_response = client.get(f"/analysis-runs/{analysis_run['runId']}/{path}")
        assert surface_response.status_code == 200, surface_response.text
        assert surface_response.json()["items"] == []


def test_submit_analysis_draft_persists_typed_context_pack_snapshot(client: TestClient) -> None:
    response = client.post("/analysis-tasks/submit", json=CONTEXT_SUBMIT_PAYLOAD)

    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["analysisTask"]["contextPack"] == CONTEXT_SUBMIT_PAYLOAD["contextPack"]
    assert payload["userMessage"]["analysisTaskId"] == payload["analysisTask"]["analysisTaskId"]
    assert payload["conversation"]["currentRunId"] == payload["analysisRun"]["runId"]


def test_submit_analysis_draft_reuses_existing_conversation(client: TestClient) -> None:
    conversation = create_conversation(client)

    response = client.post(
        "/analysis-tasks/submit",
        json={
            **CONTEXT_SUBMIT_PAYLOAD,
            "conversationId": conversation["conversationId"],
        },
    )

    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["conversation"]["conversationId"] == conversation["conversationId"]
    assert payload["analysisTask"]["conversationId"] == conversation["conversationId"]
    assert payload["userMessage"]["conversationId"] == conversation["conversationId"]


@pytest.mark.parametrize(
    ("field_name", "field_value", "message"),
    [
        ("workspaceId", "workspace-other", "Conversation.workspaceId does not match request.workspaceId"),
        ("userId", "user-luca", "Conversation.userId does not match request.userId"),
    ],
)
def test_submit_analysis_draft_rejects_conversation_workspace_or_user_mismatch(
    client: TestClient,
    field_name: str,
    field_value: str,
    message: str,
) -> None:
    conversation = create_conversation(client)
    payload = {
        **BLANK_SUBMIT_PAYLOAD,
        "conversationId": conversation["conversationId"],
        field_name: field_value,
    }

    response = client.post("/analysis-tasks/submit", json=payload)

    assert response.status_code == 409, response.text
    assert response.json() == {"errorCode": "MISMATCH", "message": message}
