"""Read-only Tool Registry tool for compact AnalysisTask context summarization."""

from __future__ import annotations

from dataclasses import dataclass
from typing import TypedDict

from src.infrastructure.database.runtime_foundation import AnalysisTaskRecord, InspectorTreeNode


class AnalysisContextSummaryOutput(TypedDict):
    contextRootTitle: str | None
    question: str
    sourceCount: int
    summary: str
    traceability: str | None


@dataclass(frozen=True, slots=True)
class AnalysisContextSummaryTool:
    tool_name: str = "analysis_context_summary"

    def execute(self, analysis_task: AnalysisTaskRecord) -> AnalysisContextSummaryOutput:
        context_pack = analysis_task["contextPack"]
        question = analysis_task["question"]
        if context_pack is None:
            return {
                "contextRootTitle": None,
                "question": question,
                "sourceCount": 0,
                "summary": f"Question: {question}\nContext: no bound context pack.",
                "traceability": None,
            }

        root = context_pack["root"]
        source_lines = _collect_source_lines(root)
        context_root_title = root["title"]
        source_count = len(source_lines)
        traceability = context_pack["traceability"]
        summary_lines = [
            f"Question: {question}",
            f"Context root: {context_root_title}",
            f"Traceability: {traceability}",
        ]
        if source_lines:
            summary_lines.append("Bound context:")
            summary_lines.extend(f"- {line}" for line in source_lines[:8])
        else:
            summary_lines.append("Bound context: no source-ref nodes found.")
        return {
            "contextRootTitle": context_root_title,
            "question": question,
            "sourceCount": source_count,
            "summary": "\n".join(summary_lines),
            "traceability": traceability,
        }


def _collect_source_lines(node: InspectorTreeNode) -> list[str]:
    lines: list[str] = []
    source_ref = node.get("sourceRef")
    if isinstance(source_ref, dict):
        lines.append(f"{node['title']} [{_format_source_ref(source_ref)}]")

    for child in node.get("children", []) or []:
        lines.extend(_collect_source_lines(child))
    return lines


def _format_source_ref(source_ref: object) -> str:
    if not isinstance(source_ref, dict):
        return "unknown"

    source_type = source_ref.get("type")
    for key in (
        "metricId",
        "tableId",
        "knowledgeDocumentId",
        "sourceEvidenceId",
        "reportId",
        "toolCallId",
        "modelCallId",
        "runId",
    ):
        value = source_ref.get(key)
        if isinstance(value, str):
            return f"{source_type}:{value}"
    return str(source_type or "unknown")
