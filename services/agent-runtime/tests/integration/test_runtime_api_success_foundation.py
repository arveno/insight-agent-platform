from __future__ import annotations

import os
import socket
import subprocess
import uuid
from collections.abc import Iterator
from copy import deepcopy
from pathlib import Path
from typing import Any, cast

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRepository,
    AnalysisTaskRepository,
    ConversationRepository,
    DecisionRecord,
    DecisionRepository,
    ExecutionAttemptRepository,
    ReportRecord,
    ReportRepository,
    ReportSectionRecord,
    RunEventRepository,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRecord,
    SourceEvidenceRepository,
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

RUN_CREATED_SUMMARY = "记录 AnalysisRun 已创建并绑定 AnalysisTask / Conversation。"
EXPECTED_DISPATCH_EVENTS = [
    ("run.created", "intake"),
    ("validation.started", "preflight"),
    ("validation.passed", "preflight"),
    ("policy.decision_recorded", "governance"),
    ("context.bound", "context_binding"),
    ("plan.created", "planning"),
    ("run.queued", "queueing"),
]

SOURCE_EVIDENCE_IDS = [
    "source-evidence-channel-weekly-17",
    "source-evidence-inventory-note-east-04",
]
REPORT_ID = "report-revenue-gap-q2"
DECISION_ID = "decision-revenue-gap-q2"


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


def response_json_dict(payload: object) -> dict[str, Any]:
    return cast(dict[str, Any], payload)


def create_analysis_task(
    client: TestClient,
    *,
    workspace_id: str | None = None,
    user_id: str | None = None,
) -> dict[str, Any]:
    payload = deepcopy(TASK_PAYLOAD)
    if workspace_id is not None:
        payload["workspaceId"] = workspace_id
    if user_id is not None:
        payload["userId"] = user_id

    response = client.post("/analysis-tasks", json=payload)
    assert response.status_code == 201
    return response_json_dict(response.json())


def get_run_events(client: TestClient, run_id: str) -> dict[str, Any]:
    response = client.get(f"/analysis-runs/{run_id}/events")
    assert response.status_code == 200
    return response_json_dict(response.json())


def create_conversation(
    client: TestClient,
    *,
    workspace_id: str,
    user_id: str,
    analysis_task_id: str,
) -> dict[str, Any]:
    response = client.post(
        "/conversations",
        json={
            "workspaceId": workspace_id,
            "userId": user_id,
            "analysisTaskId": analysis_task_id,
            "title": TASK_PAYLOAD["title"],
        },
    )
    assert response.status_code == 201
    return response_json_dict(response.json())


def create_analysis_run(
    client: TestClient,
    *,
    workspace_id: str,
    user_id: str,
    analysis_task_id: str,
    conversation_id: str,
) -> dict[str, Any]:
    response = client.post(
        "/analysis-runs",
        json={
            "workspaceId": workspace_id,
            "userId": user_id,
            "analysisTaskId": analysis_task_id,
            "conversationId": conversation_id,
        },
    )
    assert response.status_code == 201
    return response_json_dict(response.json())


def create_dispatched_run(client: TestClient) -> dict[str, Any]:
    analysis_task = create_analysis_task(client)
    conversation = create_conversation(
        client,
        workspace_id=analysis_task["workspaceId"],
        user_id=analysis_task["userId"],
        analysis_task_id=analysis_task["analysisTaskId"],
    )
    analysis_run = create_analysis_run(
        client,
        workspace_id=analysis_task["workspaceId"],
        user_id=analysis_task["userId"],
        analysis_task_id=analysis_task["analysisTaskId"],
        conversation_id=conversation["conversationId"],
    )
    dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert dispatch_response.status_code == 202
    dispatched_run = response_json_dict(dispatch_response.json())

    return {
        "analysisTask": analysis_task,
        "conversation": conversation,
        "analysisRun": dispatched_run,
    }


