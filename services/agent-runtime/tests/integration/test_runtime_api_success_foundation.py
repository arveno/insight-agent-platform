from __future__ import annotations

import os
import socket
import subprocess
import uuid
from collections.abc import Iterator
from copy import deepcopy
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRepository,
    AnalysisTaskRepository,
    ConversationRepository,
    RuntimeFoundationMysqlCli,
)

REPO_ROOT = Path(__file__).resolve().parents[4]
RUNTIME_FOUNDATION_SCRIPT = REPO_ROOT / "scripts/migration/runtime_foundation.sh"

TASK_PAYLOAD = {
    "workspaceId": "workspace-northstar-retail-china",
    "userId": "user-zoe",
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": {
        "metricId": "metric-recognized-revenue",
        "timeRange": "2026 Q2",
        "threshold": "收入增速 < -2%",
        "trend": "华东区域收入增速低于阈值",
        "tableIds": ["table-sales-order", "table-refund-order"],
        "knowledgeDocumentIds": [
            "knowledge-document-channel-weekly-17",
            "knowledge-document-inventory-east-04",
        ],
    },
    "title": "收入增速异常",
}


def run_runtime_foundation_command(
    *args: str, check: bool = True
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(RUNTIME_FOUNDATION_SCRIPT), *args],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
        check=check,
        env=os.environ.copy(),
    )


