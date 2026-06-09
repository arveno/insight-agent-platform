import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { ContentSlotLayout } from "./ContentSlotLayout";

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

describe("ContentSlotLayout", () => {
  it("renders plain children by default", () => {
    const { container } = render(
      <ContentSlotLayout>
        <div>Plain child</div>
      </ContentSlotLayout>
    );

    expect(screen.getByText("Plain child")).toBeTruthy();
    expect(container.querySelector(".ant-row")).toBeNull();
    expect(container.querySelector(".ant-space-vertical")).toBeNull();
  });

  it("renders cards layout with responsive Ant Row and Col", () => {
    render(
      <ContentSlotLayout layout="cards">
        <div>Card one</div>
        <div>Card two</div>
      </ContentSlotLayout>
    );

    expect(screen.getByText("Card one").closest(".ant-row")).toBeTruthy();
    expect(screen.getByText("Card one").closest(".ant-col")?.className).toContain("ant-col-xs-24");
    expect(screen.getByText("Card one").closest(".ant-col")?.className).toContain("ant-col-md-12");
    expect(screen.getByText("Card two").closest(".ant-col")?.className).toContain("ant-col-md-12");
  });

  it("renders stack layout with shared vertical spacing", () => {
    const { container } = render(
      <ContentSlotLayout layout="stack">
        <div>Stack item one</div>
        <div>Stack item two</div>
      </ContentSlotLayout>
    );

    expect(screen.getByText("Stack item one")).toBeTruthy();
    expect(screen.getByText("Stack item two")).toBeTruthy();
    expect(container.querySelector(".ant-space-vertical")).not.toBeNull();
  });

  it("supports custom Ant Col responsive spans for cards", () => {
    render(
      <ContentSlotLayout colProps={{ md: 12, xl: 8, xs: 24 }} layout="cards">
        <div>Report card</div>
      </ContentSlotLayout>
    );

    expect(screen.getByText("Report card").closest(".ant-col")?.className).toContain(
      "ant-col-xl-8"
    );
  });
});
