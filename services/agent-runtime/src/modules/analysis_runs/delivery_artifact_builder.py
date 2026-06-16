from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    AnalysisTaskRecord,
    ConversationRecord,
    DecisionRecord,
    InspectorTreeNode,
    MessageRecord,
    ModelCallRecord,
    ReportRecord,
    ReportSectionRecord,
    RunEventRecord,
    SourceEvidenceRecord,
    ToolCallRecord,
)

REPORT_ID = "report-revenue-gap-q2"
REPORT_TITLE = "收入异常分析摘要"
REPORT_SUMMARY = "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作"
DECISION_ID = "decision-revenue-gap-q2"
DECISION_TITLE = "复核华东渠道确认周期与库存错配"

REQUIRED_DELIVERY_SOURCES: tuple[dict[str, str], ...] = (
    {
        "knowledgeDocumentId": "knowledge-document-channel-weekly-17",
        "sourceEvidenceId": "source-evidence-channel-weekly-17",
        "fallbackTitle": "渠道周报第 17 期",
        "fallbackSnippet": "华东渠道存在确认延迟，影响 2026 Q2 收入确认节奏。",
    },
    {
        "knowledgeDocumentId": "knowledge-document-inventory-east-04",
        "sourceEvidenceId": "source-evidence-inventory-note-east-04",
        "fallbackTitle": "华东库存复核记录",
        "fallbackSnippet": "促销期间部分 SKU 库存错配，影响渠道交付与确认节奏。",
    },
)
TRACEABLE_UPSTREAM_CONTEXT_REFS: tuple[tuple[str, str], ...] = (
    ("metric", "metric-recognized-revenue"),
    ("dataTable", "table-sales-order"),
    ("dataTable", "table-refund-order"),
)


class DeliveryArtifactBuildError(RuntimeError):
    """Raised when persisted runtime state cannot produce honest delivery artifacts."""


@dataclass(frozen=True, slots=True)
class DeliveryArtifacts:
    assistant_message: MessageRecord
    decision: DecisionRecord
    report: ReportRecord
    source_evidence: list[SourceEvidenceRecord]


