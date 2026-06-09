import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { TestProviders } from "../../../shared/test/TestProviders";
import type { AnalysisRunEvent } from "../models/analysisRun";
import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";

import { AnalysisInspectorPanel } from "./AnalysisInspectorPanel";

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

describe("AnalysisInspectorPanel", () => {
  it("uses controller-owned run trace selection and drawer state", () => {
    const session = analysisStaticViewModel.sessions[0];
    const selectedRunEvent = session.runEvents[0] as AnalysisRunEvent;
    const onSelectRunEvent = vi.fn();
    const onCloseRunTraceDetail = vi.fn();

    const { rerender } = render(
      <TestProviders>
        <AnalysisInspectorPanel
          activeInspectorPanel="run-trace"
          currentRun={session.currentRun}
          isRunTraceDetailOpen={false}
          onCloseRunTraceDetail={onCloseRunTraceDetail}
          onSelectRunEvent={onSelectRunEvent}
          runEvents={session.runEvents}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEvent.eventId}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    fireEvent.click(screen.getByRole("button", { name: "查看 Trace 事件详情：1. run.created" }));

    expect(onSelectRunEvent).toHaveBeenCalledWith("event-analysis-q2-revenue-gap-user-input");
    expect(screen.queryByRole("dialog", { name: "Trace Event Detail" })).toBeNull();

    rerender(
      <TestProviders>
        <AnalysisInspectorPanel
          activeInspectorPanel="run-trace"
          currentRun={session.currentRun}
          isRunTraceDetailOpen
          onCloseRunTraceDetail={onCloseRunTraceDetail}
          onSelectRunEvent={onSelectRunEvent}
          runEvents={session.runEvents}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEvent.eventId}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByRole("dialog", { name: "Trace Event Detail" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭详情" }));

    expect(onCloseRunTraceDetail).toHaveBeenCalledTimes(1);
  });
});