def build_source_evidence_records(run_id: str) -> list[SourceEvidenceRecord]:
    return [
        {
            "sourceEvidenceId": SOURCE_EVIDENCE_IDS[0],
            "runId": run_id,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-channel-weekly-17",
            "title": "渠道周报第 17 期",
            "snippet": "华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
            "metadata": {"displayCategory": "weekly_digest"},
            "confidence": 0.86,
            "createdAt": "2026-06-05T03:23:00Z",
        },
        {
            "sourceEvidenceId": SOURCE_EVIDENCE_IDS[1],
            "runId": run_id,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-inventory-east-04",
            "title": "华东库存复核记录",
            "snippet": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
            "metadata": {"displayCategory": "inventory_note"},
            "confidence": 0.82,
            "createdAt": "2026-06-05T03:24:00Z",
        },
    ]


def build_report_record(run_id: str, workspace_id: str) -> ReportRecord:
    report_section: ReportSectionRecord = {
        "reportSectionId": "report-revenue-gap-q2-section-next-step",
        "reportId": REPORT_ID,
        "title": "下一步动作",
        "content": "先核对渠道确认周期，再复核促销库存错配。",
        "createdAt": "2026-06-05T03:25:00Z",
    }
    return {
        "reportId": REPORT_ID,
        "runId": run_id,
        "workspaceId": workspace_id,
        "title": "收入异常分析摘要",
        "summary": "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作。",
        "sections": [report_section],
        "sourceEvidence": SOURCE_EVIDENCE_IDS,
        "createdAt": "2026-06-05T03:25:00Z",
    }


def build_decision_record(run_id: str, workspace_id: str) -> DecisionRecord:
    return {
        "decisionId": DECISION_ID,
        "workspaceId": workspace_id,
        "runId": run_id,
        "reportId": REPORT_ID,
        "title": "复核华东渠道确认周期与促销库存错配",
        "status": "proposed",
        "createdAt": "2026-06-05T03:26:00Z",
    }


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

    list_events_payload = get_run_events(client, analysis_run["runId"])
    assert len(list_events_payload["items"]) == 1

    run_created_event = list_events_payload["items"][0]
    assert run_created_event["eventId"].startswith("event-")
    assert run_created_event["runId"] == analysis_run["runId"]
    assert run_created_event["eventType"] == "run.created"
    assert run_created_event["status"] == "succeeded"
    assert run_created_event["phase"] == "intake"
    assert run_created_event["sequence"] == 0
    assert run_created_event["actor"] == "analysis_runtime"
    assert run_created_event["summary"] == RUN_CREATED_SUMMARY
    assert run_created_event["parentEventId"] is None
    assert run_created_event["refType"] is None
    assert run_created_event["refId"] is None
    assert run_created_event["errorCode"] is None
    assert run_created_event["errorMessage"] is None
    assert run_created_event["nodeName"] == "run.created"
    assert run_created_event["agentName"] == "analysis-runtime"
    assert run_created_event["toolName"] is None
    assert run_created_event["occurredAt"] is not None
    assert run_created_event["startedAt"] == run_created_event["occurredAt"]
    assert run_created_event["completedAt"] == run_created_event["occurredAt"]
    assert "delta" not in run_created_event

    run_event_repository = RunEventRepository(database)
    assert (
        run_event_repository.list_by_run_id(analysis_run["runId"]) == list_events_payload["items"]
    )