def build_delivery_artifacts(
    *,
    analysis_run: AnalysisRunRecord,
    analysis_task: AnalysisTaskRecord,
    conversation: ConversationRecord,
    messages: list[MessageRecord],
    model_calls: list[ModelCallRecord],
    run_events: list[RunEventRecord],
    tool_calls: list[ToolCallRecord],
    occurred_at: str,
) -> DeliveryArtifacts:
    context_pack = analysis_task["contextPack"]
    if context_pack is None:
        raise DeliveryArtifactBuildError("AnalysisTask.contextPack.root is required for delivery.")

    if len(tool_calls) == 0:
        raise DeliveryArtifactBuildError(
            "Persisted ToolCall records are required before delivery artifacts can be built."
        )
    if len(model_calls) == 0:
        raise DeliveryArtifactBuildError(
            "Persisted ModelCall records are required before delivery artifacts can be built."
        )
    if not any(event["eventType"] == "synthesis.started" for event in run_events):
        raise DeliveryArtifactBuildError(
            "Persisted RunEvent trace must include synthesis.started before delivery."
        )

    required_source_nodes = _resolve_required_source_nodes(context_pack["root"])
    source_evidence = [
        _build_source_evidence(
            analysis_run=analysis_run,
            analysis_task=analysis_task,
            node=required_source_nodes[source_spec["knowledgeDocumentId"]],
            source_spec=source_spec,
            tool_calls=tool_calls,
            model_calls=model_calls,
            occurred_at=occurred_at,
        )
        for source_spec in REQUIRED_DELIVERY_SOURCES
    ]

    evidence_titles = [item["title"] for item in source_evidence]
    tool_summary = _extract_tool_summary(tool_calls[-1])
    report_sections = [
        _build_report_section(
            report_section_id="report-section-revenue-gap-q2-core-conclusion",
            report_id=REPORT_ID,
            title="核心结论",
            content=(
                "华东收入异常主要由渠道确认延迟与库存错配共同造成，"
                "当前证据不支持把整体价格体系失效作为主结论。"
            ),
            occurred_at=occurred_at,
        ),
        _build_report_section(
            report_section_id="report-section-revenue-gap-q2-evidence",
            report_id=REPORT_ID,
            title="证据引用",
            content=(
                f"正式证据引用来自《{evidence_titles[0]}》与《{evidence_titles[1]}》，"
                f"并结合已持久化 ToolCall 结论“{tool_summary}”完成交付归档。"
            ),
            occurred_at=occurred_at,
        ),
        _build_report_section(
            report_section_id="report-section-revenue-gap-q2-next-step",
            report_id=REPORT_ID,
            title="下一步动作",
            content="先复核华东渠道确认周期，再联动盘点促销 SKU 的库存与交付节奏。",
            occurred_at=occurred_at,
        ),
    ]
    report: ReportRecord = {
        "reportId": REPORT_ID,
        "runId": analysis_run["runId"],
        "workspaceId": analysis_run["workspaceId"],
        "title": REPORT_TITLE,
        "summary": REPORT_SUMMARY,
        "sections": report_sections,
        "sourceEvidence": [item["sourceEvidenceId"] for item in source_evidence],
        "createdAt": occurred_at,
    }
    decision: DecisionRecord = {
        "decisionId": DECISION_ID,
        "workspaceId": analysis_run["workspaceId"],
        "runId": analysis_run["runId"],
        "reportId": report["reportId"],
        "title": DECISION_TITLE,
        "status": "proposed",
        "createdAt": occurred_at,
    }
    assistant_message: MessageRecord = {
        "messageId": _generate_canonical_id("message"),
        "conversationId": conversation["conversationId"],
        "analysisTaskId": analysis_run["analysisTaskId"],
        "turnId": _generate_canonical_id("turn"),
        "runId": analysis_run["runId"],
        "role": "assistant",
        "content": (
            f"{REPORT_SUMMARY}。证据来自《{evidence_titles[0]}》和《{evidence_titles[1]}》。"
            "建议优先复核渠道确认周期与库存错配。"
        ),
        "status": "completed",
        "sourceEvidenceIds": report["sourceEvidence"],
        "toolCallIds": [tool_call["toolCallId"] for tool_call in tool_calls],
        "reportId": report["reportId"],
        "createdAt": occurred_at,
        "completedAt": occurred_at,
    }

    _assert_no_duplicate_assistant_message(messages, analysis_run["runId"])

    return DeliveryArtifacts(
        assistant_message=assistant_message,
        decision=decision,
        report=report,
        source_evidence=source_evidence,
    )


def _resolve_required_source_nodes(root: InspectorTreeNode) -> dict[str, InspectorTreeNode]:
    by_document_id = {
        knowledge_document_id: node
        for node in _iter_nodes(root)
        for knowledge_document_id in [_get_knowledge_document_id(node)]
        if knowledge_document_id is not None
    }
    missing = [
        source_spec["knowledgeDocumentId"]
        for source_spec in REQUIRED_DELIVERY_SOURCES
        if source_spec["knowledgeDocumentId"] not in by_document_id
    ]
    if missing:
        raise DeliveryArtifactBuildError(
            "Missing required canonical knowledge document source refs in "
            "AnalysisTask.contextPack.root: " + ", ".join(missing)
        )

    available_context_refs = {
        (source_type, source_id)
        for node in _iter_nodes(root)
        for source_type, source_id in [_get_context_ref(node)]
        if source_type is not None and source_id is not None
    }
    missing_context_refs = [
        source_id
        for source_type, source_id in TRACEABLE_UPSTREAM_CONTEXT_REFS
        if (source_type, source_id) not in available_context_refs
    ]
    if missing_context_refs:
        raise DeliveryArtifactBuildError(
            "Missing required traceable upstream context refs in AnalysisTask.contextPack.root: "
            + ", ".join(missing_context_refs)
        )

    return by_document_id


