from __future__ import annotations

import json
from pathlib import Path

import pytest
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskContextPack,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    DecisionRepository,
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    ReportRepository,
    RunEventRepository,
    RuntimeFoundationMysqlCli,
    SourceEvidenceRepository,
)
from src.modules.analysis_runs.lifecycle_service import (
    AnalysisRunInvalidStateError,
    AnalysisRunLifecycleService,
    build_run_created_event,
)

REPO_ROOT = Path(__file__).resolve().parents[4]
RUN_EVENT_SCHEMA_PATH = REPO_ROOT / "packages/contracts/schemas/analysis/run-event.schema.json"

WORKER_ID = "worker-claim-heartbeat-test"
ANALYSIS_TASK_ID = "analysis-task-worker-claim-q2"
CONVERSATION_ID = "conversation-worker-claim-q2"
RUN_ID = "analysis-worker-claim-q2"

RUN_EVENT_TYPE_ENUM = json.loads(RUN_EVENT_SCHEMA_PATH.read_text(encoding="utf-8"))["properties"][
    "eventType"
]["enum"]


def build_analysis_task() -> AnalysisTaskRecord:
    context_pack: AnalysisTaskContextPack = {
        "metricId": "metric-recognized-revenue",
        "timeRange": "2026 Q2",
        "threshold": "收入增速 < -2%",
        "trend": "华东区域收入增速低于阈值",
        "tableIds": ["table-sales-order", "table-refund-order"],
        "knowledgeDocumentIds": [
            "knowledge-document-channel-weekly-17",
            "knowledge-document-inventory-east-04",
        ],
    }

    return {
        "analysisTaskId": ANALYSIS_TASK_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "businessDomainId": "business-domain-revenue-quality",
        "question": "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
        "contextPack": context_pack,
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }


def build_conversation() -> ConversationRecord:
    return {
        "conversationId": CONVERSATION_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "analysisTaskId": ANALYSIS_TASK_ID,
        "currentRunId": RUN_ID,
        "title": "收入增速异常",
        "status": "active",
        "createdAt": "2026-06-05T11:08:12+08:00",
        "updatedAt": "2026-06-05T11:08:12+08:00",
    }


def build_analysis_run() -> AnalysisRunRecord:
    return {
        "runId": RUN_ID,
        "workspaceId": "workspace-northstar-retail-china",
        "userId": "user-zoe",
        "analysisTaskId": ANALYSIS_TASK_ID,
        "status": "created",
        "phase": "intake",
        "outcome": None,
        "waitingFor": None,
        "createdAt": "2026-06-05T11:08:12+08:00",
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
        "retryOfRunId": None,
        "originalRunId": None,
    }


def build_lifecycle_service(database: RuntimeFoundationMysqlCli) -> AnalysisRunLifecycleService:
    return AnalysisRunLifecycleService(
        analysis_run_repository=AnalysisRunRepository(database),
        conversation_repository=ConversationRepository(database),
        execution_attempt_repository=ExecutionAttemptRepository(database),
        run_event_repository=RunEventRepository(database),
        lifecycle_repository=AnalysisRunLifecycleRepository(database),
    )


def create_dispatched_run(
    database: RuntimeFoundationMysqlCli,
) -> tuple[AnalysisRunLifecycleService, AnalysisRunRecord]:
    analysis_task_repository = AnalysisTaskRepository(database)
    conversation_repository = ConversationRepository(database)
    lifecycle_repository = AnalysisRunLifecycleRepository(database)

    analysis_task_repository.create(build_analysis_task())
    conversation_repository.create(build_conversation())

    analysis_run = build_analysis_run()
    lifecycle_repository.create_run(
        analysis_run,
        build_conversation(),
        build_run_created_event(run_id=RUN_ID, occurred_at=analysis_run["createdAt"]),
    )

    lifecycle_service = build_lifecycle_service(database)
    dispatched_run = lifecycle_service.dispatch(RUN_ID)
    return lifecycle_service, dispatched_run


