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
      descriptionKey: "action.metricOpenAnalysis.description",
      intent: "navigation",
      key: "metric-open-analysis",
      labelKey: "action.metricOpenAnalysis.label",
      targetRoute: "analysis"
    }
  ],
  anomalyEntrances: [
    {
      descriptionKey: "action.metricAnomalyEntry.description",
      intent: "navigation",
      key: "metric-anomaly-entry",
      labelKey: "action.metricAnomalyEntry.label",
      targetRoute: "analysis"
    }
  ],
  dashboardEntrances: [
    {
      intent: "navigation",
      key: "metric-open-dashboard",
      labelKey: "action.metricOpenDashboard.label",
      targetRoute: "dashboard"
    }
  ],
  gapNote: "MetricFormula、MetricThreshold、MetricLineage detail 和 anomaly context 为 Gap。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-03T18:10:00+08:00",
  mainSections: [
    {
      descriptionKey: "page.metrics.section.metricCatalog.description",
      key: "metric-catalog",
      status: readyStatus,
      titleKey: "page.metrics.section.metricCatalog.title"
    },
    {
      descriptionKey: "page.metrics.section.formulaThreshold.description",
      key: "formula-threshold",
      status: readyStatus,
      titleKey: "page.metrics.section.formulaThreshold.title"
    },
    {
      descriptionKey: "page.metrics.section.lineageEvidence.description",
      key: "lineage-evidence",
      status: readyStatus,
      titleKey: "page.metrics.section.lineageEvidence.title"
    }
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
  pageDescriptionKey: "page.metrics.description",
  pageKey: "metrics",
  pageTitleKey: "page.metrics.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "metrics-open-analysis",
    labelKey: "action.metricsOpenAnalysis.label",
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
    "page.metrics.rightAssist.title",
    "page.metrics.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "metrics-open-dashboard",
      labelKey: "action.metricsOpenDashboard.label",
      targetRoute: "dashboard"
    }
  ],
  selectedMetric,
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "指标目录静态总数。",
      key: "metric-count",
      label: "指标",
      status: readyStatus,
      value: "24"
    }
  ]
};
