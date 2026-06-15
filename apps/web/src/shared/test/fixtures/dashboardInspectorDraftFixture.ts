import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

const dashboardOwner = { type: "analysisTask" } as const;
const lastUpdatedAt = "2026-06-05T11:08:12+08:00";

const recognizedRevenueNode: InspectorTreeNode = {
  children: [
    {
      chips: ["primary_table", "dataTable"],
      kind: "dataTable",
      nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-table",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        tableId: "table-sales-order",
        type: "dataTable"
      },
      summary: "作为确认收入的主表来源，按 workspace 粒度聚合已确认订单收入。",
      title: "销售订单汇总表"
    },
    {
      chips: ["supporting_report", "report"],
      kind: "report",
      nodeId: "metric-context-metric-recognized-revenue-metric-context-source-revenue-report",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        reportId: "report-weekly-business",
        type: "report"
      },
      summary: "补充收入确认节奏、区域差异和渠道复核建议的只读摘要。",
      title: "周经营分析报告"
    }
  ],
  chips: ["营收质量", "Last 30 days", "下降 3.2%", "风险 medium"],
  kind: "metric",
  nodeId: "metric-context-metric-recognized-revenue",
  owner: dashboardOwner,
  role: "inputContext",
  sourceRef: {
    metricId: "metric-recognized-revenue",
    type: "metric"
  },
  summary: "收入增速 < -2% 进入关注，可结合公式和上下文来源继续分析。",
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  title: "确认收入",
  value: "¥12.8M"
};

const grossMarginNode: InspectorTreeNode = {
  children: [
    {
      chips: ["primary_table", "dataTable"],
      kind: "dataTable",
      nodeId: "metric-context-metric-gross-margin-metric-context-source-margin-table",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        tableId: "table-income-statement-daily",
        type: "dataTable"
      },
      summary: "提供毛利润和净收入字段，用于解释毛利率波动。",
      title: "损益日表"
    },
    {
      chips: ["supporting_document", "knowledgeDocument"],
      kind: "knowledgeDocument",
      nodeId: "metric-context-metric-gross-margin-metric-context-source-margin-document",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        knowledgeDocumentId: "knowledge-document-margin-review",
        type: "knowledgeDocument"
      },
      summary: "沉淀促销结构、成本结算和毛利波动解释的知识摘要。",
      title: "毛利率复盘纪要"
    }
  ],
  chips: ["利润结构", "Last 30 days", "持平 0.0%", "风险 low"],
  kind: "metric",
  nodeId: "metric-context-metric-gross-margin",
  owner: dashboardOwner,
  role: "inputContext",
  sourceRef: {
    metricId: "metric-gross-margin",
    type: "metric"
  },
  summary: "毛利率 < 32% 进入关注，可结合公式和上下文来源继续分析。",
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  title: "毛利率",
  value: "33.4%"
};

const refundRateNode: InspectorTreeNode = {
  children: [
    {
      chips: ["primary_table", "dataTable"],
      kind: "dataTable",
      nodeId: "metric-context-metric-refund-rate-metric-context-source-refund-table",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        tableId: "table-refund-order",
        type: "dataTable"
      },
      summary: "提供退款订单明细和退款原因聚合口径。",
      title: "退款订单表"
    },
    {
      chips: ["supporting_evidence", "sourceEvidence"],
      kind: "sourceEvidence",
      nodeId: "metric-context-metric-refund-rate-metric-context-source-refund-evidence",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        sourceEvidenceId: "source-evidence-refund-watch",
        type: "sourceEvidence"
      },
      summary: "记录近期退款率抬升和客服标签聚合后的证据摘要。",
      title: "退款异常证据摘要"
    }
  ],
  chips: ["营收质量", "Last 30 days", "上升 0.9%", "风险 medium"],
  kind: "metric",
  nodeId: "metric-context-metric-refund-rate",
  owner: dashboardOwner,
  role: "inputContext",
  sourceRef: {
    metricId: "metric-refund-rate",
    type: "metric"
  },
  summary: "退款率 > 4.5% 进入关注，可结合公式和上下文来源继续分析。",
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  title: "退款率",
  value: "4.8%"
};

const inventoryTurnoverNode: InspectorTreeNode = {
  children: [
    {
      chips: ["primary_table", "dataTable"],
      kind: "dataTable",
      nodeId: "metric-context-metric-inventory-turnover-metric-context-source-inventory-table",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        tableId: "table-inventory-daily",
        type: "dataTable"
      },
      summary: "提供平均库存和周转校验所需的日级快照摘要。",
      title: "库存日快照表"
    },
    {
      chips: ["supporting_document", "knowledgeDocument"],
      kind: "knowledgeDocument",
      nodeId: "metric-context-metric-inventory-turnover-metric-context-source-inventory-document",
      owner: dashboardOwner,
      role: "inputContext",
      sourceRef: {
        knowledgeDocumentId: "knowledge-document-inventory-east-04",
        type: "knowledgeDocument"
      },
      summary: "补充促销库存错配和补货节奏异常的摘要说明。",
      title: "华东库存复核记录"
    }
  ],
  chips: ["供应链效率", "Last 30 days", "下降 0.4 turns", "风险 high"],
  kind: "metric",
  nodeId: "metric-context-metric-inventory-turnover",
  owner: dashboardOwner,
  role: "inputContext",
  sourceRef: {
    metricId: "metric-inventory-turnover",
    type: "metric"
  },
  summary: "库存周转 < 5.3 turns 进入关注，可结合公式和上下文来源继续分析。",
  timeRange: {
    key: "last_30_days",
    label: "Last 30 days"
  },
  title: "库存周转",
  value: "5.1 turns"
};

