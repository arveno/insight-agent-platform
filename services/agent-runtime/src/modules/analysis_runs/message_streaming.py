from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunLifecycleRepository,
    MessageRecord,
    MessageRepository,
    MessageStreamRecord,
    MessageStreamRepository,
)

PRE_DELIVERY_MESSAGE_STATUSES = frozenset({"created", "streaming"})
TERMINAL_MESSAGE_STREAM_EVENT_TYPES = frozenset(
    {"stream.completed", "stream.failed", "stream.cancelled"}
)
TERMINAL_MESSAGE_STREAM_STATUSES = frozenset({"completed", "failed", "cancelled"})
MESSAGE_STREAM_EVENT_STATUS: dict[str, str] = {
    "stream.started": "created",
    "stream.delta": "streaming",
    "stream.completed": "completed",
    "stream.failed": "failed",
    "stream.cancelled": "cancelled",
}
CHUNK_BOUNDARY_CHARACTERS = ("。", "！", "？", "；", "：", "，", "、", "\n", " ")


class MessageStreamStateError(RuntimeError):
    """Raised when Message / MessageStream persistence would violate runtime semantics."""


def generate_assistant_message_id(*, run_id: str) -> str:
    return f"message-{run_id}-assistant"


def generate_message_stream_id(*, run_id: str, sequence: int) -> str:
    return f"message-stream-{run_id}-{sequence}"


def build_placeholder_assistant_message(
    *,
    analysis_task_id: str,
    conversation_id: str,
    created_at: str,
    run_id: str,
    tool_call_ids: list[str],
    turn_id: str,
) -> MessageRecord:
    return {
        "messageId": generate_assistant_message_id(run_id=run_id),
        "conversationId": conversation_id,
        "analysisTaskId": analysis_task_id,
        "turnId": turn_id,
        "runId": run_id,
        "role": "assistant",
        "content": "",
        "status": "streaming",
        "sourceEvidenceIds": [],
        "toolCallIds": tool_call_ids,
        "reportId": None,
        "createdAt": created_at,
        "completedAt": None,
    }


def build_message_stream_record(
    *,
    conversation_id: str,
    message_id: str,
    run_id: str,
    sequence: int,
    event_type: str,
    delta: str,
    occurred_at: str,
    error_code: str | None = None,
    error_message: str | None = None,
) -> MessageStreamRecord:
    if event_type not in MESSAGE_STREAM_EVENT_STATUS:
        raise MessageStreamStateError(f"Unsupported MessageStream eventType: {event_type}")

    return {
        "messageStreamId": generate_message_stream_id(run_id=run_id, sequence=sequence),
        "conversationId": conversation_id,
        "messageId": message_id,
        "runId": run_id,
        "sequence": sequence,
        "eventType": event_type,
        "delta": delta,
        "status": MESSAGE_STREAM_EVENT_STATUS[event_type],  # type: ignore[typeddict-item]
        "occurredAt": occurred_at,
        "errorCode": error_code,
        "errorMessage": error_message,
    }


def chunk_message_stream_deltas(
    text: str,
    *,
    max_chunk_length: int = 24,
) -> list[str]:
    normalized = text.strip()
    if not normalized:
        return []

    chunks: list[str] = []
    cursor = 0
    while cursor < len(normalized):
        window_end = min(cursor + max_chunk_length, len(normalized))
        split_at = window_end
        if window_end < len(normalized):
            boundary_indexes = [
                normalized.rfind(boundary, cursor, window_end)
                for boundary in CHUNK_BOUNDARY_CHARACTERS
            ]
            best_boundary_index = max(boundary_indexes)
            if best_boundary_index > cursor:
                split_at = best_boundary_index + 1
        chunk = normalized[cursor:split_at].strip()
        if not chunk:
            split_at = min(cursor + max_chunk_length, len(normalized))
            chunk = normalized[cursor:split_at].strip()
        if chunk:
            chunks.append(chunk)
        cursor = split_at

    return chunks or [normalized]


