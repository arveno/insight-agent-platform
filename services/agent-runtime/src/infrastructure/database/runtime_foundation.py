"""#157-1 / #158-1 runtime foundation 的 repository 与数据库适配器边界。"""

from __future__ import annotations

import json
import subprocess
from collections.abc import Sequence
from pathlib import Path
from typing import Literal, NotRequired, Protocol, TypeAlias, TypedDict, cast

import pymysql  # type: ignore[import-untyped]


class RuntimeFoundationError(RuntimeError):
    """Runtime foundation MySQL CLI gateway error."""


class RuntimeFoundationDatabase(Protocol):
    """Runtime foundation database boundary shared by CLI and PyMySQL adapters."""

    def execute_sql(self, sql: str) -> None:
        """Execute a mutating SQL statement."""

    def execute_transaction(self, statements: Sequence[str]) -> None:
        """Execute multiple mutating SQL statements in one transaction."""

    def query_json_object(self, sql: str) -> dict[str, object] | None:
        """Execute a JSON_OBJECT query and return the decoded payload."""


class UserRecord(TypedDict):
    """User contract-shaped read record."""

    userId: str
    email: str
    displayName: str
    createdAt: str
    updatedAt: str


class UserAuthenticationRecord(TypedDict):
    """User identity record with DB-only password hash for login verification."""

    userId: str
    email: str
    displayName: str
    passwordHash: str
    createdAt: str
    updatedAt: str


class WorkspaceRecord(TypedDict):
    """Workspace contract-shaped read record."""

    workspaceId: str
    name: str
    createdAt: str
    updatedAt: str


class RoleRecord(TypedDict):
    """Role contract-shaped read record."""

    role: str


class WorkspaceMembershipRecord(TypedDict):
    """WorkspaceMembership contract-shaped read record."""

    membershipId: str
    userId: str
    workspaceId: str
    role: str
    createdAt: str
    updatedAt: str


class WorkspaceListItemRecord(TypedDict):
    """Workspace list item record composed from membership and workspace objects."""

    membership: WorkspaceMembershipRecord
    workspace: WorkspaceRecord


class AuthSessionRecord(TypedDict):
    """AuthSession contract-shaped read record."""

    authSessionId: str
    userId: str
    currentWorkspaceId: str | None
    expiresAt: str
    createdAt: str
    updatedAt: str
    lastAccessedAt: str | None


class AuthSessionStateRecord(TypedDict):
    """AuthSession DB state record including internal security fields."""

    authSessionId: str
    userId: str
    currentWorkspaceId: str | None
    sessionTokenHash: str
    expiresAt: str
    createdAt: str
    updatedAt: str
    lastAccessedAt: str | None
    revokedAt: str | None


class CurrentWorkspaceContextRecord(TypedDict):
    """CurrentWorkspaceContext contract-shaped read record."""

    membershipId: str
    userId: str
    workspaceId: str
    role: str


class SourceRefReport(TypedDict):
    type: Literal["report"]
    reportId: str


class SourceRefMetric(TypedDict):
    type: Literal["metric"]
    metricId: str


class SourceRefSourceEvidence(TypedDict):
    type: Literal["sourceEvidence"]
    sourceEvidenceId: str


class SourceRefAnalysisRun(TypedDict):
    type: Literal["analysisRun"]
    runId: str


class SourceRefDataTable(TypedDict):
    type: Literal["dataTable"]
    tableId: str


class SourceRefKnowledgeDocument(TypedDict):
    type: Literal["knowledgeDocument"]
    knowledgeDocumentId: str


class SourceRefToolCall(TypedDict):
    type: Literal["toolCall"]
    toolCallId: str


class SourceRefModelCall(TypedDict):
    type: Literal["modelCall"]
    modelCallId: str


class SourceRefJob(TypedDict):
    type: Literal["job"]
    jobId: str


SourceRef: TypeAlias = (
    SourceRefReport
    | SourceRefMetric
    | SourceRefSourceEvidence
    | SourceRefAnalysisRun
    | SourceRefDataTable
    | SourceRefKnowledgeDocument
    | SourceRefToolCall
    | SourceRefModelCall
    | SourceRefJob
)


class InspectorOwnerConversationRef(TypedDict):
    type: Literal["conversation"]
    conversationId: str


class InspectorOwnerAnalysisTaskRef(TypedDict):
    type: Literal["analysisTask"]
    analysisTaskId: NotRequired[str]


class InspectorOwnerAnalysisRunRef(TypedDict):
    type: Literal["analysisRun"]
    runId: str


class InspectorOwnerReportRef(TypedDict):
    type: Literal["report"]
    reportId: str


class InspectorOwnerSourceEvidenceRef(TypedDict):
    type: Literal["sourceEvidence"]
    sourceEvidenceId: str


InspectorOwnerRef: TypeAlias = (
    InspectorOwnerConversationRef
    | InspectorOwnerAnalysisTaskRef
    | InspectorOwnerAnalysisRunRef
    | InspectorOwnerReportRef
    | InspectorOwnerSourceEvidenceRef
)


InspectorNodeRole: TypeAlias = Literal[
    "inputContext",
    "runtimeReferencedSource",
    "runOutput",
    "reportSection",
    "evidenceItem",
    "traceEvent",
    "toolCall",
    "modelCall",
    "decision",
    "directory",
]


class InspectorTreeTimeRange(TypedDict):
    key: str
    label: str


class InspectorTreeNode(TypedDict):
    nodeId: str
    kind: str
    role: InspectorNodeRole
    owner: InspectorOwnerRef
    title: str
    summary: NotRequired[str]
    description: NotRequired[str]
    value: NotRequired[str]
    chips: NotRequired[list[str]]
    timeRange: NotRequired[InspectorTreeTimeRange]
    capturedAt: NotRequired[str]
    asOfAt: NotRequired[str]
    sourceRef: NotRequired[SourceRef]
    children: NotRequired[list["InspectorTreeNode"]]
    disabledReason: NotRequired[str]


class AnalysisTaskContextPack(TypedDict):
    """AnalysisTask.contextPack 的正式 tree-shaped input snapshot。"""

    version: Literal[1]
    suggestedPrompt: str
    traceability: Literal["none", "summary_only", "partial_refs", "direct_refs"]
    capturedAt: str
    root: InspectorTreeNode


class AnalysisTaskRecord(TypedDict):
    """AnalysisTask contract-shaped persistence record."""

    analysisTaskId: str
    conversationId: str
    workspaceId: str
    userId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPack | None
    createdAt: str
    updatedAt: str


class ConversationRecord(TypedDict):
    """Conversation contract-shaped persistence record."""

    conversationId: str
    workspaceId: str
    userId: str
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


