from __future__ import annotations

from collections.abc import Iterator
from copy import deepcopy
from typing import Any, cast

import pytest
from fastapi.testclient import TestClient
from src.app.config import get_settings
from src.app.main import create_app
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskRepository,
    ConversationRecord,
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

def build_context_pack(analysis_task_id: str | None = None) -> dict[str, Any]:
    owner: dict[str, str] = {"type": "analysisTask"}

    if analysis_task_id is not None:
        owner["analysisTaskId"] = analysis_task_id

    return {
        "version": 1,
        "suggestedPrompt": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "traceability": "direct_refs",
        "capturedAt": "2026-06-05T03:08:12Z",
        "root": {
            "nodeId": "inspector-node-task-context-root",
            "kind": "dashboardOverview",
            "role": "inputContext",
            "owner": owner,
            "title": "经营状态总览",
            "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
            "chips": ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
            "timeRange": {"key": "this_quarter", "label": "2026 Q2"},
            "capturedAt": "2026-06-05T03:08:12Z",
            "children": [
                {
                    "nodeId": "inspector-node-task-context-metric",
                    "kind": "metric",
                    "role": "inputContext",
                    "owner": owner,
                    "title": "确认收入",
                    "summary": "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
                    "value": "收入增速 < -2%",
                    "sourceRef": {
                        "type": "metric",
                        "metricId": "metric-recognized-revenue",
                    },
                }
            ],
        },
    }