def is_delivery_promotable_placeholder(
    message: MessageRecord,
    *,
    analysis_task_id: str,
    conversation_id: str,
    run_id: str,
    turn_id: str,
) -> bool:
    return (
        message["messageId"] == generate_assistant_message_id(run_id=run_id)
        and message["conversationId"] == conversation_id
        and message["analysisTaskId"] == analysis_task_id
        and message["turnId"] == turn_id
        and message["runId"] == run_id
        and message["role"] == "assistant"
        and message["status"] in PRE_DELIVERY_MESSAGE_STATUSES
        and message["reportId"] is None
        and not message["sourceEvidenceIds"]
        and message["completedAt"] is None
    )


def validate_message_stream_chain(
    *,
    message: MessageRecord,
    message_streams: Sequence[MessageStreamRecord],
) -> None:
    if not message_streams:
        return
    if message["role"] != "assistant":
        raise MessageStreamStateError("MessageStream replay requires an assistant Message owner.")
    if message["runId"] is None:
        raise MessageStreamStateError("MessageStream replay requires message.runId.")

    terminal_indexes: list[int] = []
    for index, message_stream in enumerate(message_streams):
        if message_stream["sequence"] != index:
            raise MessageStreamStateError("MessageStream sequence must be contiguous and 0-based.")
        if message_stream["conversationId"] != message["conversationId"]:
            raise MessageStreamStateError(
                "MessageStream conversationId must match the owning Message."
            )
        if message_stream["messageId"] != message["messageId"]:
            raise MessageStreamStateError("MessageStream messageId must match the owning Message.")
        if message_stream["runId"] != message["runId"]:
            raise MessageStreamStateError("MessageStream runId must match the owning Message.")

        expected_status = MESSAGE_STREAM_EVENT_STATUS.get(message_stream["eventType"])
        if expected_status is None:
            raise MessageStreamStateError(
                f"Unsupported MessageStream eventType: {message_stream['eventType']}"
            )
        if message_stream["status"] != expected_status:
            raise MessageStreamStateError(
                "MessageStream status must match the canonical eventType mapping."
            )

        if index == 0 and message_stream["eventType"] != "stream.started":
            raise MessageStreamStateError(
                "MessageStream sequence 0 must be stream.started for assistant replay."
            )

        if message_stream["eventType"] in TERMINAL_MESSAGE_STREAM_EVENT_TYPES:
            terminal_indexes.append(index)

    if len(terminal_indexes) > 1:
        raise MessageStreamStateError("MessageStream allows exactly one terminal event.")
    if terminal_indexes and terminal_indexes[0] != len(message_streams) - 1:
        raise MessageStreamStateError("MessageStream terminal event must be the final sequence.")


@dataclass(slots=True)
class RuntimeMessageStreamService:
    lifecycle_repository: AnalysisRunLifecycleRepository
    message_repository: MessageRepository
    message_stream_repository: MessageStreamRepository

    def persist_runtime_message_stream(
        self,
        *,
        message: MessageRecord,
        message_streams: Sequence[MessageStreamRecord] = (),
    ) -> MessageRecord:
        existing_message = self._get_existing_message(message["messageId"])
        resolved_message = _resolve_runtime_message(
            existing_message=existing_message,
            proposed_message=message,
        )
        existing_streams = self.message_stream_repository.list_by_message_id(message["messageId"])
        validate_message_stream_chain(message=resolved_message, message_streams=existing_streams)

        rows_to_persist = _resolve_message_stream_appends(
            existing_message_streams=existing_streams,
            proposed_message_streams=message_streams,
            message=resolved_message,
        )

        should_write_message = existing_message is None or existing_message != resolved_message
        if not should_write_message and not rows_to_persist:
            return resolved_message

        self.lifecycle_repository.record_execution_state(
            message=resolved_message if should_write_message else None,
            message_streams=rows_to_persist,
        )
        return resolved_message

    def _get_existing_message(self, message_id: str) -> MessageRecord | None:
        try:
            return self.message_repository.get_by_message_id(message_id)
        except KeyError:
            return None