def create_running_run(
    database: RuntimeFoundationMysqlCli,
) -> tuple[AnalysisRunLifecycleService, AnalysisRunRecord, ExecutionAttemptRecord]:
    lifecycle_service, _ = create_dispatched_run(database)
    running_run = lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)
    execution_attempt = ExecutionAttemptRepository(database).list_by_run_id(RUN_ID)[-1]
    return lifecycle_service, running_run, execution_attempt


def assert_no_artifact_side_effects(database: RuntimeFoundationMysqlCli) -> None:
    assert SourceEvidenceRepository(database).list_by_run_id(RUN_ID) == []
    assert ReportRepository(database).list_by_run_id(RUN_ID) == []
    assert DecisionRepository(database).list_by_run_id(RUN_ID) == []


def test_run_event_contract_declares_worker_failure_and_lost_types() -> None:
    assert "worker.failed" in RUN_EVENT_TYPE_ENUM
    assert "worker.lost" in RUN_EVENT_TYPE_ENUM


def test_worker_claim_transitions_queued_run_to_running_and_appends_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, dispatched_run = create_dispatched_run(database)
    attempts_before_claim = ExecutionAttemptRepository(database).list_by_run_id(RUN_ID)
    events_before_claim = RunEventRepository(database).list_by_run_id(RUN_ID)
    previous_max_sequence = events_before_claim[-1]["sequence"]

    assert dispatched_run["status"] == "queued"
    assert dispatched_run["phase"] == "queueing"
    assert attempts_before_claim[0]["status"] == "leased"

    claimed_run = lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)

    attempts_after_claim = ExecutionAttemptRepository(database).list_by_run_id(RUN_ID)
    events_after_claim = RunEventRepository(database).list_by_run_id(RUN_ID)
    latest_attempt = attempts_after_claim[-1]
    latest_event = events_after_claim[-1]

    assert claimed_run["status"] == "running"
    assert claimed_run["phase"] == "execution"
    assert claimed_run["startedAt"] is not None
    assert AnalysisRunRepository(database).get_by_run_id(RUN_ID) == claimed_run

    assert latest_attempt["attemptId"] == attempts_before_claim[-1]["attemptId"]
    assert latest_attempt["status"] == "running"
    assert latest_attempt["workerId"] == WORKER_ID
    assert latest_attempt["heartbeatAt"] is not None
    assert latest_attempt["releasedAt"] is None

    assert len(events_after_claim) == len(events_before_claim) + 1
    assert latest_event["eventType"] == "worker.lease_acquired"
    assert latest_event["status"] == "succeeded"
    assert latest_event["phase"] == "execution"
    assert latest_event["actor"] == "agent_worker"
    assert latest_event["summary"] == "记录 Worker 已接管 AnalysisRun。"
    assert latest_event["refType"] == "execution_attempt"
    assert latest_event["refId"] == latest_attempt["attemptId"]
    assert latest_event["nodeName"] == "worker.lease_acquired"
    assert latest_event["agentName"] == "agent-worker"
    assert latest_event["sequence"] == previous_max_sequence + 1

    assert_no_artifact_side_effects(database)


