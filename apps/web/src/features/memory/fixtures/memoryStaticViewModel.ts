import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { MemoryViewModel } from "../models";

const memoryItem = {
  description: "工作区长期记忆摘要，不等于 Feedback 或 Evaluation。",
  key: "memory-revenue-seasonality",
  label: "收入季节性记忆",
  status: readyStatus,
  value: "workspace"
};

export const memoryStaticViewModel: MemoryViewModel = {
  analysisRunDecisionLinks: [
    { description: "关联 AnalysisRun / Decision 的静态链接。", key: "memory-analysis-link", label: "关联分析", linkTo: "analysis", status: readyStatus, value: "run-revenue-gap" }
  ],
  gapNote: "memoryReads / memoryWrites 和 usage trace aggregate 为 Gap；不执行 Memory 写入决策。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:22:00+08:00",
  mainSections: [
    { description: "Memory 总览和类型筛选。", key: "memory-overview", status: readyStatus, title: "Memory Overview" },
    { description: "Memory 列表和关联对象详情。", key: "memory-list", status: readyStatus, title: "Memory List" },
    { description: "Memory 使用痕迹和 Analysis / Decision 链接。", key: "memory-usage", status: readyStatus, title: "Memory Usage Trace" }
  ],
  memoryItems: [memoryItem],
  memoryOverview: [
    { description: "Memory、Feedback、Evaluation 分域独立。", key: "memory-overview-card", label: "记忆条目", status: readyStatus, value: "12" }
  ],
  memoryState: defaultStateCoverage.ready,
  memoryTypeFilters: [
    { description: "Memory 类型筛选。", key: "workspace-memory-filter", label: "workspace", status: readyStatus, value: "8" }
  ],
  memoryUsageTrace: [
    { description: "使用痕迹聚合待确认 / Gap。", key: "memory-usage-gap", label: "使用痕迹", status: warningStatus, value: "待确认 / Gap" }
  ],
  metricCards: [
    { key: "memory-count", label: "记忆条目", risk: warningRisk, status: readyStatus, valueText: "12" }
  ],
  pageDescription: "长期记忆、类型筛选、关联对象详情和使用痕迹入口的静态数据。",
  pageKey: "memory",
  pageTitle: "Memory",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "memory-open-analysis",
    label: "查看关联分析",
    targetRoute: "analysis"
  },
  readonlyState: defaultReadonlyState,
  relatedObjectDetail: {
    description: "关联对象详情只展示静态摘要。",
    key: "memory-related-object",
    label: "关联对象",
    linkTo: "reports",
    status: readyStatus,
    value: "report-weekly-business"
  },
  rightAssistSummary: createRightAssistSummary(
    "memory-right-assist",
    "Memory 辅助摘要",
    "承接 selected memory、关联对象和使用痕迹摘要。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "memory-open-reports", label: "查看报告", targetRoute: "reports" }
  ],
  selectedMemoryItem: memoryItem,
  selectedMemoryType: "workspace",
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "Memory 静态摘要。", key: "memory-summary", label: "Workspace Memory", status: readyStatus, value: "8" }
  ]
};
