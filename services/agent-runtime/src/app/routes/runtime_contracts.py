"""Shared request, response, and error models for runtime routes."""

from datetime import UTC, datetime
from typing import Literal, TypeAlias
from uuid import uuid4

from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict


class RuntimeRouteStubErrorResponse(BaseModel):
    """Structured 501 response for registered but not-yet-implemented runtime routes."""

    model_config = ConfigDict(extra="forbid")

    errorCode: Literal["NOT_IMPLEMENTED"]
    message: str


class RuntimeRequestErrorResponse(BaseModel):
    """Structured non-2xx response for real runtime foundation API errors."""

    model_config = ConfigDict(extra="forbid")

    errorCode: Literal[
        "NOT_FOUND",
        "MISMATCH",
        "INVALID_REQUEST",
        "INVALID_STATE",
        "CONVERSATION_BUSY",
        "UNAUTHORIZED",
        "FORBIDDEN",
    ]
    message: str


class UserResponse(BaseModel):
    """User contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    userId: str
    email: str
    displayName: str
    createdAt: str
    updatedAt: str


class WorkspaceResponse(BaseModel):
    """Workspace contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    name: str
    createdAt: str
    updatedAt: str


class WorkspaceMembershipResponse(BaseModel):
    """WorkspaceMembership contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    membershipId: str
    userId: str
    workspaceId: str
    role: str
    createdAt: str
    updatedAt: str


class WorkspaceListItemResponse(BaseModel):
    """Workspace list item composed from membership and workspace contracts."""

    model_config = ConfigDict(extra="forbid")

    membership: WorkspaceMembershipResponse
    workspace: WorkspaceResponse


class AuthSessionResponse(BaseModel):
    """AuthSession contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    authSessionId: str
    userId: str
    currentWorkspaceId: str | None
    expiresAt: str
    createdAt: str
    updatedAt: str
    lastAccessedAt: str | None = None


class CurrentWorkspaceContextResponse(BaseModel):
    """CurrentWorkspaceContext contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    membershipId: str
    userId: str
    workspaceId: str
    role: str


class LoginRequest(BaseModel):
    """POST /auth/login request contract."""

    model_config = ConfigDict(extra="forbid")

    email: str
    password: str


class LoginResponse(BaseModel):
    """POST /auth/login response contract."""

    model_config = ConfigDict(extra="forbid")

    user: UserResponse
    authSession: AuthSessionResponse
    currentWorkspaceContext: CurrentWorkspaceContextResponse | None
    memberships: list[WorkspaceMembershipResponse]


class MeResponse(BaseModel):
    """GET /auth/me response contract."""

    model_config = ConfigDict(extra="forbid")

    user: UserResponse
    authSession: AuthSessionResponse
    currentWorkspaceContext: CurrentWorkspaceContextResponse | None


class WorkspaceListResponse(BaseModel):
    """GET /workspaces response contract."""

    model_config = ConfigDict(extra="forbid")

    items: list[WorkspaceListItemResponse]


class SelectWorkspaceRequest(BaseModel):
    """POST /auth/select-workspace request contract."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str


class SelectWorkspaceResponse(BaseModel):
    """POST /auth/select-workspace response contract."""

    model_config = ConfigDict(extra="forbid")

    authSession: AuthSessionResponse
    currentWorkspaceContext: CurrentWorkspaceContextResponse


class LogoutResponse(BaseModel):
    """POST /auth/logout response contract."""

    model_config = ConfigDict(extra="forbid")

    success: bool


class MetricContextSourceResponse(BaseModel):
    """Workspace-scoped metric context source summary."""

    model_config = ConfigDict(extra="forbid")

    metricContextSourceId: str
    metricId: str
    sourceType: Literal["dataTable", "knowledgeDocument", "sourceEvidence", "report"]
    sourceId: str
    role: str
    title: str
    summary: str
    createdAt: str
    updatedAt: str


class MetricResponse(BaseModel):
    """Shared workspace-scoped Metric response used by Dashboard and Metrics."""

    model_config = ConfigDict(extra="forbid")

    metricId: str
    workspaceId: str
    businessDomainId: str
    name: str
    description: str
    currentValue: str
    unit: str | None = None
    period: str
    trendDirection: Literal["up", "down", "flat"]
    trendValue: str
    status: str
    riskLevel: Literal["low", "medium", "high", "critical"]
    ownerTeam: str
    formulaSummary: str
    thresholdSummary: str
    contextSources: list[MetricContextSourceResponse]
    createdAt: str
    updatedAt: str


