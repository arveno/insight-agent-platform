"""#159-1 AnalysisRun lifecycle foundation service."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    ConversationRecord,
    ConversationRepository,
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    RunEventRecord,
    RunEventRepository,
)
from src.modules.analysis_runs.delivery_foundation import (
    FOUNDATION_PRODUCER_ID,
    build_foundation_delivery_artifacts,
)

ANALYSIS_RUNTIME_ACTOR = "analysis_runtime"
ANALYSIS_RUNTIME_AGENT = "analysis-runtime"
AGENT_WORKER_ACTOR = "agent_worker"
AGENT_WORKER_NAME = "agent-worker"
RUN_CREATED_SUMMARY = "记录 AnalysisRun 已创建并绑定 AnalysisTask / Conversation。"
WORKER_LEASE_ACQUIRED_SUMMARY = "记录 Worker 已接管 AnalysisRun。"
WORKER_HEARTBEAT_SUMMARY = "记录 Worker heartbeat。"
WORKER_LEASE_RELEASED_SUMMARY = "记录 Worker 已释放 AnalysisRun 的 lease，运行进入 delivery gate。"
WORKER_LEASE_RELEASED_FOR_CANCEL_SUMMARY = "记录 AnalysisRun 取消时释放 Worker lease。"
WORKER_FAILED_SUMMARY = "记录 Worker 执行失败，AnalysisRun 进入 failed 终态。"
WORKER_LOST_SUMMARY = "记录 Worker lease 丢失，AnalysisRun 进入 expired 终态。"
RUN_CANCEL_REQUESTED_SUMMARY = "记录用户已请求取消当前 AnalysisRun。"
RUN_CANCELLING_SUMMARY = "记录 AnalysisRun 已进入 cancelling 过渡。"
RUN_CANCELLED_SUMMARY = "记录 AnalysisRun 已进入 cancelled 终态。"
DELIVERY_STARTED_SUMMARY = "记录当前 AnalysisRun 已进入 delivery artifact 持久化。"
ARTIFACT_PERSISTED_SUMMARY = "记录当前 AnalysisRun 的 delivery artifacts 已完成持久化。"
RUN_COMPLETED_SUMMARY = "记录当前 AnalysisRun 已在 artifacts 落地后进入 completed 终态。"
ALLOWED_USER_RETRY_STATUSES = frozenset({"failed", "expired", "cancelled"})
ALLOWED_CANCEL_WAITING_FOR = frozenset({"approval", "user_input", "external_dependency"})
CANCEL_INVALID_STATE_MESSAGE = (
    "AnalysisRun must be queued/queueing, running/execution, or waiting for "
    "approval/user_input/external_dependency before cancellation."
)
DELIVERY_INVALID_STATE_MESSAGE = "AnalysisRun must be running/delivery before delivery completion."

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


class AnalysisRunConversationNotFoundError(RuntimeError):
    """Raised when the current Conversation cannot be resolved for the source AnalysisRun."""


@dataclass(slots=True)
class AnalysisRunLifecycleService:
    """Minimal lifecycle service for dispatching foundation AnalysisRun records."""

    analysis_run_repository: AnalysisRunRepository
    conversation_repository: ConversationRepository
    execution_attempt_repository: ExecutionAttemptRepository
    run_event_repository: RunEventRepository
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

    def retry_analysis_run(self, run_id: str) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] not in ALLOWED_USER_RETRY_STATUSES:
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be failed/expired/cancelled before user retry."
            )

        try:
            conversation = self.conversation_repository.get_by_current_run_id(run_id)
        except KeyError as exc:
            raise AnalysisRunConversationNotFoundError(run_id) from exc

        created_at = _utc_timestamp(datetime.now(UTC))
        retried_run = self._build_retried_run(
            analysis_run=analysis_run,
            created_at=created_at,
        )
        updated_conversation: ConversationRecord = {
            **conversation,
            "currentRunId": retried_run["runId"],
            "updatedAt": created_at,
        }
        run_created_event = build_run_created_event(
            run_id=retried_run["runId"],
            occurred_at=created_at,
        )

        self.lifecycle_repository.retry_run(
            retried_run,
            updated_conversation,
            run_created_event,
        )
        return retried_run

    def list_execution_attempts(self, run_id: str) -> list[ExecutionAttemptRecord]:
        self.analysis_run_repository.get_by_run_id(run_id)
        return self.execution_attempt_repository.list_by_run_id(run_id)

    def claim_for_execution(self, run_id: str, worker_id: str) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "queued" or analysis_run["phase"] != "queueing":
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be queued/queueing before worker claim."
            )

        execution_attempts = self.execution_attempt_repository.list_by_run_id(run_id)
        if not execution_attempts or execution_attempts[-1]["status"] != "leased":
            raise AnalysisRunInvalidStateError(
                "Latest ExecutionAttempt must be leased before worker claim."
            )

        claimed_at = _utc_timestamp(datetime.now(UTC))
        latest_execution_attempt = execution_attempts[-1]
        running_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "running",
            "phase": "execution",
            "startedAt": analysis_run["startedAt"] or claimed_at,
        }
        running_execution_attempt: ExecutionAttemptRecord = {
            **latest_execution_attempt,
            "status": "running",
            "workerId": worker_id,
            "heartbeatAt": claimed_at,
        }
        run_event = build_worker_lease_acquired_event(
            run_id=run_id,
            attempt_id=running_execution_attempt["attemptId"],
            occurred_at=claimed_at,
            sequence=self._next_run_event_sequence(run_id),
        )

        self.lifecycle_repository.claim_for_execution(
            running_run,
            running_execution_attempt,
            run_event,
        )
        return running_run

    def heartbeat(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
    ) -> ExecutionAttemptRecord:
        execution_attempt = self._require_running_attempt(
            run_id=run_id,
            attempt_id=attempt_id,
            worker_id=worker_id,
            run_state_error_message=(
                "AnalysisRun must be running/execution before worker heartbeat."
            ),
            attempt_state_error_message="ExecutionAttempt must be running before worker heartbeat.",
        )

        heartbeat_at = _utc_timestamp(datetime.now(UTC))
        updated_execution_attempt: ExecutionAttemptRecord = {
            **execution_attempt,
            "heartbeatAt": heartbeat_at,
        }
        run_event = build_worker_heartbeat_event(
            run_id=run_id,
            attempt_id=attempt_id,
            occurred_at=heartbeat_at,
            sequence=self._next_run_event_sequence(run_id),
        )

        self.lifecycle_repository.heartbeat(updated_execution_attempt, run_event)
        return updated_execution_attempt

    def record_worker_failure(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
        failure_code: str,
        failure_message: str,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "running" or analysis_run["phase"] != "execution":
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be running/execution before worker failure."
            )

        execution_attempt = self._require_running_attempt(
            run_id=run_id,
            attempt_id=attempt_id,
            worker_id=worker_id,
            run_state_error_message="AnalysisRun must be running/execution before worker failure.",
            attempt_state_error_message="ExecutionAttempt must be running before worker failure.",
        )

        failed_at = _utc_timestamp(datetime.now(UTC))
        failed_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "failed",
            "phase": "execution",
            "outcome": "system_failure",
            "failedAt": failed_at,
            "completedAt": None,
            "expiredAt": None,
            "failureCode": failure_code,
            "terminalReason": failure_message,
            "retryable": True,
        }
        failed_execution_attempt: ExecutionAttemptRecord = {
            **execution_attempt,
            "status": "failed",
            "releasedAt": failed_at,
            "failureCode": failure_code,
            "failureMessage": failure_message,
        }
        run_event = build_worker_failed_event(
            run_id=run_id,
            attempt_id=attempt_id,
            occurred_at=failed_at,
            failure_code=failure_code,
            failure_message=failure_message,
            sequence=self._next_run_event_sequence(run_id),
        )

        self.lifecycle_repository.record_worker_failure(
            failed_run,
            failed_execution_attempt,
            run_event,
        )
        return failed_run

    def mark_worker_lost(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
        lost_reason: str,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "running" or analysis_run["phase"] != "execution":
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be running/execution before worker lost."
            )

        execution_attempt = self._require_running_attempt(
            run_id=run_id,
            attempt_id=attempt_id,
            worker_id=worker_id,
            run_state_error_message="AnalysisRun must be running/execution before worker lost.",
            attempt_state_error_message="ExecutionAttempt must be running before worker lost.",
        )

        expired_at = _utc_timestamp(datetime.now(UTC))
        expired_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "expired",
            "phase": "execution",
            "outcome": "timeout",
            "failedAt": None,
            "completedAt": None,
            "expiredAt": expired_at,
            "failureCode": "WORKER_LOST",
            "terminalReason": lost_reason,
            "retryable": True,
        }
        lost_execution_attempt: ExecutionAttemptRecord = {
            **execution_attempt,
            "status": "lost",
            "releasedAt": expired_at,
            "failureCode": "WORKER_LOST",
            "failureMessage": lost_reason,
        }
        run_event = build_worker_lost_event(
            run_id=run_id,
            attempt_id=attempt_id,
            occurred_at=expired_at,
            lost_reason=lost_reason,
            sequence=self._next_run_event_sequence(run_id),
        )

        self.lifecycle_repository.mark_worker_lost(
            expired_run,
            lost_execution_attempt,
            run_event,
        )
        return expired_run

    def release_worker(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "running" or analysis_run["phase"] != "execution":
            raise AnalysisRunInvalidStateError(
                "AnalysisRun must be running/execution before worker release."
            )

        execution_attempt = self._require_running_attempt(
            run_id=run_id,
            attempt_id=attempt_id,
            worker_id=worker_id,
            run_state_error_message="AnalysisRun must be running/execution before worker release.",
            attempt_state_error_message="ExecutionAttempt must be running before worker release.",
        )

        released_at = _utc_timestamp(datetime.now(UTC))
        released_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "running",
            "phase": "delivery",
            "waitingFor": None,
        }
        released_execution_attempt: ExecutionAttemptRecord = {
            **execution_attempt,
            "status": "released",
            "releasedAt": released_at,
            "failureCode": None,
            "failureMessage": None,
        }
        run_event = build_worker_lease_released_event(
            run_id=run_id,
            attempt_id=attempt_id,
            occurred_at=released_at,
            phase="delivery",
            summary=WORKER_LEASE_RELEASED_SUMMARY,
            sequence=self._next_run_event_sequence(run_id),
        )

        self.lifecycle_repository.release_worker(
            released_run,
            released_execution_attempt,
            run_event,
        )
        return released_run

    def cancel_analysis_run(
        self,
        run_id: str,
        reason: str | None,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if not _is_cancellable_run(analysis_run):
            raise AnalysisRunInvalidStateError(CANCEL_INVALID_STATE_MESSAGE)

        cancelled_at = _utc_timestamp(datetime.now(UTC))
        terminal_reason = reason or "User requested cancellation."
        cancelled_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "cancelled",
            "outcome": "user_cancelled",
            "waitingFor": None,
            "cancelRequestedAt": cancelled_at,
            "cancellingAt": cancelled_at,
            "cancelledAt": cancelled_at,
            "completedAt": None,
            "failedAt": None,
            "expiredAt": None,
            "rejectedAt": None,
            "failureCode": None,
            "terminalReason": terminal_reason,
            "retryable": True,
        }

        released_execution_attempt: ExecutionAttemptRecord | None = None
        latest_attempt = self._latest_execution_attempt(run_id)
        if latest_attempt is not None and latest_attempt["status"] in {"leased", "running"}:
            released_execution_attempt = {
                **latest_attempt,
                "status": "released",
                "releasedAt": cancelled_at,
                "failureCode": None,
                "failureMessage": None,
            }

        next_sequence = self._next_run_event_sequence(run_id)
        run_events = [
            build_run_cancel_requested_event(
                run_id=run_id,
                occurred_at=cancelled_at,
                phase=analysis_run["phase"],
                sequence=next_sequence,
            ),
            build_run_cancelling_event(
                run_id=run_id,
                occurred_at=cancelled_at,
                phase=analysis_run["phase"],
                sequence=next_sequence + 1,
            ),
        ]
        if released_execution_attempt is not None:
            run_events.append(
                build_worker_lease_released_event(
                    run_id=run_id,
                    attempt_id=released_execution_attempt["attemptId"],
                    occurred_at=cancelled_at,
                    phase=analysis_run["phase"],
                    summary=WORKER_LEASE_RELEASED_FOR_CANCEL_SUMMARY,
                    sequence=next_sequence + len(run_events),
                )
            )
        run_events.append(
            build_run_cancelled_event(
                run_id=run_id,
                occurred_at=cancelled_at,
                phase=analysis_run["phase"],
                reason=terminal_reason,
                sequence=next_sequence + len(run_events),
            )
        )

        self.lifecycle_repository.cancel(
            cancelled_run,
            released_execution_attempt,
            run_events,
        )
        return cancelled_run

    def complete_delivery(
        self,
        run_id: str,
        producer_id: str,
    ) -> AnalysisRunRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "running" or analysis_run["phase"] != "delivery":
            raise AnalysisRunInvalidStateError(DELIVERY_INVALID_STATE_MESSAGE)
        if producer_id != FOUNDATION_PRODUCER_ID:
            raise AnalysisRunInvalidStateError(
                f"Unsupported delivery producer for AnalysisRun completion: {producer_id}"
            )

        try:
            conversation = self.conversation_repository.get_by_current_run_id(run_id)
        except KeyError as exc:
            raise AnalysisRunConversationNotFoundError(run_id) from exc

        completed_at = _utc_timestamp(datetime.now(UTC))
        delivery_artifacts = build_foundation_delivery_artifacts(
            analysis_run=analysis_run,
            conversation=conversation,
            occurred_at=completed_at,
        )
        completed_run: AnalysisRunRecord = {
            **analysis_run,
            "status": "completed",
            "phase": "delivery",
            "outcome": "success",
            "waitingFor": None,
            "completedAt": completed_at,
            "failedAt": None,
            "cancelledAt": None,
            "expiredAt": None,
            "rejectedAt": None,
            "failureCode": None,
            "terminalReason": "Delivery artifacts persisted.",
            "retryable": False,
        }

        next_sequence = self._next_run_event_sequence(run_id)
        run_events = build_delivery_run_events(
            run_id=run_id,
            occurred_at=completed_at,
            tool_call_id=delivery_artifacts.tool_execution.tool_call["toolCallId"],
            tool_name=delivery_artifacts.tool_execution.tool_call["toolName"],
            model_call_id=delivery_artifacts.model_generation.model_call["modelCallId"],
            report_id=delivery_artifacts.report_artifacts.report["reportId"],
            sequence_start=next_sequence,
        )

        self.lifecycle_repository.complete_delivery(
            completed_run,
            delivery_artifacts.tool_execution.tool_call,
            delivery_artifacts.model_generation.model_call,
            delivery_artifacts.source_evidence,
            delivery_artifacts.report_artifacts.report,
            delivery_artifacts.report_artifacts.decision,
            delivery_artifacts.assistant_message,
            delivery_artifacts.message_streams,
            run_events,
        )
        return completed_run

    def _next_run_event_sequence(self, run_id: str) -> int:
        run_events = self.run_event_repository.list_by_run_id(run_id)
        if not run_events:
            return 0
        return run_events[-1]["sequence"] + 1

    def _latest_execution_attempt(self, run_id: str) -> ExecutionAttemptRecord | None:
        execution_attempts = self.execution_attempt_repository.list_by_run_id(run_id)
        if not execution_attempts:
            return None
        return execution_attempts[-1]

    def _require_running_attempt(
        self,
        *,
        run_id: str,
        attempt_id: str,
        worker_id: str,
        run_state_error_message: str,
        attempt_state_error_message: str,
    ) -> ExecutionAttemptRecord:
        analysis_run = self.analysis_run_repository.get_by_run_id(run_id)

        if analysis_run["status"] != "running" or analysis_run["phase"] != "execution":
            raise AnalysisRunInvalidStateError(run_state_error_message)

        try:
            execution_attempt = self.execution_attempt_repository.get_by_attempt_id(attempt_id)
        except KeyError as exc:
            raise AnalysisRunInvalidStateError(
                f"ExecutionAttempt not found: {attempt_id}"
            ) from exc
        if execution_attempt["runId"] != run_id:
            raise AnalysisRunInvalidStateError("ExecutionAttempt.runId does not match run_id.")
        if execution_attempt["status"] != "running":
            raise AnalysisRunInvalidStateError(attempt_state_error_message)
        if execution_attempt["workerId"] != worker_id:
            raise AnalysisRunInvalidStateError(
                "ExecutionAttempt.workerId does not match worker_id."
            )
        return execution_attempt

    def _build_retried_run(
        self,
        *,
        analysis_run: AnalysisRunRecord,
        created_at: str,
    ) -> AnalysisRunRecord:
        return {
            "runId": _generate_canonical_id("analysis-run"),
            "workspaceId": analysis_run["workspaceId"],
            "userId": analysis_run["userId"],
            "analysisTaskId": analysis_run["analysisTaskId"],
            "status": "created",
            "phase": "intake",
            "outcome": None,
            "waitingFor": None,
            "createdAt": created_at,
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
            "retryOfRunId": analysis_run["runId"],
            "originalRunId": analysis_run["originalRunId"] or analysis_run["runId"],
        }


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def _utc_timestamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")


def _is_cancellable_run(analysis_run: AnalysisRunRecord) -> bool:
    if analysis_run["status"] == "queued":
        return analysis_run["phase"] == "queueing"
    if analysis_run["status"] == "running":
        return analysis_run["phase"] == "execution"
    if analysis_run["status"] == "waiting":
        return analysis_run["waitingFor"] in ALLOWED_CANCEL_WAITING_FOR
    return False


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


def build_worker_lease_acquired_event(
    *,
    run_id: str,
    attempt_id: str,
    occurred_at: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "worker.lease_acquired",
        "status": "succeeded",
        "phase": "execution",
        "sequence": sequence,
        "actor": AGENT_WORKER_ACTOR,
        "occurredAt": occurred_at,
        "summary": WORKER_LEASE_ACQUIRED_SUMMARY,
        "parentEventId": None,
        "refType": "execution_attempt",
        "refId": attempt_id,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "worker.lease_acquired",
        "agentName": AGENT_WORKER_NAME,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_worker_heartbeat_event(
    *,
    run_id: str,
    attempt_id: str,
    occurred_at: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "worker.heartbeat",
        "status": "succeeded",
        "phase": "execution",
        "sequence": sequence,
        "actor": AGENT_WORKER_ACTOR,
        "occurredAt": occurred_at,
        "summary": WORKER_HEARTBEAT_SUMMARY,
        "parentEventId": None,
        "refType": "execution_attempt",
        "refId": attempt_id,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "worker.heartbeat",
        "agentName": AGENT_WORKER_NAME,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_worker_lease_released_event(
    *,
    run_id: str,
    attempt_id: str,
    occurred_at: str,
    phase: str,
    summary: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "worker.lease_released",
        "status": "succeeded",
        "phase": phase,  # type: ignore[typeddict-item]
        "sequence": sequence,
        "actor": AGENT_WORKER_ACTOR,
        "occurredAt": occurred_at,
        "summary": summary,
        "parentEventId": None,
        "refType": "execution_attempt",
        "refId": attempt_id,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "worker.lease_released",
        "agentName": AGENT_WORKER_NAME,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_worker_failed_event(
    *,
    run_id: str,
    attempt_id: str,
    occurred_at: str,
    failure_code: str,
    failure_message: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "worker.failed",
        "status": "failed",
        "phase": "execution",
        "sequence": sequence,
        "actor": AGENT_WORKER_ACTOR,
        "occurredAt": occurred_at,
        "summary": WORKER_FAILED_SUMMARY,
        "parentEventId": None,
        "refType": "execution_attempt",
        "refId": attempt_id,
        "errorCode": failure_code,
        "errorMessage": failure_message,
        "nodeName": "worker.failed",
        "agentName": AGENT_WORKER_NAME,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_worker_lost_event(
    *,
    run_id: str,
    attempt_id: str,
    occurred_at: str,
    lost_reason: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "worker.lost",
        "status": "failed",
        "phase": "execution",
        "sequence": sequence,
        "actor": AGENT_WORKER_ACTOR,
        "occurredAt": occurred_at,
        "summary": WORKER_LOST_SUMMARY,
        "parentEventId": None,
        "refType": "execution_attempt",
        "refId": attempt_id,
        "errorCode": "WORKER_LOST",
        "errorMessage": lost_reason,
        "nodeName": "worker.lost",
        "agentName": AGENT_WORKER_NAME,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_run_cancel_requested_event(
    *,
    run_id: str,
    occurred_at: str,
    phase: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "run.cancel_requested",
        "status": "succeeded",
        "phase": phase,  # type: ignore[typeddict-item]
        "sequence": sequence,
        "actor": ANALYSIS_RUNTIME_ACTOR,
        "occurredAt": occurred_at,
        "summary": RUN_CANCEL_REQUESTED_SUMMARY,
        "parentEventId": None,
        "refType": None,
        "refId": None,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "run.cancel_requested",
        "agentName": ANALYSIS_RUNTIME_AGENT,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_run_cancelling_event(
    *,
    run_id: str,
    occurred_at: str,
    phase: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "run.cancelling",
        "status": "succeeded",
        "phase": phase,  # type: ignore[typeddict-item]
        "sequence": sequence,
        "actor": ANALYSIS_RUNTIME_ACTOR,
        "occurredAt": occurred_at,
        "summary": RUN_CANCELLING_SUMMARY,
        "parentEventId": None,
        "refType": None,
        "refId": None,
        "errorCode": None,
        "errorMessage": None,
        "nodeName": "run.cancelling",
        "agentName": ANALYSIS_RUNTIME_AGENT,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_run_cancelled_event(
    *,
    run_id: str,
    occurred_at: str,
    phase: str,
    reason: str,
    sequence: int,
) -> RunEventRecord:
    return {
        "eventId": _generate_canonical_id("event"),
        "runId": run_id,
        "eventType": "run.cancelled",
        "status": "cancelled",
        "phase": phase,  # type: ignore[typeddict-item]
        "sequence": sequence,
        "actor": ANALYSIS_RUNTIME_ACTOR,
        "occurredAt": occurred_at,
        "summary": RUN_CANCELLED_SUMMARY,
        "parentEventId": None,
        "refType": None,
        "refId": None,
        "errorCode": None,
        "errorMessage": reason,
        "nodeName": "run.cancelled",
        "agentName": ANALYSIS_RUNTIME_AGENT,
        "toolName": None,
        "startedAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_delivery_run_events(
    *,
    run_id: str,
    occurred_at: str,
    tool_call_id: str,
    tool_name: str,
    model_call_id: str,
    report_id: str,
    sequence_start: int,
) -> list[RunEventRecord]:
    definitions: tuple[tuple[str, str, str, str, str | None, str | None], ...] = (
        (
            "tool_call.requested",
            "succeeded",
            "tool_execution",
            "记录当前运行已向 Tool Registry 发起指标摘要调用。",
            "tool_call",
            tool_call_id,
        ),
        (
            "tool_call.policy_checked",
            "succeeded",
            "tool_execution",
            "记录当前工具调用已完成权限与风险校验。",
            "tool_call",
            tool_call_id,
        ),
        (
            "tool_call.started",
            "running",
            "tool_execution",
            "记录当前工具调用已开始执行。",
            "tool_call",
            tool_call_id,
        ),
        (
            "tool_call.completed",
            "succeeded",
            "tool_execution",
            "记录当前工具调用已完成并返回结构化结果。",
            "tool_call",
            tool_call_id,
        ),
        (
            "model_call.started",
            "running",
            "synthesis",
            "记录当前运行已通过 Model Gateway 发起总结生成。",
            "model_call",
            model_call_id,
        ),
        (
            "model_call.completed",
            "succeeded",
            "synthesis",
            "记录当前模型调用已完成总结生成。",
            "model_call",
            model_call_id,
        ),
        (
            "evidence.retrieved",
            "succeeded",
            "evidence_binding",
            "记录当前运行已召回标准化证据候选。",
            None,
            None,
        ),
        (
            "evidence.bound",
            "succeeded",
            "evidence_binding",
            "记录当前运行已把证据对象绑定到 runId。",
            None,
            None,
        ),
        (
            "synthesis.started",
            "succeeded",
            "synthesis",
            "记录当前运行已开始综合结论与交付物编排。",
            None,
            None,
        ),
        (
            "delivery.started",
            "succeeded",
            "delivery",
            DELIVERY_STARTED_SUMMARY,
            "report",
            report_id,
        ),
        (
            "artifact.persisted",
            "succeeded",
            "delivery",
            ARTIFACT_PERSISTED_SUMMARY,
            "report",
            report_id,
        ),
        (
            "run.completed",
            "succeeded",
            "delivery",
            RUN_COMPLETED_SUMMARY,
            None,
            None,
        ),
    )

    run_events: list[RunEventRecord] = []
    for offset, (event_type, status, phase, summary, ref_type, ref_id) in enumerate(definitions):
        run_events.append(
            {
                "eventId": _generate_canonical_id("event"),
                "runId": run_id,
                "eventType": event_type,
                "status": status,  # type: ignore[typeddict-item]
                "phase": phase,  # type: ignore[typeddict-item]
                "sequence": sequence_start + offset,
                "actor": ANALYSIS_RUNTIME_ACTOR,
                "occurredAt": occurred_at,
                "summary": summary,
                "parentEventId": None,
                "refType": ref_type,
                "refId": ref_id,
                "errorCode": None,
                "errorMessage": None,
                "nodeName": event_type,
                "agentName": ANALYSIS_RUNTIME_AGENT,
                "toolName": tool_name if event_type.startswith("tool_call.") else None,
                "startedAt": occurred_at,
                "completedAt": occurred_at,
            }
        )
    return run_events
