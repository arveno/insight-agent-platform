"""#157-1 runtime foundation 的 MySQL CLI repository 边界。

当前仓库尚未引入经审查的 Python MySQL driver。
为保持 contracts-first 与真实 MySQL foundation，本模块通过
`scripts/migration/runtime_foundation.sh` 访问 preview compose 的 mysql service，
只承接 `AnalysisTask / Conversation / AnalysisRun` 三个对象的最小持久化能力。
"""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Literal, TypedDict, cast


class RuntimeFoundationError(RuntimeError):
    """Runtime foundation MySQL CLI gateway error."""


class AnalysisTaskContextPack(TypedDict):
    """AnalysisTask.contextPack 的正式 typed object。"""

    metricId: str
    timeRange: str
    threshold: str
    trend: str
    tableIds: list[str]
    knowledgeDocumentIds: list[str]


class AnalysisTaskRecord(TypedDict):
    """AnalysisTask contract-shaped persistence record."""

    analysisTaskId: str
    workspaceId: str
    userId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPack
    createdAt: str
    updatedAt: str


class ConversationRecord(TypedDict):
    """Conversation contract-shaped persistence record."""

    conversationId: str
    workspaceId: str
    userId: str
    analysisTaskId: str
    currentRunId: str | None
    title: str
    status: Literal["active", "archived", "closed"]
    createdAt: str
    updatedAt: str


class AnalysisRunRecord(TypedDict):
    """AnalysisRun contract-shaped persistence record."""

    runId: str
    workspaceId: str
    userId: str
    analysisTaskId: str
    status: Literal[
        "created",
        "validating",
        "rejected",
        "queued",
        "running",
        "waiting",
        "cancelling",
        "cancelled",
        "failed",
        "completed",
        "expired",
    ]
    phase: Literal[
        "intake",
        "preflight",
        "governance",
        "context_binding",
        "planning",
        "approval",
        "queueing",
        "execution",
        "tool_execution",
        "evidence_binding",
        "synthesis",
        "verification",
        "delivery",
        "post_run",
    ]
    outcome: str | None
    waitingFor: str | None
    createdAt: str
    validatingAt: str | None
    queuedAt: str | None
    startedAt: str | None
    waitingSince: str | None
    timeoutAt: str | None
    cancelRequestedAt: str | None
    cancellingAt: str | None
    completedAt: str | None
    failedAt: str | None
    cancelledAt: str | None
    expiredAt: str | None
    rejectedAt: str | None
    terminalReason: str | None
    failureCode: str | None
    retryable: bool | None
    retryOfRunId: str | None
    originalRunId: str | None


class GoldenPathFoundationRecord(TypedDict):
    """Golden path foundation query result."""

    analysisTask: AnalysisTaskRecord
    conversation: ConversationRecord
    analysisRun: AnalysisRunRecord


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[5]


def _sql_literal(value: str | None) -> str:
    if value is None:
        return "NULL"
    escaped = value.replace("\\", "\\\\").replace("'", "''")
    return f"'{escaped}'"


def _json_literal(value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False)
    return f"CAST({_sql_literal(payload)} AS JSON)"


def _require_mapping(raw: object, field_name: str) -> dict[str, object]:
    if not isinstance(raw, dict):
        raise RuntimeFoundationError(f"{field_name} query did not return a JSON object.")
    return cast(dict[str, object], raw)


def _coerce_analysis_run_retryable(payload: dict[str, object]) -> AnalysisRunRecord:
    retryable = payload.get("retryable")
    if isinstance(retryable, int):
        payload["retryable"] = bool(retryable)
    return cast(AnalysisRunRecord, payload)


class RuntimeFoundationMysqlCli:
    """Host-side MySQL CLI gateway for runtime foundation persistence."""

    def __init__(self, script_path: Path | None = None) -> None:
        repo_root = _repo_root()
        self._repo_root = repo_root
        self._script_path = script_path or repo_root / "scripts/migration/runtime_foundation.sh"

    def _run(self, *args: str, input_text: str | None = None) -> str:
        process = subprocess.run(
            [str(self._script_path), *args],
            cwd=self._repo_root,
            input=input_text,
            text=True,
            capture_output=True,
            check=False,
        )

        if process.returncode != 0:
            stderr = process.stderr.strip()
            stdout = process.stdout.strip()
            details = stderr or stdout or f"exit={process.returncode}"
            raise RuntimeFoundationError(details)

        return process.stdout

    def execute_sql(self, sql: str) -> None:
        self._run("exec-sql", input_text=sql)

    def query_json_object(self, sql: str) -> dict[str, object] | None:
        output = self._run("query-json", input_text=sql).strip()
        if not output:
            return None
        parsed = json.loads(output)
        return _require_mapping(parsed, "query-json")