class RunEventRecord(TypedDict):
    """RunEvent contract-shaped persistence record."""

    eventId: str
    runId: str
    eventType: str
    status: Literal["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
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
    sequence: int
    actor: str
    occurredAt: str
    summary: str
    parentEventId: str | None
    refType: str | None
    refId: str | None
    errorCode: str | None
    errorMessage: str | None
    nodeName: str
    agentName: str
    toolName: str | None
    startedAt: str | None
    completedAt: str | None


class ExecutionAttemptRecord(TypedDict):
    """ExecutionAttempt contract-shaped persistence record."""

    attemptId: str
    runId: str
    attemptNumber: int
    workerId: str
    leaseId: str
    status: Literal["leased", "running", "lost", "released", "failed", "completed"]
    leaseAcquiredAt: str
    leaseExpiresAt: str
    heartbeatAt: str | None
    releasedAt: str | None
    failureCode: str | None
    failureMessage: str | None


class ToolCallRecord(TypedDict):
    """ToolCall contract-shaped persistence record."""

    toolCallId: str
    runId: str
    toolName: str
    input: dict[str, object]
    output: dict[str, object] | None
    status: Literal["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
    riskLevel: Literal["low", "medium", "high", "critical"]
    permission: str
    errorType: str | None
    errorMessage: str | None
    startedAt: str | None
    completedAt: str | None


class ModelCallRecord(TypedDict):
    """ModelCall contract-shaped persistence record."""

    modelCallId: str
    runId: str
    provider: str
    modelId: str
    promptVersionId: str
    inputTokens: int
    outputTokens: int
    cost: float
    latencyMs: int
    status: Literal["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
    errorType: str | None
    errorMessage: str | None
    startedAt: str | None
    completedAt: str | None


class SourceEvidenceRecord(TypedDict):
    """SourceEvidence contract-shaped persistence record."""

    sourceEvidenceId: str
    runId: str
    sourceType: Literal[
        "data_table",
        "metric",
        "knowledge_document",
        "knowledge_chunk",
        "sql_query",
        "analysis_memory",
        "decision_memory",
    ]
    sourceId: str
    title: str
    snippet: str
    metadata: dict[str, object] | None
    confidence: float
    createdAt: str


class ReportSectionRecord(TypedDict):
    """ReportSection contract-shaped persistence record."""

    reportSectionId: str
    reportId: str
    title: str
    content: str
    createdAt: str


class ReportRecord(TypedDict):
    """Report contract-shaped persistence record."""

    reportId: str
    runId: str
    workspaceId: str
    title: str
    summary: str
    sections: list[ReportSectionRecord]
    sourceEvidence: list[str]
    createdAt: str


class DecisionRecord(TypedDict):
    """Decision contract-shaped persistence record."""

    decisionId: str
    workspaceId: str
    runId: str
    reportId: str
    title: str
    status: Literal["proposed", "accepted", "rejected", "in_progress", "completed"]
    createdAt: str


class MessageRecord(TypedDict):
    """Message contract-shaped persistence record."""

    messageId: str
    conversationId: str
    analysisTaskId: str | None
    turnId: str
    runId: str | None
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    status: Literal["created", "streaming", "completed", "failed", "cancelled"]
    sourceEvidenceIds: list[str]
    toolCallIds: list[str]
    reportId: str | None
    createdAt: str
    completedAt: str | None


class MessageStreamRecord(TypedDict):
    """MessageStream contract-shaped persistence record."""

    messageStreamId: str
    conversationId: str
    messageId: str
    runId: str
    sequence: int
    eventType: Literal[
        "stream.started",
        "stream.delta",
        "stream.completed",
        "stream.failed",
        "stream.cancelled",
    ]
    delta: str
    status: Literal["created", "streaming", "completed", "failed", "cancelled"]
    occurredAt: str
    errorCode: str | None
    errorMessage: str | None


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


def _nullable_json_literal(value: object | None) -> str:
    if value is None:
        return "NULL"
    return _json_literal(value)


def _require_mapping(raw: object, field_name: str) -> dict[str, object]:
    if not isinstance(raw, dict):
        raise RuntimeFoundationError(f"{field_name} query did not return a JSON object.")
    return cast(dict[str, object], raw)


def _require_array(raw: object, field_name: str) -> list[object]:
    if not isinstance(raw, list):
        raise RuntimeFoundationError(f"{field_name} query did not return a JSON array.")
    return cast(list[object], raw)


def _coerce_analysis_run_retryable(payload: dict[str, object]) -> AnalysisRunRecord:
    retryable = payload.get("retryable")
    if isinstance(retryable, int):
        payload["retryable"] = bool(retryable)
    return cast(AnalysisRunRecord, payload)


def _analysis_run_upsert_sql(analysis_run: AnalysisRunRecord) -> str:
    return f"""
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


def _conversation_upsert_sql(conversation: ConversationRecord) -> str:
    return f"""
INSERT INTO conversations (
  conversation_id,
  workspace_id,
  user_id,
  current_run_id,
  title,
  status,
  created_at,
  updated_at
) VALUES (
  {_sql_literal(conversation["conversationId"])},
  {_sql_literal(conversation["workspaceId"])},
  {_sql_literal(conversation["userId"])},
  {_sql_literal(conversation["currentRunId"])},
  {_sql_literal(conversation["title"])},
  {_sql_literal(conversation["status"])},
  {_sql_literal(conversation["createdAt"])},
  {_sql_literal(conversation["updatedAt"])}
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  current_run_id = VALUES(current_run_id),
  title = VALUES(title),
  status = VALUES(status),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);
"""


def _auth_session_upsert_sql(auth_session: AuthSessionStateRecord) -> str:
    return f"""
INSERT INTO auth_sessions (
  auth_session_id,
  user_id,
  current_workspace_id,
  session_token_hash,
  expires_at,
  created_at,
  updated_at,
  last_accessed_at,
  revoked_at
) VALUES (
  {_sql_literal(auth_session["authSessionId"])},
  {_sql_literal(auth_session["userId"])},
  {_sql_literal(auth_session["currentWorkspaceId"])},
  {_sql_literal(auth_session["sessionTokenHash"])},
  {_sql_literal(auth_session["expiresAt"])},
  {_sql_literal(auth_session["createdAt"])},
  {_sql_literal(auth_session["updatedAt"])},
  {_sql_literal(auth_session["lastAccessedAt"])},
  {_sql_literal(auth_session["revokedAt"])}
)
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  current_workspace_id = VALUES(current_workspace_id),
  session_token_hash = VALUES(session_token_hash),
  expires_at = VALUES(expires_at),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at),
  last_accessed_at = VALUES(last_accessed_at),
  revoked_at = VALUES(revoked_at);
"""


def _run_event_insert_sql(run_event: RunEventRecord) -> str:
    return f"""
INSERT INTO run_events (
  event_id,
  run_id,
  event_type,
  status,
  phase,
  sequence,
  actor,
  occurred_at,
  summary,
  parent_event_id,
  ref_type,
  ref_id,
  error_code,
  error_message,
  node_name,
  agent_name,
  tool_name,
  started_at,
  completed_at
) VALUES (
  {_sql_literal(run_event["eventId"])},
  {_sql_literal(run_event["runId"])},
  {_sql_literal(run_event["eventType"])},
  {_sql_literal(run_event["status"])},
  {_sql_literal(run_event["phase"])},
  {run_event["sequence"]},
  {_sql_literal(run_event["actor"])},
  {_sql_literal(run_event["occurredAt"])},
  {_sql_literal(run_event["summary"])},
  {_sql_literal(run_event["parentEventId"])},
  {_sql_literal(run_event["refType"])},
  {_sql_literal(run_event["refId"])},
  {_sql_literal(run_event["errorCode"])},
  {_sql_literal(run_event["errorMessage"])},
  {_sql_literal(run_event["nodeName"])},
  {_sql_literal(run_event["agentName"])},
  {_sql_literal(run_event["toolName"])},
  {_sql_literal(run_event["startedAt"])},
  {_sql_literal(run_event["completedAt"])}
);
"""


def _execution_attempt_upsert_sql(execution_attempt: ExecutionAttemptRecord) -> str:
    return f"""
INSERT INTO execution_attempts (
  attempt_id,
  run_id,
  attempt_number,
  worker_id,
  lease_id,
  status,
  lease_acquired_at,
  lease_expires_at,
  heartbeat_at,
  released_at,
  failure_code,
  failure_message
) VALUES (
  {_sql_literal(execution_attempt["attemptId"])},
  {_sql_literal(execution_attempt["runId"])},
  {execution_attempt["attemptNumber"]},
  {_sql_literal(execution_attempt["workerId"])},
  {_sql_literal(execution_attempt["leaseId"])},
  {_sql_literal(execution_attempt["status"])},
  {_sql_literal(execution_attempt["leaseAcquiredAt"])},
  {_sql_literal(execution_attempt["leaseExpiresAt"])},
  {_sql_literal(execution_attempt["heartbeatAt"])},
  {_sql_literal(execution_attempt["releasedAt"])},
  {_sql_literal(execution_attempt["failureCode"])},
  {_sql_literal(execution_attempt["failureMessage"])}
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  attempt_number = VALUES(attempt_number),
  worker_id = VALUES(worker_id),
  lease_id = VALUES(lease_id),
  status = VALUES(status),
  lease_acquired_at = VALUES(lease_acquired_at),
  lease_expires_at = VALUES(lease_expires_at),
  heartbeat_at = VALUES(heartbeat_at),
  released_at = VALUES(released_at),
  failure_code = VALUES(failure_code),
  failure_message = VALUES(failure_message);
"""


def _tool_call_upsert_sql(tool_call: ToolCallRecord) -> str:
    return f"""
INSERT INTO tool_calls (
  tool_call_id,
  run_id,
  tool_name,
  input_json,
  output_json,
  status,
  risk_level,
  permission,
  error_type,
  error_message,
  started_at,
  completed_at
) VALUES (
  {_sql_literal(tool_call["toolCallId"])},
  {_sql_literal(tool_call["runId"])},
  {_sql_literal(tool_call["toolName"])},
  {_json_literal(tool_call["input"])},
  {_nullable_json_literal(tool_call["output"])},
  {_sql_literal(tool_call["status"])},
  {_sql_literal(tool_call["riskLevel"])},
  {_sql_literal(tool_call["permission"])},
  {_sql_literal(tool_call["errorType"])},
  {_sql_literal(tool_call["errorMessage"])},
  {_sql_literal(tool_call["startedAt"])},
  {_sql_literal(tool_call["completedAt"])}
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  tool_name = VALUES(tool_name),
  input_json = VALUES(input_json),
  output_json = VALUES(output_json),
  status = VALUES(status),
  risk_level = VALUES(risk_level),
  permission = VALUES(permission),
  error_type = VALUES(error_type),
  error_message = VALUES(error_message),
  started_at = VALUES(started_at),
  completed_at = VALUES(completed_at);
"""


def _model_call_upsert_sql(model_call: ModelCallRecord) -> str:
    return f"""
INSERT INTO model_calls (
  model_call_id,
  run_id,
  provider,
  model_id,
  prompt_version_id,
  input_tokens,
  output_tokens,
  cost,
  latency_ms,
  status,
  error_type,
  error_message,
  started_at,
  completed_at
) VALUES (
  {_sql_literal(model_call["modelCallId"])},
  {_sql_literal(model_call["runId"])},
  {_sql_literal(model_call["provider"])},
  {_sql_literal(model_call["modelId"])},
  {_sql_literal(model_call["promptVersionId"])},
  {model_call["inputTokens"]},
  {model_call["outputTokens"]},
  {model_call["cost"]},
  {model_call["latencyMs"]},
  {_sql_literal(model_call["status"])},
  {_sql_literal(model_call["errorType"])},
  {_sql_literal(model_call["errorMessage"])},
  {_sql_literal(model_call["startedAt"])},
  {_sql_literal(model_call["completedAt"])}
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  provider = VALUES(provider),
  model_id = VALUES(model_id),
  prompt_version_id = VALUES(prompt_version_id),
  input_tokens = VALUES(input_tokens),
  output_tokens = VALUES(output_tokens),
  cost = VALUES(cost),
  latency_ms = VALUES(latency_ms),
  status = VALUES(status),
  error_type = VALUES(error_type),
  error_message = VALUES(error_message),
  started_at = VALUES(started_at),
  completed_at = VALUES(completed_at);
"""


def _message_upsert_sql(message: MessageRecord) -> str:
    return f"""
INSERT INTO messages (
  message_id,
  conversation_id,
  analysis_task_id,
  turn_id,
  run_id,
  role,
  content,
  status,
  source_evidence_ids_json,
  tool_call_ids_json,
  report_id,
  created_at,
  completed_at
) VALUES (
  {_sql_literal(message["messageId"])},
  {_sql_literal(message["conversationId"])},
  {_sql_literal(message["analysisTaskId"])},
  {_sql_literal(message["turnId"])},
  {_sql_literal(message["runId"])},
  {_sql_literal(message["role"])},
  {_sql_literal(message["content"])},
  {_sql_literal(message["status"])},
  {_json_literal(message["sourceEvidenceIds"])},
  {_json_literal(message["toolCallIds"])},
  {_sql_literal(message["reportId"])},
  {_sql_literal(message["createdAt"])},
  {_sql_literal(message["completedAt"])}
)
ON DUPLICATE KEY UPDATE
  conversation_id = VALUES(conversation_id),
  analysis_task_id = VALUES(analysis_task_id),
  turn_id = VALUES(turn_id),
  run_id = VALUES(run_id),
  role = VALUES(role),
  content = VALUES(content),
  status = VALUES(status),
  source_evidence_ids_json = VALUES(source_evidence_ids_json),
  tool_call_ids_json = VALUES(tool_call_ids_json),
  report_id = VALUES(report_id),
  created_at = VALUES(created_at),
  completed_at = VALUES(completed_at);
"""


def _message_stream_upsert_sql(message_stream: MessageStreamRecord) -> str:
    return f"""
INSERT INTO message_streams (
  message_stream_id,
  conversation_id,
  message_id,
  run_id,
  sequence_number,
  event_type,
  delta,
  status,
  occurred_at,
  error_code,
  error_message
) VALUES (
  {_sql_literal(message_stream["messageStreamId"])},
  {_sql_literal(message_stream["conversationId"])},
  {_sql_literal(message_stream["messageId"])},
  {_sql_literal(message_stream["runId"])},
  {message_stream["sequence"]},
  {_sql_literal(message_stream["eventType"])},
  {_sql_literal(message_stream["delta"])},
  {_sql_literal(message_stream["status"])},
  {_sql_literal(message_stream["occurredAt"])},
  {_sql_literal(message_stream["errorCode"])},
  {_sql_literal(message_stream["errorMessage"])}
)
ON DUPLICATE KEY UPDATE
  conversation_id = VALUES(conversation_id),
  message_id = VALUES(message_id),
  run_id = VALUES(run_id),
  sequence_number = VALUES(sequence_number),
  event_type = VALUES(event_type),
  delta = VALUES(delta),
  status = VALUES(status),
  occurred_at = VALUES(occurred_at),
  error_code = VALUES(error_code),
  error_message = VALUES(error_message);
"""


def _analysis_task_upsert_sql(analysis_task: AnalysisTaskRecord) -> str:
    return f"""
INSERT INTO analysis_tasks (
  analysis_task_id,
  conversation_id,
  workspace_id,
  user_id,
  business_domain_id,
  question,
  context_pack_json,
  created_at,
  updated_at
) VALUES (
  {_sql_literal(analysis_task["analysisTaskId"])},
  {_sql_literal(analysis_task["conversationId"])},
  {_sql_literal(analysis_task["workspaceId"])},
  {_sql_literal(analysis_task["userId"])},
  {_sql_literal(analysis_task["businessDomainId"])},
  {_sql_literal(analysis_task["question"])},
  {_json_literal(analysis_task["contextPack"])},
  {_sql_literal(analysis_task["createdAt"])},
  {_sql_literal(analysis_task["updatedAt"])}
)
ON DUPLICATE KEY UPDATE
  conversation_id = VALUES(conversation_id),
  workspace_id = VALUES(workspace_id),
  user_id = VALUES(user_id),
  business_domain_id = VALUES(business_domain_id),
  question = VALUES(question),
  context_pack_json = VALUES(context_pack_json),
  created_at = VALUES(created_at),
  updated_at = VALUES(updated_at);
"""


def _source_evidence_upsert_sql(source_evidence: SourceEvidenceRecord) -> str:
    return f"""
INSERT INTO source_evidence (
  source_evidence_id,
  run_id,
  source_type,
  source_id,
  title,
  snippet,
  metadata_json,
  confidence,
  created_at
) VALUES (
  {_sql_literal(source_evidence["sourceEvidenceId"])},
  {_sql_literal(source_evidence["runId"])},
  {_sql_literal(source_evidence["sourceType"])},
  {_sql_literal(source_evidence["sourceId"])},
  {_sql_literal(source_evidence["title"])},
  {_sql_literal(source_evidence["snippet"])},
  {_nullable_json_literal(source_evidence["metadata"])},
  {source_evidence["confidence"]},
  {_sql_literal(source_evidence["createdAt"])}
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  source_type = VALUES(source_type),
  source_id = VALUES(source_id),
  title = VALUES(title),
  snippet = VALUES(snippet),
  metadata_json = VALUES(metadata_json),
  confidence = VALUES(confidence),
  created_at = VALUES(created_at);
"""


def _report_upsert_sql(report: ReportRecord) -> str:
    return f"""
INSERT INTO reports (
  report_id,
  run_id,
  workspace_id,
  title,
  summary,
  source_evidence_json,
  created_at
) VALUES (
  {_sql_literal(report["reportId"])},
  {_sql_literal(report["runId"])},
  {_sql_literal(report["workspaceId"])},
  {_sql_literal(report["title"])},
  {_sql_literal(report["summary"])},
  {_json_literal(report["sourceEvidence"])},
  {_sql_literal(report["createdAt"])}
)
ON DUPLICATE KEY UPDATE
  run_id = VALUES(run_id),
  workspace_id = VALUES(workspace_id),
  title = VALUES(title),
  summary = VALUES(summary),
  source_evidence_json = VALUES(source_evidence_json),
  created_at = VALUES(created_at);
"""


def _report_section_upsert_sql(report_section: ReportSectionRecord) -> str:
    return f"""
INSERT INTO report_sections (
  report_section_id,
  report_id,
  title,
  content,
  created_at
) VALUES (
  {_sql_literal(report_section["reportSectionId"])},
  {_sql_literal(report_section["reportId"])},
  {_sql_literal(report_section["title"])},
  {_sql_literal(report_section["content"])},
  {_sql_literal(report_section["createdAt"])}
)
ON DUPLICATE KEY UPDATE
  report_id = VALUES(report_id),
  title = VALUES(title),
  content = VALUES(content),
  created_at = VALUES(created_at);
"""


def _decision_upsert_sql(decision: DecisionRecord) -> str:
    return f"""
INSERT INTO decisions (
  decision_id,
  workspace_id,
  run_id,
  report_id,
  title,
  status,
  created_at
) VALUES (
  {_sql_literal(decision["decisionId"])},
  {_sql_literal(decision["workspaceId"])},
  {_sql_literal(decision["runId"])},
  {_sql_literal(decision["reportId"])},
  {_sql_literal(decision["title"])},
  {_sql_literal(decision["status"])},
  {_sql_literal(decision["createdAt"])}
)
ON DUPLICATE KEY UPDATE
  workspace_id = VALUES(workspace_id),
  run_id = VALUES(run_id),
  report_id = VALUES(report_id),
  title = VALUES(title),
  status = VALUES(status),
  created_at = VALUES(created_at);
"""


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

    def execute_transaction(self, statements: Sequence[str]) -> None:
        transaction_sql = "START TRANSACTION;\n" + "\n".join(statements) + "\nCOMMIT;\n"
        self.execute_sql(transaction_sql)

    def query_json_object(self, sql: str) -> dict[str, object] | None:
        output = self._run("query-json", input_text=sql).strip()
        if not output:
            return None
        parsed = json.loads(output)
        return _require_mapping(parsed, "query-json")


class RuntimeFoundationPyMySqlDatabase:
    """Direct MySQL adapter for FastAPI success paths."""

    def __init__(
        self,
        *,
        host: str,
        port: int,
        database: str,
        user: str,
        password: str,
        connect_timeout_seconds: int = 5,
    ) -> None:
        self._host = host
        self._port = port
        self._database = database
        self._user = user
        self._password = password
        self._connect_timeout_seconds = connect_timeout_seconds

    def _connect(self) -> pymysql.connections.Connection:
        return pymysql.connect(
            host=self._host,
            port=self._port,
            user=self._user,
            password=self._password,
            database=self._database,
            charset="utf8mb4",
            autocommit=False,
            connect_timeout=self._connect_timeout_seconds,
        )

    def execute_sql(self, sql: str) -> None:
        connection = self._connect()
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
            connection.commit()
        except Exception as exc:
            connection.rollback()
            raise RuntimeFoundationError(str(exc)) from exc
        finally:
            connection.close()

    def execute_transaction(self, statements: Sequence[str]) -> None:
        connection = self._connect()
        try:
            with connection.cursor() as cursor:
                for statement in statements:
                    cursor.execute(statement)
            connection.commit()
        except Exception as exc:
            connection.rollback()
            raise RuntimeFoundationError(str(exc)) from exc
        finally:
            connection.close()

    def query_json_object(self, sql: str) -> dict[str, object] | None:
        connection = self._connect()
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                row = cursor.fetchone()
        except Exception as exc:
            raise RuntimeFoundationError(str(exc)) from exc
        finally:
            connection.close()

        if row is None:
            return None

        raw_payload = row[0]
        if raw_payload is None:
            return None
        if isinstance(raw_payload, (bytes, bytearray)):
            raw_payload = raw_payload.decode("utf-8")
        if not isinstance(raw_payload, str):
            raise RuntimeFoundationError("query-json did not return a string payload.")

        parsed = json.loads(raw_payload)
        return _require_mapping(parsed, "query-json")


class UserRepository:
    """Repository boundary for User identity foundation read surfaces."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def get_by_user_id(self, user_id: str) -> UserRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'userId', user_id,
  'email', email,
  'displayName', display_name,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM users
WHERE user_id = {_sql_literal(user_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(user_id)
        return cast(UserRecord, payload)

    def get_authentication_by_email(self, email: str) -> UserAuthenticationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'userId', user_id,
  'email', email,
  'displayName', display_name,
  'passwordHash', password_hash,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM users
WHERE email = {_sql_literal(email)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(email)
        return cast(UserAuthenticationRecord, payload)


class WorkspaceRepository:
    """Repository boundary for Workspace foundation read surfaces."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def get_by_workspace_id(self, workspace_id: str) -> WorkspaceRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'workspaceId', workspace_id,
  'name', name,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM workspaces
WHERE workspace_id = {_sql_literal(workspace_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(workspace_id)
        return cast(WorkspaceRecord, payload)


class WorkspaceMembershipRepository:
    """Repository boundary for WorkspaceMembership foundation read surfaces."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def list_by_user_id(self, user_id: str) -> list[WorkspaceMembershipRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'membershipId', membership_id,
          'userId', user_id,
          'workspaceId', workspace_id,
          'role', role,
          'createdAt', created_at,
          'updatedAt', updated_at
        )
      )
      FROM (
        SELECT
          membership_id,
          user_id,
          workspace_id,
          role,
          created_at,
          updated_at
        FROM workspace_memberships
        WHERE user_id = {_sql_literal(user_id)}
        ORDER BY workspace_id ASC, id ASC
      ) ordered_workspace_memberships
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "WorkspaceMembership.items")
        return cast(list[WorkspaceMembershipRecord], items)

    def get_by_user_id_and_workspace_id(
        self,
        user_id: str,
        workspace_id: str,
    ) -> WorkspaceMembershipRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'membershipId', membership_id,
  'userId', user_id,
  'workspaceId', workspace_id,
  'role', role,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM workspace_memberships
WHERE user_id = {_sql_literal(user_id)}
  AND workspace_id = {_sql_literal(workspace_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(workspace_id)
        return cast(WorkspaceMembershipRecord, payload)


class AuthSessionRepository:
    """Repository boundary for AuthSession foundation read surfaces."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, auth_session: AuthSessionStateRecord) -> None:
        self._database.execute_sql(_auth_session_upsert_sql(auth_session))

    def get_by_auth_session_id(self, auth_session_id: str) -> AuthSessionRecord:
        auth_session_state = self.get_state_by_auth_session_id(auth_session_id)
        return {
            "authSessionId": auth_session_state["authSessionId"],
            "userId": auth_session_state["userId"],
            "currentWorkspaceId": auth_session_state["currentWorkspaceId"],
            "expiresAt": auth_session_state["expiresAt"],
            "createdAt": auth_session_state["createdAt"],
            "updatedAt": auth_session_state["updatedAt"],
            "lastAccessedAt": auth_session_state["lastAccessedAt"],
        }

    def get_state_by_auth_session_id(self, auth_session_id: str) -> AuthSessionStateRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'authSessionId', auth_session_id,
  'userId', user_id,
  'currentWorkspaceId', current_workspace_id,
  'sessionTokenHash', session_token_hash,
  'expiresAt', expires_at,
  'createdAt', created_at,
  'updatedAt', updated_at,
  'lastAccessedAt', last_accessed_at,
  'revokedAt', revoked_at
)
FROM auth_sessions
WHERE auth_session_id = {_sql_literal(auth_session_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(auth_session_id)
        return cast(AuthSessionStateRecord, payload)

    def get_state_by_session_token_hash(self, session_token_hash: str) -> AuthSessionStateRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'authSessionId', auth_session_id,
  'userId', user_id,
  'currentWorkspaceId', current_workspace_id,
  'sessionTokenHash', session_token_hash,
  'expiresAt', expires_at,
  'createdAt', created_at,
  'updatedAt', updated_at,
  'lastAccessedAt', last_accessed_at,
  'revokedAt', revoked_at
)
FROM auth_sessions
WHERE session_token_hash = {_sql_literal(session_token_hash)}
ORDER BY id DESC
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(session_token_hash)
        return cast(AuthSessionStateRecord, payload)

    def update_current_workspace(
        self,
        *,
        auth_session_id: str,
        current_workspace_id: str | None,
        updated_at: str,
    ) -> None:
        self._database.execute_sql(
            f"""
UPDATE auth_sessions
SET current_workspace_id = {_sql_literal(current_workspace_id)},
    updated_at = {_sql_literal(updated_at)}
WHERE auth_session_id = {_sql_literal(auth_session_id)};
"""
        )

    def revoke(self, *, auth_session_id: str, revoked_at: str, updated_at: str) -> None:
        self._database.execute_sql(
            f"""
UPDATE auth_sessions
SET revoked_at = {_sql_literal(revoked_at)},
    updated_at = {_sql_literal(updated_at)}
WHERE auth_session_id = {_sql_literal(auth_session_id)};
"""
        )


class CurrentWorkspaceContextRepository:
    """Repository boundary for resolving the current workspace context from an auth session."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def get_by_user_id_and_workspace_id(
        self,
        user_id: str,
        workspace_id: str,
    ) -> CurrentWorkspaceContextRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'membershipId', membership_id,
  'userId', user_id,
  'workspaceId', workspace_id,
  'role', role
)
FROM workspace_memberships
WHERE user_id = {_sql_literal(user_id)}
  AND workspace_id = {_sql_literal(workspace_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(workspace_id)
        return cast(CurrentWorkspaceContextRecord, payload)

    def get_by_auth_session_id(self, auth_session_id: str) -> CurrentWorkspaceContextRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'membershipId', workspace_memberships.membership_id,
  'userId', workspace_memberships.user_id,
  'workspaceId', workspace_memberships.workspace_id,
  'role', workspace_memberships.role
)
FROM auth_sessions
INNER JOIN workspace_memberships
  ON workspace_memberships.user_id = auth_sessions.user_id
 AND workspace_memberships.workspace_id = auth_sessions.current_workspace_id
WHERE auth_sessions.auth_session_id = {_sql_literal(auth_session_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(auth_session_id)
        return cast(CurrentWorkspaceContextRecord, payload)


class AnalysisTaskRepository:
    """Repository boundary for AnalysisTask foundation persistence."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, analysis_task: AnalysisTaskRecord) -> None:
        self._database.execute_sql(_analysis_task_upsert_sql(analysis_task))

    def get_by_analysis_task_id(self, analysis_task_id: str) -> AnalysisTaskRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'analysisTaskId', analysis_task_id,
  'conversationId', conversation_id,
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

    def get_by_analysis_task_id_and_owner(
        self,
        analysis_task_id: str,
        *,
        workspace_id: str,
        user_id: str,
    ) -> AnalysisTaskRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'analysisTaskId', analysis_task_id,
  'conversationId', conversation_id,
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
  AND workspace_id = {_sql_literal(workspace_id)}
  AND user_id = {_sql_literal(user_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(analysis_task_id)
        return cast(AnalysisTaskRecord, payload)


class ConversationRepository:
    """Repository boundary for Conversation foundation persistence."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, conversation: ConversationRecord) -> None:
        self._database.execute_sql(_conversation_upsert_sql(conversation))

    def get_by_conversation_id(self, conversation_id: str) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
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

    def get_by_conversation_id_and_owner(
        self,
        conversation_id: str,
        *,
        workspace_id: str,
        user_id: str,
    ) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'currentRunId', current_run_id,
  'title', title,
  'status', status,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM conversations
WHERE conversation_id = {_sql_literal(conversation_id)}
  AND workspace_id = {_sql_literal(workspace_id)}
  AND user_id = {_sql_literal(user_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(conversation_id)
        return cast(ConversationRecord, payload)

    def get_by_current_run_id(self, run_id: str) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'currentRunId', current_run_id,
  'title', title,
  'status', status,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM conversations
WHERE current_run_id = {_sql_literal(run_id)}
ORDER BY id DESC
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(run_id)
        return cast(ConversationRecord, payload)

    def get_by_current_run_id_and_owner(
        self,
        run_id: str,
        *,
        workspace_id: str,
        user_id: str,
    ) -> ConversationRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'conversationId', conversation_id,
  'workspaceId', workspace_id,
  'userId', user_id,
  'currentRunId', current_run_id,
  'title', title,
  'status', status,
  'createdAt', created_at,
  'updatedAt', updated_at
)
FROM conversations
WHERE current_run_id = {_sql_literal(run_id)}
  AND workspace_id = {_sql_literal(workspace_id)}
  AND user_id = {_sql_literal(user_id)}
ORDER BY id DESC
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(run_id)
        return cast(ConversationRecord, payload)


class AnalysisRunRepository:
    """Repository boundary for AnalysisRun foundation persistence."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, analysis_run: AnalysisRunRecord) -> None:
        self._database.execute_sql(_analysis_run_upsert_sql(analysis_run))

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

    def get_by_run_id_and_owner(
        self,
        run_id: str,
        *,
        workspace_id: str,
        user_id: str,
    ) -> AnalysisRunRecord:
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
  AND workspace_id = {_sql_literal(workspace_id)}
  AND user_id = {_sql_literal(user_id)}
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


class ExecutionAttemptRepository:
    """Repository boundary for ExecutionAttempt persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, execution_attempt: ExecutionAttemptRecord) -> None:
        self._database.execute_sql(_execution_attempt_upsert_sql(execution_attempt))

    def get_by_attempt_id(self, attempt_id: str) -> ExecutionAttemptRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'attemptId', attempt_id,
  'runId', run_id,
  'attemptNumber', attempt_number,
  'workerId', worker_id,
  'leaseId', lease_id,
  'status', status,
  'leaseAcquiredAt', lease_acquired_at,
  'leaseExpiresAt', lease_expires_at,
  'heartbeatAt', heartbeat_at,
  'releasedAt', released_at,
  'failureCode', failure_code,
  'failureMessage', failure_message
)
FROM execution_attempts
WHERE attempt_id = {_sql_literal(attempt_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(attempt_id)
        return cast(ExecutionAttemptRecord, payload)

    def list_by_run_id(self, run_id: str) -> list[ExecutionAttemptRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'attemptId', attempt_id,
          'runId', run_id,
          'attemptNumber', attempt_number,
          'workerId', worker_id,
          'leaseId', lease_id,
          'status', status,
          'leaseAcquiredAt', lease_acquired_at,
          'leaseExpiresAt', lease_expires_at,
          'heartbeatAt', heartbeat_at,
          'releasedAt', released_at,
          'failureCode', failure_code,
          'failureMessage', failure_message
        )
      )
      FROM (
        SELECT
          attempt_id,
          run_id,
          attempt_number,
          worker_id,
          lease_id,
          status,
          lease_acquired_at,
          lease_expires_at,
          heartbeat_at,
          released_at,
          failure_code,
          failure_message
        FROM execution_attempts
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY attempt_number ASC, id ASC
      ) ordered_execution_attempts
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "ExecutionAttempt.items")
        return cast(list[ExecutionAttemptRecord], items)


class RunEventRepository:
    """Repository boundary for append-only RunEvent persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, run_event: RunEventRecord) -> None:
        self._database.execute_sql(_run_event_insert_sql(run_event))

    def list_by_run_id(self, run_id: str) -> list[RunEventRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'eventId', event_id,
          'runId', run_id,
          'eventType', event_type,
          'status', status,
          'phase', phase,
          'sequence', sequence,
          'actor', actor,
          'occurredAt', occurred_at,
          'summary', summary,
          'parentEventId', parent_event_id,
          'refType', ref_type,
          'refId', ref_id,
          'errorCode', error_code,
          'errorMessage', error_message,
          'nodeName', node_name,
          'agentName', agent_name,
          'toolName', tool_name,
          'startedAt', started_at,
          'completedAt', completed_at
        )
      )
      FROM (
        SELECT
          event_id,
          run_id,
          event_type,
          status,
          phase,
          sequence,
          actor,
          occurred_at,
          summary,
          parent_event_id,
          ref_type,
          ref_id,
          error_code,
          error_message,
          node_name,
          agent_name,
          tool_name,
          started_at,
          completed_at
        FROM run_events
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY sequence ASC, id ASC
      ) ordered_run_events
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "RunEvent.items")
        return cast(list[RunEventRecord], items)


class ToolCallRepository:
    """Repository boundary for ToolCall persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, tool_call: ToolCallRecord) -> None:
        self._database.execute_sql(_tool_call_upsert_sql(tool_call))

    def list_by_run_id(self, run_id: str) -> list[ToolCallRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'toolCallId', tool_call_id,
          'runId', run_id,
          'toolName', tool_name,
          'input', input_json,
          'output', output_json,
          'status', status,
          'riskLevel', risk_level,
          'permission', permission,
          'errorType', error_type,
          'errorMessage', error_message,
          'startedAt', started_at,
          'completedAt', completed_at
        )
      )
      FROM (
        SELECT
          tool_call_id,
          run_id,
          tool_name,
          input_json,
          output_json,
          status,
          risk_level,
          permission,
          error_type,
          error_message,
          started_at,
          completed_at
        FROM tool_calls
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY started_at ASC, id ASC
      ) ordered_tool_calls
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "ToolCall.items")
        return cast(list[ToolCallRecord], items)


class ModelCallRepository:
    """Repository boundary for ModelCall persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, model_call: ModelCallRecord) -> None:
        self._database.execute_sql(_model_call_upsert_sql(model_call))

    def list_by_run_id(self, run_id: str) -> list[ModelCallRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'modelCallId', model_call_id,
          'runId', run_id,
          'provider', provider,
          'modelId', model_id,
          'promptVersionId', prompt_version_id,
          'inputTokens', input_tokens,
          'outputTokens', output_tokens,
          'cost', cost,
          'latencyMs', latency_ms,
          'status', status,
          'errorType', error_type,
          'errorMessage', error_message,
          'startedAt', started_at,
          'completedAt', completed_at
        )
      )
      FROM (
        SELECT
          model_call_id,
          run_id,
          provider,
          model_id,
          prompt_version_id,
          input_tokens,
          output_tokens,
          cost,
          latency_ms,
          status,
          error_type,
          error_message,
          started_at,
          completed_at
        FROM model_calls
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY started_at ASC, id ASC
      ) ordered_model_calls
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "ModelCall.items")
        return cast(list[ModelCallRecord], items)


class SourceEvidenceRepository:
    """Repository boundary for SourceEvidence persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, source_evidence: SourceEvidenceRecord) -> None:
        self._database.execute_sql(_source_evidence_upsert_sql(source_evidence))

    def list_by_run_id(self, run_id: str) -> list[SourceEvidenceRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'sourceEvidenceId', source_evidence_id,
          'runId', run_id,
          'sourceType', source_type,
          'sourceId', source_id,
          'title', title,
          'snippet', snippet,
          'metadata', metadata_json,
          'confidence', confidence,
          'createdAt', created_at
        )
      )
      FROM (
        SELECT
          source_evidence_id,
          run_id,
          source_type,
          source_id,
          title,
          snippet,
          metadata_json,
          confidence,
          created_at
        FROM source_evidence
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY created_at ASC, id ASC
      ) ordered_source_evidence
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "SourceEvidence.items")
        return cast(list[SourceEvidenceRecord], items)


class ReportRepository:
    """Repository boundary for Report / ReportSection persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, report: ReportRecord) -> None:
        statements = [_report_upsert_sql(report)]
        statements.extend(_report_section_upsert_sql(section) for section in report["sections"])
        self._database.execute_transaction(statements)

    def list_by_run_id(self, run_id: str) -> list[ReportRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'reportId', report_id,
          'runId', run_id,
          'workspaceId', workspace_id,
          'title', title,
          'summary', summary,
          'sections',
            COALESCE(
              (
                SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'reportSectionId', report_section_id,
                    'reportId', report_id,
                    'title', title,
                    'content', content,
                    'createdAt', created_at
                  )
                )
                FROM (
                  SELECT
                    report_section_id,
                    report_id,
                    title,
                    content,
                    created_at
                  FROM report_sections
                  WHERE report_id = ordered_reports.report_id
                  ORDER BY created_at ASC, id ASC
                ) ordered_report_sections
              ),
              JSON_ARRAY()
            ),
          'sourceEvidence', source_evidence_json,
          'createdAt', created_at
        )
      )
      FROM (
        SELECT
          report_id,
          run_id,
          workspace_id,
          title,
          summary,
          source_evidence_json,
          created_at
        FROM reports
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY created_at ASC, id ASC
      ) ordered_reports
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "Report.items")
        return cast(list[ReportRecord], items)


class DecisionRepository:
    """Repository boundary for Decision persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, decision: DecisionRecord) -> None:
        self._database.execute_sql(_decision_upsert_sql(decision))

    def list_by_run_id(self, run_id: str) -> list[DecisionRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'decisionId', decision_id,
          'workspaceId', workspace_id,
          'runId', run_id,
          'reportId', report_id,
          'title', title,
          'status', status,
          'createdAt', created_at
        )
      )
      FROM (
        SELECT
          decision_id,
          workspace_id,
          run_id,
          report_id,
          title,
          status,
          created_at
        FROM decisions
        WHERE run_id = {_sql_literal(run_id)}
        ORDER BY created_at ASC, id ASC
      ) ordered_decisions
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "Decision.items")
        return cast(list[DecisionRecord], items)


