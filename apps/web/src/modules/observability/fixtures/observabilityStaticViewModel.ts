import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedTraceEntrances,
  warningRisk
} from "../../../shared/view-model/staticStateFixtures";
import type { ObservabilityViewModel } from "../models/observabilityViewModel";

const selectedTrace = sharedTraceEntrances[0];

export const observabilityStaticViewModel: ObservabilityViewModel = {
  costLatencySummary: [
    {
      description: "成本和延迟图表输入待后续页面组合。",
      key: "cost-latency",
      label: "成本 / 延迟",
      status: readyStatus,
      value: "¥128 / p95 1.8s"
    }
  ],
  errorRateSummary: [
    {
      description: "错误率摘要只作为静态观测输入。",
      key: "error-rate",
      label: "错误率",
      risk: warningRisk,
      status: readyStatus,
      value: "1.2%"
    }
  ],
  gapNote:
    "ToolCallCard / ModelCallCard 输入 ViewModel 为 #74 Gap，不展示 raw input/output 或 provider 原始响应。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:14:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.observability.section.traceOverview.description",
      key: "trace-overview",
      status: readyStatus,
      titleKey: "page.observability.section.traceOverview.title"
    },
    {
      descriptionKey: "page.observability.section.costLatency.description",
      key: "cost-latency",
      status: readyStatus,
      titleKey: "page.observability.section.costLatency.title"
    },
    {
      descriptionKey: "page.observability.section.traceDetail.description",
      key: "trace-detail",
      status: readyStatus,
      titleKey: "page.observability.section.traceDetail.title"
    }
  ],
  metricCards: [
    {
      key: "p95-latency",
      label: "P95 latency",
      risk: warningRisk,
      status: readyStatus,
      trendText: "较昨日 +8%",
      valueText: "1.8s"
    }
  ],
  modelTraces: sharedTraceEntrances,
  observabilityOverview: [
    {
      description: "运行观测只展示静态摘要，不读取真实 Trace。",
      key: "observability-overview",
      label: "Trace 覆盖",
      status: readyStatus,
      value: "24 runs"
    }
  ],
  observabilityState: defaultStateCoverage.ready,
  pageDescriptionKey: "page.observability.description",
  pageKey: "observability",
  pageTitleKey: "page.observability.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "observability-open-analysis",
    labelKey: "action.observabilityOpenAnalysis.label",
    targetRoute: "analysis"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "observability-right-assist",
    "page.observability.rightAssist.title",
    "page.observability.rightAssist.description"
  ),
  runTraces: sharedTraceEntrances,
  runtimeEvents: sharedTraceEntrances,
  secondaryActions: [
    {
      intent: "navigation",
      key: "observability-open-model-tools",
      labelKey: "action.observabilityOpenModelTools.label",
      targetRoute: "model-tools"
    }
  ],
  selectedModelTrace: selectedTrace,
  selectedRunTrace: selectedTrace,
  selectedRuntimeEvent: selectedTrace,
  selectedToolTrace: sharedTraceEntrances[1],
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "静态 Trace 数量摘要。",
      key: "trace-count",
      label: "Trace",
      status: readyStatus,
      value: "24"
    }
  ],
  toolTraces: sharedTraceEntrances,
  traceDetail: {
    description: "Trace 详情只展示脱敏摘要，不展示 LangGraph raw state。",
    key: "trace-detail",
    label: "Trace Detail",
    risk: warningRisk,
    status: readyStatus,
    value: "sanitized summary"
  }
};