class MetricListResponse(BaseModel):
    """GET /metrics list response."""

    model_config = ConfigDict(extra="forbid")

    items: list[MetricResponse]


class SourceRefReportModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["report"]
    reportId: str


class SourceRefMetricModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["metric"]
    metricId: str


class SourceRefSourceEvidenceModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["sourceEvidence"]
    sourceEvidenceId: str


class SourceRefAnalysisRunModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["analysisRun"]
    runId: str


class SourceRefDataTableModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["dataTable"]
    tableId: str


class SourceRefKnowledgeDocumentModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["knowledgeDocument"]
    knowledgeDocumentId: str


class SourceRefToolCallModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["toolCall"]
    toolCallId: str


class SourceRefModelCallModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["modelCall"]
    modelCallId: str


class SourceRefJobModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["job"]
    jobId: str


SourceRefModel: TypeAlias = (
    SourceRefReportModel
    | SourceRefMetricModel
    | SourceRefSourceEvidenceModel
    | SourceRefAnalysisRunModel
    | SourceRefDataTableModel
    | SourceRefKnowledgeDocumentModel
    | SourceRefToolCallModel
    | SourceRefModelCallModel
    | SourceRefJobModel
)


class InspectorOwnerConversationModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["conversation"]
    conversationId: str


class InspectorOwnerAnalysisTaskModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["analysisTask"]
    analysisTaskId: str | None = None


class InspectorOwnerAnalysisRunModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["analysisRun"]
    runId: str


class InspectorOwnerReportModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["report"]
    reportId: str


class InspectorOwnerSourceEvidenceModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["sourceEvidence"]
    sourceEvidenceId: str


InspectorOwnerRefModel: TypeAlias = (
    InspectorOwnerConversationModel
    | InspectorOwnerAnalysisTaskModel
    | InspectorOwnerAnalysisRunModel
    | InspectorOwnerReportModel
    | InspectorOwnerSourceEvidenceModel
)


class InspectorTreeTimeRangeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    label: str


