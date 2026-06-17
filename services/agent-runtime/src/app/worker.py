"""Long-running agent-worker entrypoint for queued AnalysisRun execution."""

from __future__ import annotations

import logging
import signal
from dataclasses import dataclass
from os import getenv
from threading import Event
from time import monotonic
from typing import Protocol

from src.app.config import Settings, get_settings
from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    AnalysisRunRecord,
    AnalysisRunRepository,
    ConversationRepository,
    ExecutionAttemptRecord,
    ExecutionAttemptRepository,
    RunEventRepository,
    RuntimeFoundationPyMySqlDatabase,
)
from src.infrastructure.model_gateway.gateway import ModelGateway
from src.infrastructure.tool_registry.registry import ToolRegistry
from src.modules.analysis_runs.lifecycle_service import (
    AnalysisRunInvalidStateError,
    AnalysisRunLifecycleService,
)
from src.modules.analysis_runs.worker_service import AnalysisRunExecutionWorker

DEFAULT_WORKER_POLL_INTERVAL_SECONDS = 2.0
DEFAULT_WORKER_IDLE_LOG_INTERVAL_SECONDS = 30.0
WORKER_LOOP_FAILURE_CODE = "WORKER_LOOP_CRASH"


def _read_positive_float_env(name: str, default: float) -> float:
    raw_value = getenv(name, "").strip()
    if not raw_value:
        return default

    try:
        value = float(raw_value)
    except ValueError:
        return default
    return value if value > 0 else default


def _truncate_failure_message(message: str) -> str:
    normalized = " ".join(message.split())
    if len(normalized) <= 300:
        return normalized
    return f"{normalized[:297]}..."


def _safe_loop_failure_message(exc: Exception) -> str:
    return f"Unhandled {exc.__class__.__name__} while agent-worker was executing the run."


class AnalysisRunRepositoryLike(Protocol):
    def find_next_queued_run(self) -> AnalysisRunRecord | None: ...

    def get_by_run_id(self, run_id: str) -> AnalysisRunRecord: ...


class ExecutionAttemptRepositoryLike(Protocol):
    def list_by_run_id(self, run_id: str) -> list[ExecutionAttemptRecord]: ...


class LifecycleServiceLike(Protocol):
    def record_worker_failure(
        self,
        run_id: str,
        attempt_id: str,
        worker_id: str,
        failure_code: str,
        failure_message: str,
    ) -> AnalysisRunRecord: ...


class ExecutionWorkerLike(Protocol):
    worker_id: str

    def execute_run(self, run_id: str) -> object: ...


