import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../api/adapters/loadWorkspaceMetrics", async () => {
  const fixtures = await import("../../shared/test/fixtures/runtimeMetrics");

  return {
    loadWorkspaceMetric: vi.fn(async (metricId: string) => fixtures.findRuntimeMetric(metricId)),
    loadWorkspaceMetrics: vi.fn(async () => fixtures.runtimeMetricsFixtures)
  };
});

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import { messages } from "../../shared/i18n/messages";
import {
  findRuntimeMetric,
  runtimeMetricsFixtures
} from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import type { MetricsOverviewController } from "./hooks/useMetricsOverviewState";
import { useMetricsShellSlots } from "./hooks/useMetricsShellSlots";
import { createMetricsViewModel } from "./mappers/createMetricsViewModel";
import { MetricsPage, MetricsPageContent } from "./Page";

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

function createController(selectedMetricKey = "metric-gross-margin"): MetricsOverviewController {
  const selectedMetric = findRuntimeMetric(selectedMetricKey);
  const viewModel = createMetricsViewModel({
    metrics: runtimeMetricsFixtures,
    selectedMetric,
    workspaceBinding: {
      workspaceId: "workspace-northstar-retail-china",
      workspaceName: "Northstar Retail China"
    }
  });

  return {
    filteredMetrics: viewModel.metrics,
    onSearchChange: vi.fn(),
    onSelectMetric: vi.fn(),
    searchValue: "",
    state: "ready",
    selectedMetricKey: viewModel.selectedMetric.key,
    viewModel
  };
}

function MetricsShellSlotHarness({ onNavigate = vi.fn() }: { onNavigate?: ReturnType<typeof vi.fn> }) {
  const slots = useMetricsShellSlots({
    onBackToRoot: vi.fn(),
    onNavigate
  });

  return (
    <>
      {slots.leftNav}
      {slots.mainContent}
      {slots.rightAssistPanel}
    </>
  );
}

describe("MetricsPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);
  const metricLoader = vi.fn(async (metricId: string) => findRuntimeMetric(metricId));

  it("renders the selected metric detail and inspector summaries without changing the existing page structure", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <MetricsShellSlotHarness onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(await screen.findByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("指标关系链")).toBeTruthy();
    expect(screen.getByText("业务定义")).toBeTruthy();
    expect(screen.getByText("公式摘要")).toBeTruthy();
    expect(screen.getByText("阈值 / 风险摘要")).toBeTruthy();
    expect(screen.getByText("上下文来源摘要")).toBeTruthy();
    expect(screen.getAllByText(zhCnMessages["status.attention.title"]).length).toBeGreaterThan(0);
    expect(screen.getAllByText(zhCnMessages["risk.medium.title"]).length).toBeGreaterThan(0);
    expect(screen.getAllByText("已满足确认条件的收入金额。").length).toBeGreaterThan(0);
    expect(screen.getByText("¥12.8M")).toBeTruthy();
    expect(screen.getAllByText("Last 30 days").length).toBeGreaterThan(0);
    expect(screen.getByText("下降 3.2%")).toBeTruthy();
    expect(screen.getAllByText("确认收入 = 已预订收入 - 退款金额").length).toBeGreaterThan(0);
    expect(screen.getAllByText("收入增速 < -2% 进入关注").length).toBeGreaterThan(0);
    expect(screen.getAllByText("销售订单汇总表").length).toBeGreaterThan(0);
    expect(screen.getAllByText("周经营分析报告").length).toBeGreaterThan(0);
    expect(
      screen.getByText("当前快照用于解释指标关系和上下文来源；后续会接入事实数据计算。")
    ).toBeTruthy();
    expect(screen.getByText("风险分布")).toBeTruthy();
    expect(screen.getByText("业务域分布")).toBeTruthy();
    expect(screen.getByText("来源类型摘要")).toBeTruthy();
    expect(screen.getByText("只读边界")).toBeTruthy();
    expect(screen.getAllByText("库存周转").length).toBeGreaterThan(0);
    expect(screen.getByText(zhCnMessages["risk.high.title"])).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses the provided controller in MetricsPageContent without creating a second page-owned state track", () => {
    render(
      <TestProviders>
        <MetricsPageContent controller={createController()} onNavigate={vi.fn()} />
      </TestProviders>
    );

    expect(screen.getByText("当前指标详情：毛利率")).toBeTruthy();
    expect(screen.getAllByText("收入扣除销售成本后保留的利润比例。").length).toBeGreaterThan(0);
    expect(screen.queryByText("当前指标详情：确认收入")).toBeNull();
  });

  it("uses analysis entry actions as shared metric context handoff", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <MetricsPage metricLoader={metricLoader} metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(await screen.findByRole("button", { name: "带上下文进入 Analysis" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis", {
      analysisContextPack: buildMetricAnalysisContextPack(
        findRuntimeMetric("metric-recognized-revenue")
      )
    });
    expect(screen.queryByRole("button", { name: "新增指标" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑公式" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑阈值" })).toBeNull();
    expect(screen.queryByText("真实 conversation")).toBeNull();
  });

  it("builds the selected metric analysis handoff from the shared metric context pack", () => {
    const selectedMetric = findRuntimeMetric("metric-recognized-revenue");
    const metricsViewModel = createMetricsViewModel({
      metrics: runtimeMetricsFixtures,
      selectedMetric,
      workspaceBinding: {
        workspaceId: "workspace-northstar-retail-china",
        workspaceName: "Northstar Retail China"
      }
    });

    expect(metricsViewModel.selectedMetric.analysisContextPack).toEqual(
      buildMetricAnalysisContextPack(selectedMetric)
    );
  });
});
