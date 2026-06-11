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

        self.lifecycle_repository.dispatch(queued_run, execution_attempt)
        return queued_run

    def list_execution_attempts(self, run_id: str) -> list[ExecutionAttemptRecord]:
        self.analysis_run_repository.get_by_run_id(run_id)
        return self.execution_attempt_repository.list_by_run_id(run_id)


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def _utc_timestamp(value: datetime) -> str:
    return value.astimezone(UTC).isoformat().replace("+00:00", "Z")