@dataclass(slots=True)
class AgentWorkerLoop:
    analysis_run_repository: AnalysisRunRepositoryLike
    execution_attempt_repository: ExecutionAttemptRepositoryLike
    lifecycle_service: LifecycleServiceLike
    execution_worker: ExecutionWorkerLike
    poll_interval_seconds: float = DEFAULT_WORKER_POLL_INTERVAL_SECONDS
    idle_log_interval_seconds: float = DEFAULT_WORKER_IDLE_LOG_INTERVAL_SECONDS

    def run_once(self) -> bool:
        queued_run = self.analysis_run_repository.find_next_queued_run()
        if queued_run is None:
            return False

        run_id = queued_run["runId"]
        logging.info("Picked queued AnalysisRun runId=%s for execution.", run_id)
        try:
            self.execution_worker.execute_run(run_id)
        except AnalysisRunInvalidStateError as exc:
            logging.warning(
                "Skipped AnalysisRun runId=%s because it is no longer claimable: %s",
                run_id,
                exc,
            )
            return False
        except KeyError as exc:
            logging.warning(
                "Skipped AnalysisRun runId=%s because persisted state is missing: %s",
                run_id,
                exc,
            )
            return False
        except Exception as exc:
            logging.error(
                "Unhandled agent-worker failure while executing runId=%s exception=%s.",
                run_id,
                exc.__class__.__name__,
            )
            self._record_worker_failure(run_id, failure_message=_safe_loop_failure_message(exc))
            return False

        logging.info("Finished AnalysisRun runId=%s.", run_id)
        return True

    def run_forever(self, *, stop_event: Event) -> int:
        last_idle_log_at = 0.0

        while not stop_event.is_set():
            handled_run = self.run_once()
            if handled_run:
                continue

            now = monotonic()
            if now - last_idle_log_at >= self.idle_log_interval_seconds:
                logging.info(
                    "No queued AnalysisRun available; sleeping for %.1fs.",
                    self.poll_interval_seconds,
                )
                last_idle_log_at = now
            stop_event.wait(self.poll_interval_seconds)

        logging.info("Shutdown requested; agent-worker loop exiting cleanly.")
        return 0

    def _record_worker_failure(self, run_id: str, *, failure_message: str) -> None:
        try:
            analysis_run = self.analysis_run_repository.get_by_run_id(run_id)
        except KeyError:
            return

        if analysis_run["status"] != "running" or analysis_run["phase"] != "execution":
            return

        execution_attempts = self.execution_attempt_repository.list_by_run_id(run_id)
        if not execution_attempts:
            return

        latest_attempt = execution_attempts[-1]
        if latest_attempt["status"] != "running":
            return
        if latest_attempt["workerId"] != self.execution_worker.worker_id:
            return

        try:
            self.lifecycle_service.record_worker_failure(
                run_id,
                latest_attempt["attemptId"],
                self.execution_worker.worker_id,
                WORKER_LOOP_FAILURE_CODE,
                _truncate_failure_message(failure_message),
            )
        except Exception:
            logging.exception(
                "Failed to persist worker loop failure for runId=%s after an unhandled crash.",
                run_id,
            )


def _build_database(settings: Settings) -> RuntimeFoundationPyMySqlDatabase:
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def build_agent_worker_loop() -> AgentWorkerLoop:
    settings = get_settings()
    database = _build_database(settings)
    execution_worker = AnalysisRunExecutionWorker(
        database=database,
        model_gateway=ModelGateway(settings=settings.model_gateway),
        tool_registry=ToolRegistry(),
    )
    return AgentWorkerLoop(
        analysis_run_repository=AnalysisRunRepository(database),
        execution_attempt_repository=ExecutionAttemptRepository(database),
        lifecycle_service=AnalysisRunLifecycleService(
            analysis_run_repository=AnalysisRunRepository(database),
            conversation_repository=ConversationRepository(database),
            execution_attempt_repository=ExecutionAttemptRepository(database),
            run_event_repository=RunEventRepository(database),
            lifecycle_repository=AnalysisRunLifecycleRepository(database),
            worker_id=execution_worker.worker_id,
        ),
        execution_worker=execution_worker,
        poll_interval_seconds=_read_positive_float_env(
            "IAP_AGENT_WORKER_POLL_INTERVAL_SECONDS",
            DEFAULT_WORKER_POLL_INTERVAL_SECONDS,
        ),
        idle_log_interval_seconds=_read_positive_float_env(
            "IAP_AGENT_WORKER_IDLE_LOG_INTERVAL_SECONDS",
            DEFAULT_WORKER_IDLE_LOG_INTERVAL_SECONDS,
        ),
    )


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )


def _install_signal_handlers(stop_event: Event) -> None:
    def _request_shutdown(signum: int, _frame: object) -> None:
        logging.info("Received signal=%s; waiting for the current worker loop to finish.", signum)
        stop_event.set()

    signal.signal(signal.SIGINT, _request_shutdown)
    signal.signal(signal.SIGTERM, _request_shutdown)


def main() -> int:
    _configure_logging()
    stop_event = Event()
    _install_signal_handlers(stop_event)
    return build_agent_worker_loop().run_forever(stop_event=stop_event)


if __name__ == "__main__":
    raise SystemExit(main())
