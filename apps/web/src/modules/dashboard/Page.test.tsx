import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { InspectorTreeNode } from "@insight-agent/contracts/generated/typescript";

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import { messages } from "../../shared/i18n/messages";
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

const zhCnMessages = messages["zh-CN"];
const recognizedRevenueMetric = findRuntimeMetric("metric-recognized-revenue");
const refundRateMetric = findRuntimeMetric("metric-refund-rate");

describe("DashboardPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);
  const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
    workspaceId: "workspace-northstar-retail-china",
    workspaceName: "Northstar Retail China"
  });

  function findNodeByTitle(node: InspectorTreeNode, title: string): InspectorTreeNode | undefined {
    if (node.title === title) {
      return node;
    }

    for (const child of node.children ?? []) {
      const match = findNodeByTitle(child, title);

      if (match) {
        return match;
      }
    }

    return undefined;
  }

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
        onExpandNodes={(nodeIds) => setExpandedNodeIds(["dashboard-node-root", ...nodeIds])}
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

  it("renders the child dashboard sections inside DashboardHero instead of as peer sections", async () => {
    const { container } = render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} />
      </TestProviders>
    );

    const overviewSurface = (await screen.findByText("经营状态总览")).closest(".ant-card") as HTMLElement;
    const sectionText = Array.from(overviewSurface.querySelectorAll("section")).map((section) =>
      section.textContent?.replace(/\s+/g, " ").trim()
    );

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
    expect(screen.getByText("周经营分析报告").closest(".ant-col")?.className).toContain(
      "ant-col-xl-8"
    );
    expect(container.querySelectorAll("main > .ant-space > .ant-space-item")).toHaveLength(1);
    expect(
      Array.from(container.querySelectorAll("main > .ant-space > .ant-space-item > section"))
    ).toHaveLength(0);
    expect(within(overviewSurface).getAllByText("Last 30 days").length).toBeGreaterThan(0);
  });

  it("renders metric, risk, and evidence cards from the dashboard tree projection without raw enum leakage or fake detail actions", async () => {
    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} />
      </TestProviders>
    );

    const metricCard = (await screen.findByText("确认收入")).closest(".ant-card") as HTMLElement;
    const healthyMetricCard = screen.getByText("毛利率").closest(".ant-card") as HTMLElement;
    const riskCard = screen.getByText("库存周转风险").closest(".ant-card") as HTMLElement;
    const evidenceCard = screen.getByText("退款异常证据摘要").closest(".ant-card") as HTMLElement;
    const reportCard = screen.getByText("周经营分析报告").closest(".ant-card") as HTMLElement;

    expect(within(metricCard).getByText("已满足确认条件的收入金额。")).toBeTruthy();
    expect(within(metricCard).getByText("营收质量 · Last 30 days · 下降 3.2%")).toBeTruthy();
    expect(within(metricCard).getByRole("button", { name: "分析指标" })).toBeTruthy();
    expect(
      within(metricCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.analyzeAnomaly"]
      })
    ).toBeNull();
    expect(
      within(metricCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.viewDataKnowledge"]
      })
    ).toBeNull();
    expect(within(healthyMetricCard).getByRole("button", { name: "分析指标" })).toBeTruthy();
    expect(
      within(healthyMetricCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.analyzeAnomaly"]
      })
    ).toBeNull();
    expect(within(metricCard).queryByText("收入增速 < -2% 进入关注")).toBeNull();
    expect(within(metricCard).queryByText(/风险 (medium|high|low)/)).toBeNull();
    expect(metricCard.textContent?.match(/Last 30 days/g)).toHaveLength(1);

    expect(within(riskCard).getByText("5.1 turns · 下降 0.4 turns")).toBeTruthy();
    expect(within(riskCard).getByText("库存周转 < 5.3 turns 进入关注")).toBeTruthy();
    expect(within(riskCard).getByText("供应链效率 · Last 30 days")).toBeTruthy();
    expect(within(riskCard).getByRole("button", { name: "分析风险" })).toBeTruthy();
    expect(
      within(riskCard).queryByRole("button", { name: zhCnMessages["dashboard.action.viewAnomaly"] })
    ).toBeNull();
    expect(
      within(riskCard).queryByRole("button", { name: zhCnMessages["dashboard.action.viewTrace"] })
    ).toBeNull();

    expect(within(reportCard).getByText("报告 · 支撑报告")).toBeTruthy();
    expect(within(reportCard).getByRole("button", { name: "带报告上下文分析" })).toBeTruthy();
    expect(within(reportCard).queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(
      within(reportCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.viewSuggestions"]
      })
    ).toBeNull();
    expect(within(evidenceCard).getByText("证据 · 支撑证据")).toBeTruthy();
    expect(within(evidenceCard).getByRole("button", { name: "带证据上下文分析" })).toBeTruthy();
    expect(
      within(evidenceCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.viewEvidence"]
      })
    ).toBeNull();
    expect(
      within(evidenceCard).queryByRole("button", {
        name: zhCnMessages["dashboard.action.viewDataKnowledge"]
      })
    ).toBeNull();
    expect(
      within(evidenceCard).queryByRole("button", { name: zhCnMessages["dashboard.action.viewTrace"] })
    ).toBeNull();
    expect(screen.queryByRole("button", { name: zhCnMessages["dashboard.action.viewTrace"] })).toBeNull();
  });

  it("builds shared metric Analysis entry plus lightweight Dashboard subtree entries", async () => {
    const onNavigate = vi.fn();
    const inventoryRiskNode = findNodeByTitle(dashboardViewModel.root, "库存周转风险");

    if (!inventoryRiskNode) {
      throw new Error("Expected Dashboard tree to include the runtime-derived risk node.");
    }

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(await screen.findByRole("button", { name: "分析经营状态" }));
    expect(onNavigate).toHaveBeenNthCalledWith(
      1,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: "dashboard-node-root" })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("确认收入").closest(".ant-card")!).getByRole("button", {
        name: "分析指标"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      2,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            chips: ["营收质量", "Last 30 days", "下降 3.2%"],
            nodeId: "metric-context-metric-recognized-revenue"
          })
        })
      })
    );
    expect(onNavigate.mock.calls[1]?.[1]).toEqual({
      analysisContextPack: buildMetricAnalysisContextPack(findRuntimeMetric("metric-recognized-revenue"))
    });
    for (const level of ["medium", "high", "low"]) {
      expect(onNavigate.mock.calls[1]?.[1]?.analysisContextPack.root.chips).not.toContain(
        `风险 ${level}`
      );
    }
    expect(
      onNavigate.mock.calls[1]?.[1]?.analysisContextPack.root.children?.map(
        (child: InspectorTreeNode) => child.chips
      )
    ).toEqual([["数据表", "主表"], ["报告", "支撑报告"]]);

    fireEvent.click(
      within(screen.getByText("库存周转风险").closest(".ant-card")!).getByRole("button", {
        name: "分析风险"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      3,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            nodeId: inventoryRiskNode.nodeId,
            sourceRef: {
              metricId: "metric-inventory-turnover",
              type: "metric"
            },
            title: "库存周转风险"
          })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("周经营分析报告").closest(".ant-card")!).getByRole("button", {
        name: "带报告上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      4,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            nodeId: expect.stringMatching(/^dashboard-node-report-/),
            sourceRef: {
              reportId: "report-weekly-business",
              type: "report"
            },
            summary: "补充收入确认节奏、区域差异和渠道复核建议的只读摘要。",
            title: "周经营分析报告"
          })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("退款异常证据摘要").closest(".ant-card")!).getByRole("button", {
        name: "带证据上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      5,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            nodeId: expect.stringMatching(/^dashboard-node-sourceEvidence-/),
            sourceRef: {
              sourceEvidenceId: "source-evidence-refund-watch",
              type: "sourceEvidence"
            },
            summary: "记录近期退款率抬升和客服标签聚合后的证据摘要。",
            title: "退款异常证据摘要"
          })
        })
      })
    );
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

  it("renders a simplified Chinese dashboard context directory", () => {
    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="dashboard-node-root"
          expandedNodeIds={["dashboard-node-root", "dashboard-node-directory-metrics"]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={dashboardViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByText("上下文目录")).toBeTruthy();
    expect(screen.getByText("当前节点")).toBeTruthy();
    expect(screen.getByText("Last 30 days · Northstar Retail China")).toBeTruthy();
    expect(screen.getByText("经营状态总览 3")).toBeTruthy();
    expect(screen.getByText("核心指标 4")).toBeTruthy();
    expect(screen.getByText("风险异常 3")).toBeTruthy();
    expect(screen.getByText("报告与证据 2")).toBeTruthy();
    expect(screen.getAllByText("经营状态总览").length).toBeGreaterThan(0);
    expect(screen.getByText("经营总览 · Last 30 days")).toBeTruthy();
    expect(screen.getByText(dashboardViewModel.root.summary!)).toBeTruthy();
    expect(screen.getByText("来源引用")).toBeTruthy();
    expect(screen.getByText("目录节点 / 当前上下文根")).toBeTruthy();
    expect(screen.queryByText("平台质量")).toBeNull();
    expect(screen.queryByText("Dashboard Context")).toBeNull();
    expect(screen.queryByText("Context Tree")).toBeNull();
    expect(screen.queryByText("Selected Node")).toBeNull();
    expect(screen.queryByText(/^metric$/)).toBeNull();
    expect(screen.queryByText(/SourceRef:/)).toBeNull();
  });

  it("renders metric risk and status from mapper fields instead of reverse-parsing raw strings", () => {
    const misleadingViewModel = updateDashboardViewModelNode(
      dashboardViewModel,
      "metric-context-metric-recognized-revenue",
      (node) => ({
        ...node,
        chips: [zhCnMessages["risk.high.title"]],
        summary: zhCnMessages["status.healthy.title"]
      })
    );

    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="metric-context-metric-recognized-revenue"
          expandedNodeIds={["dashboard-node-root", "dashboard-node-directory-metrics"]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={misleadingViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByText(zhCnMessages["risk.medium.title"])).toBeTruthy();
    expect(screen.getByText(zhCnMessages["status.attention.title"])).toBeTruthy();
    expect(
      screen.queryByText(
        `${zhCnMessages["risk.high.title"]} · ${zhCnMessages["status.healthy.title"]}`
      )
    ).toBeNull();
  });

  it("does not infer evidence risk from evidence chips", () => {
    const refundEvidenceNode = findNodeByTitle(dashboardViewModel.root, "退款异常证据摘要");

    if (!refundEvidenceNode) {
      throw new Error("Expected Dashboard tree to include 退款异常证据摘要.");
    }

    const misleadingEvidenceViewModel = updateDashboardViewModelNode(
      dashboardViewModel,
      refundEvidenceNode.nodeId,
      (node) => ({
        ...node,
        chips: [zhCnMessages["risk.high.title"], zhCnMessages["status.attention.title"]]
      })
    );

    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId={refundEvidenceNode.nodeId}
          expandedNodeIds={["dashboard-node-root", "dashboard-node-directory-report-evidence"]}
          onExpandNodes={vi.fn()}
          onSelectNode={vi.fn()}
          selectedTimeRangeLabel="Last 30 days"
          viewModel={misleadingEvidenceViewModel}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByText("source-evidence-refund-watch")).toBeTruthy();
    expect(screen.queryByText(zhCnMessages["risk.high.title"])).toBeNull();
    expect(screen.queryByText(zhCnMessages["status.attention.title"])).toBeNull();
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

  it("expands collapsed groups and updates the current-node detail on selection", () => {
    render(
      <TestProviders>
        <DashboardInspectorHarness />
      </TestProviders>
    );

    expect(screen.queryByText("库存周转风险")).toBeNull();

    const riskDirectory = screen.getByText("风险异常 3").closest(".ant-tree-treenode");
    const riskSwitcher = riskDirectory?.querySelector(".ant-tree-switcher") as HTMLElement | null;

    expect(riskSwitcher).toBeTruthy();
    fireEvent.click(riskSwitcher!);

    expect(screen.getByText("库存周转风险")).toBeTruthy();

    fireEvent.click(screen.getByText("库存周转风险"));

    expect(screen.getByText("当前节点")).toBeTruthy();
    expect(screen.getByText("风险信号 · Last 30 days")).toBeTruthy();
    expect(screen.getByText("库存周转 < 5.3 turns 进入关注")).toBeTruthy();
  });
});
