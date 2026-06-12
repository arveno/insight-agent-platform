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
          decisions={session.decisions}
          decisionsState={session.decisionsState}
          isRunTraceDetailOpen={false}
          messageStream={session.messageStream}
          messageStreamState={session.messageStreamState}
          modelDetails={session.modelDetails}
          modelDetailsState={session.modelDetailsState}
          onCloseRunTraceDetail={onCloseRunTraceDetail}
          onOpenInspectorPanel={() => undefined}
          onSelectRunEvent={onSelectRunEvent}
          reportPreview={session.reportPreview}
          reportPreviewState={session.reportPreviewState}
          runEvents={session.runEvents}
          sourceEvidenceState={session.sourceEvidenceState}
          sourceEvidence={session.sourceEvidence}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEvent.eventId}
          toolDetails={session.toolDetails}
          toolDetailsState={session.toolDetailsState}
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
          decisions={session.decisions}
          decisionsState={session.decisionsState}
          isRunTraceDetailOpen
          messageStream={session.messageStream}
          messageStreamState={session.messageStreamState}
          modelDetails={session.modelDetails}
          modelDetailsState={session.modelDetailsState}
          onCloseRunTraceDetail={onCloseRunTraceDetail}
          onOpenInspectorPanel={() => undefined}
          onSelectRunEvent={onSelectRunEvent}
          reportPreview={session.reportPreview}
          reportPreviewState={session.reportPreviewState}
          runEvents={session.runEvents}
          sourceEvidenceState={session.sourceEvidenceState}
          sourceEvidence={session.sourceEvidence}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEvent.eventId}
          toolDetails={session.toolDetails}
          toolDetailsState={session.toolDetailsState}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByRole("dialog", { name: "Trace Event Detail" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "关闭详情" }));

    expect(onCloseRunTraceDetail).toHaveBeenCalledTimes(1);
  });

  it("renders independent report and decision content instead of hiding them in assistant messages", () => {
    const session = analysisStaticViewModel.sessions[0];

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          activeInspectorPanel="report-preview"
          currentRun={session.currentRun}
          decisions={session.decisions}
          decisionsState={session.decisionsState}
          isRunTraceDetailOpen={false}
          messageStream={session.messageStream}
          messageStreamState={session.messageStreamState}
          modelDetails={session.modelDetails}
          modelDetailsState={session.modelDetailsState}
          onCloseRunTraceDetail={() => undefined}
          onOpenInspectorPanel={() => undefined}
          onSelectRunEvent={() => undefined}
          reportPreview={session.reportPreview}
          reportPreviewState={session.reportPreviewState}
          runEvents={session.runEvents}
          sourceEvidenceState={session.sourceEvidenceState}
          sourceEvidence={session.sourceEvidence}
          selectedRunEvent={session.runEvents[0]}
          selectedRunEventId={session.runEvents[0]?.eventId ?? null}
          toolDetails={session.toolDetails}
          toolDetailsState={session.toolDetailsState}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getAllByText("Report Preview").length).toBeGreaterThan(0);
    expect(screen.getByText(session.reportPreview?.title ?? "")).toBeTruthy();
    expect(screen.getByText("Decision")).toBeTruthy();
    expect(screen.getByText(session.decisions[0]?.title ?? "")).toBeTruthy();
  });
});
