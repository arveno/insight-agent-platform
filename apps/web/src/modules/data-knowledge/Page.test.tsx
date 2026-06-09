import { useEffect, useMemo, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";
import { DataKnowledgePage, DataKnowledgePageContent } from "./Page";
import type { DataKnowledgeOverviewController } from "./hooks/useDataKnowledgeOverviewState";
import { createDataKnowledgeViewModel } from "./mappers/createDataKnowledgeViewModel";

vi.mock("../../shared/graph/RelationshipGraphCanvas", () => ({
  RelationshipGraphCanvas: ({
    graph,
    onSelectNode,
    selectedNodeId
  }: {
    graph: {
      description?: string;
      nodes: Array<{ label: string; nodeId: string }>;
      selectedNodeId?: string;
      title: string;
    };
    onSelectNode?: (nodeId: string) => void;
    selectedNodeId?: string;
  }) => (
    <div aria-label={graph.title}>
      <p>{graph.description}</p>
      <p>{`selectedNodeId: ${selectedNodeId ?? graph.selectedNodeId ?? ""}`}</p>
      {graph.nodes.map((node) => (
        <button key={node.nodeId} onClick={() => onSelectNode?.(node.nodeId)} type="button">
          {node.label}
        </button>
      ))}
    </div>
  )
}));

afterEach(cleanup);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      addEventListener: () => undefined,
      addListener: () => undefined,
      dispatchEvent: () => false,
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: () => undefined,
      removeListener: () => undefined
    })
  });
});

function createController(
  selectedAssetKey?: string
): DataKnowledgeOverviewController {
  const viewModel = createDataKnowledgeViewModel(selectedAssetKey);
  const selectedNode =
    viewModel.relationshipNodeDetails.find(
      (node) => node.nodeId === viewModel.relationshipGraph.selectedNodeId
    ) ?? viewModel.relationshipNodeDetails[0];

  return {
    filteredAssetItems: viewModel.assetItems,
    onSearchChange: vi.fn(),
    onSelectAsset: vi.fn(),
    onSelectNode: vi.fn(),
    searchValue: "",
    selectedAssetKey: viewModel.selectedAsset.key,
    selectedNodeId: viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId,
    selectedNode,
    viewModel
  };
}

function InteractiveDataKnowledgePage({
  selectedAssetKey
}: {
  selectedAssetKey?: string;
}) {
  const [currentAssetKey, setCurrentAssetKey] = useState(
    selectedAssetKey ?? createDataKnowledgeViewModel().selectedAsset.key
  );
  const viewModel = useMemo(
    () => createDataKnowledgeViewModel(currentAssetKey),
    [currentAssetKey]
  );
  const [selectedNodeId, setSelectedNodeId] = useState(
    viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId
  );

  useEffect(() => {
    setSelectedNodeId(
      viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId
    );
  }, [viewModel.relationshipGraph.selectedNodeId, viewModel.relationshipNodeDetails]);

  const selectedNode =
    viewModel.relationshipNodeDetails.find((node) => node.nodeId === selectedNodeId) ??
    viewModel.relationshipNodeDetails[0];
  const controller: DataKnowledgeOverviewController = {
    filteredAssetItems: viewModel.assetItems,
    onSearchChange: vi.fn(),
    onSelectAsset: setCurrentAssetKey,
    onSelectNode: setSelectedNodeId,
    searchValue: "",
    selectedAssetKey: viewModel.selectedAsset.key,
    selectedNode,
    selectedNodeId,
    viewModel
  };

  return <DataKnowledgePageContent controller={controller} />;
}

describe("DataKnowledgePage", () => {
  it("self-manages the default data knowledge controller when rendered from the route entry", () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DataKnowledgePage onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(screen.queryByText("Data & Knowledge 总览")).toBeNull();
    expect(screen.queryByText("Quality 与 Operations")).toBeNull();
    expect(screen.getByText("当前资产")).toBeTruthy();
    expect(screen.getByText("Asset relationship graph")).toBeTruthy();
    expect(screen.getByText("Selected node detail")).toBeTruthy();
    expect(screen.queryByText("Evidence usage")).toBeNull();
    expect(screen.getAllByText("CRM Revenue Warehouse").length).toBeGreaterThan(0);
    expect(screen.getAllByText("dataSourceId: data-source-crm-revenue").length).toBeGreaterThan(0);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses the provided controller in DataKnowledgePageContent without creating a second page-owned state track", () => {
    render(
      <TestProviders>
        <DataKnowledgePageContent controller={createController()} onNavigate={vi.fn()} />
      </TestProviders>
    );

    expect(screen.getAllByText("CRM Revenue Warehouse").length).toBeGreaterThan(0);
    expect(screen.getAllByText("dataSourceId: data-source-crm-revenue").length).toBeGreaterThan(0);
  });

  it("updates node detail when clicking a field node in the data source relationship graph", () => {
    render(
      <TestProviders>
        <InteractiveDataKnowledgePage />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "recognized_revenue" }));

    expect(screen.getByText("fieldId: field-sales-order-recognized-revenue")).toBeTruthy();
    expect(screen.getByText("tableId: table-sales-order")).toBeTruthy();
    expect(screen.getByText("dataType: currency")).toBeTruthy();
  });

  it("renders the knowledge document graph with chunk groups instead of table and field structure", () => {
    render(
      <TestProviders>
        <InteractiveDataKnowledgePage selectedAssetKey="knowledge_document:knowledge-document-finance-kb" />
      </TestProviders>
    );

    expect(screen.getAllByText("Finance Knowledge Base").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "收入口径章节" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "收入确认规则" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "sales_order" })).toBeNull();
    expect(screen.getByRole("button", { name: "No source evidence yet" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "No run or report usage yet" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "收入确认规则" }));

    expect(screen.getByText("knowledgeChunkId: knowledge-chunk-finance-kb-07")).toBeTruthy();
    expect(screen.getByText("createdAt: 2026-05-27T18:18:00+08:00")).toBeTruthy();
    expect(screen.queryByText("tableId: table-sales-order")).toBeNull();
  });
});