def test_worker_heartbeat_updates_attempt_and_appends_event(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _ = create_dispatched_run(database)
    lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)

    execution_attempt_repository = ExecutionAttemptRepository(database)
    run_event_repository = RunEventRepository(database)
    attempt_before_heartbeat = execution_attempt_repository.list_by_run_id(RUN_ID)[-1]
    events_before_heartbeat = run_event_repository.list_by_run_id(RUN_ID)
    previous_max_sequence = events_before_heartbeat[-1]["sequence"]

    heartbeat_attempt = lifecycle_service.heartbeat(
        RUN_ID,
        attempt_before_heartbeat["attemptId"],
        WORKER_ID,
    )

    attempt_after_heartbeat = execution_attempt_repository.list_by_run_id(RUN_ID)[-1]
    events_after_heartbeat = run_event_repository.list_by_run_id(RUN_ID)
    latest_event = events_after_heartbeat[-1]

    assert heartbeat_attempt["attemptId"] == attempt_before_heartbeat["attemptId"]
    assert heartbeat_attempt["status"] == "running"
    assert heartbeat_attempt["workerId"] == WORKER_ID
    assert heartbeat_attempt["heartbeatAt"] is not None
    assert heartbeat_attempt["heartbeatAt"] != attempt_before_heartbeat["heartbeatAt"]
    assert attempt_after_heartbeat == heartbeat_attempt

    assert len(events_after_heartbeat) == len(events_before_heartbeat) + 1
    assert latest_event["eventType"] == "worker.heartbeat"
    assert latest_event["status"] == "succeeded"
    assert latest_event["phase"] == "execution"
    assert latest_event["actor"] == "agent_worker"
    assert latest_event["summary"] == "记录 Worker heartbeat。"
    assert latest_event["refType"] == "execution_attempt"
    assert latest_event["refId"] == attempt_before_heartbeat["attemptId"]
    assert latest_event["nodeName"] == "worker.heartbeat"
    assert latest_event["agentName"] == "agent-worker"
    assert latest_event["sequence"] == previous_max_sequence + 1

    assert_no_artifact_side_effects(database)


def test_worker_claim_raises_not_found_for_unknown_run(runtime_foundation_env: None) -> None:
    with pytest.raises(KeyError):
        build_lifecycle_service(RuntimeFoundationMysqlCli()).claim_for_execution(
            "analysis-run-missing",
            WORKER_ID,
        )


def test_worker_claim_rejects_non_queued_run(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    AnalysisTaskRepository(database).create(build_analysis_task())
    ConversationRepository(database).create(build_conversation())
    AnalysisRunLifecycleRepository(database).create_run(
        build_analysis_run(),
        build_conversation(),
        build_run_created_event(run_id=RUN_ID, occurred_at="2026-06-05T11:08:12+08:00"),
    )

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be queued/queueing before worker claim.",
    ):
        build_lifecycle_service(database).claim_for_execution(RUN_ID, WORKER_ID)


def test_worker_heartbeat_rejects_non_running_attempt(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _ = create_dispatched_run(database)
    lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)
    execution_attempt_repository = ExecutionAttemptRepository(database)
    leased_attempt = execution_attempt_repository.list_by_run_id(RUN_ID)[-1]
    execution_attempt_repository.create(
        {
            **leased_attempt,
            "status": "leased",
            "heartbeatAt": None,
        }
    )

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="ExecutionAttempt must be running before worker heartbeat.",
    ):
        lifecycle_service.heartbeat(RUN_ID, leased_attempt["attemptId"], WORKER_ID)


def test_worker_claim_rejects_duplicate_claim_without_second_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _ = create_dispatched_run(database)
    lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)
    events_after_first_claim = RunEventRepository(database).list_by_run_id(RUN_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be queued/queueing before worker claim.",
    ):
        lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)

    events_after_duplicate_claim = RunEventRepository(database).list_by_run_id(RUN_ID)
    assert events_after_duplicate_claim == events_after_first_claim
    assert [event["eventType"] for event in events_after_duplicate_claim].count(
        "worker.lease_acquired"
    ) == 1


