import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, sharedEvidenceEntrances, warningRisk } from "../../../app/fixtures/staticStateFixtures";
import type { MetricAnalysisContextViewModel, MetricDetailViewModel, MetricListItemViewModel, MetricsViewModel, MetricsWorkspaceBinding } from "../models/metricsViewModel";

const lowRisk = {
  level: "low",
  titleKey: "risk.low.title"
} as const;

const highRisk = {
  level: "high",
  titleKey: "risk.high.title"
} as const;

export const defaultMetricsWorkspaceBinding: MetricsWorkspaceBinding = {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
};

type MetricBlueprint = Omit<MetricDetailViewModel, "analysisContext" | "workspaceId"> & {
  analysisContext: Omit<MetricAnalysisContextViewModel, "workspaceId">;
};

const metricBlueprints: MetricBlueprint[] = [
  {
    analysisContext: {
      currentValue: "¥12.8M",
      evidenceRefs: [
        "source-evidence-q2-revenue",
        "source-evidence-quality-job",
        "report-q2-revenue"
      ],
      formula: "recognized_revenue = booked_revenue - refund_amount",
      lineage: [
        "sales_order.recognized_revenue",
        "refund_order.refund_amount",
        "daily_revenue_snapshot"
      ].join(", "),
      metricId: "metric-recognized-revenue",
      metricName: "确认收入",
      riskLevel: "medium",
      threshold: "收入增速 < -2%",
      timeRange: "Last 30 days",
      trend: "环比 -3.2%"
    },
    businessDomain: "营收质量",
    currentValue: "¥12.8M",
    definition: "已满足确认条件的收入金额。",
    evidenceItems: [
      sharedEvidenceEntrances[0],
      sharedEvidenceEntrances[1],
      {
        confidenceText: "High",
        key: "revenue-report-paragraph",
        sourceId: "report-q2-revenue",
        sourceType: "Metric / Report",
        summary: "来自季度经营分析报告的收入异常解释段落。",
        title: "历史报告段落"
      }
    ],
    formula: {
      businessFormula: "确认收入 = 已预订收入 - 退款金额",
      technicalFormula: "recognized_revenue = booked_revenue - refund_amount"
    },
    key: "metric-recognized-revenue",
    lineageSources: [
      {
        description: "订单事实表中的已确认收入字段，用于形成收入分子。",
        key: "recognized-revenue-source-1",
        label: "确认收入字段",
        source: "sales_order.recognized_revenue"
      },
      {
        description: "退款事实表中的退款字段，用于扣减已确认收入。",
        key: "recognized-revenue-source-2",
        label: "退款金额字段",
        source: "refund_order.refund_amount"
      },
      {
        description: "日级收入快照用于校验当前 Workspace 的汇总口径。",
        key: "recognized-revenue-source-3",
        label: "日快照校验",
        source: "daily_revenue_snapshot"
      }
    ],
    metricId: "metric-recognized-revenue",
    metricName: "确认收入",
    risk: warningRisk,
    status: readyStatus,
    thresholdRules: [
      {
        condition: "收入增速 < -2%",
        key: "recognized-revenue-threshold-medium",
        label: "中风险阈值",
        risk: warningRisk
      },
      {
        condition: "收入增速 < -5%",
        key: "recognized-revenue-threshold-high",
        label: "高风险阈值",
        risk: highRisk
      }
    ],
    timeRange: "Last 30 days",
    trend: "环比 -3.2%"
  },
  {
    analysisContext: {
      currentValue: "33.4%",
      evidenceRefs: [
        "source-evidence-margin-lineage",
        "report-margin-review",
        "source-evidence-quality-job"
      ],
      formula: "gross_margin_rate = gross_profit / net_revenue",
      lineage: [
        "income_statement_daily.gross_profit",
        "income_statement_daily.net_revenue",
        "cost_settlement_fact"
      ].join(", "),
      metricId: "metric-gross-margin",
      metricName: "毛利率",
      riskLevel: "low",
      threshold: "毛利率 < 32%",
      timeRange: "Last 30 days",
      trend: "最近 30 天稳定在 33.4%"
    },
    businessDomain: "利润结构",
    currentValue: "33.4%",
    definition: "收入扣除销售成本后保留的利润比例。",
    evidenceItems: [
      {
        confidenceText: "High",
        key: "margin-lineage-evidence",
        sourceId: "source-evidence-margin-lineage",
        sourceType: "Metric / Report",
        summary: "整理毛利率口径、字段血缘和异常备注的只读证据摘要。",
        title: "毛利率口径与异常证据"
      },
      {
        confidenceText: "Medium",
        key: "margin-report-paragraph",
        sourceId: "report-margin-review",
        sourceType: "Metric / Report",
        summary: "来自毛利率复盘报告的结构化段落摘要。",
        title: "历史报告段落"
      },
      sharedEvidenceEntrances[1]
    ],
    formula: {
      businessFormula: "毛利率 = 毛利润 / 净收入",
      technicalFormula: "gross_margin_rate = gross_profit / net_revenue"
    },
    key: "metric-gross-margin",
    lineageSources: [
      {
        description: "损益日表中的毛利润字段。",
        key: "gross-margin-source-1",
        label: "毛利润字段",
        source: "income_statement_daily.gross_profit"
      },
      {
        description: "损益日表中的净收入字段。",
        key: "gross-margin-source-2",
        label: "净收入字段",
        source: "income_statement_daily.net_revenue"
      },
      {
        description: "成本结算事实表用于解释成本波动来源。",
        key: "gross-margin-source-3",
        label: "成本结算来源",
        source: "cost_settlement_fact"
      }
    ],
    metricId: "metric-gross-margin",
    metricName: "毛利率",
    risk: lowRisk,
    status: readyStatus,
    thresholdRules: [
      {
        condition: "毛利率 < 32%",
        key: "gross-margin-threshold-medium",
        label: "关注阈值",
        risk: warningRisk
      },
      {
        condition: "毛利率 < 28%",
        key: "gross-margin-threshold-high",
        label: "高风险阈值",
        risk: highRisk
      }
    ],
    timeRange: "Last 30 days",
    trend: "最近 30 天稳定在 33.4%"
  },
  {
    analysisContext: {
      currentValue: "¥1,024",
      evidenceRefs: [
        "source-evidence-cac-spend",
        "source-evidence-quality-job",
        "report-cac-efficiency"
      ],
      formula: "customer_acquisition_cost = marketing_spend / new_customers",
      lineage: [
        "marketing_spend_fact.marketing_spend",
        "customer_conversion_daily.new_customers",
        "campaign_channel_summary"
      ].join(", "),
      metricId: "metric-customer-acquisition-cost",
      metricName: "获客成本",
      riskLevel: "medium",
      threshold: "获客成本 > ¥980",
      timeRange: "Last 30 days",
      trend: "高于目标 +8.1%"
    },
    businessDomain: "获客效率",
    currentValue: "¥1,024",
    definition: "获取新增客户所需的平均营销投入。",
    evidenceItems: [
      {
        confidenceText: "High",
        key: "cac-spend-evidence",
        sourceId: "source-evidence-cac-spend",
        sourceType: "Metric / Report",
        summary: "静态展示获客成本口径、投放成本构成和异常说明。",
        title: "投放成本证据摘要"
      },
      sharedEvidenceEntrances[1],
      {
        confidenceText: "Medium",
        key: "cac-report-paragraph",
        sourceId: "report-cac-efficiency",
        sourceType: "Metric / Report",
        summary: "来自获客效率复盘报告的结构化段落摘要。",
        title: "历史报告段落"
      }
    ],
    formula: {
      businessFormula: "获客成本 = 营销投入 / 新增客户数",
      technicalFormula: "customer_acquisition_cost = marketing_spend / new_customers"
    },
    key: "metric-customer-acquisition-cost",
    lineageSources: [
      {
        description: "营销投放事实表中的总投放成本字段。",
        key: "cac-source-1",
        label: "营销投入字段",
        source: "marketing_spend_fact.marketing_spend"
      },
      {
        description: "客户转化日表中的新增客户数。",
        key: "cac-source-2",
        label: "新增客户字段",
        source: "customer_conversion_daily.new_customers"
      },
      {
        description: "渠道投放汇总用于解释不同渠道成本差异。",
        key: "cac-source-3",
        label: "渠道成本来源",
        source: "campaign_channel_summary"
      }
    ],
    metricId: "metric-customer-acquisition-cost",
    metricName: "获客成本",
    risk: warningRisk,
    status: readyStatus,
    thresholdRules: [
      {
        condition: "获客成本 > ¥980",
        key: "cac-threshold-medium",
        label: "关注阈值",
        risk: warningRisk
      },
      {
        condition: "获客成本 > ¥1,100",
        key: "cac-threshold-high",
        label: "高风险阈值",
        risk: highRisk
      }
    ],
    timeRange: "Last 30 days",
    trend: "高于目标 +8.1%"
  }
];

