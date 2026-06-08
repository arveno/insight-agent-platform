import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { ReportsPage } from "./Page";

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

describe("ReportsPage", () => {
  it("renders a structured report reader instead of the old summary grid", () => {
    render(
      <AppProviders>
        <ReportsPage />
      </AppProviders>
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
});
