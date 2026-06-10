"""Conversation HTTP boundary for Analysis workspace foundation APIs."""

from typing import Any

from fastapi import APIRouter, Path, status
from fastapi.responses import JSONResponse

from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    ConversationResponse,
    CreateConversationRequest,
    RuntimeRequestErrorResponse,
    RuntimeRouteStubErrorResponse,
    generate_canonical_id,
    not_implemented_route_stub_response,
    runtime_error_response,
    utc_timestamp,
)
from src.infrastructure.database.runtime_foundation import (
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    RuntimeFoundationPyMySqlDatabase,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

NOT_IMPLEMENTED_RESPONSE: dict[int | str, dict[str, Any]] = {
    501: {
        "description": "Runtime route stub is registered but the real implementation is pending.",
        "model": RuntimeRouteStubErrorResponse,
    }
}

FOUNDATION_ERROR_RESPONSE: dict[int | str, dict[str, Any]] = {
    404: {
        "description": "Requested AnalysisTask or Conversation was not found.",
        "model": RuntimeRequestErrorResponse,
    },
    409: {
        "description": "Request chain mismatched the persisted runtime foundation objects.",
        "model": RuntimeRequestErrorResponse,
    },
}


def _runtime_foundation_database() -> RuntimeFoundationPyMySqlDatabase:
    settings = get_settings()
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def _analysis_task_repository() -> AnalysisTaskRepository:
    return AnalysisTaskRepository(_runtime_foundation_database())


def _conversation_repository() -> ConversationRepository:
    return ConversationRepository(_runtime_foundation_database())


@router.post(
    "",
    response_model=ConversationResponse,
    status_code=status.HTTP_201_CREATED,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def create_conversation(request: CreateConversationRequest) -> ConversationRecord | JSONResponse:
    """Create a real Conversation after validating the AnalysisTask chain."""

    try:
        analysis_task = _analysis_task_repository().get_by_analysis_task_id(request.analysisTaskId)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"AnalysisTask not found: {request.analysisTaskId}",
        )

    if analysis_task["workspaceId"] != request.workspaceId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="AnalysisTask.workspaceId does not match request.workspaceId",
        )
    if analysis_task["userId"] != request.userId:
        return runtime_error_response(
            status_code=409,
            error_code="MISMATCH",
            message="AnalysisTask.userId does not match request.userId",
        )

    now = utc_timestamp()
    conversation: ConversationRecord = {
        "conversationId": generate_canonical_id("conversation"),
        "workspaceId": request.workspaceId,
        "userId": request.userId,
        "analysisTaskId": request.analysisTaskId,
        "currentRunId": None,
        "title": request.title,
        "status": "active",
        "createdAt": now,
        "updatedAt": now,
    }
    _conversation_repository().create(conversation)
    return conversation


@router.get(
    "/{conversationId}", response_model=ConversationResponse, responses=FOUNDATION_ERROR_RESPONSE
)
def get_conversation(
    conversation_id: str = Path(alias="conversationId"),
) -> ConversationRecord | JSONResponse:
    """Load a persisted Conversation by canonical conversationId."""

    try:
        return _conversation_repository().get_by_conversation_id(conversation_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )


@router.get("/{conversationId}/messages", responses=NOT_IMPLEMENTED_RESPONSE)
def list_conversation_messages(
    conversation_id: str = Path(alias="conversationId"),
) -> JSONResponse:
    """Expose the conversation message collection boundary without serving fake data."""

    _ = conversation_id
    return not_implemented_route_stub_response()


@router.get("/{conversationId}/messages/{messageId}", responses=NOT_IMPLEMENTED_RESPONSE)
def get_conversation_message(
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
) -> JSONResponse:
    """Expose the single-message boundary without creating a second success path."""

    _ = (conversation_id, message_id)
    return not_implemented_route_stub_response()


@router.get("/{conversationId}/messages/{messageId}/stream", responses=NOT_IMPLEMENTED_RESPONSE)
def stream_conversation_message(
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
) -> JSONResponse:
    """Reserve the live/replay MessageStream endpoint without implementing SSE transport."""

    _ = (conversation_id, message_id)
    return not_implemented_route_stub_response()