TASK_PAYLOAD = {
    "workspaceId": "workspace-northstar-retail-china",
    "userId": "user-zoe",
    "businessDomainId": "business-domain-revenue-quality",
    "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    "contextPack": build_context_pack(),
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


def get_execution_attempts(client: TestClient, run_id: str) -> dict[str, Any]:
    response = client.get(f"/analysis-runs/{run_id}/execution-attempts")
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


def seed_analysis_run_state(
    client: TestClient,
    *,
    status: str,
    phase: str,
    retry_of_run_id: str | None = None,
    original_run_id: str | None = None,
    attach_conversation: bool = True,
) -> dict[str, Any]:
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

    updated_run = build_analysis_run_state(
        analysis_run,
        status=status,
        phase=phase,
        retry_of_run_id=retry_of_run_id,
        original_run_id=original_run_id,
    )
    database = RuntimeFoundationMysqlCli()
    AnalysisRunRepository(database).create(updated_run)

    if not attach_conversation:
        current_conversation = ConversationRepository(database).get_by_conversation_id(
            conversation["conversationId"]
        )
        detached_conversation: ConversationRecord = {
            **current_conversation,
            "currentRunId": None,
        }
        ConversationRepository(database).create(detached_conversation)

    return {
        "analysisTask": analysis_task,
        "conversation": conversation,
        "analysisRun": response_json_dict(updated_run),
    }


def build_analysis_run_state(
    analysis_run: dict[str, Any],
    *,
    status: str,
    phase: str,
    retry_of_run_id: str | None = None,
    original_run_id: str | None = None,
) -> AnalysisRunRecord:
    updated_run = cast(
        AnalysisRunRecord,
        {
            **analysis_run,
            "status": status,
            "phase": phase,
            "outcome": None,
            "waitingFor": None,
            "validatingAt": None,
            "queuedAt": None,
            "startedAt": None,
            "waitingSince": None,
            "timeoutAt": None,
            "cancelRequestedAt": None,
            "cancellingAt": None,
            "completedAt": None,
            "failedAt": None,
            "cancelledAt": None,
            "expiredAt": None,
            "rejectedAt": None,
            "terminalReason": None,
            "failureCode": None,
            "retryable": True,
            "retryOfRunId": retry_of_run_id,
            "originalRunId": original_run_id,
        },
    )

    if status == "failed":
        updated_run["outcome"] = "system_failure"
        updated_run["failedAt"] = "2026-06-11T10:01:00Z"
        updated_run["failureCode"] = "WORKER_FAILED"
        updated_run["terminalReason"] = "Worker execution failed."
    elif status == "expired":
        updated_run["outcome"] = "timeout"
        updated_run["expiredAt"] = "2026-06-11T10:02:00Z"
        updated_run["failureCode"] = "WORKER_LOST"
        updated_run["terminalReason"] = "Worker heartbeat timed out."
    elif status == "cancelled":
        updated_run["cancelledAt"] = "2026-06-11T10:03:00Z"
        updated_run["terminalReason"] = "User requested cancellation."
    elif status == "completed":
        updated_run["outcome"] = "success"
        updated_run["completedAt"] = "2026-06-11T10:04:00Z"
        updated_run["terminalReason"] = "Run completed successfully."
    elif status == "rejected":
        updated_run["waitingFor"] = "approval"
        updated_run["rejectedAt"] = "2026-06-11T10:05:00Z"
        updated_run["terminalReason"] = "Approval request rejected."
    elif status == "queued":
        updated_run["validatingAt"] = "2026-06-11T09:56:00Z"
        updated_run["queuedAt"] = "2026-06-11T09:57:00Z"
    elif status == "running":
        updated_run["startedAt"] = "2026-06-11T09:58:00Z"

    return updated_run


def assert_retry_creates_no_downstream_side_effects(
    client: TestClient,
    *,
    run_id: str,
    conversation_id: str,
) -> None:
    database = RuntimeFoundationMysqlCli()

    assert ExecutionAttemptRepository(database).list_by_run_id(run_id) == []

    source_evidence_response = client.get(f"/analysis-runs/{run_id}/source-evidence")
    assert source_evidence_response.status_code == 200
    assert source_evidence_response.json() == {"items": []}

    reports_response = client.get(f"/analysis-runs/{run_id}/reports")
    assert reports_response.status_code == 200
    assert reports_response.json() == {"items": []}

    decisions_response = client.get(f"/analysis-runs/{run_id}/decisions")
    assert decisions_response.status_code == 200
    assert decisions_response.json() == {"items": []}

    tool_calls_response = client.get(f"/analysis-runs/{run_id}/tool-calls")
    assert tool_calls_response.status_code == 200
    assert tool_calls_response.json() == {"items": []}

    model_calls_response = client.get(f"/analysis-runs/{run_id}/model-calls")
    assert model_calls_response.status_code == 200
    assert model_calls_response.json() == {"items": []}

    messages_response = client.get(f"/conversations/{conversation_id}/messages")
    assert messages_response.status_code == 200
    assert messages_response.json() == {"items": []}


def assert_no_delivery_side_effects(
    client: TestClient,
    *,
    run_id: str,
    conversation_id: str,
) -> None:
    source_evidence_response = client.get(f"/analysis-runs/{run_id}/source-evidence")
    assert source_evidence_response.status_code == 200
    assert source_evidence_response.json() == {"items": []}

    reports_response = client.get(f"/analysis-runs/{run_id}/reports")
    assert reports_response.status_code == 200
    assert reports_response.json() == {"items": []}

    decisions_response = client.get(f"/analysis-runs/{run_id}/decisions")
    assert decisions_response.status_code == 200
    assert decisions_response.json() == {"items": []}

    tool_calls_response = client.get(f"/analysis-runs/{run_id}/tool-calls")
    assert tool_calls_response.status_code == 200
    assert tool_calls_response.json() == {"items": []}

    model_calls_response = client.get(f"/analysis-runs/{run_id}/model-calls")
    assert model_calls_response.status_code == 200
    assert model_calls_response.json() == {"items": []}

    messages_response = client.get(f"/conversations/{conversation_id}/messages")
    assert messages_response.status_code == 200
    assert messages_response.json() == {"items": []}


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
def client(runtime_foundation_env: None) -> Iterator[TestClient]:
    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client


def test_runtime_api_success_foundation_flow(client: TestClient) -> None:
    analysis_task = create_analysis_task(client)
    assert analysis_task["analysisTaskId"].startswith("analysis-task-")
    assert analysis_task["workspaceId"] == TASK_PAYLOAD["workspaceId"]
    assert analysis_task["userId"] == TASK_PAYLOAD["userId"]
    assert analysis_task["businessDomainId"] == TASK_PAYLOAD["businessDomainId"]
    assert analysis_task["question"] == TASK_PAYLOAD["question"]
    assert analysis_task["contextPack"] == build_context_pack(analysis_task["analysisTaskId"])
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
    assert list_messages_response.status_code == 200
    assert list_messages_response.json() == {"items": []}

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
    assert list_messages_response.status_code == 200
    assert list_messages_response.json() == {"items": []}

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


def test_worker_claim_heartbeat_and_release_routes_return_real_records(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    conversation = dispatched["conversation"]
    attempts_before_claim = get_execution_attempts(client, analysis_run["runId"])["items"]
    leased_attempt = attempts_before_claim[-1]

    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    claimed_run = response_json_dict(claim_response.json())
    assert claimed_run["status"] == "running"
    assert claimed_run["phase"] == "execution"
    assert claimed_run["startedAt"] is not None

    heartbeat_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-heartbeat",
        json={
            "attemptId": leased_attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert heartbeat_response.status_code == 200
    heartbeat_attempt = response_json_dict(heartbeat_response.json())
    assert heartbeat_attempt["attemptId"] == leased_attempt["attemptId"]
    assert heartbeat_attempt["status"] == "running"
    assert heartbeat_attempt["heartbeatAt"] is not None
    assert heartbeat_attempt["releasedAt"] is None

    release_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-release",
        json={
            "attemptId": leased_attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert release_response.status_code == 202
    released_run = response_json_dict(release_response.json())
    assert released_run["status"] == "running"
    assert released_run["phase"] == "delivery"
    assert released_run["completedAt"] is None
    assert released_run["failedAt"] is None
    assert released_run["cancelledAt"] is None
    assert released_run["expiredAt"] is None

    attempts_after_release = get_execution_attempts(client, analysis_run["runId"])["items"]
    released_attempt = attempts_after_release[-1]
    assert released_attempt["status"] == "released"
    assert released_attempt["releasedAt"] is not None
    assert released_attempt["failureCode"] is None
    assert released_attempt["failureMessage"] is None

    events_after_release = get_run_events(client, analysis_run["runId"])["items"]
    assert "worker.lease_acquired" in [event["eventType"] for event in events_after_release]
    assert "worker.heartbeat" in [event["eventType"] for event in events_after_release]
    assert "worker.lease_released" in [event["eventType"] for event in events_after_release]
    assert "run.completed" not in [event["eventType"] for event in events_after_release]

    database = RuntimeFoundationMysqlCli()
    assert AnalysisRunRepository(database).get_by_run_id(analysis_run["runId"]) == released_run
    assert_no_delivery_side_effects(
        client,
        run_id=analysis_run["runId"],
        conversation_id=conversation["conversationId"],
    )


def test_worker_failure_route_returns_failed_run_and_no_delivery_side_effects(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    conversation = dispatched["conversation"]
    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    failure_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-failure",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
            "failureCode": "WORKER_EXECUTION_ERROR",
            "failureMessage": "worker execution failed",
        },
    )
    assert failure_response.status_code == 202
    failed_run = response_json_dict(failure_response.json())
    assert failed_run["status"] == "failed"
    assert failed_run["phase"] == "execution"
    assert failed_run["outcome"] == "system_failure"
    assert failed_run["failedAt"] is not None
    assert failed_run["failureCode"] == "WORKER_EXECUTION_ERROR"

    failed_attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]
    assert failed_attempt["status"] == "failed"
    assert failed_attempt["failureCode"] == "WORKER_EXECUTION_ERROR"
    assert failed_attempt["failureMessage"] == "worker execution failed"

    events_after_failure = get_run_events(client, analysis_run["runId"])["items"]
    assert events_after_failure[-1]["eventType"] == "worker.failed"
    assert "run.completed" not in [event["eventType"] for event in events_after_failure]
    assert_no_delivery_side_effects(
        client,
        run_id=analysis_run["runId"],
        conversation_id=conversation["conversationId"],
    )


def test_worker_lost_route_returns_expired_run_and_no_delivery_side_effects(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    conversation = dispatched["conversation"]
    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    lost_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-lost",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
            "lostReason": "worker heartbeat timed out",
        },
    )
    assert lost_response.status_code == 202
    expired_run = response_json_dict(lost_response.json())
    assert expired_run["status"] == "expired"
    assert expired_run["phase"] == "execution"
    assert expired_run["outcome"] == "timeout"
    assert expired_run["expiredAt"] is not None
    assert expired_run["failureCode"] == "WORKER_LOST"

    lost_attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]
    assert lost_attempt["status"] == "lost"
    assert lost_attempt["failureCode"] == "WORKER_LOST"
    assert lost_attempt["failureMessage"] == "worker heartbeat timed out"

    events_after_lost = get_run_events(client, analysis_run["runId"])["items"]
    assert events_after_lost[-1]["eventType"] == "worker.lost"
    assert "run.completed" not in [event["eventType"] for event in events_after_lost]
    assert_no_delivery_side_effects(
        client,
        run_id=analysis_run["runId"],
        conversation_id=conversation["conversationId"],
    )


