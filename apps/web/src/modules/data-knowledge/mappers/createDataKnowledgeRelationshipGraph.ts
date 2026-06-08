import type { StaticRiskViewModel, StaticStatusViewModel } from "../../../app/shell/models/staticViewModelTypes";
import type { RelationshipGraphEdgeViewModel, RelationshipGraphNodeKind, RelationshipGraphNodeViewModel, RelationshipGraphViewModel } from "../../../shared/graph/models";
import type { DataKnowledgeChunkViewModel, DataKnowledgeEvidenceViewModel, DataKnowledgeFieldViewModel, DataKnowledgeRelationshipNodeFactViewModel, DataKnowledgeRelationshipNodeKind, DataKnowledgeRelationshipNodeViewModel, DataKnowledgeSelectedAssetViewModel, DataKnowledgeTableViewModel } from "../models/dataKnowledgeViewModel";

type CreateDataKnowledgeRelationshipGraphArgs = {
  chunks: DataKnowledgeChunkViewModel[];
  evidenceItems: DataKnowledgeEvidenceViewModel[];
  fields: DataKnowledgeFieldViewModel[];
  selectedAsset: DataKnowledgeSelectedAssetViewModel;
  tables: DataKnowledgeTableViewModel[];
};

type DataKnowledgeRelationshipGraphResult = {
  graph: RelationshipGraphViewModel;
  nodeDetails: DataKnowledgeRelationshipNodeViewModel[];
};

function createNodeDetail(
  nodeId: string,
  kind: DataKnowledgeRelationshipNodeKind,
  title: string,
  summary: string,
  facts: DataKnowledgeRelationshipNodeFactViewModel[],
  status?: StaticStatusViewModel,
  risk?: StaticRiskViewModel
): DataKnowledgeRelationshipNodeViewModel {
  return {
    facts,
    kind,
    nodeId,
    risk,
    status,
    summary,
    title
  };
}

function toGraphKind(kind: DataKnowledgeRelationshipNodeKind): RelationshipGraphNodeKind {
  if (kind === "data_source") {
    return "asset";
  }

  if (kind === "data_table") {
    return "table";
  }

  if (kind === "data_field") {
    return "field";
  }

  if (kind === "knowledge_document") {
    return "document";
  }

  if (kind === "knowledge_chunk_group") {
    return "chunk_group";
  }

  if (kind === "knowledge_chunk") {
    return "chunk";
  }

  if (kind === "source_evidence") {
    return "evidence";
  }

  if (kind === "usage") {
    return "usage";
  }

  return "empty";
}

function toGraphNode(
  nodeDetail: DataKnowledgeRelationshipNodeViewModel
): RelationshipGraphNodeViewModel {
  return {
    description: nodeDetail.summary,
    kind: toGraphKind(nodeDetail.kind),
    label: nodeDetail.title,
    nodeId: nodeDetail.nodeId,
    riskText: nodeDetail.risk?.level,
    statusText: nodeDetail.status?.status
  };
}

function createEdge(
  edgeId: string,
  sourceNodeId: string,
  targetNodeId: string,
  label?: string
): RelationshipGraphEdgeViewModel {
  return {
    edgeId,
    label,
    sourceNodeId,
    targetNodeId
  };
}

function createUsageNodeDetails(evidenceItems: DataKnowledgeEvidenceViewModel[]) {
  return Array.from(new Map(evidenceItems.map((item) => [item.runId, item])).values()).map(
    (item) =>
      createNodeDetail(
        `usage:${item.runId}`,
        "usage",
        item.usageTitle,
        item.usageSummary,
        [
          { label: "runId", value: item.runId },
          { label: "reportId", value: item.reportId ?? "N/A" },
          { label: "usage", value: item.usageSummary }
        ]
      )
  );
}

function createEmptyNodeDetail(
  nodeId: string,
  title: string,
  summary: string,
  state: string
) {
  return createNodeDetail(nodeId, "empty", title, summary, [{ label: "state", value: state }]);
}