class AnalysisTaskRepository:
    """Repository boundary for AnalysisTask foundation persistence."""

    def __init__(self, database: RuntimeFoundationMysqlCli) -> None:
        self._database = database

    def create(self, analysis_task: AnalysisTaskRecord) -> None:
        sql = f"""
INSERT INTO analysis_tasks (
  analysis_task_id,
  workspace_id,
  user_id,
  business_domain_id,
  question,
  context_pack_json,
  created_at,
  updated_at
) VALUES (
  {_sql_literal(analysis_task["analysisTaskId"])},
  {_sql_literal(analysis_task["workspaceId"])},
  {_sql_literal(analysis_task["userId"])},
  {_sql_literal(analysis_task["businessDomainId"])},
  {_sql_literal(analysis_task["question"])},
  {_json_literal(analysis_task["contextPack"])},
  {_sql_literal(analysis_task["createdAt"])},
  {_sql_literal(analysis_task["updatedAt"])}
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  business_domain_id = VALUES(business_domain_id),
  question = VALUES(question),
  context_pack_json = VALUES(context_pack_json),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);
"""
        self._database.execute_sql(sql)

    def get_by_analysis_task_id(self, analysis_task_id: str) -> AnalysisTaskRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'analysisTaskId', analysis_task_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'businessDomainId', business_domain_id,
  'question', question,
  'contextPack', context_pack_json,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM analysis_tasks
