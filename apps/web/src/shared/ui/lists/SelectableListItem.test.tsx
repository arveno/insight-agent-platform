import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import { shellThemeTokens } from "../../theme/tokens";
import { SelectableListItem } from "./SelectableListItem";

afterEach(cleanup);

describe("SelectableListItem", () => {
  it("keeps navigation label density stable without using bold selection", () => {
    render(
      <TestProviders>
        <>
          <SelectableListItem label="Dashboard" />
          <SelectableListItem label="Analysis" selected />
        </>
      </TestProviders>
    );

    const dashboard = screen.getByText("Dashboard");
    const analysis = screen.getByText("Analysis");

    expect(dashboard.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeNavItem}px`
    );
    expect(dashboard.getAttribute("style")).toContain(
      `font-weight: ${shellThemeTokens.fontWeightMedium}`
    );
    expect(analysis.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeNavItem}px`
    );
    expect(analysis.getAttribute("style")).toContain(
      `font-weight: ${shellThemeTokens.fontWeightMedium}`
    );
  });
});
