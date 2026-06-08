import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { shellThemeTokens } from "../../theme/tokens";
import { AppSection } from "./AppSection";

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

describe("AppSection", () => {
  it("renders compact eyebrow and section title styles instead of the default heading block", () => {
    render(
      <AppSection eyebrow="Overview" title="Operating health">
        <div>content</div>
      </AppSection>
    );

    expect(screen.queryByRole("heading", { level: 4, name: "Operating health" })).toBeNull();

    const eyebrow = screen.getByText("Overview");
    const title = screen.getByText("Operating health");

    expect(eyebrow.getAttribute("style")).toContain(`font-size: ${shellThemeTokens.fontSizeMeta}px`);
    expect(title.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeSectionTitle}px`
    );
    expect(title.getAttribute("style")).toContain("font-weight: 600");
  });
});