@pytest.mark.parametrize("start_state", ["queued", "running"])
def test_cancel_route_cancels_run_and_releases_latest_attempt(
    client: TestClient,
    start_state: str,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    conversation = dispatched["conversation"]
    if start_state == "running":
        claim_response = client.post(
            f"/analysis-runs/{analysis_run['runId']}/worker-claim",
            json={"workerId": "worker-runtime-dispatch-foundation"},
        )
        assert claim_response.status_code == 202

    attempt_before_cancel = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    cancel_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/cancel",
        json={"reason": f"user cancelled {start_state} run"},
    )
    assert cancel_response.status_code == 202
    cancelled_run = response_json_dict(cancel_response.json())
    assert cancelled_run["status"] == "cancelled"
    assert cancelled_run["outcome"] == "user_cancelled"
    assert cancelled_run["cancelRequestedAt"] is not None
    assert cancelled_run["cancellingAt"] is not None
    assert cancelled_run["cancelledAt"] is not None
    assert cancelled_run["terminalReason"] == f"user cancelled {start_state} run"
    assert cancelled_run["failedAt"] is None
    assert cancelled_run["completedAt"] is None
    assert cancelled_run["expiredAt"] is None

    released_attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]
    assert released_attempt["attemptId"] == attempt_before_cancel["attemptId"]
    assert released_attempt["status"] == "released"
    assert released_attempt["releasedAt"] is not None

    events_after_cancel = get_run_events(client, analysis_run["runId"])["items"]
    assert [event["eventType"] for event in events_after_cancel][-4:] == [
        "run.cancel_requested",
        "run.cancelling",
        "worker.lease_released",
        "run.cancelled",
    ]
    assert "run.completed" not in [event["eventType"] for event in events_after_cancel]
    assert_no_delivery_side_effects(
        client,
        run_id=analysis_run["runId"],
        conversation_id=conversation["conversationId"],
    )


