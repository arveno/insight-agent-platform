import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { buildMetricAnalysisContextPack } from "../../api/adapters/buildMetricAnalysisContextPack";
import {
  findRuntimeMetric,
  runtimeMetricsFixtures
} from "../../shared/test/fixtures/runtimeMetrics";
import { TestProviders } from "../../shared/test/TestProviders";
import type { MetricsOverviewController } from "./hooks/useMetricsOverviewState";
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

describe("MetricsPage", () => {
  const metricsLoader = vi.fn(async () => runtimeMetricsFixtures);
  const metricLoader = vi.fn(async (metricId: string) => findRuntimeMetric(metricId));

  it("renders metrics as overview plus selected metric detail instead of flat capability sections", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <MetricsPage metricLoader={metricLoader} metricsLoader={metricsLoader} onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(await screen.findByText("指标总览")).toBeTruthy();
    expect(screen.getByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByText("业务定义")).toBeTruthy();
    expect(screen.getByText("当前摘要")).toBeTruthy();
    expect(screen.getByText("公式摘要")).toBeTruthy();
    expect(screen.getByText("阈值 / 风险摘要")).toBeTruthy();
    expect(screen.getByText("上下文来源摘要")).toBeTruthy();
    expect(screen.getByText("动作")).toBeTruthy();
    expect(screen.getByText("已满足确认条件的收入金额。")).toBeTruthy();
    expect(screen.getByText("当前指标目录属于当前 Workspace。")).toBeTruthy();
    expect(
      screen.getByText("Metrics 当前阶段只读展示共享指标语义和上下文摘要，不提供新增、编辑或真实计算。")
    ).toBeTruthy();
    expect(screen.queryByText("指标目录")).toBeNull();
    expect(screen.queryByText("公式与阈值")).toBeNull();
    expect(screen.queryByText("趋势与异常")).toBeNull();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses the provided controller in MetricsPageContent without creating a second page-owned state track", () => {
    render(
      <TestProviders>
        <MetricsPageContent controller={createController()} onNavigate={vi.fn()} />
      </TestProviders>
    );

    expect(screen.getByText("当前指标详情：毛利率")).toBeTruthy();
    expect(screen.getByText("收入扣除销售成本后保留的利润比例。")).toBeTruthy();
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
});
