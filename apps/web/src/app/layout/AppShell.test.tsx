import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { AppProviders } from "../providers/AppProviders";
import { AppShell } from "./AppShell";

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

describe("AppShell", () => {
  it("renders primary entries separately from capability preview entries", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const navigation = screen.getByRole("navigation", { name: "Shell navigation" });

    expect(within(navigation).getByText("主入口")).toBeTruthy();
    expect(within(navigation).getByText("能力预览")).toBeTruthy();
    const dashboardButton = within(navigation).getByRole("button", { name: /仪表盘/ });
    const analysisButton = within(navigation).getByRole("button", { name: /分析/ });
    const reportsButton = within(navigation).getByRole("button", { name: /报告/ });

    expect(dashboardButton).toBeTruthy();
    expect(analysisButton).toBeTruthy();
    expect(reportsButton).toBeTruthy();
    expect(dashboardButton.querySelector(".anticon-right")).toBeNull();
    expect(analysisButton.querySelector(".anticon-right")).toBeTruthy();
    expect(reportsButton.querySelector(".anticon-right")).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: /模型与工具/ })).toBeTruthy();
    expect(within(navigation).getByRole("button", { name: /观测/ })).toBeTruthy();
    expect(within(navigation).queryByRole("button", { name: /工作区/ })).toBeNull();
  });

  it("switches the static workspace selector and shows simulated refresh feedback", async () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const workspaceButton = screen.getByRole("button", { name: /Northstar Retail China/ });

    fireEvent.click(workspaceButton);
    fireEvent.click(await screen.findByText("East Retail Demo"));

    expect(screen.getByRole("button", { name: /East Retail Demo/ })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /当前工作区/ })).toBeNull();
    expect(screen.getByText("已模拟刷新当前工作区。")).toBeTruthy();
    expect(screen.getByText("当前工作区: East Retail Demo")).toBeTruthy();
  });

  it("renders route-specific inspector capability and integration notes from the static view model", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const navigation = screen.getByRole("navigation", { name: "Shell navigation" });

    expect(screen.getByText(/用于查看当前工作区经营概览、异常摘要和关键入口。/)).toBeTruthy();
    expect(screen.getByText(/Metrics：指标口径、阈值和时间范围数据监测。/)).toBeTruthy();

    fireEvent.click(within(navigation).getByRole("button", { name: /分析/ }));

    expect(screen.getByText(/用于承接分析会话、追问和问题定位。/)).toBeTruthy();
    expect(
      screen.getByText(/后续会对接 Agent Run、Tool Calling、Run Trace、RAG Evidence。/)
    ).toBeTruthy();
    expect(
      screen.getByText(
        /LangGraph：Agent Runtime，负责分析流程编排、状态流转、Human-in-the-loop 和可恢复执行。/
      )
    ).toBeTruthy();
  });
});