@pytest.mark.parametrize(
    ("path", "payload"),
    [
        (
            "/analysis-runs/analysis-run-missing/worker-claim",
            {"workerId": "worker-runtime-dispatch-foundation"},
        ),
        (
            "/analysis-runs/analysis-run-missing/worker-heartbeat",
            {
                "attemptId": "attempt-missing",
                "workerId": "worker-runtime-dispatch-foundation",
            },
        ),
        (
            "/analysis-runs/analysis-run-missing/worker-failure",
            {
                "attemptId": "attempt-missing",
                "workerId": "worker-runtime-dispatch-foundation",
                "failureCode": "WORKER_EXECUTION_ERROR",
                "failureMessage": "worker execution failed",
            },
        ),
        (
            "/analysis-runs/analysis-run-missing/worker-lost",
            {
                "attemptId": "attempt-missing",
                "workerId": "worker-runtime-dispatch-foundation",
                "lostReason": "worker heartbeat timed out",
            },
        ),
        (
            "/analysis-runs/analysis-run-missing/worker-release",
            {
                "attemptId": "attempt-missing",
                "workerId": "worker-runtime-dispatch-foundation",
            },
        ),
        (
            "/analysis-runs/analysis-run-missing/cancel",
            {"reason": "user cancelled missing run"},
        ),
    ],
)
def test_worker_control_plane_routes_return_not_found_for_unknown_run(
    client: TestClient,
    path: str,
    payload: dict[str, Any],
) -> None:
    response = client.post(path, json=payload)

    assert response.status_code == 404
    assert response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }


