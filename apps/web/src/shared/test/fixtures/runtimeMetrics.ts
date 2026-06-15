import type { Metric } from "@insight-agent/contracts/generated/typescript";

export const runtimeMetricsFixtures: Metric[] = [
  {
    businessDomainId: "business-domain-revenue-quality",
    contextSources: [
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-revenue-table",
        metricId: "metric-recognized-revenue",
        role: "primary_table",
        sourceId: "table-sales-order",
        sourceType: "dataTable",
        summary: "作为确认收入的主表来源，按 workspace 粒度聚合已确认订单收入。",
        title: "销售订单汇总表",
        updatedAt: "2026-06-05T11:08:12+08:00"
      },
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-revenue-report",
        metricId: "metric-recognized-revenue",
        role: "supporting_report",
        sourceId: "report-weekly-business",
        sourceType: "report",
        summary: "补充收入确认节奏、区域差异和渠道复核建议的只读摘要。",
        title: "周经营分析报告",
        updatedAt: "2026-06-05T11:08:12+08:00"
      }
    ],
    createdAt: "2026-06-05T11:08:12+08:00",
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
    updatedAt: "2026-06-05T11:08:12+08:00",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    businessDomainId: "business-domain-margin-analysis",
    contextSources: [
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-margin-table",
        metricId: "metric-gross-margin",
        role: "primary_table",
        sourceId: "table-income-statement-daily",
        sourceType: "dataTable",
        summary: "提供毛利润和净收入字段，用于解释毛利率波动。",
        title: "损益日表",
        updatedAt: "2026-06-05T11:08:12+08:00"
      },
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-margin-document",
        metricId: "metric-gross-margin",
        role: "supporting_document",
        sourceId: "knowledge-document-margin-review",
        sourceType: "knowledgeDocument",
        summary: "沉淀促销结构、成本结算和毛利波动解释的知识摘要。",
        title: "毛利率复盘纪要",
        updatedAt: "2026-06-05T11:08:12+08:00"
      }
    ],
    createdAt: "2026-06-05T11:08:12+08:00",
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
    updatedAt: "2026-06-05T11:08:12+08:00",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    businessDomainId: "business-domain-revenue-quality",
    contextSources: [
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-refund-table",
        metricId: "metric-refund-rate",
        role: "primary_table",
        sourceId: "table-refund-order",
        sourceType: "dataTable",
        summary: "提供退款订单明细和退款原因聚合口径。",
        title: "退款订单表",
        updatedAt: "2026-06-05T11:08:12+08:00"
      },
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-refund-evidence",
        metricId: "metric-refund-rate",
        role: "supporting_evidence",
        sourceId: "source-evidence-refund-watch",
        sourceType: "sourceEvidence",
        summary: "记录近期退款率抬升和客服标签聚合后的证据摘要。",
        title: "退款异常证据摘要",
        updatedAt: "2026-06-05T11:08:12+08:00"
      }
    ],
    createdAt: "2026-06-05T11:08:12+08:00",
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
    updatedAt: "2026-06-05T11:08:12+08:00",
    workspaceId: "workspace-northstar-retail-china"
  },
  {
    businessDomainId: "business-domain-supply-chain-efficiency",
    contextSources: [
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-inventory-table",
        metricId: "metric-inventory-turnover",
        role: "primary_table",
        sourceId: "table-inventory-daily",
        sourceType: "dataTable",
        summary: "提供平均库存和周转校验所需的日级快照摘要。",
        title: "库存日快照表",
        updatedAt: "2026-06-05T11:08:12+08:00"
      },
      {
        createdAt: "2026-06-05T11:08:12+08:00",
        metricContextSourceId: "metric-context-source-inventory-document",
        metricId: "metric-inventory-turnover",
        role: "supporting_document",
        sourceId: "knowledge-document-inventory-east-04",
        sourceType: "knowledgeDocument",
        summary: "补充促销库存错配和补货节奏异常的摘要说明。",
        title: "华东库存复核记录",
        updatedAt: "2026-06-05T11:08:12+08:00"
      }
    ],
    createdAt: "2026-06-05T11:08:12+08:00",
    currentValue: "5.1 turns",
    description: "一定周期内库存消耗和补货效率的综合指标。",
    formulaSummary: "库存周转 = 销售成本 / 平均库存",
    metricId: "metric-inventory-turnover",
    name: "库存周转",
    ownerTeam: "Supply Chain",
    period: "Last 30 days",
    riskLevel: "high",
    status: "attention",
    thresholdSummary: "库存周转 < 5.3 turns 进入关注",
    trendDirection: "down",
    trendValue: "-0.4 turns",
    unit: "turns",
    updatedAt: "2026-06-05T11:08:12+08:00",
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
