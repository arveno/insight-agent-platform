import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { TestProviders } from "../../test/TestProviders";
import { PageIntro } from "./PageIntro";

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

describe("PageIntro", () => {
  it("renders eyebrow, title, description, supporting text, and extra content", () => {
    render(
      <TestProviders>
        <PageIntro
          description="Current workspace summary"
          eyebrow="Workspace"
          extra={<button type="button">Open actions</button>}
          supportingText="Last updated: a moment ago"
          title="Business health overview"
        />
      </TestProviders>
    );

    expect(screen.getByText("Workspace")).toBeTruthy();
    expect(screen.getByText("Business health overview")).toBeTruthy();
    expect(screen.getByText("Current workspace summary")).toBeTruthy();
    expect(screen.getByText("Last updated: a moment ago")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open actions" })).toBeTruthy();
  });

  it("renders plain content by default without wrapping children in card rows", () => {
    const { container } = render(
      <TestProviders>
        <PageIntro title="Plain intro">
          <div>Plain child content</div>
        </PageIntro>
      </TestProviders>
    );

    expect(screen.getByText("Plain child content")).toBeTruthy();
    expect(container.querySelector(".ant-row")).toBeNull();
  });

  it("renders card children with Ant Row and Col when contentLayout is cards", () => {
    const { container } = render(
      <TestProviders>
        <PageIntro contentLayout="cards" title="Cards intro">
          <div>Card one</div>
          <div>Card two</div>
        </PageIntro>
      </TestProviders>
    );

    expect(screen.getByText("Card one")).toBeTruthy();
    expect(screen.getByText("Card two")).toBeTruthy();
    expect(container.querySelector(".ant-row")).not.toBeNull();
  });

  it("renders stack children inside the shared vertical space layout", () => {
    const { container } = render(
      <TestProviders>
        <PageIntro contentLayout="stack" title="Stack intro">
          <div>Stack item one</div>
          <div>Stack item two</div>
        </PageIntro>
      </TestProviders>
    );

    expect(screen.getByText("Stack item one")).toBeTruthy();
    expect(screen.getByText("Stack item two")).toBeTruthy();
    expect(container.querySelector(".ant-space-vertical")).not.toBeNull();
  });
});
