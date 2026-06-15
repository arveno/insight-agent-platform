import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { createAnalysisContextPackFromTree } from "../../../shared/navigation/analysisContextPack";
import { dashboardInspectorDraftFixture } from "../../../shared/test/fixtures/dashboardInspectorDraftFixture";
import { TestProviders } from "../../../shared/test/TestProviders";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
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

function createDashboardDraftContext() {
  return createAnalysisContextPackFromTree({
    capturedAt: dashboardInspectorDraftFixture.lastUpdatedAt,
    root: dashboardInspectorDraftFixture.root,
    suggestedPrompt: "请继续分析当前经营状态。"
  });
}

function getTreeNodeByTitle(title: string): HTMLElement {
  const node = screen
    .getAllByText(title)
    .map((element) => element.closest(".ant-tree-treenode"))
    .find((element) => element?.getAttribute("role") === "treeitem");

  if (!node) {
    throw new Error(`Expected tree node for ${title}.`);
  }

  return node as HTMLElement;
}

function normalizeTextContent(element: HTMLElement | null | undefined): string {
  return element?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function requireChildNode(parent: InspectorTreeNode, title: string): InspectorTreeNode {
  const node = parent.children?.find((child) => child.title === title);

  if (!node) {
    throw new Error(`Expected child node ${title}.`);
  }

  return node;
}

function createSessionWithoutContextPack() {
  const session = analysisStaticViewModel.sessions[0]!;

  return {
    ...session,
    analysisTaskContextPack: null
  };
}

describe("AnalysisInspectorPanel", () => {
  it("renders dashboard draft context directly as a standardized context tree viewport", () => {
    const draftContext = createDashboardDraftContext();

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

    const rootNode = getTreeNodeByTitle("经营状态总览");
    const metricSection = getTreeNodeByTitle("核心指标");
    const riskSection = getTreeNodeByTitle("风险异常");
    const reportEvidenceSection = getTreeNodeByTitle("报告与证据");

    expect(screen.getByText("上下文目录")).toBeTruthy();
    expect(screen.getByText("Last 30 days")).toBeTruthy();
    expect(screen.getByText("Northstar Retail China")).toBeTruthy();
    expect(screen.getByText("草稿上下文")).toBeTruthy();
    expect(screen.queryByRole("button", { name: new RegExp(draftContext.root.title) })).toBeNull();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();
    expect(screen.queryByText(draftContext.root.summary ?? "")).toBeNull();
    expect(screen.queryByText(/^Context$/)).toBeNull();
    expect(screen.queryByText("包含内容")).toBeNull();
    expect(screen.queryByText(/sourceEvidenceId:/)).toBeNull();
    expect(screen.queryByText(/metricId:/)).toBeNull();
    expect(screen.getByText("经营状态总览").closest("[data-context-tree-row-state='selected']")).toBeTruthy();
    expect(normalizeTextContent(rootNode)).toContain("4 指标 · 3 风险 · 2 证据");
    expect(normalizeTextContent(metricSection)).toMatch(/核心指标\s*4/);
    expect(normalizeTextContent(riskSection)).toMatch(/风险异常\s*3/);
    expect(normalizeTextContent(reportEvidenceSection)).toMatch(/报告与证据\s*2/);
  });

  it("sanitizes raw report source type and role chips without inferring risk or status badges", () => {
    const draftContext = createDashboardDraftContext();
    const metricSection = requireChildNode(draftContext.root, "核心指标");
    const revenueMetric = requireChildNode(metricSection, "确认收入");
    const revenueReport = requireChildNode(revenueMetric, "周经营分析报告");

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{
            path: [
              draftContext.root.nodeId,
              metricSection.nodeId,
              revenueMetric.nodeId,
              revenueReport.nodeId
            ],
            rootKey: null
          }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    const metricNode = getTreeNodeByTitle("确认收入");
    const reportNode = getTreeNodeByTitle("周经营分析报告");

    expect(normalizeTextContent(metricNode)).toContain("¥12.8M · 下降 3.2%");
    expect(normalizeTextContent(metricNode)).not.toContain("风险 medium");
    expect(normalizeTextContent(metricNode)).not.toContain("中风险");
    expect(normalizeTextContent(metricNode)).not.toContain("高风险");
    expect(normalizeTextContent(metricNode)).not.toContain("低风险");
    expect(normalizeTextContent(metricNode)).not.toContain("关注");
    expect(normalizeTextContent(metricNode)).not.toContain("健康");
    expect(screen.getByText("报告 · 支撑报告")).toBeTruthy();
    expect(normalizeTextContent(reportNode)).not.toContain("supporting_report");
    expect(normalizeTextContent(reportNode)).not.toContain("report");
    expect(screen.queryByText(/supporting_report|report/)).toBeNull();
    expect(screen.queryByText(/风险 medium|风险 high|风险 low/)).toBeNull();
    expect(screen.queryByText(/^中风险$|^高风险$|^低风险$|^关注$|^健康$/)).toBeNull();
  });

  it("sanitizes raw evidence source type and role chips inside context tree rows", () => {
    const draftContext = createDashboardDraftContext();
    const metricSection = requireChildNode(draftContext.root, "核心指标");
    const refundMetric = requireChildNode(metricSection, "退款率");
    const refundEvidence = requireChildNode(refundMetric, "退款异常证据摘要");

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{
            path: [
              draftContext.root.nodeId,
              metricSection.nodeId,
              refundMetric.nodeId,
              refundEvidence.nodeId
            ],
            rootKey: null
          }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    const evidenceNode = getTreeNodeByTitle("退款异常证据摘要");

    expect(screen.getByText("证据 · 支撑证据")).toBeTruthy();
    expect(normalizeTextContent(evidenceNode)).not.toContain("supporting_evidence");
    expect(normalizeTextContent(evidenceNode)).not.toContain("sourceEvidence");
    expect(screen.queryByText(/supporting_report|supporting_evidence|sourceEvidence/)).toBeNull();
  });

  it("does not render a context root selector when the selected session has no context pack", () => {
    const session = createSessionWithoutContextPack();
    const roots = buildAnalysisInspectorRoots(session, {
      type: "analysisRun",
      analysisTaskId: session.analysisTaskId,
      runId: session.currentRun.runId
    });

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

    expect(roots.find((root) => root.key === "context")).toBeUndefined();
    expect(screen.getByText("本次运行")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Run Trace/ })).toBeTruthy();
    expect(screen.queryByText("本次请求上下文")).toBeNull();
    expect(screen.queryByText("当前请求没有附带上下文。")).toBeNull();
  });

  it("shows the standard empty state instead of a fake context root when the selected session has no context pack", () => {
    const session = createSessionWithoutContextPack();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            path: [],
            rootKey: "context"
          }}
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

    expect(screen.getByText("当前消息没有可展示的分析详情。")).toBeTruthy();
    expect(screen.queryByLabelText("Analysis context tree viewport")).toBeNull();
    expect(screen.queryByText("上下文目录")).toBeNull();
    expect(screen.queryByText("本次请求上下文")).toBeNull();
    expect(screen.queryByText("当前请求没有附带上下文。")).toBeNull();
  });

  it("defaults the draft context root to expanded and lets the user collapse it", async () => {
    const draftContext = createDashboardDraftContext();

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

    expect(() => getTreeNodeByTitle("核心指标")).not.toThrow();

    const rootNode = getTreeNodeByTitle("经营状态总览");
    const rootSwitcher = rootNode.querySelector(".ant-tree-switcher") as HTMLElement | null;

    expect(rootSwitcher).toBeTruthy();
    fireEvent.click(rootSwitcher!);

    expect(screen.getByText("经营状态总览")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByText("核心指标")).toBeNull();
    });
  });

  it("keeps run roots view for analysis run subjects and opens context through the root selector", () => {
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
    expect(screen.getByRole("button", { name: /Run Trace/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: new RegExp(session.analysisTaskContextPack!.root.title) })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: new RegExp(session.analysisTaskContextPack!.root.title) }));

    expect(onSelectInspectorRoot).toHaveBeenCalledWith("context");
  });

  it("shows the selected session context root as a context tree viewport with a back action", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const onPopInspectorPath = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            path: [session.analysisTaskContextPack!.root.nodeId],
            rootKey: "context"
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

    expect(screen.getByText("上下文目录")).toBeTruthy();
    expect(screen.getByRole("button", { name: "返回上一级" })).toBeTruthy();
    expect(screen.getByText(session.analysisTaskContextPack!.root.title)).toBeTruthy();
    expect(screen.queryByText(session.analysisTaskContextPack!.root.summary ?? "")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "返回上一级" }));
    expect(onPopInspectorPath).toHaveBeenCalledTimes(1);
  });

  it("shows the draft empty state when no context pack is attached", () => {
    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={undefined}
          inspectorTreeState={{ path: [], rootKey: null }}
          onPopInspectorPath={() => undefined}
          onSelectInspectorNode={() => undefined}
          onSelectInspectorRoot={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    expect(screen.getAllByText("分析详情").length).toBeGreaterThan(0);
    expect(screen.getByText("当前还没有附带上下文，可直接输入问题或从其他入口带入。")).toBeTruthy();
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
