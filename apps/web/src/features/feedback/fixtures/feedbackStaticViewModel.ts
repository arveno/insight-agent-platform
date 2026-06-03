import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../app/fixtures";
import type { FeedbackViewModel } from "../models";

const feedbackItem = {
  description: "用户对报告结论的反馈摘要。",
  key: "feedback-source-insufficient",
  label: "证据不足反馈",
  risk: warningRisk,
  status: readyStatus,
  value: "source_insufficient"
};

export const feedbackStaticViewModel: FeedbackViewModel = {
  badCaseEntrances: [
    { description: "BadCase 跳转入口，执行归 Evaluation。", key: "feedback-bad-case", label: "BadCase 入口", linkTo: "evaluation", status: readyStatus, value: "1" }
  ],
  correctionDetail: {
    description: "人工纠错详情只作为静态摘要。",
    key: "correction-detail",
    label: "纠错详情",
    status: readyStatus,
    value: "补充证据来源"
  },
  feedbackDetail: feedbackItem,
  feedbackItems: [feedbackItem],
  feedbackOverview: [
    { description: "Feedback 是用户对结果的反馈，不等于 Memory 或 Evaluation。", key: "feedback-overview", label: "反馈概览", status: readyStatus, value: "18" }
  ],
  feedbackState: defaultStateCoverage.ready,
  feedbackTypeFilters: [
    { description: "反馈类型筛选。", key: "feedback-type-source", label: "source_insufficient", status: readyStatus, value: "6" }
  ],
  gapNote: "FeedbackType 聚合和目标对象上下文为 Gap；不写入 Memory / Evaluation。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:20:00+08:00",
  mainSections: [
    { description: "Feedback 列表和类型筛选。", key: "feedback-list", status: readyStatus, title: "Feedback List" },
    { description: "人工纠错详情和目标对象上下文。", key: "correction-detail", status: readyStatus, title: "Correction Detail" },
    { description: "BadCase 和 RightAssistPanel 输入。", key: "bad-case-entry", status: readyStatus, title: "BadCase Entrances" }
  ],
  metricCards: [
    { key: "feedback-count", label: "反馈数", risk: warningRisk, status: readyStatus, valueText: "18" }
  ],
  pageDescription: "反馈列表、反馈类型、人工纠错详情和 BadCase 入口的静态数据。",
  pageKey: "feedback",
  pageTitle: "Feedback",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "feedback-open-evaluation",
    label: "进入评估",
    targetRoute: "evaluation"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "feedback-right-assist",
    "Feedback 辅助摘要",
    "承接 selected feedback、correction detail、target object 和 BadCase 入口。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "feedback-open-reports", label: "查看报告", targetRoute: "reports" }
  ],
  selectedFeedback: feedbackItem,
  selectedFeedbackType: "source_insufficient",
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "反馈静态摘要。", key: "feedback-summary", label: "待处理反馈", risk: warningRisk, status: readyStatus, value: "6" }
  ],
  targetObjectContext: {
    description: "目标对象上下文只保留 ID 与摘要，不读取 raw report。",
    key: "feedback-target-report",
    label: "目标报告",
    linkTo: "reports",
    status: readyStatus,
    value: "report-weekly-business"
  }
};
