import { StrictMode, useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import { findRuntimeMetric, runtimeMetricsFixtures } from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import { createDashboardViewModel } from "./mappers/createDashboardViewModel";
import { DashboardPage, useDashboardShellSlots } from "./Page";
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
  const dashboardViewModel = createDashboardViewModel(runtimeMetricsFixtures, {
    workspaceId: "workspace-northstar-retail-china",
    workspaceName: "Northstar Retail China"
  });

  beforeEach(() => {
    metricsLoader.mockClear();
  });

  function DashboardShellHarness({
    onNavigate
  }: {
    onNavigate?: Parameters<typeof useDashboardShellSlots>[0]["onNavigate"];
  }) {
    const slots = useDashboardShellSlots({
      metricsLoader,
      onNavigate,
      workspaceId: "workspace-northstar-retail-china",
      workspaceName: "Northstar Retail China"
    });

    return (
      <>
        {slots.mainContent}
        {slots.rightAssistPanel}
      </>
    );
  }

  function DashboardInspectorHarness({
    initialActiveNodeId = "metric-context-metric-recognized-revenue",
    initialExpandedNodeIds = [
      "dashboard-node-root",
      "dashboard-node-directory-metrics",
      "metric-context-metric-recognized-revenue"
    ]
  }: {
    initialActiveNodeId?: string;
    initialExpandedNodeIds?: string[];
  }) {
    const [activeNodeId, setActiveNodeId] = useState(initialActiveNodeId);
    const [expandedNodeIds, setExpandedNodeIds] = useState(initialExpandedNodeIds);

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

  it("loads metrics once for the shared dashboard shell controller and inspector interactions do not refetch", async () => {
    render(
      <StrictMode>
        <TestProviders>
          <DashboardShellHarness />
        </TestProviders>
      </StrictMode>
    );

    expect(await screen.findByText("经营状态总览")).toBeTruthy();
    expect(await screen.findByText("上下文目录")).toBeTruthy();
    expect(screen.getByText("核心指标 3")).toBeTruthy();
    expect(screen.getByText("风险异常 2")).toBeTruthy();
    expect(screen.getByText("报告与证据 3")).toBeTruthy();

    await waitFor(() => {
      expect(metricsLoader).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByText("风险异常 2"));

    await waitFor(() => {
      expect(metricsLoader).toHaveBeenCalledTimes(1);
    });
  });

  it("renders the default time range and updates the shared-metric summary without navigation", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(await screen.findByRole("combobox", { name: "Dashboard time range" })).toBeTruthy();
    expect(screen.getByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(screen.getAllByText("Medium risk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Low risk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Attention").length).toBeGreaterThan(0);
    expect(screen.getByText("Healthy")).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Dashboard time range" }));
    fireEvent.click(await screen.findByText("Last 7 days"));

    expect(screen.getByText("当前展示最近 7 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
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
    expect(onNavigate).toHaveBeenNthCalledWith(2, "analysis", {
      analysisContextPack: buildMetricAnalysisContextPack(
        findRuntimeMetric("metric-recognized-revenue")
      )
    });

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
            chips: expect.arrayContaining(["5 条证据", "Workspace Northstar Retail China"]),
            nodeId: "dashboard-node-report-weekly-business",
            sourceRef: {
              reportId: "report-weekly-business",
              type: "report"
            },
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
            chips: expect.arrayContaining(["指标 / 报告", "High risk"]),
            nodeId: "dashboard-node-evidence-revenue-summary",
            sourceRef: {
              sourceEvidenceId: "source-evidence-q2-revenue",
              type: "sourceEvidence"
            },
            title: "季度收入证据摘要"
          })
        })
      })
    );
  });

  it("normalizes dashboard risk and source-type labels without exposing raw enums in the inspector", () => {
    render(
      <TestProviders>
        <DashboardInspectorHarness />
      </TestProviders>
    );

    expect(screen.getByText("上下文目录")).toBeTruthy();
    expect(screen.getByText("当前节点")).toBeTruthy();
    expect(screen.getByText("核心指标 3")).toBeTruthy();
    expect(screen.getByText("风险异常 2")).toBeTruthy();
    expect(screen.getByText("报告与证据 3")).toBeTruthy();
    expect(screen.getByText("平台质量 1")).toBeTruthy();
    expect(screen.getByText("指标 · Last 30 days")).toBeTruthy();
    expect(screen.getByText("¥12.8M · 下降 3.2%")).toBeTruthy();
    expect(screen.getByText("Medium risk · Attention")).toBeTruthy();
    expect(screen.getByText("来源引用")).toBeTruthy();
    expect(screen.getByText("metric-recognized-revenue")).toBeTruthy();
    expect(screen.queryByText(/^medium$/i)).toBeNull();
    expect(screen.queryByText(/^high$/i)).toBeNull();
    expect(screen.queryByText(/^low$/i)).toBeNull();
    expect(screen.queryByText(/^metric$/)).toBeNull();
    expect(screen.queryByText(/^dataTable$/)).toBeNull();
    expect(screen.queryByText(/^sourceEvidence$/)).toBeNull();
    expect(screen.queryByText(/^report$/)).toBeNull();

    fireEvent.click(screen.getByText("销售订单汇总表"));

    expect(screen.getByText("数据表 · Last 30 days")).toBeTruthy();
    expect(screen.getByText("table-sales-order")).toBeTruthy();
    expect(screen.queryByText(/^dataTable$/)).toBeNull();
  });
});
