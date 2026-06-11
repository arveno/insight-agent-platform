"""#159-1 AnalysisRun lifecycle foundation service."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    RunEventRecord,
)

ANALYSIS_RUNTIME_ACTOR = "analysis_runtime"
ANALYSIS_RUNTIME_AGENT = "analysis-runtime"
RUN_CREATED_SUMMARY = "记录 AnalysisRun 已创建并绑定 AnalysisTask / Conversation。"

DISPATCH_EVENT_DEFINITIONS: tuple[tuple[str, str, str], ...] = (
    ("validation.started", "preflight", "记录 AnalysisRun 已开始输入校验。"),
    ("validation.passed", "preflight", "记录 AnalysisRun 输入校验通过。"),
    ("policy.decision_recorded", "governance", "记录当前运行已通过最小治理决策。"),
    ("context.bound", "context_binding", "记录 AnalysisTask context pack 已绑定到当前运行。"),
    ("plan.created", "planning", "记录当前运行已形成最小分析计划。"),
    ("run.queued", "queueing", "记录 AnalysisRun 已进入 dispatch 队列。"),
)


class AnalysisRunInvalidStateError(RuntimeError):
    """Raised when a lifecycle transition is requested from an unsupported state."""


@dataclass(slots=True)
class AnalysisRunLifecycleService:
    """Minimal lifecycle service for dispatching foundation AnalysisRun records."""

    analysis_run_repository: AnalysisRunRepository
    execution_attempt_repository: ExecutionAttemptRepository
    lifecycle_repository: AnalysisRunLifecycleRepository
    worker_id: str = "worker-runtime-dispatch-foundation"
    lease_duration: timedelta = timedelta(minutes=20)

    def dispatch(self, run_id: str) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "created" or analysis_run["phase"] != "intake":
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be created/intake before dispatch."
            )

        validating_at = datetime.now(UTC)
        queued_at = datetime.now(UTC)
        queued_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "queued",
            "phase": "queueing",
            "validatingAt": _utc_timestamp(validating_at),
            "queuedAt": _utc_timestamp(queued_at),
        }

        next_attempt_number = len(self.execution_attempt_repository.list_by_run_id(run_id)) + 1
        execution_attempt: ExecutionAttemptRecord = {
            "attemptId": _generate_canonical_id("attempt"),
            "runId": run_id,
            "attemptNumber": next_attempt_number,
            "workerId": self.worker_id,
            "leaseId": _generate_canonical_id("lease"),
            "status": "leased",
            "leaseAcquiredAt": queued_run["queuedAt"] or _utc_timestamp(queued_at),
            "leaseExpiresAt": _utc_timestamp(queued_at + self.lease_duration),
            "heartbeatAt": None,
            "releasedAt": None,
            "failureCode": None,
            "failureMessage": None,
        }

        dispatch_events = build_dispatch_run_events(
            run_id=run_id,
            validating_at=queued_run["validatingAt"] or _utc_timestamp(validating_at),
            queued_at=queued_run["queuedAt"] or _utc_timestamp(queued_at),
        )

        self.lifecycle_repository.dispatch(queued_run, execution_attempt, dispatch_events)
        return queued_run

    def list_execution_attempts(self, run_id: str) -> list[ExecutionAttemptRecord]:
        self.analysis_run_repository.get_by_run_id(run_id)
        return self.execution_attempt_repository.list_by_run_id(run_id)


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def _utc_timestamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


def build_run_created_event(*, run_id: str, occurred_at: str) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "run.created",
        "status": "succeeded",
        "phase": "intake",
        "sequence": 0,
        "actor": ANALYSIS_RUNTIME_ACTOR,
        "occurredAt": occurred_at,
        "summary": RUN_CREATED_SUMMARY,
        "parentEventId": None,
        "refType": None,
        "refId": None,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "run.created",
        "agentName": ANALYSIS_RUNTIME_AGENT,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_dispatch_run_events(
    *,
    run_id: str,
    validating_at: str,
    queued_at: str,
) -> list[RunEventRecord]:
    run_events: list[RunEventRecord] = []

    for index, (event_type, phase, summary) in enumerate(DISPATCH_EVENT_DEFINITIONS, start=1):
        occurred_at = queued_at if event_type == "run.queued" else validating_at
        run_events.append(
            {
                "eventId": _generate_canonical_id("event"),
                "runId": run_id,
                "eventType": event_type,
                "status": "succeeded",
                "phase": phase,  # type: ignore[typeddict-item]
                "sequence": index,
                "actor": ANALYSIS_RUNTIME_ACTOR,
                "occurredAt": occurred_at,
                "summary": summary,
                "parentEventId": None,
                "refType": None,
                "refId": None,
                "errorCode": None,
                "errorMessage": None,
                "nodeName": event_type,
                "agentName": ANALYSIS_RUNTIME_AGENT,
                "toolName": None,
                "startedAt": occurred_at,
                "completedAt": occurred_at,
            }
        )

    return run_events
