import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";
import { DashboardPage } from "./Page";

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
  it("renders the default time range and updates the static summary without navigation", async () => {
    const onNavigate = vi.fn();

    render(
      <TestProviders>
        <DashboardPage onNavigate={onNavigate} />
      </TestProviders>
    );

    expect(screen.getByText("Last 30 days")).toBeTruthy();
    expect(screen.getByText("当前展示最近 30 天内的指标摘要、异常和报告入口。")).toBeTruthy();

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Dashboard time range" }));
    fireEvent.click(await screen.findByText("Last 7 days"));

    expect(screen.getByText("当前展示最近 7 天内的指标摘要、异常和报告入口。")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("uses Ant Row and Col for responsive dashboard card sections and renders three report-evidence cards", () => {
    render(
      <TestProviders>
        <DashboardPage />
      </TestProviders>
    );

    expect(screen.getByText("周经营分析报告")).toBeTruthy();
    expect(screen.getByText("季度收入证据摘要")).toBeTruthy();
    expect(screen.getByText("数据质量与任务证据")).toBeTruthy();

    expect(screen.getByText("季度收入").closest(".ant-col")?.className).toContain("ant-col-lg-12");
    expect(screen.getByText("收入增速异常").closest(".ant-col")?.className).toContain(
      "ant-col-lg-12"
    );
    expect(screen.getByText("周经营分析报告").closest(".ant-col")?.className).toContain(
      "ant-col-lg-8"
    );
    expect(screen.getByText("平台质量").closest(".ant-col")?.className).toContain("ant-col-lg-12");
  });
});
