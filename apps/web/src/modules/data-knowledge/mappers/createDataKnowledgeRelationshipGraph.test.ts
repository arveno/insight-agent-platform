import { describe, expect, it } from "vitest";

import type { DataKnowledgeChunkViewModel, DataKnowledgeEvidenceViewModel, DataKnowledgeFieldViewModel, DataKnowledgeSelectedAssetViewModel, DataKnowledgeTableViewModel } from "../models/dataKnowledgeViewModel";
import { createDataKnowledgeRelationshipGraph } from "./createDataKnowledgeRelationshipGraph";

function createDataSourceAsset(): DataKnowledgeSelectedAssetViewModel {
  return {
    createdAt: "2026-05-18T08:30:00+08:00",
    dataSource: {
      createdAt: "2026-05-18T08:30:00+08:00",
      dataSourceId: "data-source-crm-revenue",
      name: "CRM Revenue Warehouse",
      sourceType: "mysql"
    },
    key: "data_source:data-source-crm-revenue",
    kind: "data_source",
    summary: "收入核心数据源。",
    title: "CRM Revenue Warehouse",
    workspaceId: "workspace-northstar-retail-china"
  };
}

function createKnowledgeDocumentAsset(): DataKnowledgeSelectedAssetViewModel {
  return {
    createdAt: "2026-05-27T18:00:00+08:00",
    key: "knowledge_document:knowledge-document-finance-kb",
    kind: "knowledge_document",
    knowledgeDocument: {
      createdAt: "2026-05-27T18:00:00+08:00",
      knowledgeDocumentId: "knowledge-document-finance-kb",
      title: "Finance Knowledge Base"
    },
    summary: "收入口径知识文档。",
    title: "Finance Knowledge Base",
    workspaceId: "workspace-northstar-retail-china"
  };
}

describe("createDataKnowledgeRelationshipGraph", () => {
  it("creates nodes and edges for a data source graph", () => {
    const tables: DataKnowledgeTableViewModel[] = [
      {
        createdAt: "2026-05-19T09:10:00+08:00",
        dataSourceId: "data-source-crm-revenue",
        fieldCount: 2,
        summary: "收入确认主表。",
        tableId: "table-sales-order",
        tableName: "sales_order"
      }
    ];
    const fields: DataKnowledgeFieldViewModel[] = [
      {
        createdAt: "2026-05-19T09:22:00+08:00",
        dataType: "currency",
        fieldId: "field-sales-order-recognized-revenue",
        fieldName: "recognized_revenue",
        summary: "确认收入字段。",
        tableId: "table-sales-order"
      }
    ];
    const evidenceItems: DataKnowledgeEvidenceViewModel[] = [
      {
        confidence: 0.92,
        confidenceText: "92%",
        createdAt: "2026-06-06T09:10:00+08:00",
        runId: "run-revenue-anomaly-q2",
        snippet: "收入确认快照。",
        sourceEvidenceId: "source-evidence-sales-order-snapshot",
        sourceId: "table-sales-order",
        sourceType: "data_table",
        title: "sales_order 收入确认快照",
        usageSummary: "被收入异常分析和报告引用。",
        usageTitle: "Revenue anomaly follow-up"
      }
    ];

    const result = createDataKnowledgeRelationshipGraph({
      chunks: [],
      evidenceItems,
      fields,
      selectedAsset: createDataSourceAsset(),
      tables
    });

    expect(result.graph.selectedNodeId).toBe("data_source:data-source-crm-revenue");
    expect(result.graph.nodes.map((node) => node.nodeId)).toEqual(
      expect.arrayContaining([
        "data_source:data-source-crm-revenue",
        "data_table:table-sales-order",
        "data_field:field-sales-order-recognized-revenue",
        "source_evidence:source-evidence-sales-order-snapshot",
        "usage:run-revenue-anomaly-q2"
      ])
    );
    expect(result.graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceNodeId: "data_source:data-source-crm-revenue",
          targetNodeId: "data_table:table-sales-order"
        }),
        expect.objectContaining({
          sourceNodeId: "data_table:table-sales-order",
          targetNodeId: "data_field:field-sales-order-recognized-revenue"
        }),
        expect.objectContaining({
          sourceNodeId: "data_field:field-sales-order-recognized-revenue",
          targetNodeId: "source_evidence:source-evidence-sales-order-snapshot"
        }),
        expect.objectContaining({
          sourceNodeId: "source_evidence:source-evidence-sales-order-snapshot",
          targetNodeId: "usage:run-revenue-anomaly-q2"
        })
      ])
    );

    expect(
      result.nodeDetails.find((node) => node.nodeId === "data_source:data-source-crm-revenue")
    ).toEqual(
      expect.objectContaining({
        kind: "data_source",
        title: "CRM Revenue Warehouse"
      })
    );
  });

  it("creates explicit empty evidence and usage nodes for a knowledge document without standardized evidence", () => {
    const chunks: DataKnowledgeChunkViewModel[] = [
      {
        chunkGroupTitle: "收入口径章节",
        contentPreview: "第 7 段：收入确认依赖统一口径。",
        createdAt: "2026-05-27T18:18:00+08:00",
        knowledgeChunkId: "knowledge-chunk-finance-kb-07",
        knowledgeDocumentId: "knowledge-document-finance-kb",
        summary: "统一收入口径。",
        title: "收入确认规则"
      }
    ];

    const result = createDataKnowledgeRelationshipGraph({
      chunks,
      evidenceItems: [],
      fields: [],
      selectedAsset: createKnowledgeDocumentAsset(),
      tables: []
    });

    expect(result.graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "document",
          nodeId: "knowledge_document:knowledge-document-finance-kb"
        }),
        expect.objectContaining({
          kind: "chunk_group",
          label: "收入口径章节"
        }),
        expect.objectContaining({
          kind: "chunk",
          nodeId: "knowledge_chunk:knowledge-chunk-finance-kb-07"
        }),
        expect.objectContaining({
          kind: "empty",
          label: "No source evidence yet"
        }),
        expect.objectContaining({
          kind: "empty",
          label: "No run or report usage yet"
        })
      ])
    );
    expect(result.graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceNodeId: "knowledge_document:knowledge-document-finance-kb",
          targetNodeId: "knowledge_chunk_group:收入口径章节"
        }),
        expect.objectContaining({
          sourceNodeId: "knowledge_chunk_group:收入口径章节",
          targetNodeId: "knowledge_chunk:knowledge-chunk-finance-kb-07"
        })
      ])
    );
    expect(result.nodeDetails.filter((node) => node.kind === "empty")).toHaveLength(2);
  });
});