class MessageRepository:
    """Repository boundary for Message persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, message: MessageRecord) -> None:
        self._database.execute_sql(_message_upsert_sql(message))

    def get_by_message_id(self, message_id: str) -> MessageRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'messageId', message_id,
  'conversationId', conversation_id,
  'analysisTaskId', analysis_task_id,
  'turnId', turn_id,
  'runId', run_id,
  'role', role,
  'content', content,
  'status', status,
  'sourceEvidenceIds', source_evidence_ids_json,
  'toolCallIds', tool_call_ids_json,
  'reportId', report_id,
  'createdAt', created_at,
  'completedAt', completed_at
)
FROM messages
WHERE message_id = {_sql_literal(message_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(message_id)
        return cast(MessageRecord, payload)

    def get_by_message_id_and_conversation_id(
        self,
        message_id: str,
        *,
        conversation_id: str,
    ) -> MessageRecord:
        sql = f"""
SELECT JSON_OBJECT(
  'messageId', message_id,
  'conversationId', conversation_id,
  'analysisTaskId', analysis_task_id,
  'turnId', turn_id,
  'runId', run_id,
  'role', role,
  'content', content,
  'status', status,
  'sourceEvidenceIds', source_evidence_ids_json,
  'toolCallIds', tool_call_ids_json,
  'reportId', report_id,
  'createdAt', created_at,
  'completedAt', completed_at
)
FROM messages
WHERE message_id = {_sql_literal(message_id)}
  AND conversation_id = {_sql_literal(conversation_id)}
