import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  AnalysisRun,
  AnalysisTask,
  AnalysisTaskContextPack,
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
  createRunTraceRootNodeId
} from "../models/inspectorTree";
import {
  useAnalysisWorkspaceController,
  type UseAnalysisWorkspaceControllerOptions
} from "./useAnalysisWorkspaceController";

type GoldenPathExample = {
  analysisRun: AnalysisRun;
  analysisTask: AnalysisTask;
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

function createDraftContext(): AnalysisTaskContextPack {
  return {
    capturedAt: "2026-06-12T10:28:00+08:00",
    root: {
      nodeId: "draft-context-root",
      kind: "report",
      role: "inputContext",
      owner: {
        type: "analysisTask"
      },
      title: "周经营分析报告",
      summary: "围绕收入增速放缓、毛利率波动和库存周转压力继续追问。",
      chips: ["Northstar Retail China", "Last 7 days", "3 条证据"],
      sourceRef: {
        reportId: "report-weekly-operations-review",
        type: "report"
      },
      children: [
        {
          nodeId: "draft-context-root-primary-source",
          kind: "reportSection",
          role: "inputContext",
          owner: {
            type: "analysisTask"
          },
          title: "关键经营摘要",
          summary: "把周报中的关键证据节点固定为 AnalysisTask 输入。"
        }
      ]
    },
    suggestedPrompt: "请继续分析华东收入增速放缓的主要原因。",
    traceability: "direct_refs",
    version: 1
  };
}

function createGoldenPathWorkspaceViewModel(goldenPath: GoldenPathExample) {
  return mapAnalysisRuntimeContractsToWorkspaceViewModel({
    analysisTask: goldenPath.analysisTask,
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
}

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
    expect(result.current.currentRun).toBeUndefined();
    expect(result.current.selectedInspectorSubject).toBeUndefined();
    expect(result.current.selectedMessageId).toBeNull();
    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });
    expect(result.current.composerMode).toBe("analysis");
  });

  it("hydrates tree-shaped draft context and clears it on new-analysis reset", async () => {
    const draftContext = createDraftContext();
    const loader = vi.fn();
    const { result } = renderHook(() =>
      useAnalysisWorkspaceController({
        bootstrap: {},
        draftContext,
        loader
      })
    );

    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
    });

    expect(result.current.draftContext).toEqual(draftContext);
    expect(result.current.composerDraft).toBe(draftContext.suggestedPrompt);
    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });

    act(() => {
      result.current.onSelectInspectorRoot("context");
    });

    expect(result.current.inspectorTreeState).toEqual({
      path: [draftContext.root.nodeId],
      rootKey: "context"
    });

    act(() => {
      result.current.onPopInspectorPath();
    });

    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });

    act(() => {
      result.current.onResetForNewAnalysis();
    });

    expect(result.current.workspaceState.kind).toBe("draft");
    expect(result.current.draftContext).toBeUndefined();
    expect(result.current.composerDraft).toBe("");
    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });
  });

  it("submits the canonical tree-shaped draft context and loads the created runtime workspace", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const draftContext = createDraftContext();
    const viewModel = createGoldenPathWorkspaceViewModel(goldenPath);
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
      draftContext,
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
        draftContext,
        question: draftContext.suggestedPrompt,
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
    expect(result.current.currentRun?.runId).toBe(goldenPath.analysisRun.runId);
    expect(result.current.selectedInspectorSubject).toEqual({
      type: "analysisRun",
      analysisTaskId: goldenPath.analysisTask.analysisTaskId,
      runId: goldenPath.analysisRun.runId
    });
    expect(result.current.selectedMessageId).toBe(
      goldenPath.messages.find((message) => message.role === "assistant")?.messageId ?? null
    );
    expect(result.current.inspectorTreeState).toEqual({
      path: [createRunTraceRootNodeId(goldenPath.analysisRun.runId)],
      rootKey: "run-trace"
    });
  });

  it("keeps draft mode and exposes the submit error when canonical submit fails", async () => {
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

    expect(loader).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(result.current.workspaceState.kind).toBe("draft");
      expect(result.current.messages).toEqual([]);
      expect(result.current.currentRun).toBeUndefined();
      expect(result.current.interactionMessage).toContain(
        "Conversation.workspaceId does not match request.workspaceId"
      );
    });
  });

  it("switches inspector subject between assistant-run and user-task message anchors", async () => {
    const goldenPath = goldenPathExample as GoldenPathExample;
    const viewModel = createGoldenPathWorkspaceViewModel(goldenPath);
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

    const assistantMessage = goldenPath.messages.find((message) => message.role === "assistant")!;
    const userMessage = goldenPath.messages.find((message) => message.role === "user")!;

    expect(result.current.selectedInspectorSubject).toEqual({
      type: "analysisRun",
      analysisTaskId: goldenPath.analysisTask.analysisTaskId,
      runId: goldenPath.analysisRun.runId
    });
    expect(result.current.selectedMessageId).toBe(assistantMessage.messageId);
    expect(result.current.inspectorTreeState).toEqual({
      path: [createRunTraceRootNodeId(goldenPath.analysisRun.runId)],
      rootKey: "run-trace"
    });

    act(() => {
      result.current.onPopInspectorPath();
    });

    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });

    act(() => {
      result.current.onSelectMessageAnchor(userMessage.messageId);
    });

    expect(result.current.selectedInspectorSubject).toEqual({
      type: "analysisTask",
      analysisTaskId: goldenPath.analysisTask.analysisTaskId,
      runId: goldenPath.analysisRun.runId
    });
    expect(result.current.selectedMessageId).toBe(userMessage.messageId);
    expect(result.current.inspectorTreeState).toEqual({ path: [], rootKey: null });

    act(() => {
      result.current.onSelectInspectorRoot("context");
    });

    expect(result.current.inspectorTreeState).toEqual({
      path: [goldenPath.analysisTask.contextPack!.root.nodeId],
      rootKey: "context"
    });

    act(() => {
      result.current.onSelectMessageAnchor(assistantMessage.messageId);
    });

    expect(result.current.selectedInspectorSubject).toEqual({
      type: "analysisRun",
      analysisTaskId: goldenPath.analysisTask.analysisTaskId,
      runId: goldenPath.analysisRun.runId
    });
    expect(result.current.selectedMessageId).toBe(assistantMessage.messageId);
    expect(result.current.inspectorTreeState).toEqual({
      path: [createRunTraceRootNodeId(goldenPath.analysisRun.runId)],
      rootKey: "run-trace"
    });
  });
});