def test_worker_control_plane_routes_return_invalid_state_for_wrong_attempt_or_worker(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    wrong_worker_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-heartbeat",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-mismatch",
        },
    )
    assert wrong_worker_response.status_code == 409
    assert wrong_worker_response.json() == {
        "errorCode": "INVALID_STATE",
        "message": "ExecutionAttempt.workerId does not match worker_id.",
    }

    wrong_attempt_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-release",
        json={
            "attemptId": "attempt-missing",
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert wrong_attempt_response.status_code == 409
    assert wrong_attempt_response.json() == {
        "errorCode": "INVALID_STATE",
        "message": "ExecutionAttempt not found: attempt-missing",
    }


def test_terminal_run_control_plane_routes_reject_claim_heartbeat_release_and_cancel(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]
    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    failure_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-failure",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
            "failureCode": "WORKER_EXECUTION_ERROR",
            "failureMessage": "worker execution failed",
        },
    )
    assert failure_response.status_code == 202

    claim_again_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_again_response.status_code == 409

    heartbeat_again_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-heartbeat",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert heartbeat_again_response.status_code == 409

    release_again_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-release",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert release_again_response.status_code == 409

    cancel_again_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/cancel",
        json={"reason": "cancel after terminal"},
    )
    assert cancel_again_response.status_code == 409


def test_cancel_route_rejects_running_delivery_state_without_appending_cancel_events(
    client: TestClient,
) -> None:
    dispatched = create_dispatched_run(client)
    analysis_run = dispatched["analysisRun"]

    claim_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-claim",
        json={"workerId": "worker-runtime-dispatch-foundation"},
    )
    assert claim_response.status_code == 202
    attempt = get_execution_attempts(client, analysis_run["runId"])["items"][-1]

    release_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/worker-release",
        json={
            "attemptId": attempt["attemptId"],
            "workerId": "worker-runtime-dispatch-foundation",
        },
    )
    assert release_response.status_code == 202
    released_run = response_json_dict(release_response.json())
    assert released_run["status"] == "running"
    assert released_run["phase"] == "delivery"

    events_before_cancel = get_run_events(client, analysis_run["runId"])["items"]

    cancel_response = client.post(
        f"/analysis-runs/{analysis_run['runId']}/cancel",
        json={"reason": "cancel after delivery gate"},
    )
    assert cancel_response.status_code == 409
    assert cancel_response.json()["errorCode"] == "INVALID_STATE"

    persisted_run_response = client.get(f"/analysis-runs/{analysis_run['runId']}")
    assert persisted_run_response.status_code == 200
    assert persisted_run_response.json() == released_run

    events_after_cancel = get_run_events(client, analysis_run["runId"])["items"]
    assert events_after_cancel == events_before_cancel
    assert "run.cancel_requested" not in [event["eventType"] for event in events_after_cancel]
    assert "run.cancelling" not in [event["eventType"] for event in events_after_cancel]
    assert "run.cancelled" not in [event["eventType"] for event in events_after_cancel]


