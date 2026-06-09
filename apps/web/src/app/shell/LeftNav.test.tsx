import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../shared/test/TestProviders";

import { LeftNav } from "./LeftNav";

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

describe("LeftNav", () => {
  it("renders entry arrows only from navigation item input instead of hardcoded route capabilities", () => {
    render(
      <TestProviders>
        <LeftNav
          groups={[
            {
              items: [
                {
                  key: "dashboard",
                  label: "Dashboard"
                },
                {
                  key: "analysis",
                  label: "Analysis",
                  showEntryArrow: true
                }
              ],
              key: "primary",
              label: "Primary"
            }
          ]}
          onSelect={vi.fn()}
          selectedKey="dashboard"
        />
      </TestProviders>
    );

    const navigation = screen.getByRole("navigation", { name: "Shell navigation" });
    const dashboardButton = within(navigation).getByRole("button", { name: "Dashboard" });
    const analysisButton = within(navigation).getByRole("button", { name: "Analysis" });

    expect(dashboardButton.querySelector(".anticon-right")).toBeNull();
    expect(analysisButton.querySelector(".anticon-right")).toBeTruthy();
  });
});