function findMetricBlueprint(metricKey: string) {
  return metricBlueprints.find((metric) => metric.key === metricKey) ?? metricBlueprints[0];
}

function createMetricList(metricDetails: MetricBlueprint[]): MetricListItemViewModel[] {
  return metricDetails.map((metric) => ({
    key: metric.key,
    metricId: metric.metricId,
    metricName: metric.metricName
  }));
}

function createSelectedMetric(
  metricKey: string,
  workspaceBinding: MetricsWorkspaceBinding
): MetricDetailViewModel {
  const metric = findMetricBlueprint(metricKey);

  return {
    ...metric,
    analysisContext: {
      ...metric.analysisContext,
      workspaceId: workspaceBinding.workspaceId
    },
    workspaceId: workspaceBinding.workspaceId
  };
}

function createSummaryCards(): MetricsViewModel["summaryCards"] {
  const evidenceCount = new Set(
    metricBlueprints.flatMap((metric) => metric.evidenceItems.map((item) => item.key))
  ).size;
  const anomalyCount = metricBlueprints.filter((metric) => metric.risk?.level !== "low").length;

  return [
    {
      description: "当前 Workspace 指标目录中的静态指标数量。",
      key: "metric-summary-count",
      label: "指标总数",
      status: readyStatus,
      value: String(metricBlueprints.length)
    },
    {
      description: "达到阈值的指标可作为后续异常追问入口。",
      key: "metric-summary-anomaly",
      label: "异常关注指标",
      risk: warningRisk,
      status: readyStatus,
      value: String(anomalyCount)
    },
    {
      description: "当前 Workspace 下所有静态证据入口的摘要数量。",
      key: "metric-summary-evidence",
      label: "证据入口",
      status: readyStatus,
      value: String(evidenceCount)
    },
    {
      description: "当前阶段只展示指标语义层解释，不展示真实计算链路。",
      key: "metric-summary-semantic-layer",
      label: "语义层状态",
      status: readyStatus,
      value: "只读解释"
    }
  ];
}

