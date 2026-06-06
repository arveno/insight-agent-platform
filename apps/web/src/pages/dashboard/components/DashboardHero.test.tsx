import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { AppProviders } from "../../../app/providers/AppProviders";
import { dashboardStaticViewModel } from "../../../features/dashboard/fixtures/dashboardStaticViewModel";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { DashboardHero } from "./DashboardHero";

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

describe("DashboardHero", () => {
  it("uses a compact hero title instead of the default level-2 heading scale", () => {
    const selectedTimeRange = dashboardStaticViewModel.timeRange.options.find(
      (option) => option.key === dashboardStaticViewModel.timeRange.selectedKey
    )!;

    render(
      <AppProviders>
        <DashboardHero
          onNavigate={vi.fn()}
          onTimeRangeChange={vi.fn()}
          selectedTimeRange={selectedTimeRange}
          selectedTimeRangeKey={dashboardStaticViewModel.timeRange.selectedKey}
          viewModel={dashboardStaticViewModel}
        />
      </AppProviders>
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "经营状态总览" })
    ).toBeNull();

    const eyebrow = screen.getByText("经营工作台");
    const title = screen.getByText("经营状态总览");

    expect(eyebrow.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeMeta}px`);
    expect(title.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeHeroTitle}px`
    );
    expect(title.getAttribute("style")).toContain("font-weight: 600");
  });
});
