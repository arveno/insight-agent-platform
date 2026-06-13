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
    expect(screen.getByText("新聊天草稿")).toBeTruthy();
    expect(screen.getByText("Analysis inspector")).toBeTruthy();
    expect(screen.getByText("Context Draft")).toBeTruthy();
    expect(
      screen.getByText("当前没有一次性上下文。直接发送前不会创建 Conversation、AnalysisTask 或 AnalysisRun。")
    ).toBeTruthy();
  });
});
