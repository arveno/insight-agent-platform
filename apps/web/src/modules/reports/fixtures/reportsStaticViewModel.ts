import { defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningRisk } from "../../../app/shell/fixtures/staticStateFixtures";
import type { ReportDetailViewModel, ReportListItemViewModel, ReportsViewModel } from "../models/reportsViewModel";

function toReportListItem(report: ReportDetailViewModel): ReportListItemViewModel {
  return {
    createdAt: report.createdAt,
    evidenceCount: report.evidenceCount,
    key: report.key,
    reportId: report.reportId,
    runId: report.runId,
    sectionCount: report.sectionCount,
    sourceContext: report.sourceContext,
    summary: report.summary,
    title: report.title,
    workspaceId: report.workspaceId
  };
}

export const reportCatalog: ReportDetailViewModel[] = [
  {
    actionSuggestions: [
      {
        actionSuggestionId: "action-suggestion-weekly-ops-review-1",
        decisionId: "decision-weekly-ops-review-discount-window",
        key: "action-suggestion-weekly-ops-review-1",
        summary: "复核华东渠道延迟订单和促销叠加时段，确认收入与毛利率偏差来源。"
      },
      {
        actionSuggestionId: "action-suggestion-weekly-ops-review-2",
        decisionId: "decision-weekly-ops-review-discount-window",
        key: "action-suggestion-weekly-ops-review-2",
        summary: "将证据摘要同步到下周经营会，并在 Analysis 中继续追问渠道和 SKU 结构。"
      }
    ],
    createdAt: "2026-06-04T09:30:00+08:00",
    decisions: [
      {
        actionSuggestions: ["优先压缩高折扣促销重叠区间", "保留高周转 SKU 的价格弹性空间"],
        decisionId: "decision-weekly-ops-review-discount-window",
        evidenceSummary: "证据集中指向华东促销叠加与核心 SKU 毛利率被稀释。",
        key: "decision-weekly-ops-review-discount-window",
        reportId: "report-weekly-operations-review",
        risk: warningRisk,
        runId: "run-weekly-operations-review",
        status: readyStatus,
        title: "优先控制高折扣促销档期"
      }
    ],
    evidenceCount: 3,
    feedbackEntrance: {
      key: "report-feedback-weekly-ops-review",
      targetId: "report-weekly-operations-review",
      targetType: "report",
      title: "提交反馈",
      types: ["useful", "incorrect", "source_insufficient"]
    },
    followUpAction: {
      intent: "navigation",
      key: "report-follow-up-weekly-ops-review",
      labelKey: "action.openInAnalysisWithContext.label",
      targetRoute: "analysis"
    },
    key: "report-weekly-operations-review",
    reportId: "report-weekly-operations-review",
    runId: "run-weekly-operations-review",
    sectionCount: 2,
    sections: [
      {
        content:
          "收入增速放缓主要集中在华东渠道，促销投放重叠导致折扣抬升，周转较慢的 SKU 放大了毛利率压力。",
        evidenceSummary: "关联 2 条指标证据和 1 条库存质检证据。",
        key: "report-section-weekly-ops-review-summary",
        reportId: "report-weekly-operations-review",
        reportSectionId: "report-section-weekly-ops-review-summary",
        title: "经营摘要"
      },
      {
        content:
          "若保持当前促销组合，预计下周毛利率仍会承压。优先回收重叠促销档期，再对低周转 SKU 做价格与补货联动。",
        evidenceSummary: "证据指向华东订单延迟、折扣叠加和库存积压风险。",
        key: "report-section-weekly-ops-review-margin",
        reportId: "report-weekly-operations-review",
        reportSectionId: "report-section-weekly-ops-review-margin",
        risk: warningRisk,
        title: "毛利率与促销影响"
      }
    ],
    sourceContext: "Northstar Retail China / Last 7 days / Weekly operations review",
    sourceEvidence: [
      {
        confidenceText: "高可信度",
        key: "report-source-evidence-weekly-ops-revenue",
        reportId: "report-weekly-operations-review",
        runId: "run-weekly-operations-review",
        sourceEvidenceId: "source-evidence-weekly-ops-revenue",
        sourceTypeLabel: "Metric",
        summary: "华东收入周报显示促销叠加期间收入增速下滑 6.4%。",
        title: "华东收入周报"
      },
      {
        confidenceText: "中可信度",
        key: "report-source-evidence-weekly-ops-margin",
        reportId: "report-weekly-operations-review",
        runId: "run-weekly-operations-review",
        sourceEvidenceId: "source-evidence-weekly-ops-margin",
        sourceTypeLabel: "Metric",
        summary: "促销叠加 SKU 的毛利率较基准周下降 3.1pct。",
        title: "毛利率波动指标"
      },
      {
        confidenceText: "中可信度",
        key: "report-source-evidence-weekly-ops-inventory",
        reportId: "report-weekly-operations-review",
        runId: "run-weekly-operations-review",
        sourceEvidenceId: "source-evidence-weekly-ops-inventory",
        sourceTypeLabel: "DataQualityCheck",
        summary: "库存周转监控提示促销末期积压 SKU 回落慢于预期。",
        title: "库存周转预警"
      }
    ],
    summary:
      "围绕收入增速放缓、毛利率波动和库存周转压力，沉淀本周经营复盘、关键证据与后续动作。",
    title: "周经营分析报告",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    actionSuggestions: [
      {
        actionSuggestionId: "action-suggestion-margin-review-1",
        decisionId: "decision-margin-review-campaign-spacing",
        key: "action-suggestion-margin-review-1",
        summary: "在 Analysis 中继续拆解促销档期、商品结构和门店区域差异。"
      }
    ],
    createdAt: "2026-06-03T18:10:00+08:00",
    decisions: [
      {
        actionSuggestions: ["缩短低毛利促销重叠周期", "对重点品类建立毛利率回收观察窗口"],
        decisionId: "decision-margin-review-campaign-spacing",
        evidenceSummary: "关键证据来自促销时序、类目结构和门店层级毛利率对比。",
        key: "decision-margin-review-campaign-spacing",
        reportId: "report-margin-retrospective",
        risk: warningRisk,
        runId: "run-margin-retrospective",
        status: readyStatus,
        title: "调整高频促销重叠策略"
      }
    ],
    evidenceCount: 2,
    feedbackEntrance: {
      key: "report-feedback-margin-retrospective",
      targetId: "report-margin-retrospective",
      targetType: "report",
      title: "提交反馈",
      types: ["useful", "incorrect"]
    },
    followUpAction: {
      intent: "navigation",
      key: "report-follow-up-margin-retrospective",
      labelKey: "action.openInAnalysisWithContext.label",
      targetRoute: "analysis"
    },
    key: "report-margin-retrospective",
    reportId: "report-margin-retrospective",
    runId: "run-margin-retrospective",
    sectionCount: 2,
    sections: [
      {
        content:
          "本季度毛利率波动主要由高频促销叠加和高折扣品类结构偏移带动，门店层级差异较明显。",
        evidenceSummary: "覆盖促销档期和门店毛利率对比。",
        key: "report-section-margin-retrospective-summary",
        reportId: "report-margin-retrospective",
        reportSectionId: "report-section-margin-retrospective-summary",
        title: "波动复盘"
      },
      {
        content:
          "建议将高折扣促销窗口错开，并在重点区域建立促销与毛利率联动复盘节奏。",
        evidenceSummary: "证据聚焦促销叠加时序与重点区域表现。",
        key: "report-section-margin-retrospective-recommendation",
        reportId: "report-margin-retrospective",
        reportSectionId: "report-section-margin-retrospective-recommendation",
        risk: warningRisk,
        title: "调整建议"
      }
    ],
    sourceContext: "Northstar Retail China / This quarter / Margin retrospective",
    sourceEvidence: [
      {
        confidenceText: "高可信度",
        key: "report-source-evidence-margin-retrospective-timeline",
        reportId: "report-margin-retrospective",
        runId: "run-margin-retrospective",
        sourceEvidenceId: "source-evidence-margin-retrospective-timeline",
        sourceTypeLabel: "Metric",
        summary: "促销日历与毛利率趋势交叉后，重叠周的毛利率波动最显著。",
        title: "促销时序对比"
      },
      {
        confidenceText: "中可信度",
        key: "report-source-evidence-margin-retrospective-stores",
        reportId: "report-margin-retrospective",
        runId: "run-margin-retrospective",
        sourceEvidenceId: "source-evidence-margin-retrospective-stores",
        sourceTypeLabel: "KnowledgeDocument",
        summary: "门店复盘记录显示重点区域对高折扣活动依赖度偏高。",
        title: "门店复盘记录"
      }
    ],
    summary: "复盘本季度毛利率波动，并沉淀促销节奏和商品结构的关键判断。",
    title: "毛利率复盘报告",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    actionSuggestions: [
      {
        actionSuggestionId: "action-suggestion-inventory-tracking-1",
        decisionId: "decision-inventory-tracking-clearance-window",
        key: "action-suggestion-inventory-tracking-1",
        summary: "追问高库存 SKU 的渠道分布，并同步到下一轮补货与清仓评审。"
      }
    ],
    createdAt: "2026-06-02T16:20:00+08:00",
    decisions: [
      {
        actionSuggestions: ["安排高库存 SKU 清仓窗口", "补货策略改为按区域分层控制"],
        decisionId: "decision-inventory-tracking-clearance-window",
        evidenceSummary: "证据集中在高库存 SKU 周转放缓和区域积压差异。",
        key: "decision-inventory-tracking-clearance-window",
        reportId: "report-inventory-exception-tracking",
        risk: warningRisk,
        runId: "run-inventory-exception-tracking",
        status: readyStatus,
        title: "优先处理高库存 SKU 清仓节奏"
      }
    ],
    evidenceCount: 2,
    feedbackEntrance: {
      key: "report-feedback-inventory-exception-tracking",
      targetId: "report-inventory-exception-tracking",
      targetType: "report",
      title: "提交反馈",
      types: ["useful", "incorrect"]
    },
    followUpAction: {
      intent: "navigation",
      key: "report-follow-up-inventory-exception-tracking",
      labelKey: "action.openInAnalysisWithContext.label",
      targetRoute: "analysis"
    },
    key: "report-inventory-exception-tracking",
    reportId: "report-inventory-exception-tracking",
    runId: "run-inventory-exception-tracking",
    sectionCount: 2,
    sections: [
      {
        content:
          "库存异常集中在低周转品类，区域仓与门店补货节奏不一致，导致积压 SKU 持续上升。",
        evidenceSummary: "聚焦区域仓库存和门店动销差异。",
        key: "report-section-inventory-tracking-summary",
        reportId: "report-inventory-exception-tracking",
        reportSectionId: "report-section-inventory-tracking-summary",
        title: "异常概览"
      },
      {
        content:
          "建议先做高库存 SKU 清仓，再重新校准区域补货上限，避免下周再次积压。",
        evidenceSummary: "证据表明库存异常与补货节奏错配同时出现。",
        key: "report-section-inventory-tracking-action",
        reportId: "report-inventory-exception-tracking",
        reportSectionId: "report-section-inventory-tracking-action",
        risk: warningRisk,
        title: "行动重点"
      }
    ],
    sourceContext: "Northstar Retail China / Last 14 days / Inventory exception tracking",
    sourceEvidence: [
      {
        confidenceText: "高可信度",
        key: "report-source-evidence-inventory-tracking-warehouse",
        reportId: "report-inventory-exception-tracking",
        runId: "run-inventory-exception-tracking",
        sourceEvidenceId: "source-evidence-inventory-tracking-warehouse",
        sourceTypeLabel: "DataTable",
        summary: "区域仓库存监控显示高库存 SKU 在华东与华南仓持续堆积。",
        title: "区域仓库存监控"
      },
      {
        confidenceText: "中可信度",
        key: "report-source-evidence-inventory-tracking-replenishment",
        reportId: "report-inventory-exception-tracking",
        runId: "run-inventory-exception-tracking",
        sourceEvidenceId: "source-evidence-inventory-tracking-replenishment",
        sourceTypeLabel: "KnowledgeDocument",
        summary: "补货策略说明记录了门店补货上限与仓储节奏失配。",
        title: "补货策略说明"
      }
    ],
    summary: "跟踪库存积压与补货错配，沉淀异常定位、证据与清仓优先级建议。",
    title: "库存异常跟踪报告",
    workspaceId: "workspace-northstar-retail-china"
  }
];

