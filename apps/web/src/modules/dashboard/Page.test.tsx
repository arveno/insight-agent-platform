import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import { findRuntimeMetric, runtimeMetricsFixtures } from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import { createDashboardViewModel } from "./mappers/createDashboardViewModel";
import { DashboardPage } from "./Page";
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

describe("DashboardPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);
  const dashboardInspectorMetrics: Metric[] = [
    ...runtimeMetricsFixtures,
    {
      businessDomainId: "business-domain-supply-chain-efficiency",
      contextSources: [
        {
          createdAt: "2026-06-12T10:30:00+08:00",
          metricContextSourceId: "metric-context-source-inventory-table",
          metricId: "metric-inventory-turnover",
          role: "primary_table",
          sourceId: "table-inventory-daily",
          sourceType: "dataTable",
          summary: "提供库存结余和出库周转明细。",
          title: "库存日表",
          updatedAt: "2026-06-12T10:30:00+08:00"
        }
      ],
      createdAt: "2026-06-12T10:30:00+08:00",
      currentValue: "5.1 turns",
      description: "库存周转速度。",
      formulaSummary: "库存周转 = 销售成本 / 平均库存",
      metricId: "metric-inventory-turnover",
      name: "库存周转",
      ownerTeam: "Supply Chain",
      period: "Last 30 days",
      riskLevel: "high",
      status: "attention",
      thresholdSummary: "库存周转 < 5.5 turns 进入关注",
      trendDirection: "down",
      trendValue: "-1.3%",
      unit: "turns",
      updatedAt: "2026-06-12T10:30:00+08:00",
      workspaceId: "workspace-northstar-retail-china"
    }
  ];
  const dashboardViewModel = createDashboardViewModel(dashboardInspectorMetrics, {
    workspaceId: "workspace-northstar-retail-china",
    workspaceName: "Northstar Retail China"
  });

  function DashboardInspectorHarness() {
    const [activeNodeId, setActiveNodeId] = useState("metric-context-metric-recognized-revenue");
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
    expect(sectionText).toHaveLength(4);
    expect(sectionText.some((text) => text?.includes("核心指标"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("风险异常"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("报告与证据"))).toBe(true);
    expect(sectionText.some((text) => text?.includes("平台质量"))).toBe(true);
    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("季度收入证据摘要")).toBeTruthy();
    expect(screen.getByText("数据质量与任务证据")).toBeTruthy();

    expect(screen.getByText("确认收入").closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(screen.getByText("确认收入 风险摘要").closest(".ant-col")?.className).toContain(
      "ant-col-md-12"
    );
    expect(screen.getByText("周经营分析报告").closest(".ant-col")?.className).toContain(
      "ant-col-xl-8"
    );
    const platformQualityColumnClassName = screen
      .getAllByText("平台质量")
      .map((element) => element.closest(".ant-col")?.className)
      .find((className) => className?.includes("ant-col-md-12"));

    expect(platformQualityColumnClassName).toContain("ant-col-md-12");
    expect(container.querySelectorAll("main > .ant-space > .ant-space-item")).toHaveLength(1);
    expect(
      Array.from(container.querySelectorAll("main > .ant-space > .ant-space-item > section"))
    ).toHaveLength(0);
    expect(within(overviewSurface).getAllByText("Last 30 days").length).toBeGreaterThan(0);
  });

  it("builds shared metric Analysis entry plus lightweight Dashboard subtree entries", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(await screen.findByRole("button", { name: "发起分析" }));
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
        name: "分析异常"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      2,
      "analysis",
      {
        analysisContextPack: buildMetricAnalysisContextPack(
          findRuntimeMetric("metric-recognized-revenue")
        )
      }
    );

    fireEvent.click(
      within(screen.getByText("确认收入 风险摘要").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      3,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({ nodeId: "dashboard-node-risk-primary-metric" })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("周经营分析报告").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      4,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            chips: expect.arrayContaining([
              "5 条证据",
              "Workspace Northstar Retail China"
            ]),
            nodeId: "dashboard-node-report-weekly-business",
            sourceRef: {
              reportId: "report-weekly-business",
              type: "report"
            },
            summary: "建议先核对相关证据，再带上下文继续分析。",
            title: "周经营分析报告"
          })
        })
      })
    );

    fireEvent.click(
      within(screen.getByText("季度收入证据摘要").closest(".ant-card")!).getByRole("button", {
        name: "带上下文分析"
      })
    );
    expect(onNavigate).toHaveBeenNthCalledWith(
      5,
      "analysis",
      expect.objectContaining({
        analysisContextPack: expect.objectContaining({
          root: expect.objectContaining({
            chips: expect.arrayContaining(["Metric / Report", "High"]),
            nodeId: "dashboard-node-evidence-revenue-summary",
            sourceRef: {
              sourceEvidenceId: "source-evidence-q2-revenue",
              type: "sourceEvidence"
            },
            summary: "来自核心指标和报告入口的轻量证据摘要。",
            title: "季度收入证据摘要"
          })
        })
      })
    );
  });

  it("renders a simplified Chinese dashboard context directory", () => {
    render(
      <TestProviders>
        <DashboardInspectorPanel
          activeNodeId="metric-context-metric-recognized-revenue"
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
    expect(screen.getByText("核心指标 4")).toBeTruthy();
    expect(screen.getByText("风险异常 2")).toBeTruthy();
    expect(screen.getByText("报告与证据 3")).toBeTruthy();
    expect(screen.getByText("平台质量 1")).toBeTruthy();
    expect(screen.getByText("指标 · Last 30 days")).toBeTruthy();
    expect(screen.getByText("¥12.8M · 下降 3.2%")).toBeTruthy();
    expect(screen.getByText("Medium risk · Attention")).toBeTruthy();
    expect(screen.getByText("来源引用")).toBeTruthy();
    expect(screen.getByText("metric-recognized-revenue")).toBeTruthy();
    expect(screen.queryByText("Dashboard Context")).toBeNull();
    expect(screen.queryByText("Context Tree")).toBeNull();
    expect(screen.queryByText("Selected Node")).toBeNull();
    expect(screen.queryByText(/^metric$/)).toBeNull();
    expect(screen.queryByText(/SourceRef:/)).toBeNull();
  });

  it("expands collapsed groups and updates the current-node detail on selection", () => {
    render(
      <TestProviders>
        <DashboardInspectorHarness />
      </TestProviders>
    );

    expect(screen.queryByText("确认收入 风险摘要")).toBeNull();

    const riskDirectory = screen.getByText("风险异常 2").closest(".ant-tree-treenode");
    const riskSwitcher = riskDirectory?.querySelector(".ant-tree-switcher") as HTMLElement | null;

    expect(riskSwitcher).toBeTruthy();
    fireEvent.click(riskSwitcher!);

    expect(screen.getByText("确认收入 风险摘要")).toBeTruthy();

    fireEvent.click(screen.getByText("确认收入 风险摘要"));

    expect(screen.getByText("当前节点")).toBeTruthy();
    expect(screen.getByText("风险信号 · Last 30 days")).toBeTruthy();
    expect(screen.getByText("确认收入 当前 下降 3.2%，建议进入 Analysis 继续追问。")).toBeTruthy();
  });
});
