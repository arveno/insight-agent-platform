"""Conversation HTTP boundary for Analysis workspace foundation APIs."""

import json
from collections.abc import Iterator
from typing import Any

from fastapi import APIRouter, Header, Path, status
from fastapi.responses import JSONResponse, StreamingResponse

from src.app.config import get_settings
from src.app.routes.runtime_contracts import (
    ConversationResponse,
    CreateConversationRequest,
    MessageListResponse,
    MessageStreamListResponse,
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
    MessageRepository,
    MessageStreamRecord,
    MessageStreamRepository,
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


def _message_repository() -> MessageRepository:
    return MessageRepository(_runtime_foundation_database())


def _message_stream_repository() -> MessageStreamRepository:
    return MessageStreamRepository(_runtime_foundation_database())


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


@router.get(
    "/{conversationId}/messages",
    response_model=MessageListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def list_conversation_messages(
    conversation_id: str = Path(alias="conversationId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Message records for a real Conversation."""

    try:
        _conversation_repository().get_by_conversation_id(conversation_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )

    return {"items": _message_repository().list_by_conversation_id(conversation_id)}


@router.get("/{conversationId}/messages/{messageId}", responses=NOT_IMPLEMENTED_RESPONSE)
def get_conversation_message(
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
) -> JSONResponse:
    """Expose the single-message boundary without creating a second success path."""

    _ = (conversation_id, message_id)
    return not_implemented_route_stub_response()


@router.get(
    "/{conversationId}/messages/{messageId}/stream",
    response_model=MessageStreamListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def stream_conversation_message(
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
    accept: str | None = Header(default=None),
) -> dict[str, object] | JSONResponse | StreamingResponse:
    """Serve MessageStream replay as JSON or SSE from the same persisted record chain."""

    try:
        _conversation_repository().get_by_conversation_id(conversation_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )

    try:
        message = _message_repository().get_by_message_id(message_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Message not found: {message_id}",
        )
    if message["conversationId"] != conversation_id:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Message not found in Conversation: {message_id}",
        )

    message_streams = _message_stream_repository().list_by_message_id(message_id)
    if accept is not None and "text/event-stream" in accept:
        return StreamingResponse(
            _encode_message_stream_sse(message_streams),
            media_type="text/event-stream",
        )
    return {"items": message_streams}


def _encode_message_stream_sse(
    message_streams: list[MessageStreamRecord],
) -> Iterator[str]:
    for message_stream in message_streams:
        payload = json.dumps(message_stream, ensure_ascii=False, separators=(",", ":"))
        yield f"event: {message_stream['eventType']}\ndata: {payload}\n\n"
