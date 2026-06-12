import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";
import { createReportsViewModel } from "./fixtures/reportsStaticViewModel";
import type { ReportsReaderController } from "./hooks/useReportsReaderState";
import { ReportsPage, ReportsPageContent } from "./Page";

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

function createController(
  selectedReportKey = "report-inventory-exception-tracking"
): ReportsReaderController {
  const viewModel = createReportsViewModel(selectedReportKey);

  return {
    filteredReports: viewModel.reports,
    onSearchChange: vi.fn(),
    onSelectReport: vi.fn(),
    searchValue: "",
    selectedReportKey: viewModel.selectedReport.key,
    viewModel
  };
}

describe("ReportsPage", () => {
  it("renders a structured report reader instead of the old summary grid", () => {
    render(
      <TestProviders>
        <ReportsPage />
      </TestProviders>
    );

    expect(screen.getByText("报告")).toBeTruthy();
    expect(screen.getAllByText("周经营分析报告").length).toBeGreaterThan(0);
    expect(
      screen.getByText(
        "围绕收入增速放缓、毛利率波动和库存周转压力，沉淀本周经营复盘、关键证据与后续动作。"
      )
    ).toBeTruthy();
    expect(screen.getByText("reportId: report-weekly-operations-review")).toBeTruthy();
    expect(screen.getByText("runId: run-weekly-operations-review")).toBeTruthy();
    expect(screen.getByText("经营摘要")).toBeTruthy();
    expect(screen.getByText("证据引用")).toBeTruthy();
    expect(screen.getByText("决策建议")).toBeTruthy();
    expect(screen.getByText("行动建议")).toBeTruthy();
    expect(screen.getByRole("button", { name: "提交反馈" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "带上下文分析" })).toBeTruthy();
    expect(screen.queryByText("报告阅读器状态只作为静态展示模型。")).toBeNull();
    expect(screen.queryByText("Reader")).toBeNull();
  });

  it("uses the provided controller in ReportsPageContent without creating a second page-owned state track", () => {
    render(
      <TestProviders>
        <ReportsPageContent controller={createController()} onNavigate={vi.fn()} />
      </TestProviders>
    );

    expect(screen.getAllByText("库存异常跟踪报告").length).toBeGreaterThan(0);
    expect(screen.getByText("runId: run-inventory-exception-tracking")).toBeTruthy();
    expect(screen.queryByText("周经营分析报告")).toBeNull();
  });

  it("hands the selected report into Analysis draft mode as one-shot route state", () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <ReportsPageContent controller={createController()} onNavigate={onNavigate} />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "带上下文分析" }));

    expect(onNavigate).toHaveBeenCalledWith("analysis", {
      draftContextPack: {
        chips: [
          "reportId report-inventory-exception-tracking",
          "runId run-inventory-exception-tracking",
          "2 条证据",
          "2 个章节"
        ],
        sourceId: "report-inventory-exception-tracking",
        sourceTitle: "库存异常跟踪报告",
        sourceType: "report",
        suggestedPrompt: "请基于报告《库存异常跟踪报告》继续分析关键证据、风险判断和下一步动作。",
        summary: "跟踪库存积压与补货错配，沉淀异常定位、证据与清仓优先级建议。"
      }
    });
  });
});
