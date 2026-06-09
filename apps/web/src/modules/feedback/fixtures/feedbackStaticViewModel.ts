import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../shared/view-model/staticStateFixtures";
import type { FeedbackViewModel } from "../models/feedbackViewModel";

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
    {
      description: "BadCase 跳转入口，执行归 Evaluation。",
      key: "feedback-bad-case",
      label: "BadCase 入口",
      linkTo: "evaluation",
      status: readyStatus,
      value: "1"
    }
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
    {
      description: "Feedback 是用户对结果的反馈，不等于 Memory 或 Evaluation。",
      key: "feedback-overview",
      label: "反馈概览",
      status: readyStatus,
      value: "18"
    }
  ],
  feedbackState: defaultStateCoverage.ready,
  feedbackTypeFilters: [
    {
      description: "反馈类型筛选。",
      key: "feedback-type-source",
      label: "source_insufficient",
      status: readyStatus,
      value: "6"
    }
  ],
  gapNote: "FeedbackType 聚合和目标对象上下文为 Gap；不写入 Memory / Evaluation。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:20:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.feedback.section.feedbackList.description",
      key: "feedback-list",
      status: readyStatus,
      titleKey: "page.feedback.section.feedbackList.title"
    },
    {
      descriptionKey: "page.feedback.section.correctionDetail.description",
      key: "correction-detail",
      status: readyStatus,
      titleKey: "page.feedback.section.correctionDetail.title"
    },
    {
      descriptionKey: "page.feedback.section.badCaseEntry.description",
      key: "bad-case-entry",
      status: readyStatus,
      titleKey: "page.feedback.section.badCaseEntry.title"
    }
  ],
  metricCards: [
    {
      key: "feedback-count",
      label: "反馈数",
      risk: warningRisk,
      status: readyStatus,
      valueText: "18"
    }
  ],
  pageDescriptionKey: "page.feedback.description",
  pageKey: "feedback",
  pageTitleKey: "page.feedback.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "feedback-open-evaluation",
    labelKey: "action.feedbackOpenEvaluation.label",
    targetRoute: "evaluation"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "feedback-right-assist",
    "page.feedback.rightAssist.title",
    "page.feedback.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "feedback-open-reports",
      labelKey: "action.feedbackOpenReports.label",
      targetRoute: "reports"
    }
  ],
  selectedFeedback: feedbackItem,
  selectedFeedbackType: "source_insufficient",
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "反馈静态摘要。",
      key: "feedback-summary",
      label: "待处理反馈",
      risk: warningRisk,
      status: readyStatus,
      value: "6"
    }
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
