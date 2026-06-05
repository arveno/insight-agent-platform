import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { analysisStaticViewModel } from "../../features/agent-analysis/fixtures/analysisStaticViewModel";
import { AppProviders } from "../providers/AppProviders";

import { RunTraceDetailDrawer } from "./RunTraceDetailDrawer";

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

  const originalGetComputedStyle = window.getComputedStyle.bind(window);

  Object.defineProperty(window, "getComputedStyle", {
    configurable: true,
    value: (element: Element) => originalGetComputedStyle(element)
  });
});

describe("RunTraceDetailDrawer", () => {
  it("uses the standard drawer mask and closes through the shared close action", () => {
    const onClose = vi.fn();
    const event = analysisStaticViewModel.sessions[0].runTrace.events[0];

    render(
      <AppProviders>
        <RunTraceDetailDrawer event={event} onClose={onClose} open />
      </AppProviders>
    );

    expect(screen.getByRole("dialog", { name: "Trace Event Detail" })).toBeTruthy();
    expect(document.querySelector(".ant-drawer-mask")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭详情" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
