"""Shared request, response, and error models for runtime routes."""

from datetime import datetime, timezone
from typing import Literal
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

    errorCode: Literal["NOT_FOUND", "MISMATCH"]
    message: str


class AnalysisTaskContextPackModel(BaseModel):
    """Typed context pack carried by the first L3 golden-path AnalysisTask."""

    model_config = ConfigDict(extra="forbid")

    metricId: str
    timeRange: str
    threshold: str
    trend: str
    tableIds: list[str]
    knowledgeDocumentIds: list[str]


class CreateAnalysisTaskRequest(BaseModel):
    """POST /analysis-tasks request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    userId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPackModel
    title: str | None = None


class AnalysisTaskResponse(BaseModel):
    """AnalysisTask contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    analysisTaskId: str
    workspaceId: str
    userId: str
    businessDomainId: str
    question: str
    contextPack: AnalysisTaskContextPackModel
    createdAt: str
    updatedAt: str


class CreateConversationRequest(BaseModel):
    """POST /conversations request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    userId: str
    analysisTaskId: str
    title: str


class ConversationResponse(BaseModel):
    """Conversation contract-shaped API response."""

    model_config = ConfigDict(extra="forbid")

    conversationId: str
    workspaceId: str
    userId: str
    analysisTaskId: str
    currentRunId: str | None
    title: str
    status: Literal["active", "archived", "closed"]
    createdAt: str
    updatedAt: str


class CreateAnalysisRunRequest(BaseModel):
    """POST /analysis-runs request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    userId: str
    analysisTaskId: str
    conversationId: str


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
    error_code: Literal["NOT_IMPLEMENTED", "NOT_FOUND", "MISMATCH"],
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

    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
