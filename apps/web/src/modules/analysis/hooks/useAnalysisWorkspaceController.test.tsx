import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  Conversation,
  Decision,
  Message,
  MessageStream,
  ModelCall,
  Report,
  RunEvent,
  SourceEvidence,
  ToolCall
} from "@insight-agent/contracts/generated/typescript";
import goldenPathExample from "../../../../../../packages/contracts/examples/analysis-runtime/golden-path.json";

import { mapAnalysisRuntimeContractsToWorkspaceViewModel } from "../mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel";
import {
  useAnalysisWorkspaceController,
  type UseAnalysisWorkspaceControllerOptions
} from "./useAnalysisWorkspaceController";

type GoldenPathExample = {
  analysisRun: AnalysisRun;
  conversation: Conversation;
  decisions: Decision[];
  messageStream: MessageStream[];
  messages: Message[];
  modelCalls: ModelCall[];
  reports: Report[];
  runEvents: RunEvent[];
  sourceEvidence: SourceEvidence[];
  toolCalls: ToolCall[];
};

describe("useAnalysisWorkspaceController", () => {
  it("enters draft mode when no runtime bootstrap id is available", async () => {
    const loader = vi.fn();
    const { result } = renderHook(() =>
      useAnalysisWorkspaceController({
        bootstrap: {},
        loader
      })
    );

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    expect(loader).not.toHaveBeenCalled();
    expect(result.current.sessions).toHaveLength(0);
    expect(result.current.visibleSessions).toHaveLength(0);
    expect(result.current.selectedConversationId).toBeNull();
    expect(result.current.selectedSession).toBeUndefined();
    expect(result.current.messages).toEqual([]);
    expect(result.current.runEvents).toEqual([]);
    expect(result.current.currentRun).toBeUndefined();
    expect(result.current.activeInspectorRoute.key).toBe("home");
    expect(result.current.canGoBackInInspector).toBe(false);
    expect(result.current.composerMode).toBe("analysis");
  });

  it("hydrates DraftContextPack into the editable draft and clears it on new chat reset", async () => {
    const loader = vi.fn();
    const { result } = renderHook(() =>
      useAnalysisWorkspaceController({
        bootstrap: {},
        draftContext: {
          chips: ["Northstar Retail China", "Last 7 days"],
          sourceId: "report-weekly-operations-review",
          sourceTitle: "周经营分析报告",
          sourceType: "report",
          suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
          summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。"
        },
        loader
      })
    );

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    expect(result.current.draftContext?.sourceId).toBe("report-weekly-operations-review");
    expect(result.current.composerDraft).toBe("请继续分析华东收入增速放缓的主要原因。");
    expect(result.current.activeInspectorRoute.key).toBe("context-origin");

    act(() => {
      result.current.onResetForNewAnalysis();
    });

    expect(result.current.workspaceState.kind).toBe("draft");
    expect(result.current.draftContext).toBeUndefined();
    expect(result.current.composerDraft).toBe("");
    expect(result.current.activeInspectorRoute.key).toBe("home");
  });

  it("submits a draft through the canonical submit endpoint and loads the created runtime workspace", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const viewModel = mapAnalysisRuntimeContractsToWorkspaceViewModel({
      conversation: goldenPath.conversation,
      currentRun: goldenPath.analysisRun,
      decisions: goldenPath.decisions,
      messageStream: goldenPath.messageStream,
      messages: goldenPath.messages,
      modelCalls: goldenPath.modelCalls,
      reports: goldenPath.reports,
      runEvents: goldenPath.runEvents,
      sourceEvidence: goldenPath.sourceEvidence,
      toolCalls: goldenPath.toolCalls
    });
    const loader = vi.fn().mockResolvedValue({
      kind: "ready",
      viewModel
    });
    const submitter = vi.fn().mockResolvedValue({
      analysisRun: { runId: goldenPath.analysisRun.runId },
      conversation: { conversationId: goldenPath.conversation.conversationId }
    });
    const options: UseAnalysisWorkspaceControllerOptions = {
      bootstrap: {},
      draftContext: {
        chips: ["Northstar Retail China", "Last 7 days", "3 条证据"],
        sourceId: "report-weekly-operations-review",
        sourceTitle: "周经营分析报告",
        sourceType: "report",
        suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
        summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。"
      },
      loader,
      submitIdentity: {
        businessDomainId: "business-domain-revenue-quality",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      },
      submitter
    };
    const { result } = renderHook(() => useAnalysisWorkspaceController(options));

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    act(() => {
      result.current.onSubmitComposer();
    });

    await waitFor(() => {
      expect(submitter).toHaveBeenCalledWith({
        businessDomainId: "business-domain-revenue-quality",
        conversationId: undefined,
        draftContext: {
          chips: ["Northstar Retail China", "Last 7 days", "3 条证据"],
          sourceId: "report-weekly-operations-review",
          sourceTitle: "周经营分析报告",
          sourceType: "report",
          suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
          summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。"
        },
        question: "请继续分析华东收入增速放缓的主要原因。",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      });
    });

    await waitFor(() => {
      expect(loader).toHaveBeenCalledWith({
        conversationId: goldenPath.conversation.conversationId,
        runId: goldenPath.analysisRun.runId
      });
    });

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("ready");
    });

    expect(result.current.selectedConversationId).toBe(goldenPath.conversation.conversationId);
    expect(result.current.messages).toEqual(viewModel.sessions[0]?.messages ?? []);
    expect(result.current.currentRun?.runId).toBe(goldenPath.analysisRun.runId);
    expect(result.current.activeInspectorRoute.key).toBe("run-trace");
    expect(result.current.interactionMessage).toBe("");
  });

  it("keeps draft mode and shows an honest error when canonical submit fails", async () => {
    const loader = vi.fn();
    const submitter = vi
      .fn()
      .mockRejectedValue(new Error("Conversation.workspaceId does not match request.workspaceId"));
    const options: UseAnalysisWorkspaceControllerOptions = {
      bootstrap: {},
      loader,
      submitIdentity: {
        businessDomainId: "business-domain-revenue-quality",
        userId: "user-zoe",
        workspaceId: "workspace-northstar-retail-china"
      },
      submitter
    };
    const { result } = renderHook(() => useAnalysisWorkspaceController(options));

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    act(() => {
      result.current.onComposerDraftChange("解释华东区域收入增速放缓的主要原因。");
    });

    act(() => {
      result.current.onSubmitComposer();
    });

    await waitFor(() => {
      expect(submitter).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    expect(loader).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
    expect(result.current.currentRun).toBeUndefined();
    expect(result.current.interactionMessage).toContain(
      "Conversation.workspaceId does not match request.workspaceId"
    );
  });

  it("loads real runtime data through the controller-owned loader and centralizes selection state", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const viewModel = mapAnalysisRuntimeContractsToWorkspaceViewModel({
      conversation: goldenPath.conversation,
      currentRun: goldenPath.analysisRun,
      decisions: goldenPath.decisions,
      messageStream: goldenPath.messageStream,
      messages: goldenPath.messages,
      modelCalls: goldenPath.modelCalls,
      reports: goldenPath.reports,
      runEvents: goldenPath.runEvents,
      sourceEvidence: goldenPath.sourceEvidence,
      toolCalls: goldenPath.toolCalls
    });
    const loader = vi.fn().mockResolvedValue({
      kind: "ready",
      viewModel
    });
    const { result } = renderHook(() =>
      useAnalysisWorkspaceController({
        bootstrap: {
          conversationId: goldenPath.conversation.conversationId,
          runId: goldenPath.analysisRun.runId
        },
        loader
      })
    );

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("ready");
    });

    expect(loader).toHaveBeenCalledWith({
      conversationId: goldenPath.conversation.conversationId,
      runId: goldenPath.analysisRun.runId
    });
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.visibleSessions).toHaveLength(1);
    expect(result.current.selectedConversationId).toBe(goldenPath.conversation.conversationId);
    expect(result.current.selectedSession?.conversationId).toBe(
      goldenPath.conversation.conversationId
    );
    expect(result.current.sessionSearchQuery).toBe("");
    expect(result.current.messages.map((message) => message.role)).toEqual([
      "system",
      "user",
      "assistant"
    ]);
    expect(result.current.messages[0]?.conversationId).toBe(goldenPath.conversation.conversationId);
    expect(result.current.messages[2]?.runId).toBe(goldenPath.analysisRun.runId);
    expect(result.current.currentRun?.runId).toBe(goldenPath.analysisRun.runId);
    expect(result.current.currentRun?.status).toBe("completed");
    expect(result.current.runEvents).toHaveLength(goldenPath.runEvents.length);
    expect(result.current.selectedRunEventId).toBe(goldenPath.runEvents[0]?.eventId ?? null);
    expect(result.current.selectedRunEvent?.eventId).toBe(goldenPath.runEvents[0]?.eventId);
    expect(result.current.activeInspectorRoute.key).toBe("run-trace");
    expect(result.current.canGoBackInInspector).toBe(false);

    act(() => {
      result.current.onSelectRunEvent(goldenPath.runEvents[1]!.eventId);
    });

    expect(result.current.selectedRunEventId).toBe(goldenPath.runEvents[1]!.eventId);
    expect(result.current.selectedRunEvent?.eventId).toBe(goldenPath.runEvents[1]!.eventId);
    expect(result.current.activeInspectorRoute).toEqual({
      eventId: goldenPath.runEvents[1]!.eventId,
      key: "run-event"
    });
    expect(result.current.canGoBackInInspector).toBe(true);

    act(() => {
      result.current.onBackInspector();
      result.current.onNavigateInspectorRoute({ key: "report-preview" });
      result.current.onComposerDraftChange("继续分析收入异常。");
    });

    expect(result.current.activeInspectorRoute.key).toBe("report-preview");
    expect(result.current.composerDraft).toBe("继续分析收入异常。");
  });

  it("does not let later run updates steal inspector focus after the user manually changes route", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const viewModel = mapAnalysisRuntimeContractsToWorkspaceViewModel({
      conversation: goldenPath.conversation,
      currentRun: goldenPath.analysisRun,
      decisions: goldenPath.decisions,
      messageStream: goldenPath.messageStream,
      messages: goldenPath.messages,
      modelCalls: goldenPath.modelCalls,
      reports: goldenPath.reports,
      runEvents: goldenPath.runEvents,
      sourceEvidence: goldenPath.sourceEvidence,
      toolCalls: goldenPath.toolCalls
    });
    const loader = vi.fn().mockResolvedValue({
      kind: "ready",
      viewModel
    });
    const submitter = vi.fn().mockResolvedValue({
      analysisRun: { runId: goldenPath.analysisRun.runId },
      conversation: { conversationId: goldenPath.conversation.conversationId }
    });
    const { result } = renderHook(() =>
      useAnalysisWorkspaceController({
        bootstrap: {
          conversationId: goldenPath.conversation.conversationId,
          runId: goldenPath.analysisRun.runId
        },
        loader,
        submitIdentity: {
          businessDomainId: "business-domain-revenue-quality",
          userId: "user-zoe",
          workspaceId: "workspace-northstar-retail-china"
        },
        submitter
      })
    );

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("ready");
    });

    act(() => {
      result.current.onNavigateInspectorRoute({ key: "report-preview" });
      result.current.onComposerDraftChange("继续追问华东渠道。");
    });

    act(() => {
      result.current.onSubmitComposer();
    });

    await waitFor(() => {
      expect(submitter).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("ready");
    });

    expect(result.current.activeInspectorRoute.key).toBe("report-preview");
    expect(result.current.canGoBackInInspector).toBe(true);
  });
});
