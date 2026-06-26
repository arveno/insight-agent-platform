import { useEffect, useMemo, useRef, useState } from "react";

import {
  AgentRuntimeClient,
  type FeedbackClosureResponse,
  type SubmitFeedbackRequest
} from "../../../api/client/agentRuntimeClient";
import {
  loadAnalysisRuntimeWorkspace,
  type AnalysisRuntimeBootstrap,
  type AnalysisWorkspaceLoadResult
} from "../../../api/adapters/loadAnalysisRuntimeWorkspace";
import {
  submitAnalysisDraft,
  type SubmitAnalysisDraftInput
} from "../../../api/adapters/submitAnalysisDraft";
import {
  subscribeToAnalysisMessageStream,
  type AnalysisMessageStreamSubscriber
} from "../../../api/adapters/streamAnalysisMessageStream";
import type { AnalysisContextRouteState } from "../../../shared/navigation/navigationTypes";
import type { ContextTreeNodeDisplayMap } from "../../../shared/view-model/contextTreeNodeDisplay";
import type {
  AnalysisComposerMode,
  AnalysisComposerViewModel,
  AnalysisDraftContextViewModel,
  AnalysisSessionViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun } from "../models/analysisRun";
import type { InspectorSubject } from "../models/inspectorSubject";
import type { AnalysisInspectorTreeState } from "../models/inspectorTree";
import { createEmptyInspectorTreeState, createRunTraceRootNodeId } from "../models/inspectorTree";
import type {
  Feedback,
  MessageStreamContract,
  SubmitAnalysisDraftResponse
} from "../models/runtimeContractTypes";

type ComposerState = "idle" | "running";
type FeedbackSubmitState = "idle" | "submitting";

const defaultModelOptions = [
  { key: "default", label: "Default" },
  { key: "reasoning", label: "Reasoning" },
  { key: "fast", label: "Fast" }
] as const;

export type AnalysisWorkspaceState =
  | {
      description: string;
      kind: "empty" | "error" | "loading";
      title: string;
    }
  | {
      kind: "draft" | "ready";
    };

export type AnalysisWorkspaceDataLoader = (
  bootstrap: AnalysisRuntimeBootstrap
) => Promise<AnalysisWorkspaceLoadResult>;

export type AnalysisDraftSubmitIdentity = {
  businessDomainId: string;
};

export type AnalysisDraftSubmitter = (
  input: SubmitAnalysisDraftInput
) => Promise<SubmitAnalysisDraftResponse>;

export type AnalysisFeedbackSubmitInput = {
  payload: SubmitFeedbackRequest;
  runId: string;
};

export type AnalysisFeedbackSubmitter = (
  input: AnalysisFeedbackSubmitInput
) => Promise<FeedbackClosureResponse>;

export type UseAnalysisWorkspaceControllerOptions = {
  bootstrap?: AnalysisRuntimeBootstrap;
  draftContext?: AnalysisContextRouteState;
  draftContextNodeDisplay?: ContextTreeNodeDisplayMap;
  feedbackSubmitter?: AnalysisFeedbackSubmitter;
  loader?: AnalysisWorkspaceDataLoader;
  streamSubscriber?: AnalysisMessageStreamSubscriber;
  submitIdentity?: AnalysisDraftSubmitIdentity;
  submitter?: AnalysisDraftSubmitter;
};

export type AnalysisWorkspaceController = {
  composerDraft: string;
  composerMode: AnalysisComposerMode;
  composerState: ComposerState;
  composerViewModels: {
    analysis: AnalysisComposerViewModel;
    followUp: AnalysisComposerViewModel;
  };
  currentRun?: AnalysisRun;
  draftContext?: AnalysisDraftContextViewModel;
  draftContextNodeDisplay?: ContextTreeNodeDisplayMap;
  feedbackComment: string;
  feedbackSubmitState: FeedbackSubmitState;
  feedbackType: Feedback["feedbackType"] | null;
  interactionMessage: string;
  inspectorTreeState: AnalysisInspectorTreeState;
  messages: AnalysisMessage[];
  modelOptions: readonly { key: string; label: string }[];
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
  onFeedbackCommentChange: (value: string) => void;
  onFeedbackTypeChange: (value: Feedback["feedbackType"]) => void;
  onResetForNewAnalysis: () => void;
  onSelectCurrentRun: () => void;
  onSetInspectorExpandedNodeIds: (nodeIds: string[]) => void;
  onSelectInspectorNode: (nodeId: string) => void;
  onSelectMessageAnchor: (messageId: string) => void;
  onSelectModel: (key: string) => void;
  onSelectSession: (conversationId: string) => void;
  onSessionSearchChange: (value: string) => void;
  onSubmitComposer: () => void;
  onSubmitFeedback: () => void;
  selectedConversationId: string | null;
  selectedInspectorSubject?: InspectorSubject;
  selectedMessageId: string | null;
  selectedModelKey: string;
  selectedModelLabel: string;
  selectedSession?: AnalysisSessionViewModel;
  sessionSearchQuery: string;
  sessions: AnalysisSessionViewModel[];
  visibleSessions: AnalysisSessionViewModel[];
  workspaceState: AnalysisWorkspaceState;
};

