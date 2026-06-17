"""Conversation HTTP boundary for Analysis workspace foundation APIs."""

import json
from collections.abc import Iterator
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, Path, status
from fastapi.responses import JSONResponse, StreamingResponse

from src.app.auth import (
    AuthenticatedRequestContext,
    authenticated_request_context_dependency,
)
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
    AnalysisRunRecord,
    AnalysisRunRepository,
    AnalysisTaskRecord,
    AnalysisTaskRepository,
    ConversationRecord,
    ConversationRepository,
    MessageRecord,
    MessageRepository,
    MessageStreamRecord,
    MessageStreamRepository,
    RuntimeFoundationPyMySqlDatabase,
)
from src.modules.analysis_runs.message_streaming import (
    MessageStreamStateError,
    validate_message_stream_chain,
    validate_message_stream_replay_message,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])
AuthenticatedContext = Annotated[
    AuthenticatedRequestContext,
    Depends(authenticated_request_context_dependency),
]

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


class MessageStreamReplayNotFoundError(RuntimeError):
    """Raised when the replay chain resolves to a non-owned runtime object."""


def _runtime_foundation_database() -> RuntimeFoundationPyMySqlDatabase:
    settings = get_settings()
    return RuntimeFoundationPyMySqlDatabase(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def _conversation_repository() -> ConversationRepository:
    return ConversationRepository(_runtime_foundation_database())


def _analysis_task_repository() -> AnalysisTaskRepository:
    return AnalysisTaskRepository(_runtime_foundation_database())


def _analysis_run_repository() -> AnalysisRunRepository:
    return AnalysisRunRepository(_runtime_foundation_database())


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
def create_conversation(
    request: CreateConversationRequest,
    context: AuthenticatedContext,
) -> ConversationRecord | JSONResponse:
    """Create a new Conversation thread container without prebinding a singular AnalysisTask."""

    now = utc_timestamp()
    conversation: ConversationRecord = {
        "conversationId": generate_canonical_id("conversation"),
        "workspaceId": context.workspaceId,
        "userId": context.userId,
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
    context: AuthenticatedContext,
    conversation_id: str = Path(alias="conversationId"),
) -> ConversationRecord | JSONResponse:
    """Load a persisted Conversation by canonical conversationId."""

    try:
        return _conversation_repository().get_by_conversation_id_and_owner(
            conversation_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
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
    context: AuthenticatedContext,
    conversation_id: str = Path(alias="conversationId"),
) -> dict[str, object] | JSONResponse:
    """Return persisted Message records for a real Conversation."""

    try:
        _conversation_repository().get_by_conversation_id_and_owner(
            conversation_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )

    return {"items": _message_repository().list_by_conversation_id(conversation_id)}


@router.get("/{conversationId}/messages/{messageId}", responses=NOT_IMPLEMENTED_RESPONSE)
def get_conversation_message(
    context: AuthenticatedContext,
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
) -> JSONResponse:
    """Expose the single-message boundary without creating a second success path."""

    try:
        _conversation_repository().get_by_conversation_id_and_owner(
            conversation_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )

    _ = (conversation_id, message_id)
    return not_implemented_route_stub_response()


@router.get(
    "/{conversationId}/messages/{messageId}/stream",
    response_model=MessageStreamListResponse,
    responses=FOUNDATION_ERROR_RESPONSE,
)
def stream_conversation_message(
    context: AuthenticatedContext,
    conversation_id: str = Path(alias="conversationId"),
    message_id: str = Path(alias="messageId"),
    accept: str | None = Header(default=None),
) -> dict[str, object] | JSONResponse | StreamingResponse:
    """Serve MessageStream replay as JSON or SSE from the same persisted record chain."""

    try:
        conversation = _conversation_repository().get_by_conversation_id_and_owner(
            conversation_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Conversation not found: {conversation_id}",
        )

    try:
        message = _message_repository().get_by_message_id_and_conversation_id(
            message_id,
            conversation_id=conversation_id,
        )
    except KeyError:
        return _message_not_found_or_mismatched_response(
            context=context,
            conversation_id=conversation_id,
            message_id=message_id,
        )

    message_streams = _message_stream_repository().list_by_message_id(message_id)
    try:
        validate_message_stream_replay_message(
            message=message,
            has_message_streams=bool(message_streams),
        )
        _validate_owned_message_stream_replay_chain(
            context=context,
            conversation=conversation,
            message=message,
        )
        validate_message_stream_chain(message=message, message_streams=message_streams)
    except MessageStreamStateError as exc:
        return runtime_error_response(
            status_code=409,
            error_code="INVALID_STATE",
            message=str(exc),
        )
    except MessageStreamReplayNotFoundError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"MessageStream replay chain not found for messageId: {message_id}",
        )
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