def test_dispatch_analysis_run_creates_execution_attempt_and_returns_real_records(
    client: TestClient,
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

    list_events_before_dispatch_payload = get_run_events(client, analysis_run["runId"])
    assert [item["eventType"] for item in list_events_before_dispatch_payload["items"]] == [
        "run.created"
    ]

    list_attempts_before_dispatch_response = client.get(
        f"/analysis-runs/{analysis_run['runId']}/execution-attempts"
    )
    assert list_attempts_before_dispatch_response.status_code == 200
    assert list_attempts_before_dispatch_response.json() == {"items": []}

    dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert dispatch_response.status_code == 202
    dispatched_run = dispatch_response.json()
    assert dispatched_run["runId"] == analysis_run["runId"]
    assert dispatched_run["status"] == "queued"
    assert dispatched_run["phase"] == "queueing"
    assert dispatched_run["createdAt"] == analysis_run["createdAt"]
    assert dispatched_run["validatingAt"] is not None
    assert dispatched_run["queuedAt"] is not None
    assert dispatched_run["startedAt"] is None
    assert dispatched_run["completedAt"] is None
    assert dispatched_run["failedAt"] is None

    get_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert get_run_response.status_code == 200
    assert get_run_response.json() == dispatched_run

    list_attempts_response = client.get(
        f"/analysis-runs/{analysis_run['runId']}/execution-attempts"
    )
    assert list_attempts_response.status_code == 200
    attempts_payload = list_attempts_response.json()
    assert len(attempts_payload["items"]) == 1
    execution_attempt = attempts_payload["items"][0]
    assert execution_attempt["attemptId"].startswith("attempt-")
    assert execution_attempt["runId"] == analysis_run["runId"]
    assert execution_attempt["attemptNumber"] == 1
    assert execution_attempt["workerId"].startswith("worker-")
    assert execution_attempt["leaseId"].startswith("lease-")
    assert execution_attempt["status"] == "leased"
    assert execution_attempt["leaseAcquiredAt"] == dispatched_run["queuedAt"]
    assert execution_attempt["leaseExpiresAt"] is not None
    assert execution_attempt["heartbeatAt"] is None
    assert execution_attempt["releasedAt"] is None
    assert execution_attempt["failureCode"] is None
    assert execution_attempt["failureMessage"] is None

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
    analysis_run_repository = AnalysisRunRepository(database)
    execution_attempt_repository = ExecutionAttemptRepository(database)

    assert analysis_run_repository.get_by_run_id(analysis_run["runId"]) == dispatched_run
    assert (
        execution_attempt_repository.list_by_run_id(analysis_run["runId"])
        == attempts_payload["items"]
    )
    run_event_repository = RunEventRepository(database)

    list_events_after_dispatch_payload = get_run_events(client, analysis_run["runId"])
    assert [item["sequence"] for item in list_events_after_dispatch_payload["items"]] == list(
        range(7)
    )
    assert [
        (item["eventType"], item["phase"]) for item in list_events_after_dispatch_payload["items"]
    ] == EXPECTED_DISPATCH_EVENTS
    assert all(
        item["runId"] == analysis_run["runId"]
        for item in list_events_after_dispatch_payload["items"]
    )
    assert all(
        item["status"] == "succeeded" for item in list_events_after_dispatch_payload["items"]
    )
    assert all(
        item["actor"] == "analysis_runtime" for item in list_events_after_dispatch_payload["items"]
    )
    assert all("delta" not in item for item in list_events_after_dispatch_payload["items"])
    assert "worker.lease_acquired" not in {
        item["eventType"] for item in list_events_after_dispatch_payload["items"]
    }
    assert (
        run_event_repository.list_by_run_id(analysis_run["runId"])
        == list_events_after_dispatch_payload["items"]
    )

    list_messages_response = client.get(f"/conversations/{conversation['conversationId']}/messages")
    assert list_messages_response.status_code == 501

    duplicate_dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert duplicate_dispatch_response.status_code == 409
    assert duplicate_dispatch_response.json() == {
        "errorCode": "INVALID_STATE",
        "message": "AnalysisRun must be created/intake before dispatch.",
    }

    duplicate_dispatch_events_payload = get_run_events(client, analysis_run["runId"])
    assert duplicate_dispatch_events_payload == list_events_after_dispatch_payload


def test_dispatch_analysis_run_returns_not_found_for_unknown_run(client: TestClient) -> None:
    response = client.post("/analysis-runs/analysis-run-missing/dispatch")

    assert response.status_code == 404
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }


def test_list_execution_attempts_returns_not_found_for_unknown_run(client: TestClient) -> None:
    response = client.get("/analysis-runs/analysis-run-missing/execution-attempts")

    assert response.status_code == 404
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }


def test_list_run_events_returns_not_found_for_unknown_run(client: TestClient) -> None:
    response = client.get("/analysis-runs/analysis-run-missing/events")

    assert response.status_code == 404
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }


