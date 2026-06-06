import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AppProviders } from "../../../app/providers/AppProviders";
import { shellThemeTokens } from "../../theme";
import { ShellNavListItem } from "./ShellNavListItem";

afterEach(cleanup);

describe("ShellNavListItem", () => {
  it("keeps navigation label density stable without using bold selection", () => {
    render(
      <AppProviders>
        <>
          <ShellNavListItem label="Dashboard" />
          <ShellNavListItem label="Analysis" selected />
        </>
      </AppProviders>
    );

    const dashboard = screen.getByText("Dashboard");
    const analysis = screen.getByText("Analysis");

    expect(dashboard.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeNavItem}px`);
    expect(dashboard.getAttribute("style")).toContain(
      `font-weight: ${shellThemeTokens.fontWeightMedium}`
    );
    expect(analysis.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeNavItem}px`);
    expect(analysis.getAttribute("style")).toContain(
      `font-weight: ${shellThemeTokens.fontWeightMedium}`
    );
  });
});
