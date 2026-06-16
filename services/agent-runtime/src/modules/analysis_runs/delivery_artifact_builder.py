from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from hashlib import sha1
from typing import Any

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
from src.modules.analysis_runs.message_streaming import (
    generate_assistant_message_id,
    is_delivery_promotable_placeholder,
)

SOURCE_PRIORITY = {
    "knowledgeDocument": 0,
    "knowledgeChunk": 1,
    "dataTable": 2,
    "metric": 3,
}


class DeliveryArtifactBuildError(RuntimeError):
    """Raised when persisted runtime state cannot produce honest delivery artifacts."""


@dataclass(frozen=True, slots=True)
class DeliveryArtifacts:
    assistant_message: MessageRecord
    decision: DecisionRecord
    report: ReportRecord
    source_evidence: list[SourceEvidenceRecord]


@dataclass(frozen=True, slots=True)
class SourceEvidenceCandidate:
    node: InspectorTreeNode
    source_id: str
    source_ref: dict[str, Any]
    source_type: str


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

    succeeded_tool_calls = _require_succeeded_tool_calls(tool_calls)
    succeeded_model_calls = _require_succeeded_model_calls(model_calls)
    _require_run_event(run_events, "tool_call.completed")
    _require_run_event(run_events, "model_call.completed")
    _require_run_event(run_events, "synthesis.started")

    user_submit_message = _require_user_submit_message(
        messages=messages,
        analysis_task_id=analysis_run["analysisTaskId"],
        run_id=analysis_run["runId"],
    )

    source_candidates = _collect_source_evidence_candidates(context_pack["root"])
    if not source_candidates:
        raise DeliveryArtifactBuildError(
            "AnalysisTask.contextPack.root must contain at least one usable sourceRef "
            "before delivery artifacts can be generated."
        )

    source_evidence = [
        _build_source_evidence(
            analysis_run=analysis_run,
            analysis_task=analysis_task,
            candidate=candidate,
            model_calls=succeeded_model_calls,
            occurred_at=occurred_at,
            tool_calls=succeeded_tool_calls,
        )
        for candidate in source_candidates
    ]

    report_id = f"report-{analysis_run['runId']}"
    report_title = _build_report_title(conversation=conversation, analysis_task=analysis_task)
    report_summary = (
        f"围绕“{_report_subject(conversation=conversation, analysis_task=analysis_task)}”"
        f"整理了 {len(source_evidence)} 条可追溯来源，并结合 "
        f"{len(succeeded_tool_calls)} 次 ToolCall 与 {len(succeeded_model_calls)} 次 ModelCall "
        "形成正式交付结论。"
    )
    report_sections = _build_report_sections(
        analysis_task=analysis_task,
        model_calls=succeeded_model_calls,
        occurred_at=occurred_at,
        report_id=report_id,
        source_evidence=source_evidence,
        tool_calls=succeeded_tool_calls,
    )
    report: ReportRecord = {
        "reportId": report_id,
        "runId": analysis_run["runId"],
        "workspaceId": analysis_run["workspaceId"],
        "title": report_title,
        "summary": report_summary,
        "sections": report_sections,
        "sourceEvidence": [item["sourceEvidenceId"] for item in source_evidence],
        "createdAt": occurred_at,
    }
    decision_title = (
        f"{_report_subject(conversation=conversation, analysis_task=analysis_task)} 下一步决策"
    )
    decision: DecisionRecord = {
        "decisionId": f"decision-{analysis_run['runId']}",
        "workspaceId": analysis_run["workspaceId"],
        "runId": analysis_run["runId"],
        "reportId": report["reportId"],
        "title": decision_title,
        "status": "proposed",
        "createdAt": occurred_at,
    }
    assistant_message_content = (
        f"{report_summary} "
        f"当前正式证据包括 {len(source_evidence)} 条来源，"
        f"可直接进入《{report['title']}》与决策节点继续跟进。"
    )
    assistant_message = _build_delivery_assistant_message(
        analysis_run=analysis_run,
        analysis_task=analysis_task,
        messages=messages,
        occurred_at=occurred_at,
        report=report,
        succeeded_tool_calls=succeeded_tool_calls,
        conversation=conversation,
        turn_id=user_submit_message["turnId"],
        content=assistant_message_content,
    )

    return DeliveryArtifacts(
        assistant_message=assistant_message,
        decision=decision,
        report=report,
        source_evidence=source_evidence,
    )


def _require_succeeded_tool_calls(tool_calls: list[ToolCallRecord]) -> list[ToolCallRecord]:
    succeeded = [tool_call for tool_call in tool_calls if tool_call["status"] == "succeeded"]
    if not succeeded:
        raise DeliveryArtifactBuildError(
            "At least one succeeded ToolCall is required before delivery artifacts can be built."
        )
    return succeeded


def _require_succeeded_model_calls(model_calls: list[ModelCallRecord]) -> list[ModelCallRecord]:
    succeeded = [model_call for model_call in model_calls if model_call["status"] == "succeeded"]
    if not succeeded:
        raise DeliveryArtifactBuildError(
            "At least one succeeded ModelCall is required before delivery artifacts can be built."
        )
    return succeeded