def test_dispatch_analysis_run_rejects_repeat_dispatch_for_non_created_run(
    client: TestClient,
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

    first_dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert first_dispatch_response.status_code == 202

    second_dispatch_response = client.post(f"/analysis-runs/{analysis_run['runId']}/dispatch")
    assert second_dispatch_response.status_code == 409
    assert second_dispatch_response.json() == {
        "errorCode": "INVALID_STATE",
        "message": "AnalysisRun must be created/intake before dispatch.",
    }


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


def test_artifact_endpoints_return_empty_items_when_run_exists(client: TestClient) -> None:
    dispatched = create_dispatched_run(client)
    run_id = dispatched["analysisRun"]["runId"]

    source_evidence_response = client.get(f"/analysis-runs/{run_id}/source-evidence")
    assert source_evidence_response.status_code == 200
    assert source_evidence_response.json() == {"items": []}

    reports_response = client.get(f"/analysis-runs/{run_id}/reports")
    assert reports_response.status_code == 200
    assert reports_response.json() == {"items": []}

    decisions_response = client.get(f"/analysis-runs/{run_id}/decisions")
    assert decisions_response.status_code == 200
    assert decisions_response.json() == {"items": []}


def test_artifact_endpoints_return_real_persisted_records(client: TestClient) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    analysis_task = dispatched["analysisTask"]

    database = RuntimeFoundationMysqlCli()
    source_evidence_repository = SourceEvidenceRepository(database)
    report_repository = ReportRepository(database)
    decision_repository = DecisionRepository(database)

    source_evidence_records = build_source_evidence_records(analysis_run["runId"])
    for source_evidence in source_evidence_records:
        source_evidence_repository.create(source_evidence)

    report_repository.create(
        build_report_record(analysis_run["runId"], analysis_task["workspaceId"])
    )
    decision_repository.create(
        build_decision_record(analysis_run["runId"], analysis_task["workspaceId"])
    )

    source_evidence_response = client.get(f"/analysis-runs/{analysis_run['runId']}/source-evidence")
    assert source_evidence_response.status_code == 200
    source_evidence_payload = response_json_dict(source_evidence_response.json())
    assert len(source_evidence_payload["items"]) == 2
    assert [
        item["sourceEvidenceId"] for item in source_evidence_payload["items"]
    ] == SOURCE_EVIDENCE_IDS
    assert [item["sourceType"] for item in source_evidence_payload["items"]] == [
        "knowledge_document",
        "knowledge_document",
    ]
    for item in source_evidence_payload["items"]:
        metadata = item["metadata"]
        assert metadata is not None
        assert "runId" not in metadata
        assert "eventId" not in metadata
        assert "rawProviderOutput" not in metadata
        assert "traceId" not in metadata

    reports_response = client.get(f"/analysis-runs/{analysis_run['runId']}/reports")
    assert reports_response.status_code == 200
    reports_payload = response_json_dict(reports_response.json())
    assert len(reports_payload["items"]) == 1
    report = reports_payload["items"][0]
    assert report["reportId"] == REPORT_ID
    assert report["runId"] == analysis_run["runId"]
    assert report["workspaceId"] == analysis_task["workspaceId"]
    assert report["sourceEvidence"] == SOURCE_EVIDENCE_IDS
    assert len(report["sections"]) == 1
    assert report["sections"][0]["title"] == "下一步动作"
    assert report["sections"][0]["reportId"] == REPORT_ID
    assert "rawMarkdown" not in report

    decisions_response = client.get(f"/analysis-runs/{analysis_run['runId']}/decisions")
    assert decisions_response.status_code == 200
    decisions_payload = response_json_dict(decisions_response.json())
    assert len(decisions_payload["items"]) == 1
    decision = decisions_payload["items"][0]
    assert decision["decisionId"] == DECISION_ID
    assert decision["runId"] == analysis_run["runId"]
    assert decision["reportId"] == REPORT_ID
    assert decision["workspaceId"] == analysis_task["workspaceId"]
    assert decision["status"] == "proposed"

    get_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert get_run_response.status_code == 200
    assert get_run_response.json()["status"] == "queued"
    assert get_run_response.json()["phase"] == "queueing"

    assert client.get(f"/analysis-runs/{analysis_run['runId']}/tool-calls").status_code == 501
    assert client.get(f"/analysis-runs/{analysis_run['runId']}/model-calls").status_code == 501


def test_artifact_endpoints_return_not_found_for_unknown_run(client: TestClient) -> None:
    for path in ("source-evidence", "reports", "decisions"):
        response = client.get(f"/analysis-runs/analysis-run-missing/{path}")
        assert response.status_code == 404
        assert response.json() == {
            "errorCode": "NOT_FOUND",
            "message": "AnalysisRun not found: analysis-run-missing",
        }
