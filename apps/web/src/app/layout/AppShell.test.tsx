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
    expect(within(analysisNavigation).getByRole("button", { name: /新建分析/ })).toBeTruthy();
    expect(within(analysisNavigation).getByText("Q2 收入异常追问")).toBeTruthy();
    expect(within(analysisNavigation).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(analysisNavigation).getByText("库存异常定位")).toBeTruthy();

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

    expect(within(main).getByText("毛利率波动复盘")).toBeTruthy();
    expect(within(main).getByText(/当前上下文：Northstar Retail China/)).toBeTruthy();
    expect(
      within(main).getByText("复盘本季度毛利率波动，重点解释促销投放和商品结构变化。")
    ).toBeTruthy();
    expect(within(main).getByText(/当前阶段判断倾向于促销档期重叠导致毛利率波动/)).toBeTruthy();
    expect(within(main).getByRole("group", { name: "Analysis composer" })).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "后续追问" })).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / 采纳入口")).toBeNull();

    expect(screen.getByText("Run Trace")).toBeTruthy();
    expect(screen.getByText("1. 接收用户问题")).toBeTruthy();
    expect(screen.getByText("6. 召回 Evidence / RAG 来源")).toBeTruthy();
    expect(screen.getByText("8. 等待用户追问 / 反馈")).toBeTruthy();
    expect(screen.queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(screen.queryByText("Feedback / 采纳入口")).toBeNull();
    expect(screen.queryByText("报告补充入口")).toBeNull();
    expect(screen.getByText(/技术对接：LangGraph \/ LangChain \/ LlamaIndex \/ Milvus。/)).toBeTruthy();
  });
});
