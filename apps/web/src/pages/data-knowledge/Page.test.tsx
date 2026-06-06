import { useEffect, useMemo, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { createDataKnowledgeViewModel } from "../../features/data-knowledge/mappers/createDataKnowledgeViewModel";
import type { DataKnowledgeOverviewController } from "../../features/data-knowledge/hooks";
import { DataKnowledgePage } from "./Page";

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
    viewModel.relationshipGraph.columns
      .flatMap((column) => column.nodes)
      .find((node) => node.key === viewModel.relationshipGraph.defaultSelectedNodeKey) ??
    viewModel.relationshipGraph.columns[0].nodes[0];

  return {
    filteredAssetItems: viewModel.assetItems,
    onSearchChange: vi.fn(),
    onSelectAsset: vi.fn(),
    onSelectNode: vi.fn(),
    searchValue: "",
    selectedAssetKey: viewModel.selectedAsset.key,
    selectedNodeKey: viewModel.relationshipGraph.defaultSelectedNodeKey,
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
  const [selectedNodeKey, setSelectedNodeKey] = useState(
    viewModel.relationshipGraph.defaultSelectedNodeKey
  );

  useEffect(() => {
    setSelectedNodeKey(viewModel.relationshipGraph.defaultSelectedNodeKey);
  }, [viewModel.relationshipGraph.defaultSelectedNodeKey]);

  const selectedNode =
    viewModel.relationshipGraph.columns
      .flatMap((column) => column.nodes)
      .find((node) => node.key === selectedNodeKey) ??
    viewModel.relationshipGraph.columns[0].nodes[0];
  const controller: DataKnowledgeOverviewController = {
    filteredAssetItems: viewModel.assetItems,
    onSearchChange: vi.fn(),
    onSelectAsset: setCurrentAssetKey,
    onSelectNode: setSelectedNodeKey,
    searchValue: "",
    selectedAssetKey: viewModel.selectedAsset.key,
    selectedNode,
    selectedNodeKey,
    viewModel
  };

  return <DataKnowledgePage dataKnowledgeState={controller} />;
}

describe("DataKnowledgePage", () => {
  it("renders the main area around the selected data asset relationship instead of the old stacked overview cards", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <DataKnowledgePage dataKnowledgeState={createController()} onNavigate={onNavigate} />
      </AppProviders>
    );

    expect(screen.queryByText("Data & Knowledge 总览")).toBeNull();
    expect(screen.queryByText("Quality 与 Operations")).toBeNull();
    expect(screen.getByText("当前资产")).toBeTruthy();
    expect(screen.getByText("Asset relationship graph")).toBeTruthy();
    expect(screen.getByText("Selected node detail")).toBeTruthy();
    expect(screen.getByText("Evidence usage")).toBeTruthy();
    expect(screen.getAllByText("CRM Revenue Warehouse").length).toBeGreaterThan(0);
    expect(screen.getByText("Asset")).toBeTruthy();
    expect(screen.getByText("Tables")).toBeTruthy();
    expect(screen.getByText("Fields")).toBeTruthy();
    expect(screen.getByText("Evidence")).toBeTruthy();
    expect(screen.getByText("Usage")).toBeTruthy();
    expect(screen.getAllByText("dataSourceId: data-source-crm-revenue").length).toBeGreaterThan(0);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("updates node detail when clicking a field node in the data source relationship graph", () => {
    render(
      <AppProviders>
        <InteractiveDataKnowledgePage />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "recognized_revenue" }));

    expect(screen.getByText("fieldId: field-sales-order-recognized-revenue")).toBeTruthy();
    expect(screen.getByText("tableId: table-sales-order")).toBeTruthy();
    expect(screen.getByText("dataType: currency")).toBeTruthy();
  });

  it("renders the knowledge document graph with chunk groups instead of table and field structure", () => {
    render(
      <AppProviders>
        <InteractiveDataKnowledgePage selectedAssetKey="knowledge_document:knowledge-document-finance-kb" />
      </AppProviders>
    );

    expect(screen.getAllByText("Finance Knowledge Base").length).toBeGreaterThan(0);
    expect(screen.getByText("Document")).toBeTruthy();
    expect(screen.getByText("Chunk groups")).toBeTruthy();
    expect(screen.getByText("Chunks")).toBeTruthy();
    expect(screen.getByText("Evidence")).toBeTruthy();
    expect(screen.getByText("Usage")).toBeTruthy();
    expect(screen.queryByText("Tables")).toBeNull();
    expect(screen.queryByText("Fields")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "收入确认规则" }));

    expect(screen.getByText("knowledgeChunkId: knowledge-chunk-finance-kb-07")).toBeTruthy();
    expect(screen.getByText("createdAt: 2026-05-27T18:18:00+08:00")).toBeTruthy();
    expect(screen.queryByText("tableId: table-sales-order")).toBeNull();
  });
});