def _require_run_event(run_events: list[RunEventRecord], event_type: str) -> None:
    matching_events = [event for event in run_events if event["eventType"] == event_type]
    if not matching_events:
        raise DeliveryArtifactBuildError(
            f"Persisted RunEvent trace must include {event_type} before delivery."
        )
    if event_type.endswith(".completed") and not any(
        event["completedAt"] is not None for event in matching_events
    ):
        raise DeliveryArtifactBuildError(
            f"Persisted RunEvent trace must include a completed {event_type} before delivery."
        )


def _require_user_submit_message(
    *,
    messages: list[MessageRecord],
    analysis_task_id: str,
    run_id: str,
) -> MessageRecord:
    for message in messages:
        if (
            message["role"] == "user"
            and message["analysisTaskId"] == analysis_task_id
            and message["runId"] == run_id
        ):
            return message

    raise DeliveryArtifactBuildError(
        "Persisted delivery state is missing the original user submit message turnId "
        "for the current conversationId / analysisTaskId / runId."
    )


def _collect_source_evidence_candidates(root: InspectorTreeNode) -> list[SourceEvidenceCandidate]:
    candidates_by_key: dict[tuple[str, str], tuple[int, int, SourceEvidenceCandidate]] = {}

    for index, node in enumerate(_iter_nodes(root)):
        source_ref = node.get("sourceRef")
        candidate = _build_source_candidate(node=node, source_ref=source_ref)
        if candidate is None:
            continue
        priority = SOURCE_PRIORITY[source_ref["type"]]
        dedupe_key = (candidate.source_type, candidate.source_id)
        existing = candidates_by_key.get(dedupe_key)
        if existing is None or priority < existing[0]:
            candidates_by_key[dedupe_key] = (priority, index, candidate)

    ordered_candidates = sorted(candidates_by_key.values(), key=lambda item: (item[0], item[1]))
    return [candidate for _, _, candidate in ordered_candidates]


def _build_source_candidate(
    *,
    node: InspectorTreeNode,
    source_ref: object,
) -> SourceEvidenceCandidate | None:
    if not isinstance(source_ref, dict):
        return None

    source_type = source_ref.get("type")
    if source_type not in SOURCE_PRIORITY:
        return None

    if source_type == "knowledgeDocument":
        source_id = source_ref.get("knowledgeDocumentId")
        evidence_source_type = "knowledge_document"
    elif source_type == "knowledgeChunk":
        source_id = source_ref.get("knowledgeChunkId")
        evidence_source_type = "knowledge_chunk"
    elif source_type == "dataTable":
        source_id = source_ref.get("tableId")
        evidence_source_type = "data_table"
    else:
        source_id = source_ref.get("metricId")
        evidence_source_type = "metric"

    if not isinstance(source_id, str) or not source_id.strip():
        return None

    return SourceEvidenceCandidate(
        node=node,
        source_id=source_id,
        source_ref=source_ref,
        source_type=evidence_source_type,
    )


def _build_source_evidence(
    *,
    analysis_run: AnalysisRunRecord,
    analysis_task: AnalysisTaskRecord,
    candidate: SourceEvidenceCandidate,
    model_calls: list[ModelCallRecord],
    occurred_at: str,
    tool_calls: list[ToolCallRecord],
) -> SourceEvidenceRecord:
    metadata: dict[str, Any] = {
        "nodeId": candidate.node["nodeId"],
        "sourceId": candidate.source_id,
        "sourceRef": candidate.source_ref,
        "sourceType": candidate.source_type,
        "toolCallIds": [tool_call["toolCallId"] for tool_call in tool_calls],
        "modelCallIds": [model_call["modelCallId"] for model_call in model_calls],
        "traceability": analysis_task["contextPack"]["traceability"]
        if analysis_task["contextPack"] is not None
        else None,
    }

    return {
        "sourceEvidenceId": _build_source_evidence_id(
            run_id=analysis_run["runId"],
            source_type=candidate.source_type,
            source_id=candidate.source_id,
        ),
        "runId": analysis_run["runId"],
        "sourceType": candidate.source_type,
        "sourceId": candidate.source_id,
        "title": candidate.node.get("title") or candidate.source_id,
        "snippet": _build_snippet(candidate.node),
        "metadata": metadata,
        "confidence": _confidence_for_source_type(candidate.source_type),
        "createdAt": occurred_at,
    }


