import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedEvidenceEntrances,
  sharedTraceEntrances,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { AnalysisViewModel } from "../models";

export const analysisStaticViewModel: AnalysisViewModel = {
  analysisContext: [
    {
      description: "来自 Dashboard 的收入增速异常上下文。",
      key: "context-dashboard-revenue",
      label: "上下文",
      linkTo: "dashboard",
      risk: warningRisk,
      status: readyStatus,
      value: "季度收入"
    }
  ],
  analysisInput: {
    description: "静态问题草稿，不创建真实 Agent Run。",
    key: "analysis-input",
    label: "分析问题",
    status: readyStatus,
    value: "解释收入增速低于阈值的主要原因"
  },
  analysisState: defaultStateCoverage.ready,
  approvalState: {
    description: "审批态为 Gap，只作为静态 UI State 展示。",
    key: "approval-gap",
    label: "审批态",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  evidenceEntrances: sharedEvidenceEntrances,
  followUpDraft: {
    description: "基于当前结果继续追问，不覆盖原 run。",
    intent: "primary",
    key: "analysis-follow-up",
    label: "继续追问"
  },
  gapNote: "Analysis 聚合 ViewModel、streaming、approval、retry 均为 Surface Contract Gap。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:02:00+08:00",
  mainSections: [
    { description: "承接主动分析输入和上下文 chip。", key: "analysis-input", status: readyStatus, title: "Analysis Input" },
    { description: "展示当前 Run 生命周期状态。", key: "run-status", status: readyStatus, title: "Run Status" },
    { description: "展示结果预览、Evidence、Trace、Report 和 Follow-up 入口。", key: "result-preview", status: readyStatus, title: "Result Preview" }
  ],
  metricCards: [],
  pageDescription: "主动分析、异常追问、结果追问和上下文分析的静态工作区数据。",
  pageKey: "analysis",
  pageTitle: "Analysis",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    disabled: true,
    intent: "disabled",
    key: "analysis-submit-disabled",
    label: "提交分析",
    description: "静态 ViewModel 阶段不执行真实 Agent Run。"
  },
  readonlyState: defaultReadonlyState,
  reportEntrances: [
    {
      evidenceCount: 3,
      key: "analysis-report-entry",
      reportId: "report-analysis-preview",
      status: readyStatus,
      title: "分析结果报告预览",
      updatedAt: "2026-06-03T17:40:00+08:00"
    }
  ],
  resultPreview: [
    {
      description: "结果预览只展示摘要，不展示模型原始输出。",
      key: "result-preview-summary",
      label: "结果摘要",
      risk: warningRisk,
      status: readyStatus,
      value: "收入下降主要来自华东渠道延迟确认。"
    }
  ],
  retryState: {
    description: "重试态为 Gap，不实现真实 retry。",
    key: "retry-gap",
    label: "重试态",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  rightAssistSummary: createRightAssistSummary(
    "analysis-right-assist",
    "Analysis 辅助摘要",
    "承接当前 run、Evidence、Trace、Report、Risk、Decision 和 Follow-up 上下文。"
  ),
  runList: [
    {
      description: "AnalysisRun 摘要，字段由后续 mapper 标准化。",
      key: "run-revenue-gap",
      label: "收入异常追问",
      risk: warningRisk,
      status: readyStatus,
      value: "completed"
    }
  ],
  runStatus: {
    description: "Run 状态来自 ViewModel，不等于真实执行状态机。",
    key: "run-status",
    label: "当前 Run",
    status: readyStatus,
    value: "completed"
  },
  secondaryActions: [
    { intent: "navigation", key: "analysis-open-reports", label: "查看报告", targetRoute: "reports" },
    { intent: "navigation", key: "analysis-open-observability", label: "查看 Trace", targetRoute: "observability" }
  ],
  selectedRun: {
    description: "当前选中 Run 摘要。",
    key: "selected-run",
    label: "Selected Run",
    risk: warningRisk,
    status: readyStatus,
    value: "run-revenue-gap"
  },
  stateCoverage: defaultStateCoverage,
  streamingState: {
    description: "流式态为 Gap，不实现真实 streaming。",
    key: "streaming-gap",
    label: "流式态",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  summaryCards: [
    {
      description: "Analysis 页面仅提供静态展示数据。",
      key: "analysis-summary",
      label: "分析状态",
      risk: warningRisk,
      status: readyStatus,
      value: "已就绪"
    }
  ],
  traceEntrances: sharedTraceEntrances
};