class InspectorTreeNodeModel(BaseModel):
    """One node occurrence inside the subject-scoped Inspector tree."""

    model_config = ConfigDict(extra="forbid")

    nodeId: str
    kind: str
    role: Literal[
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
    owner: InspectorOwnerRefModel
    title: str
    summary: str | None = None
    description: str | None = None
    value: str | None = None
    chips: list[str] | None = None
    timeRange: InspectorTreeTimeRangeModel | None = None
    capturedAt: str | None = None
    asOfAt: str | None = None
    sourceRef: SourceRefModel | None = None
    children: list["InspectorTreeNodeModel"] | None = None
    disabledReason: str | None = None


class AnalysisTaskContextPackModel(BaseModel):
    """Tree-shaped immutable input snapshot owned by AnalysisTask."""

    model_config = ConfigDict(extra="forbid")

    version: Literal[1]
    suggestedPrompt: str
    traceability: Literal["none", "summary_only", "partial_refs", "direct_refs"]
    capturedAt: str
    root: InspectorTreeNodeModel


InspectorTreeNodeModel.model_rebuild()


class CreateAnalysisTaskRequest(BaseModel):
    """POST /analysis-tasks request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    conversationId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPackModel | None
    title: str | None = None


class AnalysisTaskResponse(BaseModel):
    """AnalysisTask contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    analysisTaskId: str
    conversationId: str
    workspaceId: str
    userId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPackModel | None
    createdAt: str
    updatedAt: str


class CreateConversationRequest(BaseModel):
    """POST /conversations request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    title: str


class ConversationResponse(BaseModel):
    """Conversation contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    conversationId: str
    workspaceId: str
    userId: str
    currentRunId: str | None
    title: str
    status: Literal["active", "archived", "closed"]
    createdAt: str
    updatedAt: str


class ConversationListItemResponse(BaseModel):
    """Conversation list item response enriched for re-entry and active-run discovery."""

    model_config = ConfigDict(extra="forbid")

    conversationId: str
    workspaceId: str
    userId: str
    currentRunId: str | None
    activeRunId: str | None = None
    activeRunStatus: Literal[
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
    ] | None = None
    title: str
    status: Literal["active", "archived", "closed"]
    latestMessageId: str | None = None
    latestAssistantMessageId: str | None = None
    latestAssistantMessageStatus: Literal[
        "created",
        "streaming",
        "completed",
        "failed",
        "cancelled",
    ] | None = None
    createdAt: str
    updatedAt: str


class ConversationListResponse(BaseModel):
    """Conversation list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[ConversationListItemResponse]


class CreateAnalysisRunRequest(BaseModel):
    """POST /analysis-runs request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    analysisTaskId: str


class SubmitAnalysisDraftRequest(BaseModel):
    """POST /analysis-tasks/submit request contract."""

    model_config = ConfigDict(extra="forbid")

    conversationId: str | None = None
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPackModel | None
    title: str | None = None


class SubmitAnalysisDraftResponse(BaseModel):
    """POST /analysis-tasks/submit response contract."""

    model_config = ConfigDict(extra="forbid")

    conversation: ConversationResponse
    analysisTask: AnalysisTaskResponse
    analysisRun: "AnalysisRunResponse"
    userMessage: "MessageResponse"


class WorkerClaimRequest(BaseModel):
    """POST /analysis-runs/{runId}/worker-claim request contract."""

    model_config = ConfigDict(extra="forbid")

    workerId: str


class WorkerHeartbeatRequest(BaseModel):
    """POST /analysis-runs/{runId}/worker-heartbeat request contract."""

    model_config = ConfigDict(extra="forbid")

    attemptId: str
    workerId: str


class WorkerFailureRequest(BaseModel):
    """POST /analysis-runs/{runId}/worker-failure request contract."""

    model_config = ConfigDict(extra="forbid")

    attemptId: str
    workerId: str
    failureCode: str
    failureMessage: str


class WorkerLostRequest(BaseModel):
    """POST /analysis-runs/{runId}/worker-lost request contract."""

    model_config = ConfigDict(extra="forbid")

    attemptId: str
    workerId: str
    lostReason: str


class WorkerReleaseRequest(BaseModel):
    """POST /analysis-runs/{runId}/worker-release request contract."""

    model_config = ConfigDict(extra="forbid")

    attemptId: str
    workerId: str


class DeliveryCompleteRequest(BaseModel):
    """POST /analysis-runs/{runId}/delivery/complete request contract."""

    model_config = ConfigDict(extra="forbid")

    producerId: str


class CancelAnalysisRunRequest(BaseModel):
    """POST /analysis-runs/{runId}/cancel request contract."""

    model_config = ConfigDict(extra="forbid")

    reason: str | None


class AnalysisRunResponse(BaseModel):
    """AnalysisRun contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    outcome: str | None = None
    waitingFor: str | None = None
    createdAt: str
    validatingAt: str | None = None
    queuedAt: str | None = None
    startedAt: str | None = None
    waitingSince: str | None = None
    timeoutAt: str | None = None
    cancelRequestedAt: str | None = None
    cancellingAt: str | None = None
    completedAt: str | None = None
    failedAt: str | None = None
    cancelledAt: str | None = None
    expiredAt: str | None = None
    rejectedAt: str | None = None
    terminalReason: str | None = None
    failureCode: str | None = None
    retryable: bool | None = None
    retryOfRunId: str | None = None
    originalRunId: str | None = None


class RunEventResponse(BaseModel):
    """RunEvent contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    parentEventId: str | None = None
    refType: str | None = None
    refId: str | None = None
    errorCode: str | None = None
    errorMessage: str | None = None
    nodeName: str
    agentName: str
    toolName: str | None = None
    startedAt: str | None = None
    completedAt: str | None = None


class RunEventListResponse(BaseModel):
    """RunEvent list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[RunEventResponse]


class ToolCallResponse(BaseModel):
    """ToolCall contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    toolCallId: str
    runId: str
    toolName: str
    input: dict[str, object]
    output: dict[str, object] | None = None
    status: Literal["pending", "running", "succeeded", "failed", "skipped", "cancelled"]
    riskLevel: Literal["low", "medium", "high", "critical"]
    permission: str
    errorType: str | None = None
    errorMessage: str | None = None
    startedAt: str | None = None
    completedAt: str | None = None


class ToolCallListResponse(BaseModel):
    """ToolCall list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[ToolCallResponse]


class ModelCallResponse(BaseModel):
    """ModelCall contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    errorType: str | None = None
    errorMessage: str | None = None
    failureClass: str | None = None
    httpStatus: int | None = None
    providerErrorCode: str | None = None
    providerRequestId: str | None = None
    timeoutMs: int | None = None
    retryable: bool | None = None
    retryAfterMs: int | None = None
    rawErrorRedacted: str | None = None
    startedAt: str | None = None
    completedAt: str | None = None


class ModelCallListResponse(BaseModel):
    """ModelCall list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[ModelCallResponse]


class SourceEvidenceResponse(BaseModel):
    """SourceEvidence contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    metadata: dict[str, object] | None = None
    confidence: float
    createdAt: str


class SourceEvidenceListResponse(BaseModel):
    """SourceEvidence list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[SourceEvidenceResponse]


class ReportSectionResponse(BaseModel):
    """ReportSection contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    reportSectionId: str
    reportId: str
    title: str
    content: str
    createdAt: str


class ReportResponse(BaseModel):
    """Report contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    reportId: str
    runId: str
    workspaceId: str
    title: str
    summary: str
    sections: list[ReportSectionResponse]
    sourceEvidence: list[str]
    createdAt: str


class ReportListResponse(BaseModel):
    """Report list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[ReportResponse]


class ExecutionAttemptResponse(BaseModel):
    """ExecutionAttempt contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    attemptId: str
    runId: str
    attemptNumber: int
    workerId: str
    leaseId: str
    status: Literal["leased", "running", "lost", "released", "failed", "completed"]
    leaseAcquiredAt: str
    leaseExpiresAt: str
    heartbeatAt: str | None = None
    releasedAt: str | None = None
    failureCode: str | None = None
    failureMessage: str | None = None


class ExecutionAttemptListResponse(BaseModel):
    """ExecutionAttempt list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[ExecutionAttemptResponse]


class DecisionResponse(BaseModel):
    """Decision contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    decisionId: str
    workspaceId: str
    runId: str
    reportId: str
    title: str
    status: Literal["proposed", "accepted", "rejected", "in_progress", "completed"]
    createdAt: str


class DecisionListResponse(BaseModel):
    """Decision list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[DecisionResponse]


class MessageResponse(BaseModel):
    """Message contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    completedAt: str | None = None


class MessageListResponse(BaseModel):
    """Message list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[MessageResponse]


class MessageStreamResponse(BaseModel):
    """MessageStream contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

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
    errorCode: str | None = None
    errorMessage: str | None = None


class MessageStreamListResponse(BaseModel):
    """MessageStream list API response."""

    model_config = ConfigDict(extra="forbid")

    items: list[MessageStreamResponse]


class ApprovalDecisionRequest(BaseModel):
    """POST /analysis-runs/{runId}/approvals/{approvalId}/decision request contract."""

    model_config = ConfigDict(extra="forbid")

    status: Literal["granted", "denied", "cancelled"]
    decisionReason: str | None = None


ROUTE_STUB_ERROR = RuntimeRouteStubErrorResponse(
    errorCode="NOT_IMPLEMENTED",
    message="Runtime route stub is registered; real implementation is pending.",
)


def runtime_error_response(
    *,
    status_code: int,
    error_code: Literal[
        "NOT_IMPLEMENTED",
        "NOT_FOUND",
        "MISMATCH",
        "INVALID_REQUEST",
        "INVALID_STATE",
        "CONVERSATION_BUSY",
        "UNAUTHORIZED",
        "FORBIDDEN",
    ],
    message: str,
) -> JSONResponse:
    """Return the canonical structured runtime error payload."""

    return JSONResponse(
        status_code=status_code, content={"errorCode": error_code, "message": message}
    )


def not_implemented_route_stub_response() -> JSONResponse:
    """Return the canonical 501 response for runtime route skeletons."""

    return runtime_error_response(
        status_code=501,
        error_code=ROUTE_STUB_ERROR.errorCode,
        message=ROUTE_STUB_ERROR.message,
    )


def generate_canonical_id(prefix: str) -> str:
    """Generate a canonical business ID for runtime foundation objects."""

    return f"{prefix}-{uuid4().hex}"


def utc_timestamp() -> str:
    """Generate the canonical timestamp string used by runtime foundation persistence."""

    return datetime.now(UTC).isoformat().replace("+00:00", "Z")


SubmitAnalysisDraftResponse.model_rebuild()
