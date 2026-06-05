import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../app/providers/AppProviders";
import { AnalysisPage } from "./Page";

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

describe("AnalysisPage", () => {
  it("renders a pure conversation shell without page header actions", () => {
    render(
      <AppProviders>
        <AnalysisPage />
      </AppProviders>
    );

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(screen.queryByRole("heading", { name: "分析" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看报告" })).toBeNull();
    expect(screen.queryByRole("button", { name: "查看观测" })).toBeNull();
    expect(
      within(main).getAllByText("来自 Dashboard / Revenue · 收入增速异常 · Last 30 days")
    ).toHaveLength(2);
    expect(main.getAttribute("style")).toContain("height: 100%");
    const messageList = within(main).getByRole("log", { name: "Analysis message list" });
    const composer = within(main).getByRole("group", { name: "Analysis composer" });
    expect(messageList).toBeTruthy();
    expect(messageList.getAttribute("style")).toContain("overflow-y: auto");
    expect(composer).toBeTruthy();
    expect(composer.getAttribute("style")).toContain("flex: 0 0 auto");
    expect(within(main).queryByText("当前展示静态 Analysis 会话。页面交互只更新 UI State，不创建真实 Agent Run。")).toBeNull();
    expect(within(main).queryByText("继续追问会沿用当前静态会话上下文，但不会发起真实多轮请求。")).toBeNull();
    expect(within(main).getByText("System")).toBeTruthy();
    expect(within(main).getByText("User")).toBeTruthy();
    expect(within(main).getByText("Assistant")).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "后续追问" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "打开聊天工具入口" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "选择模型" })).toBeTruthy();
    expect(within(main).getByRole("button", { name: "发送消息" })).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / Bad Case 入口")).toBeNull();
    expect(within(main).queryByText("报告生成入口")).toBeNull();
  });

  it("keeps composer actions local to the page state", async () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <AnalysisPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "选择模型" }));
    fireEvent.click(await screen.findByText("Reasoning"));
    expect(screen.getByRole("button", { name: "选择模型" }).textContent).toContain("Reasoning");

    fireEvent.change(screen.getByRole("textbox", { name: "后续追问" }), {
      target: { value: "继续追问华东渠道和最近 7 天的差异。" }
    });
    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));

    expect(screen.getByRole("button", { name: "停止生成" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "停止生成" }));

    expect(screen.getByRole("button", { name: "发送消息" })).toBeTruthy();
    expect(screen.getByText(/已停止本地模拟生成/)).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
