import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { findRuntimeMetric, runtimeMetricsFixtures } from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import { createDashboardViewModel } from "./mappers/createDashboardViewModel";
import * as DashboardPageModule from "./Page";
import { DashboardPage } from "./Page";
import type { DashboardSurfaceViewModel } from "./models/dashboardViewModel";
import { DashboardInspectorPanel } from "./sections/DashboardSections";

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

const recognizedRevenueMetric = findRuntimeMetric("metric-recognized-revenue");
const refundRateMetric = findRuntimeMetric("metric-refund-rate");

describe("DashboardPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);
  const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
    workspaceId: "workspace-northstar-retail-china",
    workspaceName: "Northstar Retail China"
  });

  function DashboardInspectorHarness() {
    const [activeNodeId, setActiveNodeId] = useState("dashboard-node-root");
    const [expandedNodeIds, setExpandedNodeIds] = useState([
      "dashboard-node-root",
      "dashboard-node-directory-metrics"
    ]);

    return (
      <DashboardInspectorPanel
        activeNodeId={activeNodeId}
        expandedNodeIds={expandedNodeIds}
        onExpandNodes={setExpandedNodeIds}
        onSelectNode={setActiveNodeId}
        selectedTimeRangeLabel="Last 30 days"
        viewModel={dashboardViewModel}
        workspaceName="Northstar Retail China"
      />
    );
  }

  function mapDashboardNode(
    node: InspectorTreeNode,
    nodeId: string,
    updater: (node: InspectorTreeNode) => InspectorTreeNode
  ): InspectorTreeNode {
    const nextChildren = node.children?.map((child) => mapDashboardNode(child, nodeId, updater));
    const nextNode = nextChildren ? { ...node, children: nextChildren } : node;

    return nextNode.nodeId === nodeId ? updater(nextNode) : nextNode;
  }

  function updateDashboardViewModelNode(
    viewModel: DashboardSurfaceViewModel,
    nodeId: string,
    updater: (node: InspectorTreeNode) => InspectorTreeNode
  ): DashboardSurfaceViewModel {
    return {
      ...viewModel,
      root: mapDashboardNode(viewModel.root, nodeId, updater)
    };
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

  it("renders the default time range and updates the shared-metric summary without navigation", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(await screen.findByRole("combobox", { name: "Dashboard time range" })).toBeTruthy();
    expect(screen.getByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Dashboard time range" }));
    fireEvent.click(await screen.findByText("Last 7 days"));

    expect(screen.getByText("当前展示最近 7 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders the child dashboard sections inside DashboardHero and aligns report/evidence cards to the same two-column layout", async () => {
    const { container } = render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} />
      </TestProviders>
    );

    const overviewSurface = (await screen.findByText("经营状态总览")).closest(".ant-card") as HTMLElement;
    const sectionText = Array.from(overviewSurface.querySelectorAll("section")).map((section) =>
      section.textContent?.replace(/\s+/g, " ").trim()
    );
    const reportCardColumn = screen.getByText("周经营分析报告").closest(".ant-col");

    expect(overviewSurface).toBeTruthy();
    expect(sectionText).toHaveLength(3);
    expect(sectionText.some((text) => text?.includes("核心指标"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("风险异常"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("报告与证据"))).toBe(true);
    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("退款异常证据摘要")).toBeTruthy();

    expect(screen.getByText("确认收入").closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(screen.getByText("库存周转风险").closest(".ant-col")?.className).toContain(
      "ant-col-md-12"
    );
    expect(reportCardColumn?.className).toContain("ant-col-md-12");
    expect(reportCardColumn?.className).not.toContain("ant-col-xl-8");
    expect(container.querySelectorAll("main > .ant-space > .ant-space-item")).toHaveLength(1);
    expect(
      Array.from(container.querySelectorAll("main > .ant-space > .ant-space-item > section"))
    ).toHaveLength(0);
    expect(within(overviewSurface).getAllByText("Last 30 days").length).toBeGreaterThan(0);
  });

  it("keeps Dashboard UI entry points converged to the root analysis action", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(await screen.findByRole("button", { name: "分析经营状态" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith(
      "analysis",
      expect.objectContaining({
        analysisContextNodeDisplay: dashboardViewModel.nodeDisplay,
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: "dashboard-node-root", title: "经营状态总览" })
        })
      })
    );

    for (const label of [
      "查看指标",
      "查看报告",
      "查看治理风险",
      "全部报告",
      "分析指标",
      "分析风险",
      "带报告上下文分析",
      "带证据上下文分析"
    ]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
  });

  it("starts the inspector viewport from the semantic dashboard root", () => {
    const orderedViewModel = createDashboardViewModel(
      [
        findRuntimeMetric("metric-gross-margin"),
        findRuntimeMetric("metric-recognized-revenue")
      ],
      {
        workspaceId: "workspace-northstar-retail-china",
        workspaceName: "Northstar Retail China"
      }
    );
    const sanitizedViewModel = updateDashboardViewModelNode(
      orderedViewModel,
      "metric-context-metric-recognized-revenue",
      (node) => ({
        ...node,
        chips: [],
        value: undefined
      })
    );

    expect(typeof DashboardPageModule.createDashboardContextTreeViewport).toBe("function");
    expect(DashboardPageModule.createDashboardContextTreeViewport(sanitizedViewModel)).toEqual({
      activeNodeId: "dashboard-node-root",
      expandedNodeIds: ["dashboard-node-root", "dashboard-node-directory-metrics"]
    });
  });

  it("renders a standardized dashboard context tree viewport without a selected-node detail panel", () => {
    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="dashboard-node-root"
          expandedNodeIds={[
            "dashboard-node-root",
            "dashboard-node-directory-metrics",
            "metric-context-metric-recognized-revenue",
            "metric-context-metric-gross-margin",
            "dashboard-node-directory-risks",
            "dashboard-node-directory-report-evidence"
          ]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={dashboardViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByText("上下文目录")).toBeTruthy();
    expect(screen.getByText("Last 30 days")).toBeTruthy();
    expect(screen.getByText("Northstar Retail China")).toBeTruthy();
    expect(screen.queryByText("当前节点")).toBeNull();
    expect(screen.queryByText("来源引用")).toBeNull();
    expect(screen.queryByText("目录节点 / 当前上下文根")).toBeNull();
    expect(screen.queryByText("SourceRef")).toBeNull();
    expect(screen.queryByText("经营状态总览 3")).toBeNull();
    expect(screen.queryByText("metric-recognized-revenue")).toBeNull();
    expect(screen.queryByText("source-evidence-refund-watch")).toBeNull();
    expect(
      screen.queryByText(
        /supporting_report|supporting_evidence|sourceEvidence|dataTable|knowledgeDocument/
      )
    ).toBeNull();

    const rootNode = getTreeNodeByTitle("经营状态总览");
    const metricSection = getTreeNodeByTitle("核心指标");
    const riskSection = getTreeNodeByTitle("风险异常");
    const reportEvidenceSection = getTreeNodeByTitle("报告与证据");
    const metricNode = getTreeNodeByTitle("确认收入");
    const riskNode = getTreeNodeByTitle("库存周转风险");
    const reportNode = getTreeNodeByTitle("周经营分析报告");
    const evidenceNode = getTreeNodeByTitle("退款异常证据摘要");
    const dataTableNode = getTreeNodeByTitle("销售订单汇总表");
    const knowledgeDocumentNode = getTreeNodeByTitle("毛利率复盘纪要");

    expect(normalizeTextContent(rootNode)).toContain("4 指标 · 3 风险 · 2 证据");
    expect(normalizeTextContent(rootNode)).not.toMatch(/经营状态总览\s*3/);
    expect(normalizeTextContent(metricSection)).toMatch(/核心指标\s*4/);
    expect(normalizeTextContent(riskSection)).toMatch(/风险异常\s*3/);
    expect(normalizeTextContent(reportEvidenceSection)).toMatch(/报告与证据\s*2/);
    expect(normalizeTextContent(metricNode)).toContain("¥12.8M · 下降 3.2%");
    expect(normalizeTextContent(metricNode)).toContain("关注");
    expect(normalizeTextContent(metricNode)).toContain("中风险");
    expect(normalizeTextContent(metricNode)).not.toMatch(/确认收入\s*2/);
    expect(normalizeTextContent(riskNode)).toContain("5.1 turns · 下降 0.4 turns");
    expect(normalizeTextContent(riskNode)).not.toContain("库存周转 < 5.3 turns 进入关注");
    expect(normalizeTextContent(riskNode)).toContain("关注");
    expect(normalizeTextContent(riskNode)).toContain("高风险");
    expect(normalizeTextContent(reportNode)).toContain("报告 · 支撑报告");
    expect(normalizeTextContent(evidenceNode)).toContain("证据 · 支撑证据");
    expect(normalizeTextContent(dataTableNode)).toContain("数据表 · 主表");
    expect(normalizeTextContent(knowledgeDocumentNode)).toContain("知识文档 · 支撑文档");
    expect(screen.queryByText(/^dataTable$|^knowledgeDocument$/)).toBeNull();
  });

  it("shows display labels instead of raw chips for metric child report nodes in the inspector", () => {
    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="metric-context-metric-recognized-revenue-metric-context-source-revenue-report"
          expandedNodeIds={[
            "dashboard-node-root",
            "dashboard-node-directory-metrics",
            "metric-context-metric-recognized-revenue"
          ]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={dashboardViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getAllByText("周经营分析报告").length).toBeGreaterThan(0);
    expect(screen.getByText("报告 · 支撑报告")).toBeTruthy();
    expect(
      screen.queryByText(
        recognizedRevenueMetric.contextSources.find((source) => source.sourceType === "report")
          ?.role ?? ""
      )
    ).toBeNull();
    expect(
      screen.queryByText(
        [
          "report",
          recognizedRevenueMetric.contextSources.find((source) => source.sourceType === "report")
            ?.role ?? ""
        ].join(" · ")
      )
    ).toBeNull();
  });

  it("shows display labels instead of raw chips for metric child evidence nodes in the inspector", () => {
    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="metric-context-metric-refund-rate-metric-context-source-refund-evidence"
          expandedNodeIds={[
            "dashboard-node-root",
            "dashboard-node-directory-metrics",
            "metric-context-metric-refund-rate"
          ]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={dashboardViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getAllByText("退款异常证据摘要").length).toBeGreaterThan(0);
    expect(screen.getByText("证据 · 支撑证据")).toBeTruthy();
    expect(
      screen.queryByText(
        refundRateMetric.contextSources.find((source) => source.sourceType === "sourceEvidence")
          ?.role ?? ""
      )
    ).toBeNull();
    expect(
      screen.queryByText(
        [
          "sourceEvidence",
          refundRateMetric.contextSources.find(
            (source) => source.sourceType === "sourceEvidence"
          )?.role ?? ""
        ].join(" · ")
      )
    ).toBeNull();
  });

  it("defaults the root to expanded and lets the user collapse it", async () => {
    render(
      <TestProviders>
        <DashboardInspectorHarness />
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
});
