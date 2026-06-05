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
    expect(within(main).getByText("System")).toBeTruthy();
    expect(within(main).getByText("User")).toBeTruthy();
    expect(within(main).getByText("Assistant")).toBeTruthy();
    expect(within(main).getByRole("textbox", { name: "后续追问" })).toBeTruthy();
    expect(within(main).queryByText("Plan / Step / Tool Calling")).toBeNull();
    expect(within(main).queryByText("Feedback / Bad Case 入口")).toBeNull();
    expect(within(main).queryByText("报告生成入口")).toBeNull();
  });

  it("keeps follow-up submit local to the page state", () => {
    const onNavigate = vi.fn();

    render(
      <AppProviders>
        <AnalysisPage onNavigate={onNavigate} />
      </AppProviders>
    );

    fireEvent.change(screen.getByRole("textbox", { name: "后续追问" }), {
      target: { value: "继续追问华东渠道和最近 7 天的差异。" }
    });
    fireEvent.click(screen.getByRole("button", { name: "继续追问" }));

    expect(screen.getByText(/已记录当前追问草稿/)).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
