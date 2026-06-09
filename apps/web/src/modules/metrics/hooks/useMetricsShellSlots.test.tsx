import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";

import { useMetricsShellSlots } from "./useMetricsShellSlots";

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

function MetricsShellSlotHarness() {
  const slots = useMetricsShellSlots({
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

describe("useMetricsShellSlots", () => {
  it("exposes metrics navigation and main content without a default inspector", () => {
    render(
      <TestProviders>
        <MetricsShellSlotHarness />
      </TestProviders>
    );

    expect(screen.getByRole("navigation", { name: "Metrics navigation" })).toBeTruthy();
    expect(screen.getByText("指标总览")).toBeTruthy();
    expect(screen.queryByText("能力说明")).toBeNull();
  });
});