const defaultSelectedReport = reportCatalog[0];

export function createReportsViewModel(selectedReportKey = defaultSelectedReport.key): ReportsViewModel {
  const selectedDetail =
    reportCatalog.find((report) => report.key === selectedReportKey) ?? defaultSelectedReport;

  return {
    actionSuggestions: selectedDetail.actionSuggestions,
    decisions: selectedDetail.decisions,
    feedbackEntrance: selectedDetail.feedbackEntrance,
    followUpAction: selectedDetail.followUpAction,
    lastUpdatedAt: selectedDetail.createdAt,
    mainSections: [
      {
        descriptionKey: "page.reports.section.reportReader.description",
        key: "report-reader",
        status: readyStatus,
        titleKey: "page.reports.section.reportReader.title"
      },
      {
        descriptionKey: "page.reports.section.sourceEvidence.description",
        key: "source-evidence",
        status: readyStatus,
        titleKey: "page.reports.section.sourceEvidence.title"
      },
      {
        descriptionKey: "page.reports.section.decisionAction.description",
        key: "decision-action",
        status: readyStatus,
        titleKey: "page.reports.section.decisionAction.title"
      }
    ],
    metricCards: [],
    pageDescriptionKey: "page.reports.description",
    pageKey: "reports",
    pageTitleKey: "page.reports.title",
    permissionSummary: defaultPermissionSummary,
    primaryAction: {
      intent: "navigation",
      key: "reports-open-analysis",
      labelKey: "action.reportsOpenAnalysis.label",
      targetRoute: "analysis"
    },
    readonlyState: defaultReadonlyState,
    reportSections: selectedDetail.sections,
    reports: reportCatalog.map((report) => toReportListItem(report)),
    reportsState: defaultStateCoverage.ready,
    rightAssistSummary: {
      descriptionKey: "page.reports.rightAssist.description",
      evidence: [],
      key: "reports-right-assist",
      links: [selectedDetail.followUpAction],
      risk: warningRisk,
      status: readyStatus,
      titleKey: "page.reports.rightAssist.title"
    },
    secondaryActions: [
      {
        intent: "navigation",
        key: "reports-open-evaluation",
        labelKey: "action.reportsOpenEvaluation.label",
        targetRoute: "evaluation"
      }
    ],
    selectedReport: toReportListItem(selectedDetail),
    sourceEvidence: selectedDetail.sourceEvidence,
    stateCoverage: defaultStateCoverage,
    summaryCards: []
  };
}

export const reportsStaticViewModel = createReportsViewModel();