LIMIT 1;
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            raise KeyError(message_id)
        return cast(MessageRecord, payload)

    def list_by_conversation_id(self, conversation_id: str) -> list[MessageRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'messageId', message_id,
          'conversationId', conversation_id,
          'analysisTaskId', analysis_task_id,
          'turnId', turn_id,
          'runId', run_id,
          'role', role,
          'content', content,
          'status', status,
          'sourceEvidenceIds', source_evidence_ids_json,
          'toolCallIds', tool_call_ids_json,
          'reportId', report_id,
          'createdAt', created_at,
          'completedAt', completed_at
        )
      )
      FROM (
        SELECT
          message_id,
          conversation_id,
          analysis_task_id,
          turn_id,
          run_id,
          role,
          content,
          status,
          source_evidence_ids_json,
          tool_call_ids_json,
          report_id,
          created_at,
          completed_at
        FROM messages
        WHERE conversation_id = {_sql_literal(conversation_id)}
        ORDER BY created_at ASC, id ASC
      ) ordered_messages
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "Message.items")
        return cast(list[MessageRecord], items)


class MessageStreamRepository:
    """Repository boundary for MessageStream persistence and lookup."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create(self, message_stream: MessageStreamRecord) -> None:
        self._database.execute_sql(_message_stream_upsert_sql(message_stream))

    def list_by_message_id(self, message_id: str) -> list[MessageStreamRecord]:
        sql = f"""
