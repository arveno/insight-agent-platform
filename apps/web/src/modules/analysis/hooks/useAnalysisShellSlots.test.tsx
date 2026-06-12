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
    onBackToRoot: vi.fn(),
    onNavigate: vi.fn(),
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
    expect(screen.getByText("新聊天草稿")).toBeTruthy();
    expect(screen.getByLabelText("Analysis inspector")).toBeTruthy();
    expect(screen.getAllByText("Draft Context").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("当前没有一次性 DraftContextPack。刷新页面后也不会恢复之前的前端草稿上下文。")).toBeTruthy();
  });
});