function createInteractionMessage(text: string): string {
  return text;
}

function submitFeedbackToRuntime(
  input: AnalysisFeedbackSubmitInput
): Promise<FeedbackClosureResponse> {
  return new AgentRuntimeClient().submitFeedback(input.runId, input.payload);
}

function createDraftComposerViewModels(
  draftContext?: AnalysisContextRouteState
): AnalysisWorkspaceController["composerViewModels"] {
  return {
    analysis: {
      contextHint: "",
      helperText: "",
      initialDraft: draftContext?.suggestedPrompt ?? "",
      key: "draft-analysis",
      placeholder: "输入你想分析的问题",
      submitLabel: "发送",
      suggestions: [],
      title: "输入你想分析的问题"
    },
    followUp: {
      contextHint: "",
      helperText: "",
      initialDraft: draftContext?.suggestedPrompt ?? "",
      key: "draft-follow-up",
      placeholder: "输入你想分析的问题",
      submitLabel: "发送",
      suggestions: [],
      title: "输入你想分析的问题"
    }
  };
}

function getDraftContextSignature(draftContext?: AnalysisContextRouteState): string {
  return draftContext ? JSON.stringify(draftContext) : "";
}

function getActiveDraft(
  analysisDraft: string,
  composerMode: AnalysisComposerMode,
  followUpDraft: string
): string {
  return composerMode === "analysis" ? analysisDraft : followUpDraft;
}

function parseBootstrapFromLocation(): AnalysisRuntimeBootstrap {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    conversationId: params.get("conversationId"),
    runId: params.get("runId")
  };
}

function getWorkspaceStateFromLoadResult(
  result: AnalysisWorkspaceLoadResult
): AnalysisWorkspaceState {
  switch (result.kind) {
    case "empty":
      return {
        description: result.description,
        kind: "empty",
        title: result.title
      };
    case "error":
      return {
        description: result.description,
        kind: "error",
        title: result.title
      };
    case "ready":
      return { kind: "ready" };
  }
}

function findLatestMessageByRole(
  session: AnalysisSessionViewModel | undefined,
  role: AnalysisMessage["role"]
): AnalysisMessage | undefined {
  return session?.messages
    .slice()
    .reverse()
    .find((message) => message.role === role);
}

function replaceSession(
  viewModel: AnalysisWorkspaceViewModel,
  session: AnalysisSessionViewModel
): AnalysisWorkspaceViewModel {
  return {
    ...viewModel,
    sessions: viewModel.sessions.map((item) =>
      item.conversationId === session.conversationId ? session : item
    )
  };
}

function applyStreamEventToSession(
  session: AnalysisSessionViewModel,
  event: MessageStreamContract
): AnalysisSessionViewModel {
  if (session.conversationId !== event.conversationId || session.currentRun.runId !== event.runId) {
    return session;
  }

  if (session.messageStream && event.sequence < session.messageStream.eventCount) {
    return session;
  }

  const nextReplayText = `${session.messageStream?.replayText ?? ""}${event.delta}`;

  return {
    ...session,
    messageStream: {
      eventCount: Math.max(session.messageStream?.eventCount ?? 0, event.sequence + 1),
      messageId: event.messageId,
      replayText: nextReplayText,
      runId: event.runId,
      status: event.status,
      updatedAtText: event.occurredAt
    },
    messageStreamState: "ready",
    messages: session.messages.map((message) =>
      message.messageId === event.messageId && message.role === "assistant"
        ? {
            ...message,
            content: nextReplayText,
            status: event.status === "completed" ? "completed" : event.status
          }
        : message
    )
  };
}

