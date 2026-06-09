"""Conversation HTTP boundary for Analysis workspace route stubs."""

from typing import Any

from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

from src.app.routes.runtime_contracts import (
    CreateConversationRequest,
    RuntimeRouteStubErrorResponse,
    not_implemented_route_stub_response,
)

router = APIRouter(prefix="/conversations", tags=["conversations"])

NOT_IMPLEMENTED_RESPONSE: dict[int | str, dict[str, Any]] = {
    501: {
        "description": "Runtime route stub is registered but the real implementation is pending.",
        "model": RuntimeRouteStubErrorResponse,
    }
}


@router.post("", responses=NOT_IMPLEMENTED_RESPONSE)
def create_conversation(_request: CreateConversationRequest) -> JSONResponse:
    """Register the conversation create boundary without implementing persistence."""

    return not_implemented_route_stub_response()


@router.get("/{conversationId}", responses=NOT_IMPLEMENTED_RESPONSE)
def get_conversation(
    conversation_id: str = Path(alias="conversationId"),
) -> JSONResponse:
    """Keep the conversation facade boundary stable while real read logic is pending."""

    _ = conversation_id
    return not_implemented_route_stub_response()


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
