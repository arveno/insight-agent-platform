import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedEvidenceEntrances,
  warningStatus,
  warningRisk
} from "../../../app/fixtures";
import type { MetricsViewModel } from "../models";

const selectedMetric = {
  description: "核心收入指标摘要，公式和阈值只作为展示模型。",
  key: "metric-recognized-revenue",
  label: "确认收入",
  risk: warningRisk,
  status: readyStatus,
  value: "¥12.8M"
};

export const metricsStaticViewModel: MetricsViewModel = {
  analysisEntrances: [
    {
      description: "携带 metric / anomaly context 进入 Analysis。",
      intent: "navigation",
      key: "metric-open-analysis",
      label: "分析指标异常",
      targetRoute: "analysis"
    }
  ],
  anomalyEntrances: [
    {
      description: "异常上下文待确认 / Gap，仅作为静态入口。",
      intent: "navigation",
      key: "metric-anomaly-entry",
      label: "异常追问",
      targetRoute: "analysis"
    }
  ],
  dashboardEntrances: [
    { intent: "navigation", key: "metric-open-dashboard", label: "回到经营总览", targetRoute: "dashboard" }
  ],
  gapNote: "MetricFormula、MetricThreshold、MetricLineage detail 和 anomaly context 为 Gap。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:10:00+08:00",
  mainSections: [
    { description: "指标目录、筛选和 selected metric 摘要。", key: "metric-catalog", status: readyStatus, title: "Metric Catalog" },
    { description: "指标公式、阈值和风险摘要。", key: "formula-threshold", status: readyStatus, title: "Formula & Threshold" },
    { description: "血缘、证据、Dashboard 和 Analysis 入口。", key: "lineage-evidence", status: readyStatus, title: "Lineage & Evidence" }
  ],
  metricCards: [
    {
      evidenceCount: 4,
      key: "recognized-revenue-card",
      label: "确认收入",
      risk: warningRisk,
      status: readyStatus,
      trendText: "环比 -3.2%",
      valueText: "¥12.8M"
    }
  ],
  metricCatalog: [selectedMetric],
  metricEvidenceEntrances: sharedEvidenceEntrances,
  metricFormula: {
    description: "公式详情待确认 / Gap，后续由 mapper 标准化。",
    key: "revenue-formula",
    label: "收入确认公式",
    status: warningStatus,
    value: "待确认 / Gap"
  },
  metricLineage: [
    {
      description: "来自 DataField 和 DataTable 的静态血缘摘要。",
      key: "revenue-lineage",
      label: "字段血缘",
      linkTo: "data-knowledge",
      status: readyStatus,
      value: "sales_order.recognized_revenue"
    }
  ],
  metricThresholds: [
    {
      description: "阈值详情待确认 / Gap。",
      key: "revenue-threshold",
      label: "收入增速阈值",
      risk: warningRisk,
      status: readyStatus,
      value: "-2%"
    }
  ],
  metricsState: defaultStateCoverage.ready,
  pageDescription: "指标定义、公式、阈值、血缘、证据和异常入口的静态数据。",
  pageKey: "metrics",
  pageTitle: "Metrics",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "metrics-open-analysis",
    label: "用指标上下文分析",
    targetRoute: "analysis"
  },
  readonlyState: defaultReadonlyState,
  relatedDataFields: [
    {
      description: "字段详情归 Data & Knowledge。",
      key: "metric-related-field",
      label: "recognized_revenue",
      linkTo: "data-knowledge",
      status: readyStatus,
      value: "currency"
    }
  ],
  rightAssistSummary: createRightAssistSummary(
    "metrics-right-assist",
    "Metrics 辅助摘要",
    "承接 selected metric、formula、threshold、lineage、evidence 和 anomaly context。"
  ),
  secondaryActions: [
    { intent: "navigation", key: "metrics-open-dashboard", label: "查看总览", targetRoute: "dashboard" }
  ],
  selectedMetric,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "指标目录静态总数。", key: "metric-count", label: "指标", status: readyStatus, value: "24" }
  ]
};
