import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";

import { useAnalysisWorkspaceSlots } from "./useAnalysisWorkspaceSlots";

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

function AnalysisWorkspaceSlotHarness() {
  const slots = useAnalysisWorkspaceSlots({
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

describe("useAnalysisWorkspaceSlots", () => {
  it("exposes the module-owned Analysis session nav, workspace content, and inspector slots", () => {
    render(
      <TestProviders>
        <AnalysisWorkspaceSlotHarness />
      </TestProviders>
    );

    expect(screen.getByRole("navigation", { name: "Analysis session navigation" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Analysis conversation" })).toBeTruthy();
    expect(screen.getByLabelText("Analysis inspector")).toBeTruthy();
    expect(screen.getByText("Run Trace")).toBeTruthy();
  });
});
