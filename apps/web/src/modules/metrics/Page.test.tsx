import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";
import { createMetricsViewModel } from "./fixtures/metricsStaticViewModel";
import type { MetricsOverviewController } from "./hooks/useMetricsOverviewState";
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
  const viewModel = createMetricsViewModel(selectedMetricKey);

  return {
    filteredMetrics: viewModel.metrics,
    onSearchChange: vi.fn(),
    onSelectMetric: vi.fn(),
    searchValue: "",
    selectedMetricKey: viewModel.selectedMetric.key,
    viewModel
  };
}

describe("MetricsPage", () => {
  it("renders metrics as overview plus selected metric detail instead of flat capability sections", () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <MetricsPage onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.getByText("当前指标详情：确认收入")).toBeTruthy();
    expect(screen.getByText("业务定义")).toBeTruthy();
    expect(screen.getByText("当前摘要")).toBeTruthy();
    expect(screen.getByText("公式")).toBeTruthy();
    expect(screen.getByText("阈值 / 异常规则")).toBeTruthy();
    expect(screen.getByText("字段血缘摘要")).toBeTruthy();
    expect(screen.getByText("证据摘要")).toBeTruthy();
    expect(screen.getByText("动作")).toBeTruthy();
    expect(screen.getByText("已满足确认条件的收入金额。")).toBeTruthy();
    expect(screen.getByText("当前指标目录属于当前 Workspace。")).toBeTruthy();
    expect(
      screen.getByText("Metrics 当前阶段只读展示指标语义，不提供新增、编辑或真实计算。")
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

  it("uses analysis entry actions as navigation-only context handoff", () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <MetricsPage onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "带上下文进入 Analysis" }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("analysis", {
      draftContextPack: {
        chips: ["营收质量", "Last 30 days", "当前值 ¥12.8M", "环比 -3.2%", "风险 medium"],
        sourceId: "metric-recognized-revenue",
        sourceTitle: "确认收入",
        sourceType: "metric",
        suggestedPrompt:
          "请基于 确认收入 在 Last 30 days 的表现，解释 环比 -3.2% 的主要原因，并给出下一步建议。",
        summary:
          "当前值 ¥12.8M，阈值 收入增速 < -2%，趋势 环比 -3.2%，可结合公式、血缘和证据继续分析。"
      }
    });
    expect(screen.queryByRole("button", { name: "新增指标" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑公式" })).toBeNull();
    expect(screen.queryByRole("button", { name: "编辑阈值" })).toBeNull();
    expect(screen.queryByText("真实 conversation")).toBeNull();
  });
});