@pytest.mark.parametrize(
    ("status", "phase", "terminal_field"),
    [
        ("failed", "execution", "failedAt"),
        ("expired", "execution", "expiredAt"),
        ("cancelled", "execution", "cancelledAt"),
    ],
)
def test_retry_analysis_run_creates_new_created_run_for_allowed_terminal_statuses(
    client: TestClient,
    status: str,
    phase: str,
    terminal_field: str,
) -> None:
    seeded = seed_analysis_run_state(client, status=status, phase=phase)
    source_run = seeded["analysisRun"]
    source_run_id = source_run["runId"]
    conversation_id = seeded["conversation"]["conversationId"]
    database = RuntimeFoundationMysqlCli()
    analysis_run_repository = AnalysisRunRepository(database)
    conversation_repository = ConversationRepository(database)
    run_event_repository = RunEventRepository(database)

    source_run_before_retry = analysis_run_repository.get_by_run_id(source_run_id)
    source_events_before_retry = run_event_repository.list_by_run_id(source_run_id)

    retry_response = client.post(f"/analysis-runs/{source_run_id}/retry")
    assert retry_response.status_code == 202
    retried_run = response_json_dict(retry_response.json())

    assert retried_run["runId"].startswith("analysis-run-")
    assert retried_run["runId"] != source_run_id
    assert retried_run["workspaceId"] == source_run["workspaceId"]
    assert retried_run["userId"] == source_run["userId"]
    assert retried_run["analysisTaskId"] == source_run["analysisTaskId"]
    assert retried_run["status"] == "created"
    assert retried_run["phase"] == "intake"
    assert retried_run["outcome"] is None
    assert retried_run["waitingFor"] is None
    assert retried_run["retryable"] is True
    assert retried_run["retryOfRunId"] == source_run_id
    assert retried_run["originalRunId"] == source_run_id
    assert retried_run["validatingAt"] is None
    assert retried_run["queuedAt"] is None
    assert retried_run["startedAt"] is None
    assert retried_run["completedAt"] is None
    assert retried_run["failedAt"] is None
    assert retried_run["cancelledAt"] is None
    assert retried_run["expiredAt"] is None
    assert retried_run["rejectedAt"] is None
    assert retried_run["terminalReason"] is None
    assert retried_run["failureCode"] is None

    persisted_source_run = analysis_run_repository.get_by_run_id(source_run_id)
    persisted_retried_run = analysis_run_repository.get_by_run_id(retried_run["runId"])
    persisted_conversation = conversation_repository.get_by_conversation_id(conversation_id)
    retried_run_events = run_event_repository.list_by_run_id(retried_run["runId"])
    source_run_events = run_event_repository.list_by_run_id(source_run_id)

    assert source_run_before_retry["status"] == status
    assert source_run_before_retry["phase"] == phase
    if terminal_field == "failedAt":
        assert source_run_before_retry["failedAt"] is not None
    elif terminal_field == "expiredAt":
        assert source_run_before_retry["expiredAt"] is not None
    else:
        assert source_run_before_retry["cancelledAt"] is not None
    assert persisted_source_run == source_run_before_retry
    assert persisted_retried_run == retried_run
    assert persisted_conversation["currentRunId"] == retried_run["runId"]
    assert source_run_events == source_events_before_retry
    assert len(retried_run_events) == 1
    assert retried_run_events[0]["eventType"] == "run.created"
    assert retried_run_events[0]["runId"] == retried_run["runId"]
    assert retried_run_events[0]["phase"] == "intake"
    assert retried_run_events[0]["sequence"] == 0

    get_retry_run_conversation_response = client.get(
        f"/analysis-runs/{retried_run['runId']}/conversation"
    )
    assert get_retry_run_conversation_response.status_code == 200
    assert get_retry_run_conversation_response.json()["conversationId"] == conversation_id
    assert get_retry_run_conversation_response.json()["currentRunId"] == retried_run["runId"]

    assert_retry_creates_no_downstream_side_effects(
        client,
        run_id=retried_run["runId"],
        conversation_id=conversation_id,
    )