WHERE analysis_task_id = {_sql_literal(analysis_task_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(analysis_task_id)
        return cast(AnalysisTaskRecord, payload)


class ConversationRepository:
    """Repository boundary for Conversation foundation persistence."""

    def __init__(self, database: RuntimeFoundationMysqlCli) -> None:
        self._database = database

    def create(self, conversation: ConversationRecord) -> None:
        sql = f"""
INSERT INTO conversations (
  conversation_id,
  workspace_id,
  user_id,
  analysis_task_id,
  current_run_id,
  title,
  status,
  created_at,
  updated_at
) VALUES (
  {_sql_literal(conversation["conversationId"])},
  {_sql_literal(conversation["workspaceId"])},
  {_sql_literal(conversation["userId"])},
  {_sql_literal(conversation["analysisTaskId"])},
  {_sql_literal(conversation["currentRunId"])},
  {_sql_literal(conversation["title"])},
  {_sql_literal(conversation["status"])},
  {_sql_literal(conversation["createdAt"])},
  {_sql_literal(conversation["updatedAt"])}
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  analysis_task_id = VALUES(analysis_task_id),
  current_run_id = VALUES(current_run_id),
  title = VALUES(title),
  status = VALUES(status),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);
"""
        self._database.execute_sql(sql)

    def get_by_conversation_id(self, conversation_id: str) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'analysisTaskId', analysis_task_id,
  'currentRunId', current_run_id,
  'title', title,
  'status', status,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM conversations
WHERE conversation_id = {_sql_literal(conversation_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(conversation_id)
        return cast(ConversationRecord, payload)

    def get_by_analysis_task_id(self, analysis_task_id: str) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'analysisTaskId', analysis_task_id,
  'currentRunId', current_run_id,
  'title', title,
  'status', status,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM conversations
WHERE analysis_task_id = {_sql_literal(analysis_task_id)}
ORDER BY id DESC
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(analysis_task_id)
        return cast(ConversationRecord, payload)


class AnalysisRunRepository:
    """Repository boundary for AnalysisRun foundation persistence."""

    def __init__(self, database: RuntimeFoundationMysqlCli) -> None:
        self._database = database

    def create(self, analysis_run: AnalysisRunRecord) -> None:
        sql = f"""
INSERT INTO analysis_runs (
  run_id,
  workspace_id,
  user_id,
  analysis_task_id,
  status,
  phase,
  outcome,
  waiting_for,
  created_at,
  validating_at,
  queued_at,
  started_at,
  waiting_since,
  timeout_at,
  cancel_requested_at,
  cancelling_at,
  completed_at,
  failed_at,
  cancelled_at,
  expired_at,
  rejected_at,
  terminal_reason,
  failure_code,
  retryable,
  retry_of_run_id,
  original_run_id
) VALUES (
  {_sql_literal(analysis_run["runId"])},
  {_sql_literal(analysis_run["workspaceId"])},
  {_sql_literal(analysis_run["userId"])},
  {_sql_literal(analysis_run["analysisTaskId"])},
  {_sql_literal(analysis_run["status"])},
  {_sql_literal(analysis_run["phase"])},
  {_sql_literal(analysis_run["outcome"])},
  {_sql_literal(analysis_run["waitingFor"])},
  {_sql_literal(analysis_run["createdAt"])},
  {_sql_literal(analysis_run["validatingAt"])},
  {_sql_literal(analysis_run["queuedAt"])},
  {_sql_literal(analysis_run["startedAt"])},
  {_sql_literal(analysis_run["waitingSince"])},
  {_sql_literal(analysis_run["timeoutAt"])},
  {_sql_literal(analysis_run["cancelRequestedAt"])},
  {_sql_literal(analysis_run["cancellingAt"])},
  {_sql_literal(analysis_run["completedAt"])},
  {_sql_literal(analysis_run["failedAt"])},
  {_sql_literal(analysis_run["cancelledAt"])},
  {_sql_literal(analysis_run["expiredAt"])},
  {_sql_literal(analysis_run["rejectedAt"])},
  {_sql_literal(analysis_run["terminalReason"])},
  {_sql_literal(analysis_run["failureCode"])},
  {1 if analysis_run["retryable"] is True else 0 if analysis_run["retryable"] is False else "NULL"},
  {_sql_literal(analysis_run["retryOfRunId"])},
  {_sql_literal(analysis_run["originalRunId"])}
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  analysis_task_id = VALUES(analysis_task_id),
  status = VALUES(status),
  phase = VALUES(phase),
  outcome = VALUES(outcome),
  waiting_for = VALUES(waiting_for),
  created_at = VALUES(created_at),
  validating_at = VALUES(validating_at),
  queued_at = VALUES(queued_at),
  started_at = VALUES(started_at),
  waiting_since = VALUES(waiting_since),
  timeout_at = VALUES(timeout_at),
  cancel_requested_at = VALUES(cancel_requested_at),
  cancelling_at = VALUES(cancelling_at),
  completed_at = VALUES(completed_at),
  failed_at = VALUES(failed_at),
  cancelled_at = VALUES(cancelled_at),
  expired_at = VALUES(expired_at),
  rejected_at = VALUES(rejected_at),
  terminal_reason = VALUES(terminal_reason),
  failure_code = VALUES(failure_code),
  retryable = VALUES(retryable),
  retry_of_run_id = VALUES(retry_of_run_id),
  original_run_id = VALUES(original_run_id);
"""
        self._database.execute_sql(sql)

    def get_by_run_id(self, run_id: str) -> AnalysisRunRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'runId', run_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'analysisTaskId', analysis_task_id,
  'status', status,
  'phase', phase,
  'outcome', outcome,
  'waitingFor', waiting_for,
  'createdAt', created_at,
  'validatingAt', validating_at,
  'queuedAt', queued_at,
  'startedAt', started_at,
  'waitingSince', waiting_since,
  'timeoutAt', timeout_at,
  'cancelRequestedAt', cancel_requested_at,
  'cancellingAt', cancelling_at,
  'completedAt', completed_at,
  'failedAt', failed_at,
  'cancelledAt', cancelled_at,
  'expiredAt', expired_at,
  'rejectedAt', rejected_at,
  'terminalReason', terminal_reason,
  'failureCode', failure_code,
  'retryable', retryable,
  'retryOfRunId', retry_of_run_id,
  'originalRunId', original_run_id
)
FROM analysis_runs
WHERE run_id = {_sql_literal(run_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(run_id)
        return _coerce_analysis_run_retryable(payload)

    def get_by_analysis_task_id(self, analysis_task_id: str) -> AnalysisRunRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'runId', run_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'analysisTaskId', analysis_task_id,
  'status', status,
  'phase', phase,
  'outcome', outcome,
  'waitingFor', waiting_for,
  'createdAt', created_at,
  'validatingAt', validating_at,
  'queuedAt', queued_at,
  'startedAt', started_at,
  'waitingSince', waiting_since,
  'timeoutAt', timeout_at,
  'cancelRequestedAt', cancel_requested_at,
  'cancellingAt', cancelling_at,
  'completedAt', completed_at,
  'failedAt', failed_at,
  'cancelledAt', cancelled_at,
  'expiredAt', expired_at,
  'rejectedAt', rejected_at,
  'terminalReason', terminal_reason,
  'failureCode', failure_code,
  'retryable', retryable,
  'retryOfRunId', retry_of_run_id,
  'originalRunId', original_run_id
)
FROM analysis_runs
WHERE analysis_task_id = {_sql_literal(analysis_task_id)}
ORDER BY id DESC
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(analysis_task_id)
        return _coerce_analysis_run_retryable(payload)


class GoldenPathFoundationRepository:
    """Query helper for the three-object frozen foundation chain."""

    def __init__(
        self,
        analysis_task_repository: AnalysisTaskRepository,
        conversation_repository: ConversationRepository,
        analysis_run_repository: AnalysisRunRepository,
    ) -> None:
        self._analysis_task_repository = analysis_task_repository
        self._conversation_repository = conversation_repository
        self._analysis_run_repository = analysis_run_repository

    def get_by_analysis_task_id(self, analysis_task_id: str) -> GoldenPathFoundationRecord:
        analysis_task = self._analysis_task_repository.get_by_analysis_task_id(analysis_task_id)
        conversation = self._conversation_repository.get_by_analysis_task_id(analysis_task_id)
        analysis_run = self._analysis_run_repository.get_by_analysis_task_id(analysis_task_id)

        return {
            "analysisTask": analysis_task,
            "conversation": conversation,
            "analysisRun": analysis_run,
        }
