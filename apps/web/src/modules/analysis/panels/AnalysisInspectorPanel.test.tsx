import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
import { createContextRootNodeId } from "../models/inspectorTree";
import { AnalysisInspectorPanel } from "./AnalysisInspectorPanel";

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

  const originalGetComputedStyle = window.getComputedStyle.bind(window);

  Object.defineProperty(window, "getComputedStyle", {
    configurable: true,
    value: (element: Element) => originalGetComputedStyle(element)
  });
});

describe("AnalysisInspectorPanel", () => {
  it("renders subject-scoped roots for an analysis task instead of a fixed capability menu", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const onSelectInspectorRoot = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="Inspector roots are generated from the selected subject."
          draftContext={undefined}
          inspectorTreeState={{ path: [], rootKey: null }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={onSelectInspectorRoot}
          selectedInspectorSubject={{
            type: "analysisTask",
            analysisTaskId: session.analysisTaskId,
            runId: session.currentRun.runId
          }}
          selectedSession={session}
          workspaceState={{ kind: "ready" }}
        />
      </TestProviders>
    );

    expect(screen.getByText("Context")).toBeTruthy();
    expect(screen.getByText("运行记录")).toBeTruthy();
    expect(screen.queryByText("Run Trace")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /运行记录/ }));

    expect(onSelectInspectorRoot).toHaveBeenCalledWith("run-history");
  });

  it("drills into context tree nodes and uses only internal path-pop back behavior", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const contextRoot = session.analysisTaskContextPack!.root;
    const childNode = contextRoot.children?.[0];
    const onPopInspectorPath = vi.fn();
    const onSelectInspectorNode = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="Inspector roots are generated from the selected subject."
          draftContext={undefined}
          inspectorTreeState={{
            path: [createContextRootNodeId(session.analysisTaskId), contextRoot.nodeId],
            rootKey: "context"
          }}
          onPopInspectorPath={onPopInspectorPath}
          onSelectInspectorNode={onSelectInspectorNode}
          onSelectInspectorRoot={() => undefined}
          selectedInspectorSubject={{
            type: "analysisRun",
            analysisTaskId: session.analysisTaskId,
            runId: session.currentRun.runId
          }}
          selectedSession={session}
          workspaceState={{ kind: "ready" }}
        />
      </TestProviders>
    );

    expect(screen.getByRole("button", { name: "返回上一级" })).toBeTruthy();
    expect(screen.getByText(contextRoot.title)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Home" })).toBeNull();

    if (!childNode) {
      throw new Error("Expected fixture context root to include a child node.");
    }

    fireEvent.click(screen.getByRole("button", { name: new RegExp(childNode.title) }));
    expect(onSelectInspectorNode).toHaveBeenCalledWith(childNode.nodeId);

    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(1);
  });
});
