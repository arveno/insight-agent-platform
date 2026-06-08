import type { DataKnowledgeStaticContracts } from "../models/dataKnowledgeContracts";
import type { DataKnowledgeWorkspaceBindingViewModel } from "../models/dataKnowledgeViewModel";

export const defaultDataKnowledgeWorkspaceBinding: DataKnowledgeWorkspaceBindingViewModel = {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
};

export const dataKnowledgeStaticContracts: DataKnowledgeStaticContracts = {
  dataFields: [
    {
      createdAt: "2026-05-19T09:22:00+08:00",
      dataType: "currency",
      fieldId: "field-sales-order-recognized-revenue",
      fieldName: "recognized_revenue",
      tableId: "table-sales-order"
    },
    {
      createdAt: "2026-05-19T09:24:00+08:00",
      dataType: "datetime",
      fieldId: "field-sales-order-booked-at",
      fieldName: "booked_at",
      tableId: "table-sales-order"
    },
    {
      createdAt: "2026-05-19T09:28:00+08:00",
      dataType: "currency",
      fieldId: "field-refund-order-refund-amount",
      fieldName: "refund_amount",
      tableId: "table-refund-order"
    },
    {
      createdAt: "2026-05-19T09:31:00+08:00",
      dataType: "string",
      fieldId: "field-refund-order-refund-reason",
      fieldName: "refund_reason",
      tableId: "table-refund-order"
    },
    {
      createdAt: "2026-05-23T11:15:00+08:00",
      dataType: "currency",
      fieldId: "field-customer-acquisition-channel-spend",
      fieldName: "channel_spend",
      tableId: "table-customer-acquisition"
    },
    {
      createdAt: "2026-05-23T11:17:00+08:00",
      dataType: "number",
      fieldId: "field-customer-acquisition-new-customers",
      fieldName: "new_customers",
      tableId: "table-customer-acquisition"
    }
  ],
  dataQualityChecks: [
    {
      createdAt: "2026-06-06T02:18:00+08:00",
      dataQualityCheckId: "data-quality-check-revenue-completeness",
      status: "attention",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    },
    {
      createdAt: "2026-06-06T02:22:00+08:00",
      dataQualityCheckId: "data-quality-check-refund-reconciliation",
      status: "ready",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    },
    {
      createdAt: "2026-06-05T23:40:00+08:00",
      dataQualityCheckId: "data-quality-check-knowledge-freshness",
      status: "attention",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    }
  ],
  dataSources: [
    {
      createdAt: "2026-05-18T08:30:00+08:00",
      dataSourceId: "data-source-crm-revenue",
      name: "CRM Revenue Warehouse",
      sourceType: "mysql",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    },
    {
      createdAt: "2026-05-23T10:08:00+08:00",
      dataSourceId: "data-source-growth-mart",
      name: "Growth Acquisition Mart",
      sourceType: "clickhouse",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    }
  ],
  dataTables: [
    {
      createdAt: "2026-05-19T09:10:00+08:00",
      dataSourceId: "data-source-crm-revenue",
      tableId: "table-sales-order",
      tableName: "sales_order"
    },
    {
      createdAt: "2026-05-19T09:16:00+08:00",
      dataSourceId: "data-source-crm-revenue",
      tableId: "table-refund-order",
      tableName: "refund_order"
    },
    {
      createdAt: "2026-05-23T11:00:00+08:00",
      dataSourceId: "data-source-growth-mart",
      tableId: "table-customer-acquisition",
      tableName: "customer_acquisition_daily"
    }
  ],
  knowledgeChunks: [
    {
      content:
        "渠道经营周报第 18 段：促销档期重叠导致不同渠道的获客成本和退货率同时抬升。",
      createdAt: "2026-05-29T14:10:00+08:00",
      knowledgeChunkId: "knowledge-chunk-channel-weekly-18",
      knowledgeDocumentId: "knowledge-document-channel-weekly"
    },
    {
      content:
        "渠道经营周报第 19 段：建议优先对齐渠道投放日历、收入确认窗口和退款波动解释。",
      createdAt: "2026-05-29T14:11:00+08:00",
      knowledgeChunkId: "knowledge-chunk-channel-weekly-19",
      knowledgeDocumentId: "knowledge-document-channel-weekly"
    },
    {
      content:
        "Finance Knowledge Base 第 7 段：收入确认依赖 booked_at、recognized_revenue 和 refund_amount 的统一口径。",
      createdAt: "2026-05-27T18:18:00+08:00",
      knowledgeChunkId: "knowledge-chunk-finance-kb-07",
      knowledgeDocumentId: "knowledge-document-finance-kb"
    },
    {
      content:
        "Finance Knowledge Base 第 8 段：SourceEvidence 需要回挂到知识文档或表级对象，不能直接展示 raw 向量结果。",
      createdAt: "2026-05-27T18:20:00+08:00",
      knowledgeChunkId: "knowledge-chunk-finance-kb-08",
      knowledgeDocumentId: "knowledge-document-finance-kb"
    }
  ],
  knowledgeDocuments: [
    {
      createdAt: "2026-05-27T18:00:00+08:00",
      knowledgeDocumentId: "knowledge-document-finance-kb",
      title: "Finance Knowledge Base",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    },
    {
      createdAt: "2026-05-29T14:00:00+08:00",
      knowledgeDocumentId: "knowledge-document-channel-weekly",
      title: "渠道经营周报",
      workspaceId: defaultDataKnowledgeWorkspaceBinding.workspaceId
    }
  ],
  sourceEvidences: [
    {
      confidence: 0.92,
      createdAt: "2026-06-06T09:10:00+08:00",
      runId: "run-revenue-anomaly-q2",
      snippet: "用于解释确认收入异常的表级证据快照，供 Analysis 和 Reports 复用。",
      sourceEvidenceId: "source-evidence-sales-order-snapshot",
      sourceId: "table-sales-order",
      sourceType: "data_table",
      title: "sales_order 收入确认快照"
    },
    {
      confidence: 0.84,
      createdAt: "2026-06-06T09:14:00+08:00",
      runId: "run-revenue-anomaly-q2",
      snippet: "退款明细用于解释收入扣减和退款异常，仍以 SourceEvidence 标准对象对外呈现。",
      sourceEvidenceId: "source-evidence-refund-order-snapshot",
      sourceId: "table-refund-order",
      sourceType: "data_table",
      title: "refund_order 退款明细证据"
    },
    {
      confidence: 0.88,
      createdAt: "2026-06-06T09:21:00+08:00",
      runId: "run-channel-margin-review",
      snippet: "周报段落用于解释促销档期和渠道结构变化如何进入报告结论。",
      sourceEvidenceId: "source-evidence-channel-weekly-document",
      sourceId: "knowledge-document-channel-weekly",
      sourceType: "knowledge_document",
      title: "渠道经营周报文档证据"
    },
    {
      confidence: 0.81,
      createdAt: "2026-06-06T09:23:00+08:00",
      runId: "run-channel-margin-review",
      snippet: "知识切片保留结构化摘要，不展示 raw embedding、raw score 或原始检索负载。",
      sourceEvidenceId: "source-evidence-channel-weekly-chunk-18",
      sourceId: "knowledge-chunk-channel-weekly-18",
      sourceType: "knowledge_chunk",
      title: "渠道经营周报切片证据"
    }
  ]
};
