import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAnalysisWorkspaceController } from "./useAnalysisWorkspaceController";

describe("useAnalysisWorkspaceController", () => {
  it("centralizes session, message, run, and inspector selection state", () => {
    const { result } = renderHook(() => useAnalysisWorkspaceController());

    expect(result.current.sessions).toHaveLength(3);
    expect(result.current.visibleSessions).toHaveLength(3);
    expect(result.current.selectedSessionId).toBe("session-revenue-gap-q2");
    expect(result.current.selectedSession.sessionId).toBe("session-revenue-gap-q2");
    expect(result.current.sessionSearchQuery).toBe("");
    expect(result.current.messages.map((message) => message.role)).toEqual([
      "system",
      "user",
      "assistant"
    ]);
    expect(result.current.messages[0]?.sessionId).toBe("session-revenue-gap-q2");
    expect(result.current.messages[2]?.runId).toBe("analysis-q2-revenue-gap");
    expect(result.current.currentRun.runId).toBe("analysis-q2-revenue-gap");
    expect(result.current.currentRun.status).toBe("completed");
    expect(result.current.runEvents).toHaveLength(8);
    expect(result.current.selectedRunEventId).toBe("event-analysis-q2-revenue-gap-user-input");
    expect(result.current.selectedRunEvent?.eventId).toBe(
      "event-analysis-q2-revenue-gap-user-input"
    );
    expect(result.current.isRunTraceDetailOpen).toBe(false);
    expect(result.current.activeInspectorPanel).toBe("run-trace");
  });

  it("owns search, session switching, composer, and run trace detail state", () => {
    const { result } = renderHook(() => useAnalysisWorkspaceController());

    act(() => {
      result.current.onSessionSearchChange("毛利率");
    });

    expect(result.current.sessionSearchQuery).toBe("毛利率");
    expect(result.current.visibleSessions).toHaveLength(1);
    expect(result.current.visibleSessions[0]?.sessionId).toBe("session-margin-follow-up");

    act(() => {
      result.current.onSelectSession("session-margin-follow-up");
    });

    expect(result.current.selectedSessionId).toBe("session-margin-follow-up");
    expect(result.current.messages[0]?.sessionId).toBe("session-margin-follow-up");
    expect(result.current.currentRun.runId).toBe("analysis-margin-follow-up");
    expect(result.current.currentRun.status).toBe("running");
    expect(result.current.selectedRunEventId).toBe("event-analysis-margin-follow-up-user-input");
    expect(result.current.isRunTraceDetailOpen).toBe(false);

    act(() => {
      result.current.onSelectRunEvent("event-analysis-margin-follow-up-summary-generated");
    });

    expect(result.current.selectedRunEventId).toBe(
      "event-analysis-margin-follow-up-summary-generated"
    );
    expect(result.current.selectedRunEvent?.eventId).toBe(
      "event-analysis-margin-follow-up-summary-generated"
    );
    expect(result.current.isRunTraceDetailOpen).toBe(true);

    act(() => {
      result.current.onCloseRunTraceDetail();
      result.current.onComposerModeChange("analysis");
      result.current.onComposerDraftChange("继续分析毛利率波动。");
      result.current.onSubmitComposer();
    });

    expect(result.current.isRunTraceDetailOpen).toBe(false);
    expect(result.current.composerMode).toBe("analysis");
    expect(result.current.composerDraft).toBe("继续分析毛利率波动。");
    expect(result.current.composerState).toBe("running");
    expect(result.current.messages).toHaveLength(3);
  });
});
