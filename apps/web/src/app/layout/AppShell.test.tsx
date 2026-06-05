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

  it("enters analysis session navigation mode and filters the static session list locally", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /分析/ }));

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });

    expect(within(analysisNavigation).getByText("分析")).toBeTruthy();
    expect(within(analysisNavigation).getByRole("textbox", { name: "搜索会话" })).toBeTruthy();
    expect(within(analysisNavigation).getByRole("button", { name: /新聊天/ })).toBeTruthy();
    expect(within(analysisNavigation).getByText("Q2 收入异常追问")).toBeTruthy();
    expect(within(analysisNavigation).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(analysisNavigation).getByText("库存异常定位")).toBeTruthy();
    expect(within(analysisNavigation).queryByText("刚刚更新")).toBeNull();
    expect(within(analysisNavigation).queryByText("成功")).toBeNull();
    expect(
      within(analysisNavigation).queryByText("围绕 Dashboard 收入异常做渠道和时间窗口追问。")
    ).toBeNull();

    fireEvent.change(within(analysisNavigation).getByRole("textbox", { name: "搜索会话" }), {
      target: { value: "毛利率" }
    });

    expect(within(analysisNavigation).queryByText("Q2 收入异常追问")).toBeNull();
    expect(within(analysisNavigation).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(analysisNavigation).queryByText("库存异常定位")).toBeNull();
  });

  it("updates conversation and inspector when switching analysis sessions", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /分析/ }));

    const analysisNavigation = screen.getByRole("navigation", {
      name: "Analysis session navigation"
    });

    fireEvent.click(within(analysisNavigation).getByText("毛利率波动复盘"));

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(within(main).queryByRole("heading", { name: "分析" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(within(main).queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(
      within(main).getAllByText("来自 Reports / Margin · 毛利率复盘 · This quarter")
    ).toHaveLength(2);
    expect(
      within(main).getByText("复盘本季度毛利率波动，重点解释促销投放和商品结构变化。")
    ).toBeTruthy();
    expect(within(main).getByText(/当前阶段判断倾向于促销档期重叠导致毛利率波动/)).toBeTruthy();
    expect(within(main).getByRole("group", { name: "Analysis composer" })).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "后续追问" })).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / 采纳入口")).toBeNull();

    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.getByText("runId: analysis-margin-follow-up")).toBeTruthy();
    expect(screen.getByText("1. 接收用户问题")).toBeTruthy();
    expect(screen.getByText("6. 召回 Evidence / RAG 来源")).toBeTruthy();
    expect(screen.getByText("8. 等待用户追问 / 反馈")).toBeTruthy();
    expect(screen.queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(screen.queryByText("Feedback / 采纳入口")).toBeNull();
    expect(screen.queryByText("报告补充入口")).toBeNull();
    expect(screen.queryByText(/技术对接：/)).toBeNull();
  });

  it("enters reports navigation mode and keeps report selection in local UI state", () => {
    render(
      <AppProviders>
        <AppShell />
      </AppProviders>
    );

    const rootNavigation = screen.getByRole("navigation", { name: "Shell navigation" });

    fireEvent.click(within(rootNavigation).getByRole("button", { name: /报告/ }));

    const reportsNavigation = screen.getByRole("navigation", { name: "Reports navigation" });

    expect(within(reportsNavigation).getByText("报告")).toBeTruthy();
    expect(within(reportsNavigation).getByRole("textbox", { name: "搜索报告" })).toBeTruthy();
    expect(within(reportsNavigation).getByText("周经营分析报告")).toBeTruthy();
    expect(within(reportsNavigation).getByText("毛利率复盘报告")).toBeTruthy();
    expect(within(reportsNavigation).getByText("库存异常跟踪报告")).toBeTruthy();
    expect(within(reportsNavigation).queryByText("4 个证据引用")).toBeNull();

    fireEvent.change(within(reportsNavigation).getByRole("textbox", { name: "搜索报告" }), {
      target: { value: "库存" }
    });

    expect(within(reportsNavigation).queryByText("周经营分析报告")).toBeNull();
    expect(within(reportsNavigation).queryByText("毛利率复盘报告")).toBeNull();
    expect(within(reportsNavigation).getByText("库存异常跟踪报告")).toBeTruthy();

    fireEvent.click(within(reportsNavigation).getByText("库存异常跟踪报告"));

    expect(screen.getAllByText("库存异常跟踪报告").length).toBeGreaterThan(0);
    expect(screen.getAllByText("reportId: report-inventory-exception-tracking").length).toBeGreaterThan(0);
    expect(screen.getAllByText("runId: run-inventory-exception-tracking").length).toBeGreaterThan(0);
    expect(screen.getByText("evidence: 2")).toBeTruthy();
    expect(screen.getByText("sections: 2")).toBeTruthy();
    expect(screen.queryByText("能力说明")).toBeNull();
    expect(screen.queryByText("技术对接")).toBeNull();
    expect(screen.queryByText("Run Trace")).toBeNull();
  });
});
