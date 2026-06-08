import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { shellThemeTokens } from "../../theme/tokens";
import { PageHeader } from "./PageHeader";

afterEach(cleanup);

describe("PageHeader", () => {
  it("renders a compact page title without the default level-2 heading style", () => {
    render(
      <PageHeader
        meta="Updated a moment ago"
        subtitle="Compact subtitle"
        title="Business health overview"
      />
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Business health overview" })
    ).toBeNull();

    const title = screen.getByText("Business health overview");
    const subtitle = screen.getByText("Compact subtitle");

    expect(title.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizePageTitle}px`);
    expect(title.getAttribute("style")).toContain("font-weight: 600");
    expect(subtitle.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeBody}px`);
  });
});