def _message_not_found_or_mismatched_response(
    *,
    context: AuthenticatedRequestContext,
    conversation_id: str,
    message_id: str,
) -> JSONResponse:
    try:
        message = _message_repository().get_by_message_id(message_id)
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Message not found: {message_id}",
        )

    try:
        _conversation_repository().get_by_conversation_id_and_owner(
            message["conversationId"],
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        return runtime_error_response(
            status_code=404,
            error_code="NOT_FOUND",
            message=f"Message not found: {message_id}",
        )

    return runtime_error_response(
        status_code=409,
        error_code="INVALID_STATE",
        message=(
            "MessageStream replay requires the requested conversationId and messageId to share "
            f"the same persisted object chain; conversationId={conversation_id} "
            f"messageId={message_id} mismatched the owned Conversation / Message binding."
        ),
    )


def _validate_owned_message_stream_replay_chain(
    *,
    context: AuthenticatedRequestContext,
    conversation: ConversationRecord,
    message: MessageRecord,
) -> None:
    analysis_task = _resolve_owned_analysis_task_for_message(context=context, message=message)
    analysis_run = _resolve_owned_analysis_run_for_message(context=context, message=message)

    mismatches: list[str] = []
    if analysis_task["conversationId"] != conversation["conversationId"]:
        mismatches.append("analysisTask.conversationId")
    if message["analysisTaskId"] != analysis_task["analysisTaskId"]:
        mismatches.append("message.analysisTaskId")
    if message["runId"] != analysis_run["runId"]:
        mismatches.append("message.runId")
    if analysis_run["analysisTaskId"] != analysis_task["analysisTaskId"]:
        mismatches.append("analysisRun.analysisTaskId")

    if mismatches:
        mismatch_summary = ", ".join(mismatches)
        raise MessageStreamStateError(
            "MessageStream replay requires Conversation / Message / AnalysisRun / "
            "AnalysisTask to share the same owned runtime chain; mismatched fields: "
            f"{mismatch_summary}."
        )


def _resolve_owned_analysis_task_for_message(
    *,
    context: AuthenticatedRequestContext,
    message: MessageRecord,
) -> AnalysisTaskRecord:
    analysis_task_id = message["analysisTaskId"]
    if analysis_task_id is None:
        raise MessageStreamStateError("MessageStream replay requires message.analysisTaskId.")

    try:
        return _analysis_task_repository().get_by_analysis_task_id_and_owner(
            analysis_task_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        try:
            _analysis_task_repository().get_by_analysis_task_id(analysis_task_id)
        except KeyError as exc:
            raise MessageStreamStateError(
                "MessageStream replay requires message.analysisTaskId to resolve to a "
                "persisted AnalysisTask."
            ) from exc
        raise MessageStreamReplayNotFoundError(analysis_task_id) from None


def _resolve_owned_analysis_run_for_message(
    *,
    context: AuthenticatedRequestContext,
    message: MessageRecord,
) -> AnalysisRunRecord:
    run_id = message["runId"]
    if run_id is None:
        raise MessageStreamStateError("MessageStream replay requires message.runId.")

    try:
        return _analysis_run_repository().get_by_run_id_and_owner(
            run_id,
            workspace_id=context.workspaceId,
            user_id=context.userId,
        )
    except KeyError:
        try:
            _analysis_run_repository().get_by_run_id(run_id)
        except KeyError as exc:
            raise MessageStreamStateError(
                "MessageStream replay requires message.runId to resolve to a persisted "
                "AnalysisRun."
            ) from exc
        raise MessageStreamReplayNotFoundError(run_id) from None
