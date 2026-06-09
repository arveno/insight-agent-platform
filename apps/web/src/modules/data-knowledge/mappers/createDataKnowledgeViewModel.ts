import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk,
  warningStatus
} from "../../../shared/view-model/staticStateFixtures";
import type {
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../../shared/view-model/staticViewModelTypes";
import {
  dataKnowledgeStaticContracts,
  defaultDataKnowledgeWorkspaceBinding
} from "../fixtures/dataKnowledgeStaticContracts";
import type {
  DataKnowledgeAssetKind,
  DataKnowledgeChunkViewModel,
  DataKnowledgeEvidenceViewModel,
  DataKnowledgeFieldViewModel,
  DataKnowledgeQualityCheckViewModel,
  DataKnowledgeSelectedAssetViewModel,
  DataKnowledgeTableViewModel,
  DataKnowledgeViewModel,
  DataKnowledgeWorkspaceBindingViewModel
} from "../models/dataKnowledgeViewModel";
import { createDataKnowledgeRelationshipGraph } from "./createDataKnowledgeRelationshipGraph";

const lowRisk = {
  level: "low",
  titleKey: "risk.low.title"
} as const satisfies StaticRiskViewModel;

type AssetPresentation = {
  risk?: StaticRiskViewModel;
  status?: StaticStatusViewModel;
  subtitle: string;
  summary: string;
};

type TablePresentation = {
  summary: string;
};

type FieldPresentation = {
  summary: string;
};

type ChunkPresentation = {
  groupTitle: string;
  summary: string;
  title: string;
};

type QualityCheckPresentation = {
  risk?: StaticRiskViewModel;
  statusLabel: string;
  statusView?: StaticStatusViewModel;
  summary: string;
  title: string;
};

type UsagePresentation = {
  reportId: string;
  summary: string;
  title: string;
};

const dataSourcePresentationById: Record<string, AssetPresentation> = {
  "data-source-crm-revenue": {
    risk: warningRisk,
    status: warningStatus,
    subtitle: "MySQL / Revenue",
    summary:
      "当前 Workspace 的收入核心数据源，用于承接收入确认、退款扣减和后续 SourceEvidence 追溯。"
  },
  "data-source-growth-mart": {
    risk: lowRisk,
    status: readyStatus,
    subtitle: "ClickHouse / Growth",
    summary: "承接获客效率和渠道投放事实的只读资产目录，用于 Metrics 和 Analysis 的上下文绑定。"
  }
};

const knowledgeDocumentPresentationById: Record<string, AssetPresentation> = {
  "knowledge-document-finance-kb": {
    status: readyStatus,
    subtitle: "Knowledge document",
    summary:
      "沉淀收入确认和证据表达规则的知识文档，只读展示给 Analysis / Reports / RAG Strategy 作为语义来源。"
  },
  "knowledge-document-channel-weekly": {
    risk: warningRisk,
    status: readyStatus,
    subtitle: "Weekly report",
    summary: "沉淀渠道经营复盘、促销上下文和异常解释的知识文档，当前只展示切片与承接边界。"
  }
};

const tablePresentationById: Record<string, TablePresentation> = {
  "table-customer-acquisition": {
    summary: "承接渠道投放与新增客户的日粒度事实，不在本页执行真实同步或下钻。"
  },
  "table-refund-order": {
    summary: "用于解释退款波动与收入扣减来源，表级证据进入 SourceEvidence 后才对 UI 可见。"
  },
  "table-sales-order": {
    summary: "收入确认主表，只读展示 schema 范围，不展示 raw SQL、raw API 或真实数据连接结果。"
  }
};

const fieldPresentationById: Record<string, FieldPresentation> = {
  "field-customer-acquisition-channel-spend": {
    summary: "营销投放金额字段，用于获客成本与渠道效率语义说明。"
  },
  "field-customer-acquisition-new-customers": {
    summary: "新增客户数字段，用于获客成本和转化分析。"
  },
  "field-refund-order-refund-amount": {
    summary: "退款金额字段，用于收入扣减和退款解释。"
  },
  "field-refund-order-refund-reason": {
    summary: "退款原因字段，只用于语义解释，不直接暴露原始值。"
  },
  "field-sales-order-booked-at": {
    summary: "订单确认时间字段，用于说明时间窗口与收入确认边界。"
  },
  "field-sales-order-recognized-revenue": {
    summary: "确认收入字段，是当前 Workspace 的收入指标语义主字段之一。"
  }
};

const chunkPresentationById: Record<string, ChunkPresentation> = {
  "knowledge-chunk-channel-weekly-18": {
    groupTitle: "渠道复盘章节",
    summary: "切片保持结构化摘要，用于 Reports 和 Analysis 的证据追溯。",
    title: "促销与获客成本"
  },
  "knowledge-chunk-channel-weekly-19": {
    groupTitle: "行动建议章节",
    summary: "切片描述后续动作建议，但不在本页发起真实任务或索引。",
    title: "投放日历与确认窗口"
  },
  "knowledge-chunk-finance-kb-07": {
    groupTitle: "收入口径章节",
    summary: "切片用于统一收入口径和字段语义，不展示原始向量负载。",
    title: "收入确认规则"
  },
  "knowledge-chunk-finance-kb-08": {
    groupTitle: "Evidence 标准章节",
    summary: "切片用于约束 Evidence 标准化边界，不展示 raw 检索结果。",
    title: "Evidence 标准化"
  }
};

const qualityCheckPresentationById: Record<string, QualityCheckPresentation> = {
  "data-quality-check-knowledge-freshness": {
    risk: warningRisk,
    statusLabel: "Needs review",
    statusView: warningStatus,
    summary: "知识文档 freshness 需要人工复核。详情、真实 Job 和重跑入口仍归 Platform Operations。",
    title: "Knowledge freshness review"
  },
  "data-quality-check-refund-reconciliation": {
    risk: lowRisk,
    statusLabel: "Ready",
    statusView: readyStatus,
    summary: "退款明细与收入扣减对账状态正常。本页只展示摘要，不执行真实对账任务。",
    title: "Refund reconciliation"
  },
  "data-quality-check-revenue-completeness": {
    risk: warningRisk,
    statusLabel: "Attention",
    statusView: warningStatus,
    summary: "Revenue completeness 存在需要复核的缺口波动，可能影响收入类指标和报告证据可信度。",
    title: "Revenue completeness"
  }
};

const usagePresentationByRunId: Record<string, UsagePresentation> = {
  "run-channel-margin-review": {
    reportId: "report-channel-margin-review",
    summary: "证据被渠道毛利复盘分析和对应报告段落引用，用于解释促销档期影响。",
    title: "Channel margin review"
  },
  "run-revenue-anomaly-q2": {
    reportId: "report-revenue-anomaly-q2",
    summary: "证据被收入异常追问 run 和收入异常报告引用，用于解释确认收入与退款扣减。",
    title: "Revenue anomaly follow-up"
  }
};

function withWorkspaceBinding(workspaceBinding: DataKnowledgeWorkspaceBindingViewModel) {
  return {
    dataQualityChecks: dataKnowledgeStaticContracts.dataQualityChecks.map((item) => ({
      ...item,
      workspaceId: workspaceBinding.workspaceId
    })),
    dataSources: dataKnowledgeStaticContracts.dataSources.map((item) => ({
      ...item,
      workspaceId: workspaceBinding.workspaceId
    })),
    knowledgeDocuments: dataKnowledgeStaticContracts.knowledgeDocuments.map((item) => ({
      ...item,
      workspaceId: workspaceBinding.workspaceId
    }))
  };
}

function createAssetKey(kind: DataKnowledgeAssetKind, id: string) {
  return `${kind}:${id}`;
}

function formatConfidence(confidence: number) {
  return `${Math.round(confidence * 100)}%`;
}

function resolveSelectedAssetKey(
  assetItems: DataKnowledgeViewModel["assetItems"],
  selectedAssetKey: string
) {
  return assetItems.find((item) => item.key === selectedAssetKey)?.key ?? assetItems[0]?.key;
}

function createSelectedAsset(
  selectedAssetKey: string,
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel
): DataKnowledgeSelectedAssetViewModel {
  const { dataSources, knowledgeDocuments } = withWorkspaceBinding(workspaceBinding);
  const dataSource = dataSources.find(
    (item) => createAssetKey("data_source", item.dataSourceId) === selectedAssetKey
  );

  if (dataSource) {
    const presentation = dataSourcePresentationById[dataSource.dataSourceId];

    return {
      createdAt: dataSource.createdAt,
      dataSource,
      key: createAssetKey("data_source", dataSource.dataSourceId),
      kind: "data_source",
      risk: presentation.risk,
      status: presentation.status,
      summary: presentation.summary,
      title: dataSource.name,
      workspaceId: dataSource.workspaceId
    };
  }

  const knowledgeDocument =
    knowledgeDocuments.find(
      (item) => createAssetKey("knowledge_document", item.knowledgeDocumentId) === selectedAssetKey
    ) ?? knowledgeDocuments[0];
  const presentation = knowledgeDocumentPresentationById[knowledgeDocument.knowledgeDocumentId];

  return {
    createdAt: knowledgeDocument.createdAt,
    key: createAssetKey("knowledge_document", knowledgeDocument.knowledgeDocumentId),
    kind: "knowledge_document",
    knowledgeDocument,
    risk: presentation.risk,
    status: presentation.status,
    summary: presentation.summary,
    title: knowledgeDocument.title,
    workspaceId: knowledgeDocument.workspaceId
  };
}

function createTables(
  selectedAsset: DataKnowledgeSelectedAssetViewModel
): DataKnowledgeTableViewModel[] {
  if (selectedAsset.kind !== "data_source" || !selectedAsset.dataSource) {
    return [];
  }

  const { dataSourceId } = selectedAsset.dataSource;

  return dataKnowledgeStaticContracts.dataTables
    .filter((table) => table.dataSourceId === dataSourceId)
    .map((table) => ({
      ...table,
      fieldCount: dataKnowledgeStaticContracts.dataFields.filter(
        (field) => field.tableId === table.tableId
      ).length,
      summary: tablePresentationById[table.tableId]?.summary ?? ""
    }));
}

function createFields(tables: DataKnowledgeTableViewModel[]): DataKnowledgeFieldViewModel[] {
  const tableIds = new Set(tables.map((table) => table.tableId));

  return dataKnowledgeStaticContracts.dataFields
    .filter((field) => tableIds.has(field.tableId))
    .map((field) => ({
      ...field,
      summary: fieldPresentationById[field.fieldId]?.summary ?? ""
    }));
}

function createChunks(
  selectedAsset: DataKnowledgeSelectedAssetViewModel
): DataKnowledgeChunkViewModel[] {
  if (selectedAsset.kind !== "knowledge_document" || !selectedAsset.knowledgeDocument) {
    return [];
  }

  return dataKnowledgeStaticContracts.knowledgeChunks
    .filter(
      (chunk) => chunk.knowledgeDocumentId === selectedAsset.knowledgeDocument?.knowledgeDocumentId
    )
    .map((chunk) => {
      const presentation = chunkPresentationById[chunk.knowledgeChunkId];

      return {
        chunkGroupTitle: presentation.groupTitle,
        contentPreview: chunk.content,
        createdAt: chunk.createdAt,
        knowledgeChunkId: chunk.knowledgeChunkId,
        knowledgeDocumentId: chunk.knowledgeDocumentId,
        summary: presentation.summary,
        title: presentation.title
      };
    });
}

function createEvidenceItems(
  selectedAsset: DataKnowledgeSelectedAssetViewModel
): DataKnowledgeEvidenceViewModel[] {
  let evidenceContracts = dataKnowledgeStaticContracts.sourceEvidences;

  if (selectedAsset.kind === "data_source" && selectedAsset.dataSource) {
    const tableIds = dataKnowledgeStaticContracts.dataTables
      .filter((table) => table.dataSourceId === selectedAsset.dataSource?.dataSourceId)
      .map((table) => table.tableId);

    evidenceContracts = evidenceContracts.filter(
      (evidence) => evidence.sourceType === "data_table" && tableIds.includes(evidence.sourceId)
    );
  }

  if (selectedAsset.kind === "knowledge_document" && selectedAsset.knowledgeDocument) {
    const chunkIds = dataKnowledgeStaticContracts.knowledgeChunks
      .filter(
        (chunk) =>
          chunk.knowledgeDocumentId === selectedAsset.knowledgeDocument?.knowledgeDocumentId
      )
      .map((chunk) => chunk.knowledgeChunkId);

    evidenceContracts = evidenceContracts.filter((evidence) => {
      if (evidence.sourceType === "knowledge_document") {
        return evidence.sourceId === selectedAsset.knowledgeDocument?.knowledgeDocumentId;
      }

      return evidence.sourceType === "knowledge_chunk" && chunkIds.includes(evidence.sourceId);
    });
  }

  return evidenceContracts.map((evidence) => {
    const usage = usagePresentationByRunId[evidence.runId];

    return {
      ...evidence,
      confidenceText: formatConfidence(evidence.confidence),
      reportId: usage?.reportId,
      usageSummary: usage?.summary ?? "证据当前只用于静态 Usage 摘要展示。",
      usageTitle: usage?.title ?? evidence.runId
    };
  });
}

function createWorkspaceQualityChecks(
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel
): DataKnowledgeQualityCheckViewModel[] {
  return withWorkspaceBinding(workspaceBinding).dataQualityChecks.map((qualityCheck) => {
    const presentation = qualityCheckPresentationById[qualityCheck.dataQualityCheckId];

    return {
      createdAt: qualityCheck.createdAt,
      dataQualityCheckId: qualityCheck.dataQualityCheckId,
      risk: presentation.risk,
      status: qualityCheck.status,
      statusLabel: presentation.statusLabel,
      statusView: presentation.statusView,
      summary: presentation.summary,
      title: presentation.title,
      workspaceId: qualityCheck.workspaceId
    };
  });
}

export function createDataKnowledgeViewModel(
  selectedAssetKey?: string,
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel = defaultDataKnowledgeWorkspaceBinding
): DataKnowledgeViewModel {
  const { dataSources, knowledgeDocuments } = withWorkspaceBinding(workspaceBinding);
  const assetItems = [
    ...dataSources.map((dataSource) => ({
      key: createAssetKey("data_source", dataSource.dataSourceId),
      kind: "data_source" as const,
      risk: dataSourcePresentationById[dataSource.dataSourceId]?.risk,
      status: dataSourcePresentationById[dataSource.dataSourceId]?.status,
      subtitle: dataSourcePresentationById[dataSource.dataSourceId]?.subtitle,
      title: dataSource.name
    })),
    ...knowledgeDocuments.map((document) => ({
      key: createAssetKey("knowledge_document", document.knowledgeDocumentId),
      kind: "knowledge_document" as const,
      risk: knowledgeDocumentPresentationById[document.knowledgeDocumentId]?.risk,
      status: knowledgeDocumentPresentationById[document.knowledgeDocumentId]?.status,
      subtitle: knowledgeDocumentPresentationById[document.knowledgeDocumentId]?.subtitle,
      title: document.title
    }))
  ];
  const selectedKey = selectedAssetKey
    ? resolveSelectedAssetKey(assetItems, selectedAssetKey)
    : undefined;
  const selectedAsset = createSelectedAsset(selectedKey ?? assetItems[0].key, workspaceBinding);
  const tables = createTables(selectedAsset);
  const fields = createFields(tables);
  const chunks = createChunks(selectedAsset);
  const evidenceItems = createEvidenceItems(selectedAsset);
  const qualityChecks = createWorkspaceQualityChecks(workspaceBinding);
  const readonlyBoundaryItems = [
    "不接真实 API / DB",
    "不执行 ingestion",
    "不执行 schema sync",
    "不执行 LlamaIndex indexing",
    "不执行 Milvus vector search",
    "不执行 DataQualityCheck"
  ];
  const technicalBoundaryItems = [
    "LlamaIndex = 文档解析 / 切片 / 索引 / 检索增强方向",
    "Milvus = 向量存储 / 相似度检索方向",
    "SourceEvidence = 标准化证据对象"
  ];
  const relationship = createDataKnowledgeRelationshipGraph({
    chunks,
    evidenceItems,
    fields,
    selectedAsset,
    tables
  });

  return {
    assetItems,
    chunks,
    dataKnowledgeState: defaultStateCoverage.ready,
    evidenceItems,
    fields,
    implementationStatus: "stable",
    lastUpdatedAt: "2026-06-06T20:10:00+08:00",
    mainSections: [
      {
        descriptionKey: "page.dataKnowledge.section.selectedAsset.description",
        key: "data-knowledge-selected-asset",
        status: readyStatus,
        titleKey: "page.dataKnowledge.section.selectedAsset.title"
      },
      {
        descriptionKey: "page.dataKnowledge.section.relationship.description",
        key: "data-knowledge-relationship",
        status: readyStatus,
        titleKey: "page.dataKnowledge.section.relationship.title"
      },
      {
        descriptionKey: "page.dataKnowledge.section.nodeDetail.description",
        key: "data-knowledge-node-detail",
        status: readyStatus,
        titleKey: "page.dataKnowledge.section.nodeDetail.title"
      }
    ],
    metricCards: [],
    pageDescriptionKey: "page.dataKnowledge.description",
    pageKey: "data-knowledge",
    pageTitleKey: "page.dataKnowledge.title",
    permissionSummary: defaultPermissionSummary,
    primaryAction: {
      descriptionKey: "action.dataKnowledgeOpenAnalysis.description",
      intent: "navigation",
      key: "data-knowledge-open-analysis",
      labelKey: "action.dataKnowledgeOpenAnalysis.label",
      targetRoute: "analysis"
    },
    qualityChecks,
    readonlyBoundaryItems,
    readonlyNotice:
      "不接真实 API / DB，不执行 ingestion、schema sync、LlamaIndex indexing、Milvus vector search 或 DataQualityCheck。",
    readonlyState: defaultReadonlyState,
    relationshipGraph: relationship.graph,
    relationshipNodeDetails: relationship.nodeDetails,
    rightAssistSummary: createRightAssistSummary(
      "data-knowledge-right-assist",
      "page.dataKnowledge.rightAssist.title",
      "page.dataKnowledge.rightAssist.description"
    ),
    secondaryActions: [
      {
        intent: "navigation",
        key: "data-knowledge-open-metrics",
        labelKey: "action.dataKnowledgeOpenMetrics.label",
        targetRoute: "metrics"
      },
      {
        intent: "navigation",
        key: "data-knowledge-open-reports",
        labelKey: "action.dataKnowledgeOpenReports.label",
        targetRoute: "reports"
      },
      {
        intent: "navigation",
        key: "data-knowledge-open-platform-operations",
        labelKey: "action.dataKnowledgeOpenPlatformOperations.label",
        targetRoute: "platform-operations"
      }
    ],
    selectedAsset,
    stateCoverage: defaultStateCoverage,
    summaryCards: [
      {
        description: "当前 Workspace 的 DataSource 数量。",
        key: "data-knowledge-summary-data-source-count",
        label: "DataSource count",
        status: readyStatus,
        value: String(dataSources.length)
      },
      {
        description: "当前 Workspace 目录中挂载的 DataTable 数量。",
        key: "data-knowledge-summary-data-table-count",
        label: "DataTable count",
        status: readyStatus,
        value: String(dataKnowledgeStaticContracts.dataTables.length)
      },
      {
        description: "当前 Workspace 字段字典中纳入静态视图的 DataField 数量。",
        key: "data-knowledge-summary-data-field-count",
        label: "DataField count",
        status: readyStatus,
        value: String(dataKnowledgeStaticContracts.dataFields.length)
      },
      {
        description: "当前 Workspace 的 KnowledgeDocument 数量。",
        key: "data-knowledge-summary-knowledge-document-count",
        label: "KnowledgeDocument count",
        status: readyStatus,
        value: String(knowledgeDocuments.length)
      },
      {
        description: "当前 Workspace 的 KnowledgeChunk 数量。",
        key: "data-knowledge-summary-knowledge-chunk-count",
        label: "KnowledgeChunk count",
        status: readyStatus,
        value: String(dataKnowledgeStaticContracts.knowledgeChunks.length)
      },
      {
        description: "当前 Workspace 的 SourceEvidence 数量。",
        key: "data-knowledge-summary-source-evidence-count",
        label: "SourceEvidence count",
        risk: warningRisk,
        status: readyStatus,
        value: String(dataKnowledgeStaticContracts.sourceEvidences.length)
      },
      {
        description: "当前 Workspace 的 DataQualityCheck 摘要数量。",
        key: "data-knowledge-summary-quality-count",
        label: "DataQualityCheck summary",
        risk: warningRisk,
        status: warningStatus,
        value: String(dataKnowledgeStaticContracts.dataQualityChecks.length)
      }
    ],
    tables,
    tabs: [
      {
        count: dataSources.length,
        key: "data-sources",
        labelKey: "page.dataKnowledge.tab.dataSources.label",
        status: "ready"
      },
      {
        count: knowledgeDocuments.length,
        key: "knowledge-documents",
        labelKey: "page.dataKnowledge.tab.knowledgeDocuments.label",
        status: "ready"
      }
    ],
    technicalBoundaryItems,
    workspaceBinding,
    workspaceNotice:
      "当前页面只绑定当前 Workspace 的数据资产、知识资产、证据来源和质量摘要。切换 Workspace 后，左侧资产目录、关系图和 Inspector 都必须重建到当前 Workspace。"
  };
}
