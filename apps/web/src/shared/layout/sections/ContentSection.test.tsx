import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { shellThemeTokens } from "../../theme/tokens";
import { ContentSection } from "./ContentSection";

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

describe("ContentSection", () => {
  it("renders compact eyebrow and section title styles instead of the default heading block", () => {
    render(
      <ContentSection eyebrow="Overview" title="Operating health">
        <div>content</div>
      </ContentSection>
    );

    expect(screen.queryByRole("heading", { level: 4, name: "Operating health" })).toBeNull();

    const eyebrow = screen.getByText("Overview");
    const title = screen.getByText("Operating health");

    expect(eyebrow.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeMeta}px`
    );
    expect(title.getAttribute("style")).toContain(
      `font-size: ${shellThemeTokens.fontSizeSectionTitle}px`
    );
    expect(title.getAttribute("style")).toContain("font-weight: 600");
  });

  it("renders extra content in the header without turning the title into a suffix slot", () => {
    render(
      <ContentSection
        eyebrow="Overview"
        extra={<button type="button">Open metrics</button>}
        title="Operating health"
      >
        <div>first card</div>
        <div>second card</div>
      </ContentSection>
    );

    expect(screen.getByRole("button", { name: "Open metrics" })).toBeTruthy();
    expect(screen.getByText("first card")).toBeTruthy();
    expect(screen.getByText("second card")).toBeTruthy();
    expect(screen.getByText("first card").closest(".ant-col")).toBeNull();
  });

  it("uses Ant Row and Col for cards layout with default responsive spans", () => {
    render(
      <ContentSection contentLayout="cards" eyebrow="Overview" title="Operating health">
        <div>first card</div>
        <div>second card</div>
      </ContentSection>
    );

    expect(screen.getByText("first card").closest(".ant-row")).toBeTruthy();
    expect(screen.getByText("first card").closest(".ant-col")?.className).toContain("ant-col-xs-24");
    expect(screen.getByText("first card").closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(screen.getByText("second card").closest(".ant-col")?.className).toContain(
      "ant-col-md-12"
    );
  });

  it("allows cards layout callers to declare custom Ant Col responsive spans", () => {
    render(
      <ContentSection
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        eyebrow="Overview"
        title="Operating health"
      >
        <div>report card</div>
      </ContentSection>
    );

    expect(screen.getByText("report card").closest(".ant-col")?.className).toContain("ant-col-xl-8");
  });

  it("uses a vertical stack layout when contentLayout is stack", () => {
    render(
      <ContentSection contentLayout="stack" eyebrow="Overview" title="Operating health">
        <div>first item</div>
        <div>second item</div>
      </ContentSection>
    );

    expect(screen.getByText("first item").closest(".ant-space-item")).toBeTruthy();
    expect(screen.getByText("first item").closest(".ant-col")).toBeNull();
  });
});
