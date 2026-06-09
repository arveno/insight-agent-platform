import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { shellThemeTokens } from "../../theme/tokens";
import { ResponsivePageShell } from "./ResponsivePageShell";

afterEach(cleanup);

describe("ResponsivePageShell", () => {
  it("renders children inside the page padding container", () => {
    render(
      <ResponsivePageShell>
        <div>Page body</div>
      </ResponsivePageShell>
    );

    const pageShell = screen.getByRole("main");

    expect(pageShell).toBeTruthy();
    expect(screen.getByText("Page body")).toBeTruthy();
    expect(pageShell.getAttribute("style")).toContain(`padding: ${shellThemeTokens.pagePadding}px`);
    expect(pageShell.getAttribute("style")).toContain("width: 100%");
  });
});
