import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { EvaluationViewModel } from "../models";

const dataset = {
  description: "EvaluationDataset 摘要，不执行真实评估。",
  key: "dataset-revenue-cases",
  label: "Revenue regression set",
  status: readyStatus,
  value: "32 cases"
};

const badCase = {
  description: "BadCase 摘要来自静态闭环数据。",
  key: "bad-case-source-insufficient",
  label: "证据不足结果",
  risk: warningRisk,
  status: readyStatus,
  value: "open"
};

const evaluationRun = {
  description: "EvaluationRun 状态只作为展示模型。",
  key: "evaluation-run-weekly",
  label: "weekly-eval-run",
  status: readyStatus,
  value: "completed"
};

export const evaluationStaticViewModel: EvaluationViewModel = {
  badCases: [badCase],
  datasetItems: [
    { description: "DatasetItem 为 Gap，只提供静态摘要。", key: "dataset-item-gap", label: "Dataset item", status: warningStatus, value: "待确认 / Gap" }
  ],
  evaluationDatasets: [dataset],
  evaluationOverview: [
    { description: "Evaluation 是系统质量评估，不等于用户 Feedback。", key: "evaluation-overview", label: "评估概览", status: readyStatus, value: "86/100" }
  ],
  evaluationRuns: [evaluationRun],
  evaluationState: defaultStateCoverage.ready,
  gapNote: "Rubric / DatasetItem 为 Gap；不实现真实 Evaluation。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:18:00+08:00",
  mainSections: [
    { description: "Bad Case、Dataset 和 Run 摘要。", key: "evaluation-overview", status: readyStatus, title: "Evaluation Overview" },
    { description: "Score、Rubric 和 Feedback / Report 关联入口。", key: "score-reference", status: readyStatus, title: "Score & References" }
  ],
  metricCards: [
    { key: "quality-score", label: "质量分", risk: warningRisk, status: readyStatus, trendText: "较上周 +2", valueText: "86" }
  ],
  modelReportFeedbackReferences: [
    { description: "关联 Feedback 和 Reports，不承接主列表。", key: "eval-report-feedback-ref", label: "闭环引用", linkTo: "feedback", status: readyStatus, value: "4 refs" }
  ],
  pageDescription: "Bad Case、评估数据集、评估运行、评分和闭环引用的静态数据。",
  pageKey: "evaluation",
  pageTitle: "Evaluation",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "evaluation-run-disabled",
    label: "执行评估",
    description: "静态 UI 阶段不执行真实 Evaluation。"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "evaluation-right-assist",
    "Evaluation 辅助摘要",
    "承接 selected bad case、dataset、evaluation run、score 和闭环引用。"
  ),
  rubrics: [
    { description: "Rubric 为 Surface Contract Gap。", key: "rubric-gap", label: "Rubric", status: warningStatus, value: "待确认 / Gap" }
  ],
  scoreSummary: [
    { description: "评分摘要只作为静态展示输入。", key: "score-summary", label: "Score", risk: warningRisk, status: readyStatus, value: "86" }
  ],
  secondaryActions: [
    { intent: "navigation", key: "evaluation-open-feedback", label: "查看反馈", targetRoute: "feedback" }
  ],
  selectedBadCase: badCase,
  selectedDataset: dataset,
  selectedEvaluationRun: evaluationRun,
  selectedRubric: {
    description: "Rubric 详情待确认 / Gap。",
    key: "selected-rubric-gap",
    label: "Selected Rubric",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "评估静态摘要。", key: "evaluation-summary", label: "评估运行", status: readyStatus, value: "5" }
  ]
};
