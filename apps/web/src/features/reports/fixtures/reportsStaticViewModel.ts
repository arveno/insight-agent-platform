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
    label: "基于报告继续追问",
    targetRoute: "analysis"
  },
  gapNote: "Report reader state、Feedback submit state、Follow-up context 为 Surface Contract Gap。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:05:00+08:00",
  mainSections: [
    { description: "展示报告列表和当前报告摘要。", key: "report-list", status: readyStatus, title: "Report List" },
    { description: "展示正式报告阅读区，不展示模型原始输出。", key: "report-reader", status: readyStatus, title: "Report Reader" },
    { description: "展示段落证据、决策建议、反馈和 Follow-up 入口。", key: "report-section", status: readyStatus, title: "ReportSection" }
  ],
  metricCards: [],
  pageDescription: "正式报告阅读、证据追溯、决策建议、反馈和结果追问入口的静态数据。",
  pageKey: "reports",
  pageTitle: "Reports",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "reports-open-analysis",
    label: "基于报告追问",
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
    "Reports 辅助摘要",
    "承接 selected report、ReportSection、Evidence、Decision、Feedback 和 Follow-up 上下文。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "reports-open-feedback", label: "查看反馈", targetRoute: "feedback" },
    { intent: "navigation", key: "reports-open-evaluation", label: "查看评估", targetRoute: "evaluation" }
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
