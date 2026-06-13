import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { createAnalysisContextPackFromTree } from "../../../shared/navigation/analysisContextPack";
import { TestProviders } from "../../../shared/test/TestProviders";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
import { dashboardStaticViewModel } from "../../dashboard/fixtures/dashboardStaticViewModel";
import {
  AnalysisInspectorPanel,
  buildAnalysisInspectorRoots
} from "./AnalysisInspectorPanel";

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
  it("renders subject roots for an analysis task with the real context root title", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const onSelectInspectorRoot = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
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

    expect(screen.getByText("本次分析请求")).toBeTruthy();
    expect(screen.getByText(session.analysisTaskContextPack!.root.title)).toBeTruthy();
    expect(screen.getByText("运行记录")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();
    expect(screen.queryByText(/^Context$/)).toBeNull();
    expect(screen.queryByText("Run Trace")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /运行记录/ }));

    expect(onSelectInspectorRoot).toHaveBeenCalledWith("run-history");
  });

  it("shows dashboard draft context as a single roots entry before opening detail", () => {
    const draftContext = createAnalysisContextPackFromTree({
      capturedAt: dashboardStaticViewModel.lastUpdatedAt,
      root: dashboardStaticViewModel.root,
      suggestedPrompt: "请继续分析当前经营状态。"
    });

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{ path: [], rootKey: null }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    expect(screen.getByText("分析详情")).toBeTruthy();
    expect(screen.getByRole("button", { name: new RegExp(draftContext.root.title) })).toBeTruthy();
    expect(screen.getByText(draftContext.root.title)).toBeTruthy();
    expect(screen.getAllByText("Last 30 days")).toHaveLength(1);
    expect(screen.getByText("2 个指标")).toBeTruthy();
    expect(screen.getByText("2 条证据")).toBeTruthy();
    expect(screen.queryByText(/^Context$/)).toBeNull();
    expect(screen.queryByText("包含内容")).toBeNull();
    expect(screen.queryByText("核心指标")).toBeNull();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();
  });

  it("renders dashboard root detail only after the roots entry is opened", () => {
    const draftContext = createAnalysisContextPackFromTree({
      capturedAt: dashboardStaticViewModel.lastUpdatedAt,
      root: dashboardStaticViewModel.root,
      suggestedPrompt: "请继续分析当前经营状态。"
    });
    const onPopInspectorPath = vi.fn();

    const { container } = render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{ path: [draftContext.root.nodeId], rootKey: "context" }}
          onPopInspectorPath={onPopInspectorPath}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    expect(screen.getByText("经营状态总览")).toBeTruthy();
    expect(screen.queryByText(/^分析详情$/)).toBeNull();
    expect(screen.queryByRole("button", { name: /经营状态总览/ })).toBeNull();
    expect(screen.getByRole("button", { name: "返回上一级" })).toBeTruthy();
    expect(screen.getAllByText(dashboardStaticViewModel.root.summary!)).toHaveLength(1);
    expect(screen.getAllByText("Last 30 days")).toHaveLength(1);
    expect(screen.getByText("2 个指标")).toBeTruthy();
    expect(screen.getByText("2 条证据")).toBeTruthy();
    expect(screen.queryByText("包含内容")).toBeNull();
    expect(screen.getByText("核心指标 · 2 项")).toBeTruthy();
    expect(screen.getByText("风险异常 · 2 项")).toBeTruthy();
    expect(screen.getByText("报告与证据 · 3 项")).toBeTruthy();
    expect(screen.getByText("平台质量 · 1 项")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Last 30 days/ })).toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.queryByText("dashboardOverview")).toBeNull();
    expect(screen.queryByText("timeRange")).toBeNull();
    expect(screen.queryByText(/^directory$/)).toBeNull();
    expect(screen.queryByText(/reportId:/)).toBeNull();
    expect(screen.queryByText(/metricId:/)).toBeNull();
    expect(screen.queryByText(/sourceEvidenceId:/)).toBeNull();
    expect(container.querySelectorAll(".ant-card")).toHaveLength(5);

    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(1);
  });

  it("renders child directory details as a header with leaf cards instead of a sibling directory card", () => {
    const draftContext = createAnalysisContextPackFromTree({
      capturedAt: dashboardStaticViewModel.lastUpdatedAt,
      root: dashboardStaticViewModel.root,
      suggestedPrompt: "请继续分析当前经营状态。"
    });
    const metricsNode = draftContext.root.children?.find((node) => node.title === "核心指标");

    if (!metricsNode) {
      throw new Error("Expected dashboard draft context to include the 核心指标 directory node.");
    }

    const { container } = render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{
            path: [draftContext.root.nodeId, metricsNode.nodeId],
            rootKey: "context"
          }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    expect(screen.getByText("核心指标 · 2 项")).toBeTruthy();
    expect(screen.getAllByText(metricsNode.summary!)).toHaveLength(1);
    expect(screen.queryByText(/^分析详情$/)).toBeNull();
    expect(screen.queryByRole("button", { name: /核心指标/ })).toBeNull();
    expect(screen.getByRole("button", { name: "返回上一级" })).toBeTruthy();
    expect(screen.queryByText("包含内容")).toBeNull();
    expect(screen.getByRole("button", { name: /零售收入/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /毛利率/ })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(screen.queryByText("directory")).toBeNull();
    expect(container.querySelectorAll(".ant-card")).toHaveLength(3);
  });

  it("renders run roots with the task-owned context entry title instead of Context", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const runRoots = buildAnalysisInspectorRoots(session, {
      type: "analysisRun",
      analysisTaskId: session.analysisTaskId,
      runId: session.currentRun.runId
    });
    const contextRoot = runRoots.find((root) => root.key === "context");

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{ path: [], rootKey: null }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
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

    expect(screen.getByText("本次运行")).toBeTruthy();
    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.getByText(session.analysisTaskContextPack!.root.title)).toBeTruthy();
    expect(screen.queryByText(/^Context$/)).toBeNull();
    expect(screen.queryByText("零售收入")).toBeNull();
    expect(contextRoot?.owner).toEqual({
      analysisTaskId: session.analysisTaskId,
      type: "analysisTask"
    });
  });

  it("shows back for root detail and child detail, while roots view has no back", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const contextRoot = session.analysisTaskContextPack!.root;
    const childNode = contextRoot.children?.[0];
    const onPopInspectorPath = vi.fn();
    const onSelectInspectorNode = vi.fn();

    if (!childNode) {
      throw new Error("Expected fixture context root to include a child node.");
    }

    const { rerender } = render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            path: [contextRoot.nodeId],
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

    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: new RegExp(childNode.title) }));
    expect(onSelectInspectorNode).toHaveBeenCalledWith(childNode.nodeId);

    rerender(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            path: [contextRoot.nodeId, childNode.nodeId],
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

    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(2);
  });

  it("shows back on assistant run trace detail and returns to run roots through inspector path pop", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const onPopInspectorPath = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            path: [`inspector-root-run-trace:${session.currentRun.runId}`],
            rootKey: "run-trace"
          }}
          onPopInspectorPath={onPopInspectorPath}
          onSelectInspectorNode={() => undefined}
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

    expect(screen.getByText("Run Trace")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(1);
  });

  it("assigns report section nodes to the report owner instead of the analysis run owner", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const reportRoot = buildAnalysisInspectorRoots(session, {
      type: "analysisRun",
      analysisTaskId: session.analysisTaskId,
      runId: session.currentRun.runId
    }).find((root) => root.key === "reports");

    const reportNode = reportRoot?.tree.children?.[0];
    const sectionNode = reportNode?.children?.[0];

    expect(reportNode?.owner).toEqual({
      runId: session.currentRun.runId,
      type: "analysisRun"
    });
    expect(sectionNode?.owner).toEqual({
      reportId: session.reportPreview!.reportId,
      type: "report"
    });
  });
});
