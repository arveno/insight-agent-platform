import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../../app/providers/AppProviders";
import type { DataKnowledgeOverviewController } from "../../../features/data-knowledge/hooks/useDataKnowledgeOverviewState";
import { createDataKnowledgeViewModel } from "../../../features/data-knowledge/mappers/createDataKnowledgeViewModel";
import { DataKnowledgeInspectorPanel } from "./DataKnowledgeInspectorPanel";

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

function createController(): DataKnowledgeOverviewController {
  const viewModel = createDataKnowledgeViewModel();
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
    selectedNode,
    selectedNodeId:
      viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId,
    viewModel
  };
}

describe("DataKnowledgeInspectorPanel", () => {
  it("keeps workspace overview, readonly boundary and actions in the inspector", () => {
    render(
      <AppProviders>
        <DataKnowledgeInspectorPanel controller={createController()} />
      </AppProviders>
    );

    expect(screen.getByText("Workspace Overview")).toBeTruthy();
    expect(screen.getByText("Readonly Boundary")).toBeTruthy();
    expect(screen.getByText("Quality & Operations Summary")).toBeTruthy();
    expect(screen.getByText("Actions")).toBeTruthy();
    expect(screen.getByText("Technical Boundary")).toBeTruthy();
    expect(screen.getByText("DataSource count: 2")).toBeTruthy();
    expect(screen.getByText((text) => text.includes("不接真实 API / DB"))).toBeTruthy();
    expect(screen.getAllByText("查看 Platform Operations").length).toBeGreaterThan(0);
  });
});