export function createMetricsViewModel(
  selectedMetricKey = metricBlueprints[0].key,
  workspaceBinding: MetricsWorkspaceBinding = defaultMetricsWorkspaceBinding
): MetricsViewModel {
  const selectedMetric = createSelectedMetric(selectedMetricKey, workspaceBinding);

  return {
    lastUpdatedAt: "2026-06-06T10:15:00+08:00",
    mainSections: [
      {
        descriptionKey: "page.metrics.section.metricsOverview.description",
        key: "metrics-overview",
        status: readyStatus,
        titleKey: "page.metrics.section.metricsOverview.title"
      },
      {
        descriptionKey: "page.metrics.section.selectedMetricDetail.description",
        key: "selected-metric-detail",
        status: readyStatus,
        titleKey: "page.metrics.section.selectedMetricDetail.title"
      }
    ],
    metricCards: [],
    metrics: createMetricList(metricBlueprints),
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
    selectedMetric,
    stateCoverage: defaultStateCoverage,
    summaryCards: createSummaryCards(),
    workspaceNotice: `当前指标目录属于当前 Workspace。切换 Workspace 后指标目录、公式、阈值、血缘和证据都可能变化。当前 Workspace：${workspaceBinding.workspaceName}。`
  };
}

export const metricsStaticViewModel = createMetricsViewModel();
