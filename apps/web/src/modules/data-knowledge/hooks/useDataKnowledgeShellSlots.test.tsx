import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";

import { useDataKnowledgeShellSlots } from "./useDataKnowledgeShellSlots";

vi.mock("../../../shared/graph/RelationshipGraphCanvas", () => ({
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

function DataKnowledgeShellSlotHarness() {
  const slots = useDataKnowledgeShellSlots({
    onBackToRoot: vi.fn(),
    onNavigate: vi.fn()
  });

  return (
    <>
      {slots.leftNav}
      {slots.mainContent}
      {slots.rightAssistPanel}
    </>
  );
}

describe("useDataKnowledgeShellSlots", () => {
  it("exposes data knowledge navigation, content, and inspector as module-owned shell regions", () => {
    render(
      <TestProviders>
        <DataKnowledgeShellSlotHarness />
      </TestProviders>
    );

    expect(screen.getByRole("navigation", { name: "Data & Knowledge navigation" })).toBeTruthy();
    expect(screen.getByText("当前资产")).toBeTruthy();
    expect(screen.getByText("Workspace Overview")).toBeTruthy();
  });
});