def _build_report_sections(
    *,
    analysis_task: AnalysisTaskRecord,
    model_calls: list[ModelCallRecord],
    occurred_at: str,
    report_id: str,
    source_evidence: list[SourceEvidenceRecord],
    tool_calls: list[ToolCallRecord],
) -> list[ReportSectionRecord]:
    evidence_titles = "、".join(f"《{item['title']}》" for item in source_evidence[:3])
    if len(source_evidence) > 3:
        evidence_titles = f"{evidence_titles} 等 {len(source_evidence)} 条来源"

    tool_summary = _extract_tool_summary(tool_calls[-1])
    model_call = model_calls[-1]
    run_id = tool_calls[-1]["runId"]

    return [
        _build_report_section(
            report_section_id=f"report-section-{run_id}-core-conclusion",
            report_id=report_id,
            title="核心结论",
            content=(
                f"当前问题“{analysis_task['question']}”已完成 delivery 前置校验，"
                f"并基于 {len(tool_calls)} 次 succeeded ToolCall 与 "
                f"{len(model_calls)} 次 succeeded ModelCall 进入正式交付。"
            ),
            occurred_at=occurred_at,
        ),
        _build_report_section(
            report_section_id=f"report-section-{run_id}-evidence",
            report_id=report_id,
            title="证据引用",
            content=(
                f"正式证据引用来自 {evidence_titles}。"
                f"最近一次 ToolCall 摘要为“{tool_summary}”，"
                f"最近一次 ModelCall 由 {model_call['provider']} / {model_call['modelId']} 完成。"
            ),
            occurred_at=occurred_at,
        ),
        _build_report_section(
            report_section_id=f"report-section-{run_id}-next-step",
            report_id=report_id,
            title="下一步动作",
            content=(
                "基于当前 report、decision 与已持久化 SourceEvidence，"
                "优先复核最高优先级来源，再继续扩展 follow-up 分析。"
            ),
            occurred_at=occurred_at,
        ),
    ]


def _build_report_title(
    *,
    conversation: ConversationRecord,
    analysis_task: AnalysisTaskRecord,
) -> str:
    return f"{_report_subject(conversation=conversation, analysis_task=analysis_task)} 分析报告"


def _report_subject(
    *,
    conversation: ConversationRecord,
    analysis_task: AnalysisTaskRecord,
) -> str:
    conversation_title: str = conversation["title"]
    if conversation_title.strip():
        return conversation_title

    question: str = analysis_task["question"]
    return question


def _build_source_evidence_id(*, run_id: str, source_type: str, source_id: str) -> str:
    digest = sha1(f"{source_type}:{source_id}".encode()).hexdigest()[:16]
    return f"source-evidence-{run_id}-{digest}"


def _build_delivery_assistant_message(
    *,
    analysis_run: AnalysisRunRecord,
    analysis_task: AnalysisTaskRecord,
    messages: list[MessageRecord],
    occurred_at: str,
    report: ReportRecord,
    succeeded_tool_calls: list[ToolCallRecord],
    conversation: ConversationRecord,
    turn_id: str,
    content: str,
) -> MessageRecord:
    assistant_messages = [
        message
        for message in messages
        if message["role"] == "assistant" and message["runId"] == analysis_run["runId"]
    ]
    tool_call_ids = [tool_call["toolCallId"] for tool_call in succeeded_tool_calls]
    deterministic_message_id = generate_assistant_message_id(run_id=analysis_run["runId"])

    if not assistant_messages:
        return {
            "messageId": deterministic_message_id,
            "conversationId": conversation["conversationId"],
            "analysisTaskId": analysis_run["analysisTaskId"],
            "turnId": turn_id,
            "runId": analysis_run["runId"],
            "role": "assistant",
            "content": content,
            "status": "completed",
            "sourceEvidenceIds": report["sourceEvidence"],
            "toolCallIds": tool_call_ids,
            "reportId": report["reportId"],
            "createdAt": occurred_at,
            "completedAt": occurred_at,
        }

    if len(assistant_messages) != 1:
        raise DeliveryArtifactBuildError(
            "Delivery completion requires at most one assistant_message per runId before "
            "placeholder promotion."
        )

    placeholder_message = assistant_messages[0]
    if not is_delivery_promotable_placeholder(
        placeholder_message,
        analysis_task_id=analysis_task["analysisTaskId"],
        conversation_id=conversation["conversationId"],
        run_id=analysis_run["runId"],
        turn_id=turn_id,
    ):
        raise DeliveryArtifactBuildError(
            "assistant_message already exists for runId "
            f"{analysis_run['runId']} but does not satisfy placeholder promotion rules."
        )

    return {
        **placeholder_message,
        "content": content,
        "status": "completed",
        "sourceEvidenceIds": report["sourceEvidence"],
        "toolCallIds": tool_call_ids,
        "reportId": report["reportId"],
        "completedAt": occurred_at,
    }


def _build_snippet(node: InspectorTreeNode) -> str:
    for field in ("summary", "description", "title"):
        value = node.get(field)
        if isinstance(value, str) and value.strip():
            return value

    node_id: str = node["nodeId"]
    return node_id


def _confidence_for_source_type(source_type: str) -> float:
    if source_type == "knowledge_document":
        return 0.86
    if source_type == "knowledge_chunk":
        return 0.84
    if source_type == "data_table":
        return 0.82
    return 0.8


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


def _extract_tool_summary(tool_call: ToolCallRecord) -> str:
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


def utc_timestamp() -> str:
    return datetime.now(UTC).isoformat().replace("+00:00", "Z")