SELECT JSON_OBJECT(
  'items',
  COALESCE(
    (
      SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'messageStreamId', message_stream_id,
          'conversationId', conversation_id,
          'messageId', message_id,
          'runId', run_id,
          'sequence', sequence_number,
          'eventType', event_type,
          'delta', delta,
          'status', status,
          'occurredAt', occurred_at,
          'errorCode', error_code,
          'errorMessage', error_message
        )
      )
      FROM (
        SELECT
          message_stream_id,
          conversation_id,
          message_id,
          run_id,
          sequence_number,
          event_type,
          delta,
          status,
          occurred_at,
          error_code,
          error_message
        FROM message_streams
        WHERE message_id = {_sql_literal(message_id)}
        ORDER BY sequence_number ASC, id ASC
      ) ordered_message_streams
    ),
    JSON_ARRAY()
  )
);
"""
        payload = self._database.query_json_object(sql)
        if payload is None:
            return []

        items = _require_array(payload.get("items"), "MessageStream.items")
        return cast(list[MessageStreamRecord], items)


class AnalysisRunLifecycleRepository:
    """Repository boundary for transactional lifecycle transitions."""

    def __init__(self, database: RuntimeFoundationDatabase) -> None:
        self._database = database

    def create_run(
        self,
        analysis_run: AnalysisRunRecord,
        conversation: ConversationRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _conversation_upsert_sql(conversation),
                _run_event_insert_sql(run_event),
            ]
        )

    def submit_draft(
        self,
        conversation: ConversationRecord,
        analysis_task: AnalysisTaskRecord,
        analysis_run: AnalysisRunRecord,
        user_message: MessageRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _conversation_upsert_sql(conversation),
                _analysis_task_upsert_sql(analysis_task),
                _analysis_run_upsert_sql(analysis_run),
                _message_upsert_sql(user_message),
                _run_event_insert_sql(run_event),
            ]
        )

    def retry_run(
        self,
        analysis_run: AnalysisRunRecord,
        conversation: ConversationRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _conversation_upsert_sql(conversation),
                _run_event_insert_sql(run_event),
            ]
        )

    def dispatch(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord,
        run_events: Sequence[RunEventRecord],
    ) -> None:
        statements = [
            _analysis_run_upsert_sql(analysis_run),
            _execution_attempt_upsert_sql(execution_attempt),
        ]
        statements.extend(_run_event_insert_sql(run_event) for run_event in run_events)
        self._database.execute_transaction(statements)

    def claim_for_execution(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _execution_attempt_upsert_sql(execution_attempt),
                _run_event_insert_sql(run_event),
            ]
        )

    def heartbeat(
        self,
        execution_attempt: ExecutionAttemptRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _execution_attempt_upsert_sql(execution_attempt),
                _run_event_insert_sql(run_event),
            ]
        )

    def record_worker_failure(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _execution_attempt_upsert_sql(execution_attempt),
                _run_event_insert_sql(run_event),
            ]
        )

    def mark_worker_lost(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _execution_attempt_upsert_sql(execution_attempt),
                _run_event_insert_sql(run_event),
            ]
        )

    def release_worker(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord,
        run_event: RunEventRecord,
    ) -> None:
        self._database.execute_transaction(
            [
                _analysis_run_upsert_sql(analysis_run),
                _execution_attempt_upsert_sql(execution_attempt),
                _run_event_insert_sql(run_event),
            ]
        )

    def complete_delivery(
        self,
        analysis_run: AnalysisRunRecord,
        tool_call: ToolCallRecord,
        model_call: ModelCallRecord,
        source_evidence: Sequence[SourceEvidenceRecord],
        report: ReportRecord,
        decision: DecisionRecord,
        message: MessageRecord,
        message_streams: Sequence[MessageStreamRecord],
        run_events: Sequence[RunEventRecord],
    ) -> None:
        statements = [
            _analysis_run_upsert_sql(analysis_run),
            _tool_call_upsert_sql(tool_call),
            _model_call_upsert_sql(model_call),
        ]
        statements.extend(_source_evidence_upsert_sql(item) for item in source_evidence)
        statements.append(_report_upsert_sql(report))
        statements.extend(_report_section_upsert_sql(section) for section in report["sections"])
        statements.append(_decision_upsert_sql(decision))
        statements.append(_message_upsert_sql(message))
        statements.extend(_message_stream_upsert_sql(item) for item in message_streams)
        statements.extend(_run_event_insert_sql(run_event) for run_event in run_events)
        self._database.execute_transaction(statements)

    def cancel(
        self,
        analysis_run: AnalysisRunRecord,
        execution_attempt: ExecutionAttemptRecord | None,
        run_events: Sequence[RunEventRecord],
    ) -> None:
        statements = [_analysis_run_upsert_sql(analysis_run)]
        if execution_attempt is not None:
            statements.append(_execution_attempt_upsert_sql(execution_attempt))
        statements.extend(_run_event_insert_sql(run_event) for run_event in run_events)
        self._database.execute_transaction(statements)


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
        conversation = self._conversation_repository.get_by_conversation_id(
            analysis_task["conversationId"]
        )
        analysis_run = self._analysis_run_repository.get_by_analysis_task_id(analysis_task_id)

        return {
            "analysisTask": analysis_task,
            "conversation": conversation,
            "analysisRun": analysis_run,
        }
