"""Deterministic backend delivery foundation artifacts for Issue #198."""

from __future__ import annotations

from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    ConversationRecord,
    MessageRecord,
    MessageStreamRecord,
    SourceEvidenceRecord,
)
from src.infrastructure.model_gateway.gateway import (
    FoundationModelGateway,
    FoundationModelGeneration,
)
from src.infrastructure.tool_registry.registry import (
    FoundationToolExecution,
    FoundationToolRegistry,
)
from src.infrastructure.tool_registry.report_tool import (
    FoundationReportArtifacts,
    build_foundation_report_artifacts,
)

FOUNDATION_PRODUCER_ID = "delivery-producer-foundation"
MESSAGE_STREAM_SEGMENTS = (
    "",
    "收入增速下滑主要来自华东核心渠道确认延迟",
    "与促销库存错配，而不是整体价格体系失效。",
)


@dataclass(frozen=True, slots=True)
class FoundationDeliveryArtifacts:
    """Structured artifact bundle created during delivery completion."""

    tool_execution: FoundationToolExecution
    model_generation: FoundationModelGeneration
    source_evidence: list[SourceEvidenceRecord]
    report_artifacts: FoundationReportArtifacts
    assistant_message: MessageRecord
    message_streams: list[MessageStreamRecord]


def build_foundation_delivery_artifacts(
    *,
    analysis_run: AnalysisRunRecord,
    conversation: ConversationRecord,
    occurred_at: str,
) -> FoundationDeliveryArtifacts:
    tool_execution = FoundationToolRegistry().execute_metrics_summary(
        run_id=analysis_run["runId"],
        occurred_at=occurred_at,
    )
    model_generation = FoundationModelGateway().generate_delivery_summary(
        run_id=analysis_run["runId"],
        occurred_at=occurred_at,
        tool_conclusion=tool_execution.conclusion,
    )
    source_evidence = build_foundation_source_evidence(
        run_id=analysis_run["runId"],
        occurred_at=occurred_at,
    )
    report_artifacts = build_foundation_report_artifacts(
        analysis_run=analysis_run,
        source_evidence_ids=[item["sourceEvidenceId"] for item in source_evidence],
        occurred_at=occurred_at,
    )
    assistant_message = build_foundation_assistant_message(
        analysis_run=analysis_run,
        conversation=conversation,
        occurred_at=occurred_at,
        source_evidence_ids=[item["sourceEvidenceId"] for item in source_evidence],
        tool_call_id=tool_execution.tool_call["toolCallId"],
        report_id=report_artifacts.report["reportId"],
        assistant_content=model_generation.assistant_content,
    )
    message_streams = build_foundation_message_streams(
        analysis_run=analysis_run,
        conversation=conversation,
        message_id=assistant_message["messageId"],
        occurred_at=occurred_at,
    )
    return FoundationDeliveryArtifacts(
        tool_execution=tool_execution,
        model_generation=model_generation,
        source_evidence=source_evidence,
        report_artifacts=report_artifacts,
        assistant_message=assistant_message,
        message_streams=message_streams,
    )


def build_foundation_source_evidence(
    *,
    run_id: str,
    occurred_at: str,
) -> list[SourceEvidenceRecord]:
    return [
        {
            "sourceEvidenceId": f"source-evidence-{run_id}-channel-weekly-17",
            "runId": run_id,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-channel-weekly-17",
            "title": "渠道周报第 17 期",
            "snippet": "华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
            "metadata": {"displayCategory": "weekly_digest"},
            "confidence": 0.86,
            "createdAt": occurred_at,
        },
        {
            "sourceEvidenceId": f"source-evidence-{run_id}-inventory-note-east-04",
            "runId": run_id,
            "sourceType": "knowledge_document",
            "sourceId": "knowledge-document-inventory-east-04",
            "title": "华东库存复核记录",
            "snippet": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
            "metadata": {"displayCategory": "inventory_note"},
            "confidence": 0.82,
            "createdAt": occurred_at,
        },
    ]


def build_foundation_assistant_message(
    *,
    analysis_run: AnalysisRunRecord,
    conversation: ConversationRecord,
    occurred_at: str,
    source_evidence_ids: list[str],
    tool_call_id: str,
    report_id: str,
    assistant_content: str,
) -> MessageRecord:
    return {
        "messageId": f"message-{analysis_run['runId']}-assistant",
        "conversationId": conversation["conversationId"],
        "turnId": f"turn-{analysis_run['runId']}-1",
        "runId": analysis_run["runId"],
        "role": "assistant",
        "content": assistant_content,
        "status": "completed",
        "sourceEvidenceIds": source_evidence_ids,
        "toolCallIds": [tool_call_id],
        "reportId": report_id,
        "createdAt": occurred_at,
        "completedAt": occurred_at,
    }


def build_foundation_message_streams(
    *,
    analysis_run: AnalysisRunRecord,
    conversation: ConversationRecord,
    message_id: str,
    occurred_at: str,
) -> list[MessageStreamRecord]:
    return [
        {
            "messageStreamId": f"message-stream-{analysis_run['runId']}-0",
            "conversationId": conversation["conversationId"],
            "messageId": message_id,
            "runId": analysis_run["runId"],
            "sequence": 0,
            "eventType": "stream.started",
            "delta": MESSAGE_STREAM_SEGMENTS[0],
            "status": "created",
            "occurredAt": occurred_at,
            "errorCode": None,
            "errorMessage": None,
        },
        {
            "messageStreamId": f"message-stream-{analysis_run['runId']}-1",
            "conversationId": conversation["conversationId"],
            "messageId": message_id,
            "runId": analysis_run["runId"],
            "sequence": 1,
            "eventType": "stream.delta",
            "delta": MESSAGE_STREAM_SEGMENTS[1],
            "status": "streaming",
            "occurredAt": occurred_at,
            "errorCode": None,
            "errorMessage": None,
        },
        {
            "messageStreamId": f"message-stream-{analysis_run['runId']}-2",
            "conversationId": conversation["conversationId"],
            "messageId": message_id,
            "runId": analysis_run["runId"],
            "sequence": 2,
            "eventType": "stream.completed",
            "delta": MESSAGE_STREAM_SEGMENTS[2],
            "status": "completed",
            "occurredAt": occurred_at,
            "errorCode": None,
            "errorMessage": None,
        },
    ]
