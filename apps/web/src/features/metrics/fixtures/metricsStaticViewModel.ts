import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  sharedEvidenceEntrances,
  warningRisk
} from "../../../app/fixtures";
import type { MetricsViewModel } from "../models";

export const metricsStaticViewModel: MetricsViewModel = {
  dashboardEntrances: [
    {
      intent: "navigation",
      key: "metric-open-dashboard",
      labelKey: "action.metricOpenDashboard.label",
      targetRoute: "dashboard"
    }
  ],
  evidenceEntrances: [
    ...sharedEvidenceEntrances,
    {
      confidenceText: "High",
      key: "margin-lineage-evidence",
      sourceId: "source-evidence-margin-lineage",
      sourceType: "Metric / Report",
      summary: "将指标口径、字段血缘和异常备注整理为只读证据入口。",
      title: "毛利率口径与异常证据"
    }
  ],
  formulaThresholdCards: [
    {
      description: "只读展示口径，不触发真实计算或配置编辑。",
      eyebrow: "口径",
      key: "metric-formula-revenue",
      meta: "阈值：收入增速低于 -2% 进入异常观察。",
      status: readyStatus,
      title: "确认收入公式",
      value: "recognized_revenue = booked_revenue - refund_amount"
    },
    {
      description: "指标阈值用于解释什么时候异常，不在本页执行真实规则引擎。",
      eyebrow: "阈值",
      key: "metric-threshold-margin",
      meta: "风险等级：低于 32% 进入中风险。",
      risk: warningRisk,
      status: readyStatus,
      title: "毛利率阈值",
      value: "gross_margin_rate < 32%"
    },
    {
      description: "指标语义层只解释分母和分子来源，不承接配置写入。",
      eyebrow: "口径",
      key: "metric-formula-cac",
      meta: "阈值：高于 ¥980 进入关注。",
      status: readyStatus,
      title: "获客成本公式",
      value: "customer_acquisition_cost = marketing_spend / new_customers"
    }
  ],
  lastUpdatedAt: "2026-06-06T10:15:00+08:00",
  lineageSourceCards: [
    {
      description: "字段血缘和来源对象属于当前 Workspace 的只读语义解释。",
      eyebrow: "字段血缘",
      key: "lineage-revenue",
      meta: "来源：sales_order / refund_order / daily_revenue_snapshot",
      status: readyStatus,
      title: "确认收入来源",
      value: "sales_order.recognized_revenue -> refund_order.refund_amount"
    },
    {
      description: "指标血缘只表达从哪来，不做真实表连接或 SQL 下钻。",
      eyebrow: "来源字段",
      key: "lineage-margin",
      meta: "来源：income_statement_daily / cost_settlement_fact",
      status: readyStatus,
      title: "毛利率来源",
      value: "gross_profit / net_revenue"
    },
    {
      description: "切换 Workspace 后，指标、字段和来源系统都可能变化。",
      eyebrow: "Workspace 绑定",
      key: "lineage-workspace",
      meta: "workspaceId = workspace-north-america-revenue",
      status: readyStatus,
      title: "当前 Workspace 指标目录",
      value: "North America Revenue Ops Workspace"
    }
  ],
  mainSections: [
    {
      descriptionKey: "page.metrics.section.metricsOverview.description",
      key: "metrics-overview",
      status: readyStatus,
      titleKey: "page.metrics.section.metricsOverview.title"
    },
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
      descriptionKey: "page.metrics.section.trendAnomaly.description",
      key: "trend-anomaly",
      status: readyStatus,
      titleKey: "page.metrics.section.trendAnomaly.title"
    },
    {
      descriptionKey: "page.metrics.section.lineageSource.description",
      key: "lineage-source",
      status: readyStatus,
      titleKey: "page.metrics.section.lineageSource.title"
    },
    {
      descriptionKey: "page.metrics.section.evidenceEntry.description",
      key: "evidence-entry",
      status: readyStatus,
      titleKey: "page.metrics.section.evidenceEntry.title"
    },
    {
      descriptionKey: "page.metrics.section.analysisContext.description",
      key: "analysis-context",
      status: readyStatus,
      titleKey: "page.metrics.section.analysisContext.title"
    }
  ],
  metricCatalogCards: [
    {
      evidenceCount: 4,
      key: "metric-card-recognized-revenue",
      label: "确认收入",
      risk: warningRisk,
      status: readyStatus,
      trendText: "最近 30 天环比 -3.2%",
      valueText: "¥12.8M"
    },
    {
      evidenceCount: 3,
      key: "metric-card-gross-margin",
      label: "毛利率",
      risk: {
        level: "low",
        titleKey: "risk.low.title"
      },
      status: readyStatus,
      trendText: "最近 30 天稳定在 33.4%",
      valueText: "33.4%"
    },
    {
      evidenceCount: 2,
      key: "metric-card-cac",
      label: "获客成本",
      risk: warningRisk,
      status: readyStatus,
      trendText: "最近 30 天高于目标 +8.1%",
      valueText: "¥1,024"
    }
  ],
  metricContexts: [
    {
      currentValue: "¥12.8M",
      evidenceRefs: ["source-evidence-q2-revenue", "report-q2-revenue", "metric-threshold-revenue"],
      formula: "recognized_revenue = booked_revenue - refund_amount",
      key: "context-recognized-revenue",
      lineage: "sales_order.recognized_revenue -> refund_order.refund_amount",
      metricId: "metric-recognized-revenue",
      metricName: "确认收入",
      riskLevel: "medium",
      threshold: "收入增速 < -2%",
      timeRange: "Last 30 days",
      trend: "环比 -3.2%",
      workspaceId: "workspace-north-america-revenue"
    },
    {
      currentValue: "¥1,024",
      evidenceRefs: ["source-evidence-margin-lineage", "metric-threshold-cac"],
      formula: "customer_acquisition_cost = marketing_spend / new_customers",
      key: "context-cac",
      lineage: "marketing_spend_fact + customer_conversion_daily",
      metricId: "metric-customer-acquisition-cost",
      metricName: "获客成本",
      riskLevel: "medium",
      threshold: "获客成本 > ¥980",
      timeRange: "Last 30 days",
      trend: "高于目标 +8.1%",
      workspaceId: "workspace-north-america-revenue"
    }
  ],
  metricDirectory: [
    {
      description: "业务负责人默认从这里理解指标语义，而不是进入配置页。",
      key: "metric-directory-revenue",
      label: "确认收入",
      meta: "业务域：营收质量",
      risk: warningRisk,
      status: readyStatus,
      value: "口径稳定 / 异常待分析"
    },
    {
      description: "指标目录只读展示公式摘要、阈值摘要和证据入口。",
      key: "metric-directory-margin",
      label: "毛利率",
      meta: "业务域：利润结构",
      status: readyStatus,
      value: "口径稳定 / 需关注成本波动"
    },
    {
      description: "异常追问入口只表达 metric-level context，不触发真实 Analysis Run。",
      key: "metric-directory-cac",
      label: "获客成本",
      meta: "业务域：获客效率",
      risk: warningRisk,
      status: readyStatus,
      value: "高于目标 / 适合带上下文进入 Analysis"
    }
  ],
  metricCards: [
    {
      evidenceCount: 3,
      key: "metric-overview-card-revenue",
      label: "确认收入",
      risk: warningRisk,
      status: readyStatus,
      trendText: "收入增速低于阈值",
      valueText: "异常追问入口已准备"
    },
    {
      evidenceCount: 3,
      key: "metric-overview-card-workspace",
      label: "当前 Workspace",
      risk: {
        level: "low",
        titleKey: "risk.low.title"
      },
      status: readyStatus,
      trendText: "切换 Workspace 后目录、阈值、血缘都会刷新",
      valueText: "North America Revenue Ops Workspace"
    }
  ],
  metricsState: defaultStateCoverage.ready,
  pageDescriptionKey: "page.metrics.description",
  pageKey: "metrics",
  pageTitleKey: "page.metrics.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    descriptionKey: "action.metricOpenAnalysis.description",
    intent: "navigation",
    key: "metrics-open-analysis",
    labelKey: "action.metricOpenAnalysis.label",
    targetRoute: "analysis"
  },
  readonlyNotice: "Metrics 当前阶段只读展示指标语义，不提供新增、编辑或真实计算。",
  readonlyState: defaultReadonlyState,
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
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "当前 Workspace 只读指标目录数量。",
      key: "metric-summary-count",
      label: "指标总数",
      status: readyStatus,
      value: "24"
    },
    {
      description: "当前阶段只展示语义层，不展示真实计算过程。",
      key: "metric-summary-semantic-layer",
      label: "语义层状态",
      status: readyStatus,
      value: "只读解释"
    },
    {
      description: "达到阈值的指标可作为异常追问入口。",
      key: "metric-summary-anomaly",
      label: "异常关注指标",
      risk: warningRisk,
      status: readyStatus,
      value: "3"
    },
    {
      description: "指标证据入口来自当前 Workspace 的静态 ViewModel。",
      key: "metric-summary-evidence",
      label: "证据入口",
      status: readyStatus,
      value: "7"
    }
  ],
  trendAnomalyCards: [
    {
      evidenceCount: 4,
      key: "metric-trend-revenue",
      label: "确认收入",
      risk: warningRisk,
      status: readyStatus,
      trendText: "收入增速连续两周低于阈值",
      valueText: "环比 -3.2%"
    },
    {
      evidenceCount: 2,
      key: "metric-trend-cac",
      label: "获客成本",
      risk: warningRisk,
      status: readyStatus,
      trendText: "投放成本上升快于新增客户",
      valueText: "高于目标 +8.1%"
    }
  ],
  workspaceNotice:
    "当前指标目录属于当前 Workspace。切换 Workspace 后指标目录、公式、阈值、血缘和证据都可能变化。"
};
