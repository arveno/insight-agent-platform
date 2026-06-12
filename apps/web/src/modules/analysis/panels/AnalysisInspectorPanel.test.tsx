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
  it("renders inspector home entries and drills down/back inside the inspector stack", () => {
    const onBackInspector = vi.fn();
    const onNavigateInspectorRoute = vi.fn();

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          activeInspectorRoute={{ key: "home" }}
          canGoBackInInspector={false}
          decisions={[]}
          decisionsState="empty"
          draftContext={{
            chips: ["Northstar Retail China", "Last 7 days"],
            sourceId: "report-weekly-operations-review",
            sourceTitle: "周经营分析报告",
            sourceType: "report",
            suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
            summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。"
          }}
          messageStreamState="empty"
          modelDetails={[]}
          modelDetailsState="empty"
          onBackInspector={onBackInspector}
          onNavigateInspectorRoute={onNavigateInspectorRoute}
          onSelectRunEvent={() => undefined}
          reportPreviewState="empty"
          runEvents={[]}
          selectedRunEventId={null}
          sourceEvidence={[]}
          sourceEvidenceState="empty"
          toolDetails={[]}
          toolDetailsState="empty"
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByText("Inspector Home")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Context Origin" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Source Ref" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Open Context Origin" }));

    expect(onNavigateInspectorRoute).toHaveBeenCalledWith({ key: "context-origin" });
    expect(onBackInspector).not.toHaveBeenCalled();
  });

  it("renders run-event detail inside the inspector instead of opening a drawer", () => {
    const session = analysisStaticViewModel.sessions[0];
    const selectedRunEvent = session.runEvents[1] as AnalysisRunEvent;

    render(
      <TestProviders>
        <AnalysisInspectorPanel
          activeInspectorRoute={{
            eventId: selectedRunEvent.eventId,
            key: "run-event"
          }}
          canGoBackInInspector
          currentRun={session.currentRun}
          decisions={session.decisions}
          decisionsState={session.decisionsState}
          messageStream={session.messageStream}
          messageStreamState={session.messageStreamState}
          modelDetails={session.modelDetails}
          modelDetailsState={session.modelDetailsState}
          onBackInspector={() => undefined}
          onNavigateInspectorRoute={() => undefined}
          onSelectRunEvent={() => undefined}
          reportPreview={session.reportPreview}
          reportPreviewState={session.reportPreviewState}
          runEvents={session.runEvents}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEvent.eventId}
          sourceEvidence={session.sourceEvidence}
          sourceEvidenceState={session.sourceEvidenceState}
          toolDetails={session.toolDetails}
          toolDetailsState={session.toolDetailsState}
          workspaceName="Northstar Retail China"
        />
      </TestProviders>
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeTruthy();
    expect(screen.getByText("Run Event")).toBeTruthy();
    expect(screen.getByText(selectedRunEvent.title)).toBeTruthy();
    expect(screen.getAllByText(selectedRunEvent.summary).length).toBeGreaterThan(0);
    expect(screen.queryByRole("dialog", { name: "Trace Event Detail" })).toBeNull();
  });
});
