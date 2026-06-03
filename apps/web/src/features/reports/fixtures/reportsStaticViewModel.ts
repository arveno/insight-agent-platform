import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedEvidenceEntrances,
  warningRisk
} from "../../../app/fixtures";
import type { ReportsViewModel } from "../models";

export const reportsStaticViewModel: ReportsViewModel = {
  actionSuggestions: ["复核华东渠道延迟订单", "将证据同步到下周经营会"],
  decisionSummary: [
    {
      actionSuggestions: ["进入 Feedback 记录人工判断"],
      decisionId: "decision-channel-delay",
      key: "decision-channel-delay",
      risk: warningRisk,
      status: readyStatus,
      title: "延迟订单需要人工复核"
    }
  ],
  feedbackEntrance: {
    key: "report-feedback",
    targetId: "report-weekly-business",
    targetType: "report",
    title: "报告反馈入口",
    types: ["useful", "incorrect", "source_insufficient"]
  },
  followUpContext: {
    intent: "navigation",
    key: "report-follow-up",
    labelKey: "action.reportFollowUp.label",
    targetRoute: "analysis"
  },
  gapNote:
    "Report reader state、Feedback submit state、Follow-up context 为 Surface Contract Gap。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:05:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.reports.section.reportList.description",
      key: "report-list",
      status: readyStatus,
      titleKey: "page.reports.section.reportList.title"
    },
    {
      descriptionKey: "page.reports.section.reportReader.description",
      key: "report-reader",
      status: readyStatus,
      titleKey: "page.reports.section.reportReader.title"
    },
    {
      descriptionKey: "page.reports.section.reportSection.description",
      key: "report-section",
      status: readyStatus,
      titleKey: "page.reports.section.reportSection.title"
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
  reportReader: {
    description: "报告阅读器状态只作为静态展示模型。",
    key: "report-reader-state",
    label: "Reader",
    status: readyStatus,
    value: "section-2"
  },
  reportSections: [
    {
      description: "收入异常原因、证据引用和风险提示。",
      key: "report-section-revenue",
      label: "收入增速分析",
      risk: warningRisk,
      status: readyStatus,
      value: "3 个证据引用"
    }
  ],
  reportsList: [
    {
      evidenceCount: 5,
      key: "weekly-business-report",
      reportId: "report-weekly-business",
      status: readyStatus,
      title: "周经营分析报告",
      updatedAt: "2026-06-03T17:30:00+08:00"
    }
  ],
  reportsState: defaultStateCoverage.ready,
  rightAssistSummary: createRightAssistSummary(
    "reports-right-assist",
    "page.reports.rightAssist.title",
    "page.reports.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "reports-open-feedback",
      labelKey: "action.reportsOpenFeedback.label",
      targetRoute: "feedback"
    },
    {
      intent: "navigation",
      key: "reports-open-evaluation",
      labelKey: "action.reportsOpenEvaluation.label",
      targetRoute: "evaluation"
    }
  ],
  selectedReport: {
    evidenceCount: 5,
    key: "weekly-business-report",
    reportId: "report-weekly-business",
    status: readyStatus,
    title: "周经营分析报告",
    updatedAt: "2026-06-03T17:30:00+08:00"
  },
  sourceEvidenceEntrances: sharedEvidenceEntrances,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "Reports 只展示正式报告阅读与可信入口。",
      key: "reports-summary",
      label: "报告数量",
      risk: warningRisk,
      status: readyStatus,
      value: "4"
    }
  ]
};