def _build_source_evidence(
    *,
    analysis_run: AnalysisRunRecord,
    analysis_task: AnalysisTaskRecord,
    node: InspectorTreeNode,
    source_spec: dict[str, str],
    tool_calls: list[ToolCallRecord],
    model_calls: list[ModelCallRecord],
    occurred_at: str,
) -> SourceEvidenceRecord:
    snippet = node.get("summary") or source_spec["fallbackSnippet"]
    title = node.get("title") or source_spec["fallbackTitle"]

    metadata: dict[str, Any] = {
        "knowledgeDocumentId": source_spec["knowledgeDocumentId"],
        "toolCallIds": [tool_call["toolCallId"] for tool_call in tool_calls],
        "modelCallIds": [model_call["modelCallId"] for model_call in model_calls],
        "traceability": analysis_task["contextPack"]["traceability"]
        if analysis_task["contextPack"]
        else None,
        "upstreamContextRefs": [source_id for _, source_id in TRACEABLE_UPSTREAM_CONTEXT_REFS],
    }

    return {
        "sourceEvidenceId": source_spec["sourceEvidenceId"],
        "runId": analysis_run["runId"],
        "sourceType": "knowledge_document",
        "sourceId": source_spec["knowledgeDocumentId"],
        "title": title,
        "snippet": snippet,
        "metadata": metadata,
        "confidence": 0.86 if source_spec["sourceEvidenceId"].endswith("17") else 0.82,
        "createdAt": occurred_at,
    }


def _build_report_section(
    *,
    report_section_id: str,
    report_id: str,
    title: str,
    content: str,
    occurred_at: str,
) -> ReportSectionRecord:
    return {
        "reportSectionId": report_section_id,
        "reportId": report_id,
        "title": title,
        "content": content,
        "createdAt": occurred_at,
    }


def _assert_no_duplicate_assistant_message(
    messages: list[MessageRecord],
    run_id: str,
) -> None:
    if any(message["role"] == "assistant" and message["runId"] == run_id for message in messages):
        raise DeliveryArtifactBuildError(
            "Assistant Message already exists for runId "
            f"{run_id}; refusing duplicate delivery completion."
        )


def _extract_tool_summary(tool_call: ToolCallRecord) -> str:
    error_message = tool_call["errorMessage"]
    if isinstance(error_message, str) and error_message:
        return error_message

    output = tool_call["output"]
    if isinstance(output, dict):
        for key in ("conclusion", "summary", "result", "message"):
            value = output.get(key)
            if isinstance(value, str) and value.strip():
                return value

    return str(tool_call["toolName"])


def _iter_nodes(node: InspectorTreeNode) -> list[InspectorTreeNode]:
    nodes = [node]
    for child in node.get("children", []) or []:
        nodes.extend(_iter_nodes(child))
    return nodes


def _get_knowledge_document_id(node: InspectorTreeNode) -> str | None:
    source_ref = node.get("sourceRef")
    if not isinstance(source_ref, dict):
        return None
    if source_ref.get("type") != "knowledgeDocument":
        return None
    knowledge_document_id = source_ref.get("knowledgeDocumentId")
    return knowledge_document_id if isinstance(knowledge_document_id, str) else None


def _get_context_ref(node: InspectorTreeNode) -> tuple[str | None, str | None]:
    source_ref = node.get("sourceRef")
    if not isinstance(source_ref, dict):
        return (None, None)

    source_type = source_ref.get("type")
    if source_type == "metric":
        metric_id = source_ref.get("metricId")
        return ("metric", metric_id if isinstance(metric_id, str) else None)
    if source_type == "dataTable":
        table_id = source_ref.get("tableId")
        return ("dataTable", table_id if isinstance(table_id, str) else None)
    return (None, None)


def _generate_canonical_id(prefix: str) -> str:
    return f"{prefix}-{uuid4().hex}"


def utc_timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
