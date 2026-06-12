"""职责：
承载报告生成和报告结构化写入工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 Report Tool 边界；
下游是 reports domain、Report contract 和 SourceEvidence。

边界：
允许按报告契约组织章节、摘要和证据引用；不允许在工具内绕过 contracts 输出临时报告结构。

原因：
报告是正式交付物，必须保持结构、字段和证据链稳定，便于前端展示和后续决策追踪。
"""

from __future__ import annotations

from dataclasses import dataclass

from src.infrastructure.database.runtime_foundation import (
    AnalysisRunRecord,
    DecisionRecord,
    ReportRecord,
    ReportSectionRecord,
)


@dataclass(frozen=True, slots=True)
class FoundationReportArtifacts:
    """Structured report outputs for the delivery foundation slice."""

    report: ReportRecord
    decision: DecisionRecord


def build_foundation_report_artifacts(
    *,
    analysis_run: AnalysisRunRecord,
    source_evidence_ids: list[str],
    occurred_at: str,
) -> FoundationReportArtifacts:
    report_id = f"report-{analysis_run['runId']}"
    report_section: ReportSectionRecord = {
        "reportSectionId": f"report-section-{analysis_run['runId']}-next-step",
        "reportId": report_id,
        "title": "下一步动作",
        "content": "先核对渠道确认周期，再复核促销库存错配。",
        "createdAt": occurred_at,
    }
    report: ReportRecord = {
        "reportId": report_id,
        "runId": analysis_run["runId"],
        "workspaceId": analysis_run["workspaceId"],
        "title": "收入异常分析摘要",
        "summary": "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作。",
        "sections": [report_section],
        "sourceEvidence": source_evidence_ids,
        "createdAt": occurred_at,
    }
    decision: DecisionRecord = {
        "decisionId": f"decision-{analysis_run['runId']}",
        "workspaceId": analysis_run["workspaceId"],
        "runId": analysis_run["runId"],
        "reportId": report_id,
        "title": "复核华东渠道确认周期与促销库存错配",
        "status": "proposed",
        "createdAt": occurred_at,
    }
    return FoundationReportArtifacts(report=report, decision=decision)
