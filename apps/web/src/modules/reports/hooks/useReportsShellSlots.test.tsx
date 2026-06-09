import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";

import { useReportsShellSlots } from "./useReportsShellSlots";

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

function ReportsShellSlotHarness() {
  const slots = useReportsShellSlots({
    onBackToRoot: vi.fn(),
    onNavigate: vi.fn()
  });

  return (
    <>
      {slots.leftNav}
      {slots.mainContent}
    </>
  );
}

describe("useReportsShellSlots", () => {
  it("exposes reports-owned left navigation and main content without a fallback inspector", () => {
    render(
      <TestProviders>
        <ReportsShellSlotHarness />
      </TestProviders>
    );

    expect(screen.getByRole("navigation", { name: "Reports navigation" })).toBeTruthy();
    expect(screen.getAllByText("周经营分析报告").length).toBeGreaterThan(0);
    expect(screen.queryByText("能力说明")).toBeNull();
  });
});