function applyStreamEventToViewModel(
  viewModel: AnalysisWorkspaceViewModel,
  event: MessageStreamContract
): AnalysisWorkspaceViewModel {
  return {
    ...viewModel,
    sessions: viewModel.sessions.map((session) => applyStreamEventToSession(session, event))
  };
}

function createRunSubject(session: AnalysisSessionViewModel): InspectorSubject {
  return {
    type: "analysisRun",
    analysisTaskId: session.analysisTaskId,
    runId: session.currentRun.runId
  };
}

function createContextTreeState(contextRootNodeId?: string): AnalysisInspectorTreeState {
  return {
    expandedNodeIds: [contextRootNodeId].filter((nodeId): nodeId is string => Boolean(nodeId)),
    selectedNodeId: contextRootNodeId ?? null
  };
}

function createRunTraceTreeState(session: AnalysisSessionViewModel): AnalysisInspectorTreeState {
  const rootNodeId = createRunTraceRootNodeId(session.currentRun.runId);

  return {
    expandedNodeIds: [rootNodeId],
    selectedNodeId: rootNodeId
  };
}

export function useAnalysisWorkspaceController(
  options: UseAnalysisWorkspaceControllerOptions = {}
): AnalysisWorkspaceController {
  const bootstrap = useMemo(
    () => options.bootstrap ?? parseBootstrapFromLocation(),
    [options.bootstrap?.conversationId, options.bootstrap?.runId]
  );
  const loader = options.loader ?? loadAnalysisRuntimeWorkspace;
  const feedbackSubmitter = options.feedbackSubmitter ?? submitFeedbackToRuntime;
  const streamSubscriber = options.streamSubscriber ?? subscribeToAnalysisMessageStream;
  const submitter = options.submitter ?? submitAnalysisDraft;
  const draftContextSignature = useMemo(
    () => getDraftContextSignature(options.draftContext),
    [options.draftContext]
  );
  const [workspaceState, setWorkspaceState] = useState<AnalysisWorkspaceState>(() =>
    bootstrap.conversationId || bootstrap.runId
      ? {
          description: "正在准备当前会话与分析详情。",
          kind: "loading",
          title: "正在加载分析详情"
        }
      : { kind: "draft" }
  );
  const [workspaceViewModel, setWorkspaceViewModel] = useState<AnalysisWorkspaceViewModel | null>(
    null
  );
  const [draftContext, setDraftContext] = useState<AnalysisContextRouteState | undefined>(
    options.draftContext
  );
  const [draftContextNodeDisplay, setDraftContextNodeDisplay] = useState<
    ContextTreeNodeDisplayMap | undefined
  >(options.draftContextNodeDisplay);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [analysisDraft, setAnalysisDraft] = useState(options.draftContext?.suggestedPrompt ?? "");
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [composerMode, setComposerMode] = useState<AnalysisComposerMode>(
    bootstrap.conversationId || bootstrap.runId ? "follow_up" : "analysis"
  );
  const composerModeRef = useRef<AnalysisComposerMode>(
    bootstrap.conversationId || bootstrap.runId ? "follow_up" : "analysis"
  );
  const [composerState, setComposerState] = useState<ComposerState>("idle");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitState, setFeedbackSubmitState] = useState<FeedbackSubmitState>("idle");
  const [feedbackType, setFeedbackType] = useState<Feedback["feedbackType"] | null>(null);
  const [selectedModelKey, setSelectedModelKey] = useState<string>(defaultModelOptions[0].key);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedInspectorSubject, setSelectedInspectorSubject] = useState<
    InspectorSubject | undefined
  >(undefined);
  const [inspectorTreeState, setInspectorTreeState] = useState<AnalysisInspectorTreeState>(() =>
    options.draftContext
      ? createContextTreeState(options.draftContext.root.nodeId)
      : createEmptyInspectorTreeState()
  );

  useEffect(() => {
    setDraftContext(options.draftContext);
  }, [draftContextSignature]);

  useEffect(() => {
    setDraftContextNodeDisplay(options.draftContextNodeDisplay);
  }, [options.draftContextNodeDisplay]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!bootstrap.conversationId && !bootstrap.runId && options.draftContext) {
        setWorkspaceState({ kind: "draft" });
        setWorkspaceViewModel(null);
        return;
      }

      const result = await loader(bootstrap);

      if (cancelled) {
        return;
      }

      if (!bootstrap.conversationId && !bootstrap.runId && result.kind !== "ready") {
        setWorkspaceState({ kind: "draft" });
        setWorkspaceViewModel(null);
        return;
      }

      setWorkspaceState(getWorkspaceStateFromLoadResult(result));
      setWorkspaceViewModel(result.kind === "ready" ? result.viewModel : null);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [bootstrap, draftContextSignature, loader, options.draftContext]);

  const sessions = workspaceViewModel?.sessions ?? [];
  const selectedSession = useMemo(() => {
    if (selectedConversationId) {
      return sessions.find((session) => session.conversationId === selectedConversationId);
    }

    if (workspaceState.kind === "ready") {
      return sessions[0];
    }

    return undefined;
  }, [selectedConversationId, sessions, workspaceState.kind]);

  useEffect(() => {
    if (sessions.length === 0 || workspaceState.kind !== "ready") {
      setSelectedConversationId(null);
      return;
    }

    setSelectedConversationId((currentConversationId) =>
      currentConversationId &&
      sessions.some((session) => session.conversationId === currentConversationId)
        ? currentConversationId
        : sessions[0]!.conversationId
    );
  }, [sessions, workspaceState.kind]);

  useEffect(() => {
    if (workspaceState.kind === "draft") {
      setSelectedInspectorSubject(undefined);
      setSelectedMessageId(null);
      setInspectorTreeState(
        draftContext
          ? createContextTreeState(draftContext.root.nodeId)
          : createEmptyInspectorTreeState()
      );
      setAnalysisDraft(draftContext?.suggestedPrompt ?? "");
      setFollowUpDraft("");
      return;
    }

    if (!selectedSession) {
      return;
    }

    const latestAssistantMessage = findLatestMessageByRole(selectedSession, "assistant");

    setSelectedInspectorSubject(createRunSubject(selectedSession));
    setSelectedMessageId(latestAssistantMessage?.messageId ?? null);
    setInspectorTreeState(createRunTraceTreeState(selectedSession));
    setAnalysisDraft(selectedSession.inputComposer.initialDraft);
    setFeedbackComment("");
    setFeedbackSubmitState("idle");
    setFeedbackType(null);
    setFollowUpDraft(selectedSession.followUpComposer.initialDraft);
  }, [draftContext, selectedSession, workspaceState.kind]);

  const visibleSessions = useMemo(() => {
    const normalizedQuery = sessionSearchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return sessions;
    }

    return sessions.filter((session) =>
      session.sessionSummary.title.toLowerCase().includes(normalizedQuery)
    );
  }, [sessionSearchQuery, sessions]);
  const streamTarget = useMemo(() => {
    if (!selectedSession?.messageStream || selectedSession.messageStream.status !== "streaming") {
      return undefined;
    }

    return {
      conversationId: selectedSession.conversationId,
      messageId: selectedSession.messageStream.messageId
    };
  }, [
    selectedSession?.conversationId,
    selectedSession?.messageStream?.messageId,
    selectedSession?.messageStream?.status
  ]);

  useEffect(() => {
    if (!streamTarget) {
      return undefined;
    }

    return streamSubscriber({
      conversationId: streamTarget.conversationId,
      messageId: streamTarget.messageId,
      onError: () => {
        setInteractionMessage(createInteractionMessage("实时输出已中断，可刷新后读取回放。"));
      },
      onEvent: (event) => {
        setWorkspaceViewModel((current) =>
          current ? applyStreamEventToViewModel(current, event) : current
        );
      }
    });
  }, [streamSubscriber, streamTarget]);

  const draftComposerViewModels = useMemo(
    () => createDraftComposerViewModels(draftContext),
    [draftContext]
  );
  const composerViewModels = selectedSession
    ? {
        analysis: selectedSession.inputComposer,
        followUp: selectedSession.followUpComposer
      }
    : draftComposerViewModels;
  const modelOptions = workspaceViewModel?.modelOptions ?? defaultModelOptions;
  const selectedModelLabel =
    modelOptions.find((model) => model.key === selectedModelKey)?.label ??
    modelOptions[0]?.label ??
    "Default";

  const submitFeedback = () => {
    if (!selectedSession?.reportPreview || !feedbackType || feedbackSubmitState === "submitting") {
      return;
    }

    const comment = feedbackComment.trim();
    const payload: SubmitFeedbackRequest = {
      comment: comment.length > 0 ? comment : null,
      feedbackType,
      reportId: selectedSession.reportPreview.reportId
    };

    if (feedbackType !== "useful") {
      payload.expectedBehavior = "复核报告结论后再进入验收基线。";
      payload.failureReason = comment.length > 0 ? comment : "用户标记结果需要复核。";
      payload.failureType = feedbackType;
    }

    setFeedbackSubmitState("submitting");
    setInteractionMessage("");

    void (async () => {
      try {
        await feedbackSubmitter({
          payload,
          runId: selectedSession.currentRun.runId
        });

        const loadResult = await loader({
          conversationId: selectedSession.conversationId,
          runId: selectedSession.currentRun.runId
        });

        if (loadResult.kind === "ready") {
          const loadedSession = loadResult.viewModel.sessions[0];

          if (loadedSession) {
            setWorkspaceViewModel((current) =>
              current ? replaceSession(current, loadedSession) : loadResult.viewModel
            );
          }
        }

        setFeedbackComment("");
        setFeedbackType(null);
        setInteractionMessage(createInteractionMessage("Feedback 已提交，闭环状态已更新。"));
      } catch (error) {
        setInteractionMessage(
          createInteractionMessage(error instanceof Error ? error.message : "Feedback 提交失败。")
        );
      } finally {
        setFeedbackSubmitState("idle");
      }
    })();
  };

  return {
    composerDraft: getActiveDraft(analysisDraft, composerMode, followUpDraft),
    composerMode,
    composerState,
    composerViewModels,
    currentRun: selectedSession?.currentRun,
    draftContext: workspaceState.kind === "draft" ? draftContext : undefined,
    draftContextNodeDisplay: workspaceState.kind === "draft" ? draftContextNodeDisplay : undefined,
    feedbackComment,
    feedbackSubmitState,
    feedbackType,
    interactionMessage,
    inspectorTreeState,
    messages: selectedSession?.messages ?? [],
    modelOptions,
    onComposerAccessoryClick: () => {
      setInteractionMessage(createInteractionMessage("该功能暂不可用。"));
    },
    onComposerDraftChange: (value) => {
      if (composerModeRef.current === "analysis") {
        setAnalysisDraft(value);
        return;
      }

      setFollowUpDraft(value);
    },
    onComposerModeChange: (mode) => {
      composerModeRef.current = mode;
      setComposerMode(mode);
      setComposerState("idle");
    },
    onComposerStop: () => {
      setComposerState("idle");
      setInteractionMessage(createInteractionMessage("当前无法停止此次生成。"));
    },
    onFeedbackCommentChange: setFeedbackComment,
    onFeedbackTypeChange: (value) => {
      setFeedbackType(value);
      setInteractionMessage("");
    },
    onResetForNewAnalysis: () => {
      composerModeRef.current = "analysis";
      setComposerMode("analysis");
      setComposerState("idle");
      setWorkspaceState({ kind: "draft" });
      setWorkspaceViewModel(null);
      setDraftContext(undefined);
      setDraftContextNodeDisplay(undefined);
      setAnalysisDraft("");
      setFeedbackComment("");
      setFeedbackSubmitState("idle");
      setFeedbackType(null);
      setFollowUpDraft("");
      setSelectedConversationId(null);
      setSelectedInspectorSubject(undefined);
      setSelectedMessageId(null);
      setInspectorTreeState(createEmptyInspectorTreeState());
      setInteractionMessage("");
    },
    onSelectCurrentRun: () => {
      if (!selectedSession) {
        return;
      }

      setSelectedInspectorSubject(createRunSubject(selectedSession));
      setInspectorTreeState(createRunTraceTreeState(selectedSession));
    },
    onSetInspectorExpandedNodeIds: (nodeIds) => {
      setInspectorTreeState((current) => ({
        ...current,
        expandedNodeIds: [...new Set(nodeIds)]
      }));
    },
    onSelectInspectorNode: (nodeId) => {
      setInspectorTreeState((current) => ({
        ...current,
        selectedNodeId: nodeId
      }));
    },
    onSelectMessageAnchor: (messageId) => {
      const message = selectedSession?.messages.find((item) => item.messageId === messageId);

      if (!message) {
        return;
      }

      if (message.role !== "assistant" || message.analysisTaskId == null || message.runId == null) {
        return;
      }

      setSelectedMessageId(messageId);
      setSelectedInspectorSubject({
        type: "analysisRun",
        analysisTaskId: message.analysisTaskId,
        runId: message.runId
      });
      setInspectorTreeState(createRunTraceTreeState(selectedSession!));
    },
    onSelectModel: (key) => {
      const nextModel = modelOptions.find((model) => model.key === key);

      if (!nextModel) {
        return;
      }

      setSelectedModelKey(nextModel.key);
      setInteractionMessage("");
    },
    onSelectSession: (conversationId) => {
      const nextSession = sessions.find((session) => session.conversationId === conversationId);

      if (!nextSession) {
        return;
      }

      composerModeRef.current = "follow_up";
      setComposerMode("follow_up");
      setWorkspaceState({ kind: "ready" });
      setSelectedConversationId(nextSession.conversationId);
      setDraftContext(undefined);
      setSelectedInspectorSubject(createRunSubject(nextSession));
      setSelectedMessageId(findLatestMessageByRole(nextSession, "assistant")?.messageId ?? null);
      setComposerState("idle");
      setInspectorTreeState(createRunTraceTreeState(nextSession));
      setInteractionMessage("");

      void (async () => {
        const loadResult = await loader({ conversationId });

        if (loadResult.kind !== "ready") {
          setInteractionMessage(
            createInteractionMessage(loadResult.description ?? "暂时无法重新加载该会话。")
          );
          return;
        }

        const loadedSession = loadResult.viewModel.sessions[0];

        if (!loadedSession) {
          return;
        }

        setWorkspaceViewModel((current) =>
          current ? replaceSession(current, loadedSession) : loadResult.viewModel
        );
        setSelectedInspectorSubject(createRunSubject(loadedSession));
        setSelectedMessageId(
          findLatestMessageByRole(loadedSession, "assistant")?.messageId ?? null
        );
        setInspectorTreeState(createRunTraceTreeState(loadedSession));
      })();
    },
    onSessionSearchChange: setSessionSearchQuery,
    onSubmitComposer: () => {
      const question = getActiveDraft(analysisDraft, composerModeRef.current, followUpDraft).trim();
      const submitIdentity = options.submitIdentity;

      if (question.length === 0) {
        setComposerState("idle");
        setInteractionMessage(createInteractionMessage("输入你想分析的问题。"));
        return;
      }

      if (!submitIdentity) {
        setComposerState("idle");
        setInteractionMessage(createInteractionMessage("当前环境未配置分析提交能力。"));
        return;
      }

      setComposerState("running");
      setInteractionMessage("");

      void (async () => {
        try {
          const submitResult = await submitter({
            businessDomainId: submitIdentity.businessDomainId,
            conversationId: selectedSession?.conversationId,
            draftContext,
            question
          });
          const loadResult = await loader({
            conversationId: submitResult.conversation.conversationId,
            runId: submitResult.analysisRun.runId
          });

          if (loadResult.kind !== "ready") {
            setWorkspaceState(getWorkspaceStateFromLoadResult(loadResult));
            setWorkspaceViewModel(null);
            setComposerState("idle");
            setInteractionMessage(
              createInteractionMessage(
                loadResult.description ?? "分析请求已提交，但暂时无法刷新当前会话。"
              )
            );
            return;
          }

          const loadedSession = loadResult.viewModel.sessions[0];

          composerModeRef.current = "follow_up";
          setWorkspaceViewModel(loadResult.viewModel);
          setWorkspaceState({ kind: "ready" });
          setSelectedConversationId(submitResult.conversation.conversationId);
          setDraftContext(undefined);
          setAnalysisDraft("");
          setFollowUpDraft("");
          setComposerMode("follow_up");
          setComposerState("idle");
          setSelectedInspectorSubject(
            loadedSession
              ? {
                  type: "analysisRun",
                  analysisTaskId: loadedSession.analysisTaskId,
                  runId: loadedSession.currentRun.runId
                }
              : undefined
          );
          setSelectedMessageId(
            loadedSession
              ? (findLatestMessageByRole(loadedSession, "assistant")?.messageId ?? null)
              : null
          );
          setInspectorTreeState(
            loadedSession ? createRunTraceTreeState(loadedSession) : createEmptyInspectorTreeState()
          );
          setInteractionMessage("");
        } catch {
          setComposerState("idle");
          setInteractionMessage(createInteractionMessage("发送失败，请稍后重试。"));
        }
      })();
    },
    onSubmitFeedback: submitFeedback,
    selectedConversationId,
    selectedInspectorSubject,
    selectedMessageId,
    selectedModelKey,
    selectedModelLabel,
    selectedSession,
    sessionSearchQuery,
    sessions,
    visibleSessions,
    workspaceState
  };
}
