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
  it("renders conversation-first main content and keeps inspector-only panels out of main", () => {
    render(
      <AppProviders>
        <AnalysisPage />
      </AppProviders>
    );

    const main = screen.getByRole("region", { name: "Analysis conversation" });

    expect(within(main).getByText("Conversation-first")).toBeTruthy();
    expect(within(main).getByText("当前分析问题")).toBeTruthy();
    expect(within(main).getByText("分析结果摘要")).toBeTruthy();
    expect(within(main).getByText("后续追问")).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Evidence / RAG 来源")).toBeNull();
    expect(within(main).queryByText("Feedback / Bad Case 入口")).toBeNull();
  });

  it("keeps analysis submit and follow-up submit local to the page state", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <AnalysisPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "分析任务输入区" }), {
      target: { value: "请重新整理收入异常的归因和建议。" }
    });
    fireEvent.click(screen.getByRole("button", { name: "发起分析" }));

    expect(screen.getByText(/已记录当前分析问题草稿/)).toBeTruthy();

    fireEvent.change(screen.getByRole("textbox", { name: "后续追问" }), {
      target: { value: "继续追问华东渠道和最近 7 天的差异。" }
    });
    fireEvent.click(screen.getByRole("button", { name: "继续追问" }));

    expect(screen.getByText(/已记录当前追问草稿/)).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