def test_record_worker_failure_transitions_running_run_to_failed_and_appends_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, running_run, running_attempt = create_running_run(database)
    run_event_repository = RunEventRepository(database)
    events_before_failure = run_event_repository.list_by_run_id(RUN_ID)
    previous_max_sequence = events_before_failure[-1]["sequence"]

    failed_run = lifecycle_service.record_worker_failure(
        RUN_ID,
        str(running_attempt["attemptId"]),
        WORKER_ID,
        "WORKER_EXECUTION_ERROR",
        "worker execution failed",
    )

    failed_attempt = ExecutionAttemptRepository(database).get_by_attempt_id(
        str(running_attempt["attemptId"])
    )
    persisted_run = AnalysisRunRepository(database).get_by_run_id(RUN_ID)
    events_after_failure = run_event_repository.list_by_run_id(RUN_ID)
    latest_event = events_after_failure[-1]

    assert running_run["status"] == "running"
    assert failed_run["status"] == "failed"
    assert failed_run["phase"] == "execution"
    assert failed_run["outcome"] == "system_failure"
    assert failed_run["failedAt"] is not None
    assert failed_run["completedAt"] is None
    assert failed_run["expiredAt"] is None
    assert failed_run["failureCode"] == "WORKER_EXECUTION_ERROR"
    assert failed_run["terminalReason"] == "worker execution failed"
    assert failed_run["retryable"] is True
    assert persisted_run == failed_run

    assert failed_attempt["status"] == "failed"
    assert failed_attempt["failureCode"] == "WORKER_EXECUTION_ERROR"
    assert failed_attempt["failureMessage"] == "worker execution failed"
    assert failed_attempt["releasedAt"] is not None

    assert len(events_after_failure) == len(events_before_failure) + 1
    assert latest_event["eventType"] == "worker.failed"
    assert latest_event["eventType"] in RUN_EVENT_TYPE_ENUM
    assert latest_event["status"] == "failed"
    assert latest_event["phase"] == "execution"
    assert latest_event["actor"] == "agent_worker"
    assert latest_event["refType"] == "execution_attempt"
    assert latest_event["refId"] == running_attempt["attemptId"]
    assert latest_event["errorCode"] == "WORKER_EXECUTION_ERROR"
    assert latest_event["errorMessage"] == "worker execution failed"
    assert latest_event["sequence"] == previous_max_sequence + 1

    assert_no_artifact_side_effects(database)


def test_mark_worker_lost_transitions_running_run_to_expired_and_appends_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, running_run, running_attempt = create_running_run(database)
    run_event_repository = RunEventRepository(database)
    events_before_lost = run_event_repository.list_by_run_id(RUN_ID)
    previous_max_sequence = events_before_lost[-1]["sequence"]

    expired_run = lifecycle_service.mark_worker_lost(
        RUN_ID,
        str(running_attempt["attemptId"]),
        WORKER_ID,
        "worker heartbeat timed out",
    )

    lost_attempt = ExecutionAttemptRepository(database).get_by_attempt_id(
        str(running_attempt["attemptId"])
    )
    persisted_run = AnalysisRunRepository(database).get_by_run_id(RUN_ID)
    events_after_lost = run_event_repository.list_by_run_id(RUN_ID)
    latest_event = events_after_lost[-1]

    assert running_run["status"] == "running"
    assert expired_run["status"] == "expired"
    assert expired_run["phase"] == "execution"
    assert expired_run["outcome"] == "timeout"
    assert expired_run["expiredAt"] is not None
    assert expired_run["completedAt"] is None
    assert expired_run["failedAt"] is None
    assert expired_run["failureCode"] == "WORKER_LOST"
    assert expired_run["terminalReason"] == "worker heartbeat timed out"
    assert expired_run["retryable"] is True
    assert persisted_run == expired_run

    assert lost_attempt["status"] == "lost"
    assert lost_attempt["failureCode"] == "WORKER_LOST"
    assert lost_attempt["failureMessage"] == "worker heartbeat timed out"
    assert lost_attempt["releasedAt"] is not None

    assert len(events_after_lost) == len(events_before_lost) + 1
    assert latest_event["eventType"] == "worker.lost"
    assert latest_event["eventType"] in RUN_EVENT_TYPE_ENUM
    assert latest_event["status"] == "failed"
    assert latest_event["phase"] == "execution"
    assert latest_event["actor"] == "agent_worker"
    assert latest_event["refType"] == "execution_attempt"
    assert latest_event["refId"] == running_attempt["attemptId"]
    assert latest_event["errorCode"] == "WORKER_LOST"
    assert latest_event["errorMessage"] == "worker heartbeat timed out"
    assert latest_event["sequence"] == previous_max_sequence + 1

    assert_no_artifact_side_effects(database)