const dashboardRiskNodes: InspectorTreeNode[] = [
  {
    chips: ["Last 30 days", "Supply Chain"],
    kind: "riskSignal",
    nodeId: "dashboard-node-risk-metric-inventory-turnover",
    owner: dashboardOwner,
    role: "inputContext",
    sourceRef: {
      metricId: "metric-inventory-turnover",
      type: "metric"
    },
    summary: "库存周转当前值 5.1 turns，阈值 库存周转 < 5.3 turns 进入关注，趋势 下降 0.4 turns，建议进入 Analysis 继续追问。",
    timeRange: {
      key: "last_30_days",
      label: "Last 30 days"
    },
    title: "库存周转风险",
    value: "5.1 turns"
  },
  {
    chips: ["Last 30 days", "Revenue Operations"],
    kind: "riskSignal",
    nodeId: "dashboard-node-risk-metric-recognized-revenue",
    owner: dashboardOwner,
    role: "inputContext",
    sourceRef: {
      metricId: "metric-recognized-revenue",
      type: "metric"
    },
    summary: "确认收入当前值 ¥12.8M，阈值 收入增速 < -2% 进入关注，趋势 下降 3.2%，建议进入 Analysis 继续追问。",
    timeRange: {
      key: "last_30_days",
      label: "Last 30 days"
    },
    title: "确认收入风险",
    value: "¥12.8M"
  },
  {
    chips: ["Last 30 days", "Customer Care"],
    kind: "riskSignal",
    nodeId: "dashboard-node-risk-metric-refund-rate",
    owner: dashboardOwner,
    role: "inputContext",
    sourceRef: {
      metricId: "metric-refund-rate",
      type: "metric"
    },
    summary: "退款率当前值 4.8%，阈值 退款率 > 4.5% 进入关注，趋势 上升 0.9%，建议进入 Analysis 继续追问。",
    timeRange: {
      key: "last_30_days",
      label: "Last 30 days"
    },
    title: "退款率风险",
    value: "4.8%"
  }
];

const dashboardReportEvidenceNodes: InspectorTreeNode[] = [
  {
    chips: ["更新时间 2026-06-05T11:08:12+08:00"],
    kind: "report",
    nodeId: "dashboard-node-report-report-weekly-business",
    owner: dashboardOwner,
    role: "inputContext",
    sourceRef: {
      reportId: "report-weekly-business",
      type: "report"
    },
    summary: "补充收入确认节奏、区域差异和渠道复核建议的只读摘要。",
    title: "周经营分析报告"
  },
  {
    chips: ["sourceEvidence", "supporting_evidence"],
    kind: "sourceEvidence",
    nodeId: "dashboard-node-sourceEvidence-source-evidence-refund-watch",
    owner: dashboardOwner,
    role: "inputContext",
    sourceRef: {
      sourceEvidenceId: "source-evidence-refund-watch",
      type: "sourceEvidence"
    },
    summary: "记录近期退款率抬升和客服标签聚合后的证据摘要。",
    title: "退款异常证据摘要"
  }
];

export const dashboardInspectorDraftFixture = {
  lastUpdatedAt,
  root: {
    capturedAt: lastUpdatedAt,
    chips: ["Last 30 days", "4 个指标", "2 条证据"],
    children: [
      {
        children: [
          recognizedRevenueNode,
          grossMarginNode,
          refundRateNode,
          inventoryTurnoverNode
        ],
        kind: "directory",
        nodeId: "dashboard-node-directory-metrics",
        owner: dashboardOwner,
        role: "directory",
        summary: "围绕当前经营问题最值得优先追问的共享指标。",
        title: "核心指标"
      },
      {
        children: dashboardRiskNodes,
        kind: "directory",
        nodeId: "dashboard-node-directory-risks",
        owner: dashboardOwner,
        role: "directory",
        summary: "聚焦需要继续核查的真实指标风险信号。",
        title: "风险异常"
      },
      {
        children: dashboardReportEvidenceNodes,
        kind: "directory",
        nodeId: "dashboard-node-directory-report-evidence",
        owner: dashboardOwner,
        role: "directory",
        summary: "从报告和证据入口继续追问当前经营问题。",
        title: "报告与证据"
      }
    ],
    kind: "dashboardOverview",
    nodeId: "dashboard-node-root",
    owner: dashboardOwner,
    role: "inputContext",
    summary: "围绕 Northstar Retail China 当前共享指标、风险异常和报告证据继续追问。确认收入 当前值 ¥12.8M。",
    timeRange: {
      key: "last_30_days",
      label: "Last 30 days"
    },
    title: "经营状态总览"
  } satisfies InspectorTreeNode
};