function createDataSourceRelationshipGraph({
  evidenceItems,
  fields,
  selectedAsset,
  tables
}: CreateDataKnowledgeRelationshipGraphArgs): DataKnowledgeRelationshipGraphResult {
  const assetNodeId = `data_source:${selectedAsset.dataSource?.dataSourceId ?? selectedAsset.key}`;
  const assetNode = createNodeDetail(
    assetNodeId,
    "data_source",
    selectedAsset.title,
    selectedAsset.summary,
    [
      { label: "dataSourceId", value: selectedAsset.dataSource?.dataSourceId ?? "" },
      { label: "sourceType", value: selectedAsset.dataSource?.sourceType ?? "" },
      { label: "name", value: selectedAsset.dataSource?.name ?? selectedAsset.title },
      { label: "createdAt", value: selectedAsset.createdAt },
      { label: "workspaceId", value: selectedAsset.workspaceId }
    ],
    selectedAsset.status,
    selectedAsset.risk
  );
  const tableNodes =
    tables.length > 0
      ? tables.map((table) =>
          createNodeDetail(
            `data_table:${table.tableId}`,
            "data_table",
            table.tableName,
            table.summary,
            [
              { label: "tableId", value: table.tableId },
              { label: "tableName", value: table.tableName },
              { label: "dataSourceId", value: table.dataSourceId },
              { label: "createdAt", value: table.createdAt }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:tables:${selectedAsset.key}`,
            "No data tables yet",
            "当前数据源还没有进入 DataTable 目录。",
            "waiting for reviewed schema registration"
          )
        ];
  const fieldNodes =
    fields.length > 0
      ? fields.map((field) =>
          createNodeDetail(
            `data_field:${field.fieldId}`,
            "data_field",
            field.fieldName,
            field.summary,
            [
              { label: "fieldId", value: field.fieldId },
              { label: "fieldName", value: field.fieldName },
              { label: "dataType", value: field.dataType },
              { label: "tableId", value: field.tableId },
              { label: "createdAt", value: field.createdAt }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:fields:${selectedAsset.key}`,
            "No data fields yet",
            "当前数据源还没有进入 DataField 字典。",
            "waiting for reviewed field registration"
          )
        ];
  const evidenceNodes =
    evidenceItems.length > 0
      ? evidenceItems.map((evidence) =>
          createNodeDetail(
            `source_evidence:${evidence.sourceEvidenceId}`,
            "source_evidence",
            evidence.title,
            evidence.snippet,
            [
              { label: "sourceEvidenceId", value: evidence.sourceEvidenceId },
              { label: "sourceType", value: evidence.sourceType },
              { label: "sourceId", value: evidence.sourceId },
              { label: "title", value: evidence.title },
              { label: "snippet", value: evidence.snippet },
              { label: "confidence", value: evidence.confidenceText },
              { label: "runId", value: evidence.runId }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:evidence:${selectedAsset.key}`,
            "No source evidence yet",
            "当前资产还没有形成可供 Analysis / Reports 使用的标准化 SourceEvidence。",
            "waiting for first standardized SourceEvidence"
          )
        ];
  const usageNodes =
    evidenceItems.length > 0
      ? createUsageNodeDetails(evidenceItems)
      : [
          createEmptyNodeDetail(
            `empty:usage:${selectedAsset.key}`,
            "No run or report usage yet",
            "当前资产还没有被静态映射到 Run / Report usage 视图。",
            "waiting for first run or report reference"
          )
        ];
  const tableNodeIdsByTableId = new Map(tableNodes.map((node) => [node.nodeId.split(":")[1], node.nodeId]));
  const fieldNodeIdsByTableId = fields.reduce(
    (fieldMap, field) => {
      const items = fieldMap.get(field.tableId) ?? [];

      items.push(`data_field:${field.fieldId}`);
      fieldMap.set(field.tableId, items);

      return fieldMap;
    },
    new Map<string, string[]>()
  );
  const usageNodeIdByRunId = new Map(
    usageNodes
      .filter((node) => node.kind === "usage")
      .map((node) => {
        const runId = node.facts.find((fact) => fact.label === "runId")?.value ?? "";

        return [runId, node.nodeId] as const;
      })
  );
  const edges: RelationshipGraphEdgeViewModel[] = [];

  tableNodes.forEach((tableNode) => {
    edges.push(createEdge(`edge:${assetNodeId}:${tableNode.nodeId}`, assetNodeId, tableNode.nodeId));
  });

  fields.forEach((field) => {
    const tableNodeId = tableNodeIdsByTableId.get(field.tableId);

    if (tableNodeId) {
      edges.push(
        createEdge(
          `edge:data_table:${field.tableId}:data_field:${field.fieldId}`,
          tableNodeId,
          `data_field:${field.fieldId}`
        )
      );
    }
  });

  if (fields.length === 0) {
    tableNodes.forEach((tableNode) => {
      edges.push(
        createEdge(`edge:${tableNode.nodeId}:${fieldNodes[0].nodeId}`, tableNode.nodeId, fieldNodes[0].nodeId)
      );
    });
  }

  if (evidenceItems.length > 0) {
    evidenceItems.forEach((evidence) => {
      const evidenceNodeId = `source_evidence:${evidence.sourceEvidenceId}`;
      const sourceFieldNodeIds =
        evidence.sourceType === "data_table" ? fieldNodeIdsByTableId.get(evidence.sourceId) ?? [] : [];

      if (sourceFieldNodeIds.length > 0) {
        sourceFieldNodeIds.forEach((fieldNodeId) => {
          edges.push(
            createEdge(`edge:${fieldNodeId}:${evidenceNodeId}`, fieldNodeId, evidenceNodeId, "evidence")
          );
        });
      } else {
        const tableNodeId = tableNodeIdsByTableId.get(evidence.sourceId);

        if (tableNodeId) {
          edges.push(
            createEdge(`edge:${tableNodeId}:${evidenceNodeId}`, tableNodeId, evidenceNodeId, "evidence")
          );
        }
      }

      const usageNodeId = usageNodeIdByRunId.get(evidence.runId);

      if (usageNodeId) {
        edges.push(createEdge(`edge:${evidenceNodeId}:${usageNodeId}`, evidenceNodeId, usageNodeId, "usage"));
      }
    });
  } else {
    const emptyEvidenceNodeId = evidenceNodes[0].nodeId;
    const emptyUsageNodeId = usageNodes[0].nodeId;

    if (fieldNodes.length > 0) {
      fieldNodes.forEach((fieldNode) => {
        edges.push(createEdge(`edge:${fieldNode.nodeId}:${emptyEvidenceNodeId}`, fieldNode.nodeId, emptyEvidenceNodeId));
      });
    } else {
      tableNodes.forEach((tableNode) => {
        edges.push(createEdge(`edge:${tableNode.nodeId}:${emptyEvidenceNodeId}`, tableNode.nodeId, emptyEvidenceNodeId));
      });
    }

    edges.push(createEdge(`edge:${emptyEvidenceNodeId}:${emptyUsageNodeId}`, emptyEvidenceNodeId, emptyUsageNodeId));
  }

  const nodeDetails = [assetNode, ...tableNodes, ...fieldNodes, ...evidenceNodes, ...usageNodes];

  return {
    graph: {
      description: "DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report",
      edges,
      nodes: nodeDetails.map(toGraphNode),
      selectedNodeId: assetNode.nodeId,
      title: "Asset relationship graph"
    },
    nodeDetails
  };
}

function createKnowledgeRelationshipGraph({
  chunks,
  evidenceItems,
  selectedAsset
}: CreateDataKnowledgeRelationshipGraphArgs): DataKnowledgeRelationshipGraphResult {
  const documentNodeId = `knowledge_document:${selectedAsset.knowledgeDocument?.knowledgeDocumentId ?? selectedAsset.key}`;
  const documentNode = createNodeDetail(
    documentNodeId,
    "knowledge_document",
    selectedAsset.title,
    selectedAsset.summary,
    [
      {
        label: "knowledgeDocumentId",
        value: selectedAsset.knowledgeDocument?.knowledgeDocumentId ?? ""
      },
      { label: "title", value: selectedAsset.knowledgeDocument?.title ?? selectedAsset.title },
      { label: "workspaceId", value: selectedAsset.workspaceId },
      { label: "createdAt", value: selectedAsset.createdAt }
    ],
    selectedAsset.status,
    selectedAsset.risk
  );
  const chunkGroups = Array.from(
    chunks.reduce((groupMap, chunk) => {
      const groupChunks = groupMap.get(chunk.chunkGroupTitle) ?? [];

      groupChunks.push(chunk);
      groupMap.set(chunk.chunkGroupTitle, groupChunks);

      return groupMap;
    }, new Map<string, DataKnowledgeChunkViewModel[]>())
  );
  const groupNodes =
    chunkGroups.length > 0
      ? chunkGroups.map(([groupTitle, groupChunks]) =>
          createNodeDetail(
            `knowledge_chunk_group:${groupTitle}`,
            "knowledge_chunk_group",
            groupTitle,
            `承接 ${groupChunks.length} 个知识切片的主题分组。`,
            [
              { label: "sectionTitle", value: groupTitle },
              {
                label: "knowledgeDocumentId",
                value: selectedAsset.knowledgeDocument?.knowledgeDocumentId ?? ""
              },
              { label: "chunkCount", value: String(groupChunks.length) }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:chunk-groups:${selectedAsset.key}`,
            "No chunk groups yet",
            "当前知识文档还没有形成章节分组。",
            "waiting for reviewed chunk grouping"
          )
        ];
  const chunkNodes =
    chunks.length > 0
      ? chunks.map((chunk) =>
          createNodeDetail(
            `knowledge_chunk:${chunk.knowledgeChunkId}`,
            "knowledge_chunk",
            chunk.title,
            chunk.summary,
            [
              { label: "knowledgeChunkId", value: chunk.knowledgeChunkId },
              { label: "knowledgeDocumentId", value: chunk.knowledgeDocumentId },
              { label: "contentPreview", value: chunk.contentPreview },
              { label: "createdAt", value: chunk.createdAt }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:chunks:${selectedAsset.key}`,
            "No knowledge chunks yet",
            "当前知识文档还没有形成可展示的 KnowledgeChunk。",
            "waiting for reviewed chunk extraction"
          )
        ];
  const evidenceNodes =
    evidenceItems.length > 0
      ? evidenceItems.map((evidence) =>
          createNodeDetail(
            `source_evidence:${evidence.sourceEvidenceId}`,
            "source_evidence",
            evidence.title,
            evidence.snippet,
            [
              { label: "sourceEvidenceId", value: evidence.sourceEvidenceId },
              { label: "sourceType", value: evidence.sourceType },
              { label: "sourceId", value: evidence.sourceId },
              { label: "title", value: evidence.title },
              { label: "snippet", value: evidence.snippet },
              { label: "confidence", value: evidence.confidenceText },
              { label: "runId", value: evidence.runId }
            ]
          )
        )
      : [
          createEmptyNodeDetail(
            `empty:evidence:${selectedAsset.key}`,
            "No source evidence yet",
            "当前知识文档还没有形成标准化 SourceEvidence。",
            "waiting for first standardized SourceEvidence"
          )
        ];
  const usageNodes =
    evidenceItems.length > 0
      ? createUsageNodeDetails(evidenceItems)
      : [
          createEmptyNodeDetail(
            `empty:usage:${selectedAsset.key}`,
            "No run or report usage yet",
            "当前知识文档还没有被静态映射到 Run / Report usage 视图。",
            "waiting for first run or report reference"
          )
        ];
  const usageNodeIdByRunId = new Map(
    usageNodes
      .filter((node) => node.kind === "usage")
      .map((node) => {
        const runId = node.facts.find((fact) => fact.label === "runId")?.value ?? "";

        return [runId, node.nodeId] as const;
      })
  );
  const chunkNodeIdByChunkId = new Map(
    chunkNodes
      .filter((node) => node.kind === "knowledge_chunk")
      .map((node) => {
        const chunkId =
          node.facts.find((fact) => fact.label === "knowledgeChunkId")?.value ?? "";

        return [chunkId, node.nodeId] as const;
      })
  );
  const edges: RelationshipGraphEdgeViewModel[] = [];

  groupNodes.forEach((groupNode) => {
    edges.push(createEdge(`edge:${documentNodeId}:${groupNode.nodeId}`, documentNodeId, groupNode.nodeId));
  });

  chunkGroups.forEach(([groupTitle, groupChunks]) => {
    groupChunks.forEach((chunk) => {
      edges.push(
        createEdge(
          `edge:knowledge_chunk_group:${groupTitle}:knowledge_chunk:${chunk.knowledgeChunkId}`,
          `knowledge_chunk_group:${groupTitle}`,
          `knowledge_chunk:${chunk.knowledgeChunkId}`
        )
      );
    });
  });

  if (chunks.length === 0) {
    groupNodes.forEach((groupNode) => {
      edges.push(createEdge(`edge:${groupNode.nodeId}:${chunkNodes[0].nodeId}`, groupNode.nodeId, chunkNodes[0].nodeId));
    });
  }

  if (evidenceItems.length > 0) {
    evidenceItems.forEach((evidence) => {
      const evidenceNodeId = `source_evidence:${evidence.sourceEvidenceId}`;
      const chunkNodeId = chunkNodeIdByChunkId.get(evidence.sourceId);

      if (evidence.sourceType === "knowledge_document" || !chunkNodeId) {
        edges.push(createEdge(`edge:${documentNodeId}:${evidenceNodeId}`, documentNodeId, evidenceNodeId, "evidence"));
      } else {
        edges.push(createEdge(`edge:${chunkNodeId}:${evidenceNodeId}`, chunkNodeId, evidenceNodeId, "evidence"));
      }

      const usageNodeId = usageNodeIdByRunId.get(evidence.runId);

      if (usageNodeId) {
        edges.push(createEdge(`edge:${evidenceNodeId}:${usageNodeId}`, evidenceNodeId, usageNodeId, "usage"));
      }
    });
  } else {
    const emptyEvidenceNodeId = evidenceNodes[0].nodeId;
    const emptyUsageNodeId = usageNodes[0].nodeId;

    if (chunkNodes.length > 0) {
      chunkNodes.forEach((chunkNode) => {
        edges.push(createEdge(`edge:${chunkNode.nodeId}:${emptyEvidenceNodeId}`, chunkNode.nodeId, emptyEvidenceNodeId));
      });
    } else {
      edges.push(createEdge(`edge:${documentNodeId}:${emptyEvidenceNodeId}`, documentNodeId, emptyEvidenceNodeId));
    }

    edges.push(createEdge(`edge:${emptyEvidenceNodeId}:${emptyUsageNodeId}`, emptyEvidenceNodeId, emptyUsageNodeId));
  }

  const nodeDetails = [documentNode, ...groupNodes, ...chunkNodes, ...evidenceNodes, ...usageNodes];

  return {
    graph: {
      description:
        "KnowledgeDocument -> Chunk Group -> KnowledgeChunk -> SourceEvidence -> Run / Report",
      edges,
      nodes: nodeDetails.map(toGraphNode),
      selectedNodeId: documentNode.nodeId,
      title: "Asset relationship graph"
    },
    nodeDetails
  };
}

export function createDataKnowledgeRelationshipGraph(
  args: CreateDataKnowledgeRelationshipGraphArgs
): DataKnowledgeRelationshipGraphResult {
  if (args.selectedAsset.kind === "data_source") {
    return createDataSourceRelationshipGraph(args);
  }

  return createKnowledgeRelationshipGraph(args);
}