def pick_free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def create_analysis_task(
    client: TestClient,
    *,
    workspace_id: str | None = None,
    user_id: str | None = None,
) -> dict[str, object]:
    payload = deepcopy(TASK_PAYLOAD)
    if workspace_id is not None:
        payload["workspaceId"] = workspace_id
    if user_id is not None:
        payload["userId"] = user_id

    response = client.post("/analysis-tasks", json=payload)
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def runtime_api_env(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    project_suffix = uuid.uuid4().hex[:8]
    mysql_host_port = str(pick_free_port())

    monkeypatch.setenv("IAP_MIGRATION_TARGET", "local")
    monkeypatch.setenv("IAP_MIGRATION_COMPOSE_PROJECT_NAME", f"iap-runtime-api-{project_suffix}")
    monkeypatch.setenv("IAP_MIGRATION_DATA_DIR", str(tmp_path / "mysql-data"))
    monkeypatch.setenv("IAP_MIGRATION_MYSQL_HOST_PORT", mysql_host_port)
    monkeypatch.setenv("MYSQL_HOST", "127.0.0.1")
    monkeypatch.setenv("MYSQL_PORT", mysql_host_port)
    monkeypatch.setenv("MYSQL_DATABASE", "insight_agent_platform")
    monkeypatch.setenv("MYSQL_USER", "iap_preview")
    monkeypatch.setenv("MYSQL_PASSWORD", "iap_preview_password")
    get_settings.cache_clear()

    migrate_result = run_runtime_foundation_command("migrate")
    assert migrate_result.returncode == 0, migrate_result.stderr

    try:
        yield
    finally:
        run_runtime_foundation_command("down", check=False)
        get_settings.cache_clear()


@pytest.fixture()
def client(runtime_api_env: None) -> Iterator[TestClient]:
    with TestClient(create_app()) as test_client:
        yield test_client


def test_runtime_api_success_foundation_flow(client: TestClient) -> None:
    analysis_task = create_analysis_task(client)
    assert analysis_task["analysisTaskId"].startswith("analysis-task-")
    assert analysis_task["workspaceId"] == TASK_PAYLOAD["workspaceId"]
    assert analysis_task["userId"] == TASK_PAYLOAD["userId"]
    assert analysis_task["businessDomainId"] == TASK_PAYLOAD["businessDomainId"]
    assert analysis_task["question"] == TASK_PAYLOAD["question"]
    assert analysis_task["contextPack"] == TASK_PAYLOAD["contextPack"]
    assert analysis_task["createdAt"] == analysis_task["updatedAt"]

    create_conversation_response = client.post(
        "/conversations",
        json={
            "workspaceId": analysis_task["workspaceId"],
            "userId": analysis_task["userId"],
            "analysisTaskId": analysis_task["analysisTaskId"],
            "title": TASK_PAYLOAD["title"],
        },
    )

    assert create_conversation_response.status_code == 201
    conversation = create_conversation_response.json()
    assert conversation["conversationId"].startswith("conversation-")
    assert conversation["analysisTaskId"] == analysis_task["analysisTaskId"]
    assert conversation["currentRunId"] is None
    assert conversation["status"] == "active"

    create_run_response = client.post(
        "/analysis-runs",
        json={
            "workspaceId": analysis_task["workspaceId"],
            "userId": analysis_task["userId"],
            "analysisTaskId": analysis_task["analysisTaskId"],
            "conversationId": conversation["conversationId"],
        },
    )

    assert create_run_response.status_code == 201
    analysis_run = create_run_response.json()
    assert analysis_run["runId"].startswith("analysis-run-")
    assert analysis_run["analysisTaskId"] == analysis_task["analysisTaskId"]
    assert analysis_run["status"] == "created"
    assert analysis_run["phase"] == "intake"
    assert analysis_run["outcome"] is None
    assert analysis_run["waitingFor"] is None
    assert analysis_run["retryable"] is True
    assert analysis_run["completedAt"] is None
    assert analysis_run["failedAt"] is None

    get_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert get_run_response.status_code == 200
    assert get_run_response.json() == analysis_run

    get_run_conversation_response = client.get(
        f"/analysis-runs/{analysis_run['runId']}/conversation"
    )
    assert get_run_conversation_response.status_code == 200
    run_conversation = get_run_conversation_response.json()
    assert run_conversation["conversationId"] == conversation["conversationId"]
    assert run_conversation["currentRunId"] == analysis_run["runId"]

    get_conversation_response = client.get(f"/conversations/{conversation['conversationId']}")
    assert get_conversation_response.status_code == 200
    assert get_conversation_response.json() == run_conversation

    database = RuntimeFoundationMysqlCli()
    analysis_task_repository = AnalysisTaskRepository(database)
    conversation_repository = ConversationRepository(database)
    analysis_run_repository = AnalysisRunRepository(database)

    assert (
        analysis_task_repository.get_by_analysis_task_id(analysis_task["analysisTaskId"])
        == analysis_task
    )
    assert (
        conversation_repository.get_by_conversation_id(conversation["conversationId"])
        == run_conversation
    )
    assert analysis_run_repository.get_by_run_id(analysis_run["runId"]) == analysis_run

    list_messages_response = client.get(f"/conversations/{conversation['conversationId']}/messages")
    assert list_messages_response.status_code == 501

    list_events_response = client.get(f"/analysis-runs/{analysis_run['runId']}/events")
    assert list_events_response.status_code == 501


def test_create_conversation_returns_not_found_when_analysis_task_missing(
    client: TestClient,
) -> None:
    response = client.post(
        "/conversations",
        json={
            "workspaceId": TASK_PAYLOAD["workspaceId"],
            "userId": TASK_PAYLOAD["userId"],
            "analysisTaskId": "analysis-task-missing",
            "title": TASK_PAYLOAD["title"],
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisTask not found: analysis-task-missing",
    }


def test_create_analysis_run_returns_mismatch_when_conversation_chain_conflicts(
    client: TestClient,
) -> None:
    analysis_task = create_analysis_task(client)
    other_analysis_task = create_analysis_task(client)

    create_conversation_response = client.post(
        "/conversations",
        json={
            "workspaceId": analysis_task["workspaceId"],
            "userId": analysis_task["userId"],
            "analysisTaskId": analysis_task["analysisTaskId"],
            "title": TASK_PAYLOAD["title"],
        },
    )
    assert create_conversation_response.status_code == 201
    conversation = create_conversation_response.json()

    mismatch_response = client.post(
        "/analysis-runs",
        json={
            "workspaceId": analysis_task["workspaceId"],
            "userId": analysis_task["userId"],
            "analysisTaskId": other_analysis_task["analysisTaskId"],
            "conversationId": conversation["conversationId"],
        },
    )

    assert mismatch_response.status_code == 409
    assert mismatch_response.json() == {
        "errorCode": "MISMATCH",
        "message": "Conversation.analysisTaskId does not match request.analysisTaskId",
    }


@pytest.mark.parametrize(
    ("field_name", "field_value", "expected_message"),
    [
        (
            "workspaceId",
            "workspace-south",
            "AnalysisTask.workspaceId does not match request.workspaceId",
        ),
        ("userId", "user-luca", "AnalysisTask.userId does not match request.userId"),
    ],
)
def test_create_conversation_returns_mismatch_when_analysis_task_scope_conflicts(
    client: TestClient,
    field_name: str,
    field_value: str,
    expected_message: str,
) -> None:
    analysis_task = create_analysis_task(client)

    payload = {
        "workspaceId": analysis_task["workspaceId"],
        "userId": analysis_task["userId"],
        "analysisTaskId": analysis_task["analysisTaskId"],
        "title": TASK_PAYLOAD["title"],
    }
    payload[field_name] = field_value

    response = client.post("/conversations", json=payload)

    assert response.status_code == 409
    assert response.json() == {
        "errorCode": "MISMATCH",
        "message": expected_message,
    }


@pytest.mark.parametrize(
    ("field_name", "field_value", "expected_message"),
    [
        (
            "workspaceId",
            "workspace-south",
            "Conversation.workspaceId does not match request.workspaceId",
        ),
        ("userId", "user-luca", "Conversation.userId does not match request.userId"),
    ],
)
def test_create_analysis_run_returns_mismatch_when_conversation_scope_conflicts(
    client: TestClient,
    field_name: str,
    field_value: str,
    expected_message: str,
) -> None:
    analysis_task = create_analysis_task(client)
    create_conversation_response = client.post(
        "/conversations",
        json={
            "workspaceId": analysis_task["workspaceId"],
            "userId": analysis_task["userId"],
            "analysisTaskId": analysis_task["analysisTaskId"],
            "title": TASK_PAYLOAD["title"],
        },
    )
    assert create_conversation_response.status_code == 201
    conversation = create_conversation_response.json()

    payload = {
        "workspaceId": analysis_task["workspaceId"],
        "userId": analysis_task["userId"],
        "analysisTaskId": analysis_task["analysisTaskId"],
        "conversationId": conversation["conversationId"],
    }
    payload[field_name] = field_value

    response = client.post("/analysis-runs", json=payload)

    assert response.status_code == 409
    assert response.json() == {
        "errorCode": "MISMATCH",
        "message": expected_message,
    }


def test_get_endpoints_return_not_found_for_unknown_ids(client: TestClient) -> None:
    get_run_response = client.get("/analysis-runs/analysis-run-missing")
    assert get_run_response.status_code == 404
    assert get_run_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }

    get_conversation_response = client.get("/conversations/conversation-missing")
    assert get_conversation_response.status_code == 404
    assert get_conversation_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "Conversation not found: conversation-missing",
    }
