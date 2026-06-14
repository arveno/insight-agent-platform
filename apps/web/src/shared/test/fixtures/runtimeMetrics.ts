import type { Metric } from "@insight-agent/contracts/generated/typescript";

export const runtimeMetricsFixtures: Metric[] = [
  {
    businessDomainId: "business-domain-revenue-quality",
    contextSources: [
      {
        createdAt: "2026-06-12T10:30:00+08:00",
        metricContextSourceId: "metric-context-source-revenue-table",
        metricId: "metric-recognized-revenue",
        role: "primary_table",
        sourceId: "table-sales-order",
        sourceType: "dataTable",
        summary: "作为确认收入的主表来源。",
        title: "销售订单汇总表",
        updatedAt: "2026-06-12T10:30:00+08:00"
      },
      {
        createdAt: "2026-06-12T10:30:00+08:00",
        metricContextSourceId: "metric-context-source-revenue-report",
        metricId: "metric-recognized-revenue",
        role: "supporting_report",
        sourceId: "report-weekly-business",
        sourceType: "report",
        summary: "补充收入确认节奏和区域差异。",
        title: "周经营分析报告",
        updatedAt: "2026-06-12T10:30:00+08:00"
      }
    ],
    createdAt: "2026-06-12T10:30:00+08:00",
    currentValue: "¥12.8M",
    description: "已满足确认条件的收入金额。",
    formulaSummary: "确认收入 = 已预订收入 - 退款金额",
    metricId: "metric-recognized-revenue",
    name: "确认收入",
    ownerTeam: "Revenue Operations",
    period: "Last 30 days",
    riskLevel: "medium",
    status: "attention",
    thresholdSummary: "收入增速 < -2% 进入关注",
    trendDirection: "down",
    trendValue: "-3.2%",
    unit: "CNY",
    updatedAt: "2026-06-12T10:30:00+08:00",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    businessDomainId: "business-domain-margin-analysis",
    contextSources: [
      {
        createdAt: "2026-06-12T10:30:00+08:00",
        metricContextSourceId: "metric-context-source-margin-table",
        metricId: "metric-gross-margin",
        role: "primary_table",
        sourceId: "table-income-statement-daily",
        sourceType: "dataTable",
        summary: "提供毛利润和净收入字段。",
        title: "损益日表",
        updatedAt: "2026-06-12T10:30:00+08:00"
      }
    ],
    createdAt: "2026-06-12T10:30:00+08:00",
    currentValue: "33.4%",
    description: "收入扣除销售成本后保留的利润比例。",
    formulaSummary: "毛利率 = 毛利润 / 净收入",
    metricId: "metric-gross-margin",
    name: "毛利率",
    ownerTeam: "Finance BP",
    period: "Last 30 days",
    riskLevel: "low",
    status: "healthy",
    thresholdSummary: "毛利率 < 32% 进入关注",
    trendDirection: "flat",
    trendValue: "+0.0%",
    unit: "%",
    updatedAt: "2026-06-12T10:30:00+08:00",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    businessDomainId: "business-domain-revenue-quality",
    contextSources: [
      {
        createdAt: "2026-06-12T10:30:00+08:00",
        metricContextSourceId: "metric-context-source-refund-table",
        metricId: "metric-refund-rate",
        role: "primary_table",
        sourceId: "table-refund-order",
        sourceType: "dataTable",
        summary: "提供退款订单明细和退款原因聚合口径。",
        title: "退款订单表",
        updatedAt: "2026-06-12T10:30:00+08:00"
      }
    ],
    createdAt: "2026-06-12T10:30:00+08:00",
    currentValue: "4.8%",
    description: "已退款订单占已确认订单的比例。",
    formulaSummary: "退款率 = 退款订单数 / 已确认订单数",
    metricId: "metric-refund-rate",
    name: "退款率",
    ownerTeam: "Customer Care",
    period: "Last 30 days",
    riskLevel: "medium",
    status: "attention",
    thresholdSummary: "退款率 > 4.5% 进入关注",
    trendDirection: "up",
    trendValue: "+0.9%",
    unit: "%",
    updatedAt: "2026-06-12T10:30:00+08:00",
    workspaceId: "workspace-northstar-retail-china"
  }
];

export function findRuntimeMetric(metricId: string): Metric {
  const metric = runtimeMetricsFixtures.find((item) => item.metricId === metricId);

  if (!metric) {
    throw new Error(`Unknown metric fixture: ${metricId}`);
  }

  return metric;
}
