import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { createAnalysisContextPackFromTree } from "../../../shared/navigation/analysisContextPack";
import { dashboardInspectorDraftFixture } from "../../../shared/test/fixtures/dashboardInspectorDraftFixture";
import { TestProviders } from "../../../shared/test/TestProviders";
import { findRuntimeMetric } from "../../../shared/test/fixtures/runtimeMetrics";
import {
  createMetricRiskViewModel,
  createMetricStatusViewModel
} from "../../../shared/utils/viewModelState";
import {
  formatMetricDisplayValue,
  formatMetricTrendLabel
} from "../../../api/adapters/buildMetricAnalysisContextPack";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
import {
  createRunTraceRootNodeId
} from "../models/inspectorTree";
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

function createDashboardContextNodeDisplay() {
  const metrics = [
    findRuntimeMetric("metric-recognized-revenue"),
    findRuntimeMetric("metric-gross-margin"),
    findRuntimeMetric("metric-refund-rate"),
    findRuntimeMetric("metric-inventory-turnover")
  ];

  return metrics.reduce<Record<string, {
    risk?: ReturnType<typeof createMetricRiskViewModel>;
    status: ReturnType<typeof createMetricStatusViewModel>;
    trendText: string;
    valueText: string;
  }>>((accumulator, metric) => {
    accumulator[`metric-context-${metric.metricId}`] = {
      risk: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
      status: createMetricStatusViewModel(metric.status),
      trendText: formatMetricTrendLabel(metric),
      valueText: formatMetricDisplayValue(metric)
    };

    if (metric.riskLevel !== "low") {
      accumulator[`dashboard-node-risk-${metric.metricId}`] = {
        risk: createMetricRiskViewModel(metric.riskLevel, metric.thresholdSummary),
        status: createMetricStatusViewModel(metric.status),
        trendText: formatMetricTrendLabel(metric),
        valueText: formatMetricDisplayValue(metric)
      };
    }

    return accumulator;
  }, {});
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
  it("renders draft context with the actual context root as the visible tree root", () => {
    const draftContext = createDashboardDraftContext();
    const contextNodeDisplay = createDashboardContextNodeDisplay();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          contextNodeDisplay={contextNodeDisplay}
          draftContext={draftContext}
          inspectorTreeState={{
            expandedNodeIds: [draftContext.root.nodeId],
            selectedNodeId: draftContext.root.nodeId
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    expect(screen.getByLabelText("Analysis inspector tree")).toBeTruthy();
    expect(() => getTreeNodeByTitle("经营状态总览")).not.toThrow();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();
    expect(screen.queryByText("Request Context")).toBeNull();
    expect(screen.queryByText(/^Context$/)).toBeNull();
  });

  it("reuses the dashboard route-state nodeDisplay for context-tree metric badges while still sanitizing report source chips", () => {
    const draftContext = createDashboardDraftContext();
    const contextNodeDisplay = createDashboardContextNodeDisplay();
    const metricSection = requireChildNode(draftContext.root, "核心指标");
    const revenueMetric = requireChildNode(metricSection, "确认收入");
    const revenueReport = requireChildNode(revenueMetric, "周经营分析报告");

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          contextNodeDisplay={contextNodeDisplay}
          draftContext={draftContext}
          inspectorTreeState={{
            expandedNodeIds: [draftContext.root.nodeId, metricSection.nodeId, revenueMetric.nodeId],
            selectedNodeId: revenueReport.nodeId
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    const metricNode = getTreeNodeByTitle("确认收入");
    const reportNode = getTreeNodeByTitle("周经营分析报告");

    expect(normalizeTextContent(metricNode)).toContain("¥12.8M · 下降 3.2%");
    expect(within(metricNode).getByText("关注")).toBeTruthy();
    expect(within(metricNode).getByText("中风险")).toBeTruthy();
    expect(normalizeTextContent(metricNode)).not.toContain("风险 medium");
    expect(screen.getByText("报告 · 支撑报告")).toBeTruthy();
    expect(normalizeTextContent(reportNode)).not.toContain("supporting_report");
    expect(normalizeTextContent(reportNode)).not.toContain("report");
    expect(screen.queryAllByText(/supporting_report|report/)).toHaveLength(0);
    expect(screen.queryByText(/风险 medium|风险 high|风险 low/)).toBeNull();
  });

  it("sanitizes raw evidence source type and role chips inside context tree rows", () => {
    const draftContext = createDashboardDraftContext();
    const contextNodeDisplay = createDashboardContextNodeDisplay();
    const metricSection = requireChildNode(draftContext.root, "核心指标");
    const refundMetric = requireChildNode(metricSection, "退款率");
    const refundEvidence = requireChildNode(refundMetric, "退款异常证据摘要");

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          contextNodeDisplay={contextNodeDisplay}
          draftContext={draftContext}
          inspectorTreeState={{
            expandedNodeIds: [draftContext.root.nodeId, metricSection.nodeId, refundMetric.nodeId],
            selectedNodeId: refundEvidence.nodeId
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={() => undefined}
          selectedSession={undefined}
          workspaceState={{ kind: "draft" }}
        />
      </TestProviders>
    );

    const evidenceNode = getTreeNodeByTitle("退款异常证据摘要");

    expect(screen.getByText("证据 · 支撑证据")).toBeTruthy();
    expect(normalizeTextContent(evidenceNode)).not.toContain("supporting_evidence");
    expect(normalizeTextContent(evidenceNode)).not.toContain("sourceEvidence");
    expect(screen.queryAllByText(/supporting_report|supporting_evidence|sourceEvidence/)).toHaveLength(0);
  });

  it("does not surface a fake Request Context root when the selected session has no context pack", () => {
    const session = createSessionWithoutContextPack();
    const roots = buildAnalysisInspectorRoots(session);

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            expandedNodeIds: [createRunTraceRootNodeId(session.currentRun.runId)],
            selectedNodeId: createRunTraceRootNodeId(session.currentRun.runId)
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={() => undefined}
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
    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.queryByText("Request Context")).toBeNull();
  });

  it("lets the unified tree collapse and expand context branches without a synthetic wrapper node", async () => {
    const draftContext = createDashboardDraftContext();
    const onSetInspectorExpandedNodeIds = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="右侧会显示当前草稿将要附带的分析详情。"
          draftContext={draftContext}
          inspectorTreeState={{
            expandedNodeIds: [draftContext.root.nodeId],
            selectedNodeId: draftContext.root.nodeId
          }}
          onSetInspectorExpandedNodeIds={onSetInspectorExpandedNodeIds}
          onSelectInspectorNode={() => undefined}
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

    await waitFor(() => {
      expect(onSetInspectorExpandedNodeIds).toHaveBeenCalled();
    });
  });

  it("renders one unified inspector tree with Run Trace and the actual context root as sibling roots", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const runTraceRootNodeId = createRunTraceRootNodeId(session.currentRun.runId);
    const contextRootNodeId = session.analysisTaskContextPack!.root.nodeId;
    const contextRootTitle = session.analysisTaskContextPack!.root.title;

    const { container } = render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            expandedNodeIds: [runTraceRootNodeId, contextRootNodeId],
            selectedNodeId: runTraceRootNodeId
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={() => undefined}
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

    expect(screen.getByLabelText("Analysis inspector tree")).toBeTruthy();
    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.getByText(contextRootTitle)).toBeTruthy();
    expect(screen.getAllByText("run.created").length).toBeGreaterThan(0);
    expect(screen.queryByText("Request Context")).toBeNull();
    expect(screen.queryByRole("button", { name: /Run Trace/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "返回上一级" })).toBeNull();
    expect(container.querySelectorAll("aside .ant-card").length).toBe(1);
  });

  it("selects actual tree roots and leaves through the unified tree callback instead of a root-card mode", () => {
    const session = analysisStaticViewModel.sessions[0]!;
    const onSelectInspectorNode = vi.fn();
    const contextRootTitle = session.analysisTaskContextPack!.root.title;

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          contextPanelNote="点击消息后，右侧会显示对应的分析详情与上下文。"
          draftContext={undefined}
          inspectorTreeState={{
            expandedNodeIds: [
              createRunTraceRootNodeId(session.currentRun.runId),
              session.analysisTaskContextPack!.root.nodeId
            ],
            selectedNodeId: createRunTraceRootNodeId(session.currentRun.runId)
          }}
          onSetInspectorExpandedNodeIds={() => undefined}
          onSelectInspectorNode={onSelectInspectorNode}
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

    fireEvent.click(screen.getByText(contextRootTitle));
    expect(onSelectInspectorNode).toHaveBeenCalledWith(session.analysisTaskContextPack!.root.nodeId);
  });
});
