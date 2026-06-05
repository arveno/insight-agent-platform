import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  it("renders the conversation-first static analysis surface", () => {
    render(
      <AppProviders>
        <AnalysisPage />
      </AppProviders>
    );

    expect(screen.getByText("分析输入与上下文")).toBeTruthy();
    expect(screen.getByText("会话与运行过程")).toBeTruthy();
    expect(screen.getByText("证据与 Trace 摘要")).toBeTruthy();
    expect(screen.getByText("结论、追问与反馈")).toBeTruthy();
    expect(screen.getByText("分析会话 / 历史入口")).toBeTruthy();
    expect(screen.getByText("Plan / Step / Tool Calling")).toBeTruthy();
    expect(screen.getByText("Evidence / RAG 来源")).toBeTruthy();
    expect(screen.getByText("Feedback / Bad Case 入口")).toBeTruthy();
  });

  it("switches static sessions and updates local state without navigation", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <AnalysisPage onNavigate={onNavigate} />
      </AppProviders>
    );

    const input = screen.getByRole("textbox", { name: "分析任务输入区" }) as HTMLTextAreaElement;

    expect(input.value).toBe("解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。");

    fireEvent.click(screen.getByRole("button", { name: /毛利率波动复盘/ }));

    expect(screen.getByText(/已切换到「毛利率波动复盘」静态会话/)).toBeTruthy();
    expect(input.value).toBe("复盘本季度毛利率波动，重点解释促销投放和商品结构变化。");
    expect(screen.getByText("当前阶段: 追问进行中")).toBeTruthy();
    expect(screen.getByText(/当前阶段判断倾向于促销档期重叠导致毛利率波动/)).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("keeps submit and feedback actions local to the page state", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <AnalysisPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "发起分析" }));
    expect(screen.getByText(/已记录当前分析问题草稿/)).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "标记问题" }));
    fireEvent.click(screen.getByRole("button", { name: "提交标记" }));

    expect(screen.getByText(/已记录本地反馈选择/)).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
