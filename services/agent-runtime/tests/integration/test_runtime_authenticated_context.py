from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.app.main import create_app
from tests.integration.conftest import login_client, seed_runtime_foundation

DEFAULT_WORKSPACE_ID = "workspace-northstar-retail-china"
SECONDARY_WORKSPACE_ID = "workspace-northstar-retail-sea"
USER_ID = "user-zoe"
BUSINESS_DOMAIN_ID = "business-domain-revenue-quality"
QUESTION = "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。"
TITLE = "收入增速异常"


@pytest.fixture()
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    seed_runtime_foundation()
    with TestClient(create_app()) as test_client:
        login_client(test_client)
        yield test_client


@pytest.fixture()
def unauthenticated_client(runtime_foundation_env: None) -> Iterator[TestClient]:
    seed_runtime_foundation()
    with TestClient(create_app()) as test_client:
        yield test_client


def create_conversation(client: TestClient) -> dict[str, Any]:
    response = client.post("/conversations", json={"title": TITLE})
    assert response.status_code == 201, response.text
    return response.json()


def create_analysis_task(client: TestClient, conversation_id: str) -> dict[str, Any]:
    response = client.post(
        "/analysis-tasks",
        json={
            "conversationId": conversation_id,
            "businessDomainId": BUSINESS_DOMAIN_ID,
            "question": QUESTION,
            "contextPack": None,
        },
    )
    assert response.status_code == 201, response.text
    return response.json()


def create_analysis_run(client: TestClient, analysis_task_id: str) -> dict[str, Any]:
    response = client.post("/analysis-runs", json={"analysisTaskId": analysis_task_id})
    assert response.status_code == 201, response.text
    return response.json()


def test_unauthenticated_submit_returns_401(unauthenticated_client: TestClient) -> None:
    response = unauthenticated_client.post(
        "/analysis-tasks/submit",
        json={
            "businessDomainId": BUSINESS_DOMAIN_ID,
            "question": QUESTION,
            "contextPack": None,
            "title": TITLE,
        },
    )

    assert response.status_code == 401
    assert response.json() == {
        "errorCode": "UNAUTHORIZED",
        "message": "Authentication session is missing or invalid.",
    }


def test_runtime_chain_routes_bind_authenticated_context(client: TestClient) -> None:
    conversation = create_conversation(client)
    assert conversation["workspaceId"] == DEFAULT_WORKSPACE_ID
    assert conversation["userId"] == USER_ID

    analysis_task = create_analysis_task(client, conversation["conversationId"])
    assert analysis_task["workspaceId"] == DEFAULT_WORKSPACE_ID
    assert analysis_task["userId"] == USER_ID
    assert analysis_task["conversationId"] == conversation["conversationId"]

    analysis_run = create_analysis_run(client, analysis_task["analysisTaskId"])
    assert analysis_run["workspaceId"] == DEFAULT_WORKSPACE_ID
    assert analysis_run["userId"] == USER_ID
    assert analysis_run["analysisTaskId"] == analysis_task["analysisTaskId"]


def test_submit_uses_selected_workspace_context(client: TestClient) -> None:
    login_client(client, workspace_id=SECONDARY_WORKSPACE_ID)

    response = client.post(
        "/analysis-tasks/submit",
        json={
            "businessDomainId": BUSINESS_DOMAIN_ID,
            "question": QUESTION,
            "contextPack": None,
            "title": TITLE,
        },
    )

    assert response.status_code == 201, response.text
    payload = response.json()
    assert payload["conversation"]["workspaceId"] == SECONDARY_WORKSPACE_ID
    assert payload["conversation"]["userId"] == USER_ID
    assert payload["analysisTask"]["workspaceId"] == SECONDARY_WORKSPACE_ID
    assert payload["analysisTask"]["userId"] == USER_ID
    assert payload["analysisRun"]["workspaceId"] == SECONDARY_WORKSPACE_ID
    assert payload["analysisRun"]["userId"] == USER_ID


@pytest.mark.parametrize(
    ("path", "payload"),
    [
        (
            "/conversations",
            {
                "title": TITLE,
                "workspaceId": SECONDARY_WORKSPACE_ID,
            },
        ),
        (
            "/analysis-tasks/submit",
            {
                "businessDomainId": BUSINESS_DOMAIN_ID,
                "question": QUESTION,
                "contextPack": None,
                "title": TITLE,
                "userId": "user-luca",
            },
        ),
    ],
)
def test_runtime_routes_reject_client_supplied_identity_fields(
    client: TestClient,
    path: str,
    payload: dict[str, Any],
) -> None:
    response = client.post(path, json=payload)

    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "extra_forbidden"


def test_workspace_switch_hides_other_workspace_runtime_records(client: TestClient) -> None:
    conversation = create_conversation(client)
    analysis_task = create_analysis_task(client, conversation["conversationId"])
    analysis_run = create_analysis_run(client, analysis_task["analysisTaskId"])

    login_client(client, workspace_id=SECONDARY_WORKSPACE_ID)

    conversation_response = client.get(f"/conversations/{conversation['conversationId']}")
    assert conversation_response.status_code == 404
    assert conversation_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": f"Conversation not found: {conversation['conversationId']}",
    }

    analysis_task_response = client.get(f"/analysis-tasks/{analysis_task['analysisTaskId']}")
    assert analysis_task_response.status_code == 404
    assert analysis_task_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": f"AnalysisTask not found: {analysis_task['analysisTaskId']}",
    }

    analysis_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert analysis_run_response.status_code == 404
    assert analysis_run_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": f"AnalysisRun not found: {analysis_run['runId']}",
    }
