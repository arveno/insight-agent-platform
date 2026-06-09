import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningStatus,
  warningRisk
} from "../../../shared/view-model/staticStateFixtures";
import type { MemoryViewModel } from "../models/memoryViewModel";

const memoryItem = {
  description: "工作区长期记忆摘要，不等于 Feedback 或 Evaluation。",
  key: "memory-revenue-seasonality",
  label: "收入季节性记忆",
  status: readyStatus,
  value: "workspace"
};

export const memoryStaticViewModel: MemoryViewModel = {
  analysisRunDecisionLinks: [
    {
      description: "关联 AnalysisRun / Decision 的静态链接。",
      key: "memory-analysis-link",
      label: "关联分析",
      linkTo: "analysis",
      status: readyStatus,
      value: "run-revenue-gap"
    }
  ],
  gapNote: "memoryReads / memoryWrites 和 usage trace aggregate 为 Gap；不执行 Memory 写入决策。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:22:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.memory.section.memoryOverview.description",
      key: "memory-overview",
      status: readyStatus,
      titleKey: "page.memory.section.memoryOverview.title"
    },
    {
      descriptionKey: "page.memory.section.memoryList.description",
      key: "memory-list",
      status: readyStatus,
      titleKey: "page.memory.section.memoryList.title"
    },
    {
      descriptionKey: "page.memory.section.memoryUsage.description",
      key: "memory-usage",
      status: readyStatus,
      titleKey: "page.memory.section.memoryUsage.title"
    }
  ],
  memoryItems: [memoryItem],
  memoryOverview: [
    {
      description: "Memory、Feedback、Evaluation 分域独立。",
      key: "memory-overview-card",
      label: "记忆条目",
      status: readyStatus,
      value: "12"
    }
  ],
  memoryState: defaultStateCoverage.ready,
  memoryTypeFilters: [
    {
      description: "Memory 类型筛选。",
      key: "workspace-memory-filter",
      label: "workspace",
      status: readyStatus,
      value: "8"
    }
  ],
  memoryUsageTrace: [
    {
      description: "使用痕迹聚合待确认 / Gap。",
      key: "memory-usage-gap",
      label: "使用痕迹",
      status: warningStatus,
      value: "待确认 / Gap"
    }
  ],
  metricCards: [
    {
      key: "memory-count",
      label: "记忆条目",
      risk: warningRisk,
      status: readyStatus,
      valueText: "12"
    }
  ],
  pageDescriptionKey: "page.memory.description",
  pageKey: "memory",
  pageTitleKey: "page.memory.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "memory-open-analysis",
    labelKey: "action.memoryOpenAnalysis.label",
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
    "page.memory.rightAssist.title",
    "page.memory.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "memory-open-reports",
      labelKey: "action.memoryOpenReports.label",
      targetRoute: "reports"
    }
  ],
  selectedMemoryItem: memoryItem,
  selectedMemoryType: "workspace",
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "Memory 静态摘要。",
      key: "memory-summary",
      label: "Workspace Memory",
      status: readyStatus,
      value: "8"
    }
  ]
};