def test_worker_failure_rejects_mismatched_worker_id(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _, running_attempt = create_running_run(database)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="ExecutionAttempt.workerId does not match worker_id.",
    ):
        lifecycle_service.record_worker_failure(
            RUN_ID,
            str(running_attempt["attemptId"]),
            "worker-mismatch",
            "WORKER_EXECUTION_ERROR",
            "worker execution failed",
        )


def test_worker_failure_rejects_unknown_run_or_attempt(runtime_foundation_env: None) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _, running_attempt = create_running_run(database)

    with pytest.raises(KeyError):
        lifecycle_service.record_worker_failure(
            "analysis-run-missing",
            str(running_attempt["attemptId"]),
            WORKER_ID,
            "WORKER_EXECUTION_ERROR",
            "worker execution failed",
        )

    with pytest.raises(KeyError):
        lifecycle_service.mark_worker_lost(
            RUN_ID,
            "attempt-missing",
            WORKER_ID,
            "worker heartbeat timed out",
        )


def test_worker_failure_blocks_heartbeat_claim_and_duplicate_terminal_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _, running_attempt = create_running_run(database)
    lifecycle_service.record_worker_failure(
        RUN_ID,
        str(running_attempt["attemptId"]),
        WORKER_ID,
        "WORKER_EXECUTION_ERROR",
        "worker execution failed",
    )
    events_after_failure = RunEventRepository(database).list_by_run_id(RUN_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be running/execution before worker heartbeat.",
    ):
        lifecycle_service.heartbeat(RUN_ID, str(running_attempt["attemptId"]), WORKER_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be queued/queueing before worker claim.",
    ):
        lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be running/execution before worker failure.",
    ):
        lifecycle_service.record_worker_failure(
            RUN_ID,
            str(running_attempt["attemptId"]),
            WORKER_ID,
            "WORKER_EXECUTION_ERROR",
            "worker execution failed",
        )

    events_after_duplicate_failure = RunEventRepository(database).list_by_run_id(RUN_ID)
    assert events_after_duplicate_failure == events_after_failure
    assert [event["eventType"] for event in events_after_duplicate_failure].count(
        "worker.failed"
    ) == 1


def test_worker_lost_blocks_heartbeat_claim_and_duplicate_terminal_event(
    runtime_foundation_env: None,
) -> None:
    database = RuntimeFoundationMysqlCli()
    lifecycle_service, _, running_attempt = create_running_run(database)
    lifecycle_service.mark_worker_lost(
        RUN_ID,
        str(running_attempt["attemptId"]),
        WORKER_ID,
        "worker heartbeat timed out",
    )
    events_after_lost = RunEventRepository(database).list_by_run_id(RUN_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be running/execution before worker heartbeat.",
    ):
        lifecycle_service.heartbeat(RUN_ID, str(running_attempt["attemptId"]), WORKER_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be queued/queueing before worker claim.",
    ):
        lifecycle_service.claim_for_execution(RUN_ID, WORKER_ID)

    with pytest.raises(
        AnalysisRunInvalidStateError,
        match="AnalysisRun must be running/execution before worker lost.",
    ):
        lifecycle_service.mark_worker_lost(
            RUN_ID,
            str(running_attempt["attemptId"]),
            WORKER_ID,
            "worker heartbeat timed out",
        )

    events_after_duplicate_lost = RunEventRepository(database).list_by_run_id(RUN_ID)
    assert events_after_duplicate_lost == events_after_lost
    assert [event["eventType"] for event in events_after_duplicate_lost].count(
        "worker.lost"
    ) == 1