def _resolve_runtime_message(
    *,
    existing_message: MessageRecord | None,
    proposed_message: MessageRecord,
) -> MessageRecord:
    if proposed_message["role"] != "assistant":
        raise MessageStreamStateError(
            "Runtime MessageStream persistence requires assistant Message."
        )
    if proposed_message["runId"] is None:
        raise MessageStreamStateError("Runtime assistant Message must bind runId.")
    if proposed_message["reportId"] is not None:
        raise MessageStreamStateError("Runtime assistant placeholder must not bind reportId.")
    if proposed_message["sourceEvidenceIds"]:
        raise MessageStreamStateError(
            "Runtime assistant placeholder must not bind SourceEvidence before delivery."
        )
    if proposed_message["status"] == "completed":
        raise MessageStreamStateError(
            "Runtime assistant placeholder cannot be marked completed before delivery."
        )
    if (
        proposed_message["status"] in PRE_DELIVERY_MESSAGE_STATUSES
        and proposed_message["completedAt"] is not None
    ):
        raise MessageStreamStateError(
            "Pre-delivery assistant placeholder must not set completedAt."
        )
    if (
        proposed_message["status"] in TERMINAL_MESSAGE_STREAM_STATUSES
        and proposed_message["completedAt"] is None
    ):
        raise MessageStreamStateError("Terminal assistant placeholder must set completedAt.")

    if existing_message is None:
        return proposed_message

    for immutable_field in (
        "messageId",
        "conversationId",
        "analysisTaskId",
        "turnId",
        "runId",
        "role",
        "createdAt",
    ):
        if existing_message[immutable_field] != proposed_message[immutable_field]:
            raise MessageStreamStateError(
                f"Runtime assistant Message cannot change immutable field {immutable_field}."
            )

    if existing_message["reportId"] is not None or existing_message["sourceEvidenceIds"]:
        raise MessageStreamStateError(
            "Runtime MessageStream persistence refuses to overwrite delivery-bound "
            "assistant Message."
        )

    if existing_message["status"] == "completed":
        raise MessageStreamStateError(
            "Runtime MessageStream persistence refuses to overwrite completed assistant Message."
        )
    if (
        existing_message["status"] in TERMINAL_MESSAGE_STREAM_STATUSES
        and existing_message != proposed_message
    ):
        raise MessageStreamStateError(
            "Runtime MessageStream persistence refuses to overwrite terminal assistant Message."
        )

    allowed_status_transitions = {
        "created": {"created", "streaming", "failed", "cancelled"},
        "streaming": {"streaming", "failed", "cancelled"},
        "failed": {"failed"},
        "cancelled": {"cancelled"},
    }
    current_status = existing_message["status"]
    if proposed_message["status"] not in allowed_status_transitions[current_status]:
        raise MessageStreamStateError(
            f"Unsupported assistant placeholder status transition: {current_status} -> "
            f"{proposed_message['status']}."
        )

    return proposed_message


def _resolve_message_stream_appends(
    *,
    existing_message_streams: Sequence[MessageStreamRecord],
    proposed_message_streams: Sequence[MessageStreamRecord],
    message: MessageRecord,
) -> list[MessageStreamRecord]:
    if not proposed_message_streams:
        return []

    rows_to_persist: list[MessageStreamRecord] = []
    combined_message_streams = list(existing_message_streams)
    existing_by_sequence = {
        message_stream["sequence"]: message_stream for message_stream in existing_message_streams
    }
    terminal_already_present = bool(
        combined_message_streams
        and combined_message_streams[-1]["eventType"] in TERMINAL_MESSAGE_STREAM_EVENT_TYPES
    )

    for message_stream in proposed_message_streams:
        existing = existing_by_sequence.get(message_stream["sequence"])
        if existing is not None:
            if existing != message_stream:
                raise MessageStreamStateError(
                    "Duplicate MessageStream sequence must carry the exact same payload."
                )
            continue

        if terminal_already_present:
            raise MessageStreamStateError(
                "MessageStream cannot append delta or terminal rows after a terminal event."
            )

        expected_sequence = len(combined_message_streams)
        if message_stream["sequence"] != expected_sequence:
            raise MessageStreamStateError(
                "MessageStream append must continue from the next contiguous sequence."
            )

        combined_message_streams.append(message_stream)
        rows_to_persist.append(message_stream)
        validate_message_stream_chain(message=message, message_streams=combined_message_streams)
        if message_stream["eventType"] in TERMINAL_MESSAGE_STREAM_EVENT_TYPES:
            terminal_already_present = True

    validate_message_stream_chain(message=message, message_streams=combined_message_streams)
    return rows_to_persist
