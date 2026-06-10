"""Shared request and error models for runtime route stubs."""

from typing import Literal

from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict


class RuntimeRouteStubErrorResponse(BaseModel):
    """Structured 501 response for registered but not-yet-implemented runtime routes."""

    model_config = ConfigDict(extra="forbid")

    errorCode: Literal["NOT_IMPLEMENTED"]
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


class CreateConversationRequest(BaseModel):
    """POST /conversations request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    userId: str
    analysisTaskId: str
    title: str


class CreateAnalysisRunRequest(BaseModel):
    """POST /analysis-runs request contract for route registration and validation."""

    model_config = ConfigDict(extra="forbid")

    workspaceId: str
    userId: str
    analysisTaskId: str
    conversationId: str


class ApprovalDecisionRequest(BaseModel):
    """POST /analysis-runs/{runId}/approvals/{approvalId}/decision request contract."""

    model_config = ConfigDict(extra="forbid")

    status: Literal["granted", "denied", "cancelled"]
    decisionReason: str | None = None


ROUTE_STUB_ERROR = RuntimeRouteStubErrorResponse(
    errorCode="NOT_IMPLEMENTED",
    message="Runtime route stub is registered; real implementation is pending.",
)


def not_implemented_route_stub_response() -> JSONResponse:
    """Return the canonical 501 response for runtime route skeletons."""

    return JSONResponse(status_code=501, content=ROUTE_STUB_ERROR.model_dump())