def test_retry_analysis_run_preserves_original_run_id_chain(client: TestClient) -> None:
    seeded = seed_analysis_run_state(
        client,
        status="failed",
        phase="execution",
        retry_of_run_id="analysis-run-retry-parent",
        original_run_id="analysis-run-root-origin",
    )
    source_run_id = seeded["analysisRun"]["runId"]

    retry_response = client.post(f"/analysis-runs/{source_run_id}/retry")
    assert retry_response.status_code == 202
    retried_run = response_json_dict(retry_response.json())

    assert retried_run["retryOfRunId"] == source_run_id
    assert retried_run["originalRunId"] == "analysis-run-root-origin"


@pytest.mark.parametrize(
    ("status", "phase"),
    [
        ("created", "intake"),
        ("queued", "queueing"),
        ("running", "execution"),
        ("completed", "delivery"),
        ("rejected", "approval"),
    ],
)
def test_retry_analysis_run_rejects_unsupported_source_statuses(
    client: TestClient,
    status: str,
    phase: str,
) -> None:
    seeded = seed_analysis_run_state(client, status=status, phase=phase)
    source_run_id = seeded["analysisRun"]["runId"]
    conversation_id = seeded["conversation"]["conversationId"]
    database = RuntimeFoundationMysqlCli()
    analysis_run_repository = AnalysisRunRepository(database)
    conversation_repository = ConversationRepository(database)
    source_run_before_retry = analysis_run_repository.get_by_run_id(source_run_id)
    conversation_before_retry = conversation_repository.get_by_conversation_id(conversation_id)

    retry_response = client.post(f"/analysis-runs/{source_run_id}/retry")
    assert retry_response.status_code == 409
    assert retry_response.json() == {
        "errorCode": "INVALID_STATE",
        "message": "AnalysisRun must be failed/expired/cancelled before user retry.",
    }

    assert analysis_run_repository.get_by_run_id(source_run_id) == source_run_before_retry
    assert (
        conversation_repository.get_by_conversation_id(conversation_id)
        == conversation_before_retry
    )


def test_retry_analysis_run_returns_not_found_for_unknown_run(client: TestClient) -> None:
    retry_response = client.post("/analysis-runs/analysis-run-missing/retry")

    assert retry_response.status_code == 404
    assert retry_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": "AnalysisRun not found: analysis-run-missing",
    }


def test_retry_analysis_run_returns_not_found_when_conversation_is_missing(
    client: TestClient,
) -> None:
    seeded = seed_analysis_run_state(
        client,
        status="failed",
        phase="execution",
        attach_conversation=False,
    )
    source_run_id = seeded["analysisRun"]["runId"]
    database = RuntimeFoundationMysqlCli()
    analysis_run_repository = AnalysisRunRepository(database)
    source_run_before_retry = analysis_run_repository.get_by_run_id(source_run_id)

    retry_response = client.post(f"/analysis-runs/{source_run_id}/retry")

    assert retry_response.status_code == 404
    assert retry_response.json() == {
        "errorCode": "NOT_FOUND",
        "message": f"Conversation not found for AnalysisRun: {source_run_id}",
    }
    assert analysis_run_repository.get_by_run_id(source_run_id) == source_run_before_retry


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

    tool_calls_response = client.get(f"/analysis-runs/{analysis_run['runId']}/tool-calls")
    assert tool_calls_response.status_code == 200
    assert tool_calls_response.json() == {"items": []}

    model_calls_response = client.get(f"/analysis-runs/{analysis_run['runId']}/model-calls")
    assert model_calls_response.status_code == 200
    assert model_calls_response.json() == {"items": []}


def test_artifact_endpoints_return_not_found_for_unknown_run(client: TestClient) -> None:
    for path in ("source-evidence", "reports", "decisions"):
        response = client.get(f"/analysis-runs/analysis-run-missing/{path}")
        assert response.status_code == 404
        assert response.json() == {
            "errorCode": "NOT_FOUND",
            "message": "AnalysisRun not found: analysis-run-missing",
        }
