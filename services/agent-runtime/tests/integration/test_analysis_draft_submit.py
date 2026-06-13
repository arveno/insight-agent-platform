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

def build_context_pack(analysis_task_id: str | None = None) -> dict[str, Any]:
    owner: dict[str, str] = {"type": "analysisTask"}

    if analysis_task_id is not None:
        owner["analysisTaskId"] = analysis_task_id

    return {
        "version": 1,
        "suggestedPrompt": "请继续分析华东收入增速放缓的主要原因。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-05T03:08:12Z",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": owner,
            "title": "经营状态总览",
            "summary": "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
            "chips": ["Northstar Retail China", "Last 7 days", "3 条证据"],
            "timeRange": {
                "key": "last_7_days",
                "label": "Last 7 days",
            },
            "capturedAt": "2026-06-05T03:08:12Z",
            "children": [
                {
                    "nodeId": "inspector-node-task-context-report",
                    "kind": "report",
                    "role": "inputContext",
                    "owner": owner,
                    "title": "周经营分析报告",
                    "summary": "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
                    "sourceRef": {
                        "type": "report",
                        "reportId": "report-weekly-operations-review",
                    },
                }
            ],
        },
    }

CONTEXT_SUBMIT_PAYLOAD = {
    **BLANK_SUBMIT_PAYLOAD,
    "contextPack": build_context_pack(),
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


def create_analysis_task_payload(
    *,
    conversation_id: str,
    workspace_id: str = BLANK_SUBMIT_PAYLOAD["workspaceId"],
    user_id: str = BLANK_SUBMIT_PAYLOAD["userId"],
) -> dict[str, Any]:
    return {
        "businessDomainId": BLANK_SUBMIT_PAYLOAD["businessDomainId"],
        "contextPack": CONTEXT_SUBMIT_PAYLOAD["contextPack"],
        "conversationId": conversation_id,
        "question": BLANK_SUBMIT_PAYLOAD["question"],
        "userId": user_id,
        "workspaceId": workspace_id,
    }


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
    assert payload["analysisTask"]["contextPack"] == build_context_pack(
        payload["analysisTask"]["analysisTaskId"]
    )
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


def test_create_analysis_task_rejects_missing_conversation(client: TestClient) -> None:
    response = client.post(
        "/analysis-tasks",
        json=create_analysis_task_payload(conversation_id="conversation-missing"),
    )

    assert response.status_code == 404, response.text
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "Conversation not found: conversation-missing",
    }


def test_create_analysis_task_rejects_workspace_mismatch(client: TestClient) -> None:
    conversation = create_conversation(client)

    response = client.post(
        "/analysis-tasks",
        json=create_analysis_task_payload(
            conversation_id=conversation["conversationId"],
            workspace_id="workspace-other",
        ),
    )

    assert response.status_code == 409, response.text
    assert response.json() == {
        "errorCode": "MISMATCH",
        "message": "Conversation.workspaceId does not match request.workspaceId",
    }


def test_create_analysis_task_rejects_user_mismatch(client: TestClient) -> None:
    conversation = create_conversation(client)

    response = client.post(
        "/analysis-tasks",
        json=create_analysis_task_payload(
            conversation_id=conversation["conversationId"],
            user_id="user-luca",
        ),
    )

    assert response.status_code == 409, response.text
    assert response.json() == {
        "errorCode": "MISMATCH",
        "message": "Conversation.userId does not match request.userId",
    }


def test_create_analysis_task_binds_to_valid_conversation(client: TestClient) -> None:
    conversation = create_conversation(client)

    response = client.post(
        "/analysis-tasks",
        json=create_analysis_task_payload(conversation_id=conversation["conversationId"]),
    )

    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["conversationId"] == conversation["conversationId"]
    assert payload["workspaceId"] == conversation["workspaceId"]
    assert payload["userId"] == conversation["userId"]
    assert payload["contextPack"] == build_context_pack(payload["analysisTaskId"])


def test_get_analysis_task_returns_persisted_tree_shaped_context_pack(client: TestClient) -> None:
    conversation = create_conversation(client)

    create_response = client.post(
        "/analysis-tasks",
        json=create_analysis_task_payload(conversation_id=conversation["conversationId"]),
    )
    assert create_response.status_code == 201, create_response.text
    created_task = create_response.json()

    get_response = client.get(f"/analysis-tasks/{created_task['analysisTaskId']}")

    assert get_response.status_code == 200, get_response.text
    assert get_response.json() == {
        **created_task,
        "contextPack": build_context_pack(created_task["analysisTaskId"]),
    }


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
