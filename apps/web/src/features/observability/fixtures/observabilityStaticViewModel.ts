import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedTraceEntrances,
  warningRisk
} from "../../../app/fixtures";
import type { ObservabilityViewModel } from "../models";

const selectedTrace = sharedTraceEntrances[0];

export const observabilityStaticViewModel: ObservabilityViewModel = {
  costLatencySummary: [
    { description: "成本和延迟图表输入待后续页面组合。", key: "cost-latency", label: "成本 / 延迟", status: readyStatus, value: "¥128 / p95 1.8s" }
  ],
  errorRateSummary: [
    { description: "错误率摘要只作为静态观测输入。", key: "error-rate", label: "错误率", risk: warningRisk, status: readyStatus, value: "1.2%" }
  ],
  gapNote: "ToolCallCard / ModelCallCard 输入 ViewModel 为 #74 Gap，不展示 raw input/output 或 provider 原始响应。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:14:00+08:00",
  mainSections: [
    { description: "Run、Tool、Model Trace 摘要。", key: "trace-overview", status: readyStatus, title: "Trace Overview" },
    { description: "成本、延迟和错误率摘要。", key: "cost-latency", status: readyStatus, title: "Cost / Latency / Error" },
    { description: "Trace 详情和 RightAssistPanel 输入。", key: "trace-detail", status: readyStatus, title: "Trace Detail" }
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
    { description: "运行观测只展示静态摘要，不读取真实 Trace。", key: "observability-overview", label: "Trace 覆盖", status: readyStatus, value: "24 runs" }
  ],
  observabilityState: defaultStateCoverage.ready,
  pageDescription: "Run Trace、Tool Trace、Model Trace、成本、延迟和错误率的静态观测数据。",
  pageKey: "observability",
  pageTitle: "Observability",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "observability-open-analysis",
    label: "回到 Analysis",
    targetRoute: "analysis"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "observability-right-assist",
    "Observability 辅助摘要",
    "承接 selected trace、runtime event、成本延迟和错误率摘要。"
  ),
  runTraces: sharedTraceEntrances,
  runtimeEvents: sharedTraceEntrances,
  secondaryActions: [
    { intent: "navigation", key: "observability-open-model-tools", label: "查看模型工具", targetRoute: "model-tools" }
  ],
  selectedModelTrace: selectedTrace,
  selectedRunTrace: selectedTrace,
  selectedRuntimeEvent: selectedTrace,
  selectedToolTrace: sharedTraceEntrances[1],
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "静态 Trace 数量摘要。", key: "trace-count", label: "Trace", status: readyStatus, value: "24" }
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
