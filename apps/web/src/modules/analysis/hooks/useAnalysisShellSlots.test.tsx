import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";

import { useAnalysisShellSlots } from "./useAnalysisShellSlots";

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

  const originalGetComputedStyle = window.getComputedStyle.bind(window);

  Object.defineProperty(window, "getComputedStyle", {
    configurable: true,
    value: (element: Element) => originalGetComputedStyle(element)
  });
});

function AnalysisShellSlotHarness() {
  const slots = useAnalysisShellSlots({
    businessDomainId: "business-domain-revenue-quality",
    onBackToRoot: vi.fn(),
    onNavigate: vi.fn(),
    userId: "user-zoe",
    workspaceId: "workspace-northstar-retail-china",
    workspaceName: "Northstar Retail China"
  });

  return (
    <>
      {slots.leftNav}
      {slots.mainContent}
      {slots.rightAssistPanel}
    </>
  );
}

describe("useAnalysisShellSlots", () => {
  it("exposes the module-owned Analysis session nav, draft workspace content, and inspector slots", () => {
    render(
      <TestProviders>
        <AnalysisShellSlotHarness />
      </TestProviders>
    );

    expect(screen.getByRole("navigation", { name: "Analysis session navigation" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Analysis conversation" })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "输入你想分析的问题" })).toBeTruthy();
    expect(screen.getAllByText("分析详情").length).toBeGreaterThan(0);
    expect(screen.getByText("右侧会显示当前草稿将要附带的分析详情。")).toBeTruthy();
    expect(screen.getByText("输入问题开始分析")).toBeTruthy();
    expect(screen.queryByText("当前没有一次性上下文")).toBeNull();
  });
});
