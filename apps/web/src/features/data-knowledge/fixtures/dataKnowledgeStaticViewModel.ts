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
import type { DataKnowledgeViewModel } from "../models";

const dataSourceSummary = {
  description: "核心数据源静态摘要，不连接真实数据库。",
  key: "crm-data-source",
  label: "CRM 数据源",
  risk: warningRisk,
  status: readyStatus,
  value: "12 张表"
};

const dataTableSummary = {
  description: "销售订单表 schema 摘要。",
  key: "sales-order-table",
  label: "sales_order",
  status: readyStatus,
  value: "36 fields"
};

const dataFieldSummary = {
  description: "字段字典摘要，字段详情归 Data & Knowledge Surface。",
  key: "recognized-revenue-field",
  label: "recognized_revenue",
  status: readyStatus,
  value: "currency"
};

const knowledgeDocumentSummary = {
  description: "业务口径文档静态摘要。",
  key: "revenue-policy-doc",
  label: "收入确认口径",
  status: readyStatus,
  value: "v3"
};

const knowledgeChunkSummary = {
  description: "知识切片只展示脱敏摘要，不展示 raw 文档。",
  key: "revenue-policy-chunk",
  label: "收入确认延迟规则",
  risk: warningRisk,
  status: readyStatus,
  value: "chunk-18"
};

export const dataKnowledgeStaticViewModel: DataKnowledgeViewModel = {
  analysisContextEntrances: [
    {
      description: "带数据表和字段上下文进入 Analysis。",
      intent: "navigation",
      key: "data-knowledge-open-analysis",
      label: "用数据上下文分析",
      targetRoute: "analysis"
    }
  ],
  dataFields: [dataFieldSummary],
  dataKnowledgeState: defaultStateCoverage.ready,
  dataKnowledgeTabs: [
    { count: 2, key: "data-sources", label: "Data Sources", status: "ready" },
    { count: 2, key: "knowledge", label: "Knowledge", status: "ready" }
  ],
  dataSources: [dataSourceSummary],
  dataTables: [dataTableSummary],
  evidenceEntrances: sharedEvidenceEntrances,
  gapNote: "DataQuality summary、ingestion、index 和 schema sync 聚合均为 Gap。",
  implementationStatus: "gap",
  indexEntrances: [
    {
      disabled: true,
      intent: "disabled",
      key: "index-gap",
      label: "索引入口",
      description: "只展示索引状态入口，不执行真实 index job。"
    }
  ],
  ingestionEntrances: [
    {
      disabled: true,
      intent: "disabled",
      key: "ingestion-gap",
      label: "Ingestion 入口",
      description: "只展示 ingestion 状态入口，不执行真实导入。"
    }
  ],
  knowledgeChunks: [knowledgeChunkSummary],
  knowledgeDocuments: [knowledgeDocumentSummary],
  lastUpdatedAt: "2026-06-03T18:08:00+08:00",
  mainSections: [
    { description: "数据源、数据表和字段字典摘要。", key: "data-source", status: readyStatus, title: "Data Source Browser" },
    { description: "知识文档和知识切片摘要。", key: "knowledge", status: readyStatus, title: "Knowledge Browser" },
    { description: "数据质量、schema sync、Analysis 上下文入口。", key: "quality-entry", status: readyStatus, title: "Quality & Analysis Entrances" }
  ],
  metricCards: [
    {
      evidenceCount: 2,
      key: "data-quality-score",
      label: "数据质量",
      risk: warningRisk,
      status: readyStatus,
      trendText: "2 项需关注",
      valueText: "91%"
    }
  ],
  pageDescription: "数据源、字段字典、业务知识和知识切片的静态展示数据。",
  pageKey: "data-knowledge",
  pageTitle: "Data & Knowledge",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "data-knowledge-open-analysis",
    label: "进入分析",
    targetRoute: "analysis"
  },
  qualitySummary: [
    {
      description: "数据质量摘要，详情和执行归 Platform Operations。",
      key: "quality-summary",
      label: "质量摘要",
      linkTo: "platform-operations",
      risk: warningRisk,
      status: readyStatus,
      value: "2 checks"
    }
  ],
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "data-knowledge-right-assist",
    "Data & Knowledge 辅助摘要",
    "承接 selected data source、table、field、knowledge document 和 chunk 摘要。"
  ),
  schemaSyncSummary: [
    {
      description: "schema sync 为静态状态入口，不执行真实同步。",
      key: "schema-sync",
      label: "Schema Sync",
      status: warningStatus,
      value: "待确认 / Gap"
    }
  ],
  secondaryActions: [
    { intent: "navigation", key: "data-knowledge-open-metrics", label: "查看指标", targetRoute: "metrics" }
  ],
  selectedDataField: dataFieldSummary,
  selectedDataSource: dataSourceSummary,
  selectedDataTable: dataTableSummary,
  selectedKnowledgeChunk: knowledgeChunkSummary,
  selectedKnowledgeDocument: knowledgeDocumentSummary,
  selectedTab: "data-sources",
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    { description: "数据与知识静态目录。", key: "data-sources-count", label: "数据源", status: readyStatus, value: "2" },
    { description: "知识文档静态目录。", key: "knowledge-doc-count", label: "知识文档", status: readyStatus, value: "2" }
  ]
};
