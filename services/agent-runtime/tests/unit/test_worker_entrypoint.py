from __future__ import annotations

from dataclasses import dataclass, field

from src.app.worker import AgentWorkerLoop


@dataclass
class FakeAnalysisRunRepository:
    queued_runs: list[dict[str, object]] = field(default_factory=list)
    runs_by_id: dict[str, dict[str, object]] = field(default_factory=dict)

    def find_next_queued_run(self) -> dict[str, object] | None:
        if not self.queued_runs:
            return None
        return self.queued_runs.pop(0)

    def get_by_run_id(self, run_id: str) -> dict[str, object]:
        return self.runs_by_id[run_id]


@dataclass
class FakeExecutionAttemptRepository:
    attempts_by_run_id: dict[str, list[dict[str, object]]] = field(default_factory=dict)

    def list_by_run_id(self, run_id: str) -> list[dict[str, object]]:
        return self.attempts_by_run_id.get(run_id, [])


@dataclass
class FakeLifecycleService:
    recorded_failures: list[tuple[str, str, str, str, str]] = field(default_factory=list)

    def record_worker_failure(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
        failure_code: str,
        failure_message: str,
    ) -> dict[str, object]:
        self.recorded_failures.append(
            (run_id, attempt_id, worker_id, failure_code, failure_message)
        )
        return {"runId": run_id}


@dataclass
class FakeExecutionWorker:
    worker_id: str = "agent-worker-langgraph"
    executed_run_ids: list[str] = field(default_factory=list)
    failure: Exception | None = None

    def execute_run(self, run_id: str) -> dict[str, object]:
        self.executed_run_ids.append(run_id)
        if self.failure is not None:
            raise self.failure
        return {"runId": run_id}


def test_run_once_returns_false_when_queue_is_empty() -> None:
    loop = AgentWorkerLoop(
        analysis_run_repository=FakeAnalysisRunRepository(),
        execution_attempt_repository=FakeExecutionAttemptRepository(),
        lifecycle_service=FakeLifecycleService(),
        execution_worker=FakeExecutionWorker(),
    )

    assert loop.run_once() is False


def test_run_once_executes_next_queued_run() -> None:
    execution_worker = FakeExecutionWorker()
    loop = AgentWorkerLoop(
        analysis_run_repository=FakeAnalysisRunRepository(
            queued_runs=[{"runId": "analysis-run-queued"}]
        ),
        execution_attempt_repository=FakeExecutionAttemptRepository(),
        lifecycle_service=FakeLifecycleService(),
        execution_worker=execution_worker,
    )

    assert loop.run_once() is True
    assert execution_worker.executed_run_ids == ["analysis-run-queued"]


def test_run_once_records_worker_failure_after_unhandled_exception() -> None:
    lifecycle_service = FakeLifecycleService()
    execution_worker = FakeExecutionWorker(failure=RuntimeError("unexpected crash"))
    run_id = "analysis-run-crash"
    loop = AgentWorkerLoop(
        analysis_run_repository=FakeAnalysisRunRepository(
            queued_runs=[{"runId": run_id}],
            runs_by_id={
                run_id: {
                    "runId": run_id,
                    "status": "running",
                    "phase": "execution",
                }
            },
        ),
        execution_attempt_repository=FakeExecutionAttemptRepository(
            attempts_by_run_id={
                run_id: [
                    {
                        "attemptId": "attempt-1",
                        "workerId": execution_worker.worker_id,
                        "status": "running",
                    }
                ]
            }
        ),
        lifecycle_service=lifecycle_service,
        execution_worker=execution_worker,
    )

    assert loop.run_once() is False
    assert lifecycle_service.recorded_failures == [
        (
            run_id,
            "attempt-1",
            execution_worker.worker_id,
            "WORKER_LOOP_CRASH",
            "Unhandled RuntimeError while agent-worker was executing the run.",
        )
    ]
