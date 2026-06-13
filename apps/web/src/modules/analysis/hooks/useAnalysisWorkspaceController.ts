import { useEffect, useMemo, useRef, useState } from "react";

import {
  loadAnalysisRuntimeWorkspace,
  type AnalysisRuntimeBootstrap,
  type AnalysisWorkspaceLoadResult
} from "../../../api/adapters/loadAnalysisRuntimeWorkspace";
import {
  submitAnalysisDraft,
  type SubmitAnalysisDraftInput
} from "../../../api/adapters/submitAnalysisDraft";
import type { AnalysisContextRouteState } from "../../../shared/navigation/navigationTypes";
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
import type {
  AnalysisInspectorRootKey,
  AnalysisInspectorTreeState
} from "../models/inspectorTree";
import {
  createContextRootNodeId,
  createDecisionsRootNodeId,
  createEvidenceRootNodeId,
  createModelCallsRootNodeId,
  createReportsRootNodeId,
  createRunHistoryRootNodeId,
  createRunTraceRootNodeId,
  createToolCallsRootNodeId
} from "../models/inspectorTree";
import type { SubmitAnalysisDraftResponse } from "../models/runtimeContractTypes";

type ComposerState = "idle" | "running";

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
  userId: string;
  workspaceId: string;
};

export type AnalysisDraftSubmitter = (
  input: SubmitAnalysisDraftInput
) => Promise<SubmitAnalysisDraftResponse>;

export type UseAnalysisWorkspaceControllerOptions = {
  bootstrap?: AnalysisRuntimeBootstrap;
  draftContext?: AnalysisContextRouteState;
  loader?: AnalysisWorkspaceDataLoader;
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
  interactionMessage: string;
  inspectorTreeState: AnalysisInspectorTreeState;
  messages: AnalysisMessage[];
  modelOptions: readonly { key: string; label: string }[];
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
  onPopInspectorPath: () => void;
  onResetForNewAnalysis: () => void;
  onSelectInspectorNode: (nodeId: string) => void;
  onSelectInspectorRoot: (rootKey: AnalysisInspectorRootKey) => void;
  onSelectMessageAnchor: (messageId: string) => void;
  onSelectModel: (key: string) => void;
  onSelectSession: (conversationId: string) => void;
  onSessionSearchChange: (value: string) => void;
  onSubmitComposer: () => void;
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

function getWorkspaceStateFromLoadResult(result: AnalysisWorkspaceLoadResult): AnalysisWorkspaceState {
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

function getRootNodeId(
  rootKey: AnalysisInspectorRootKey,
  session: AnalysisSessionViewModel | undefined,
  draftContext: AnalysisContextRouteState | undefined
): string | null {
  if (rootKey === "context") {
    return (
      session?.analysisTaskContextPack?.root.nodeId ??
      (session ? createContextRootNodeId(session.analysisTaskId) : null) ??
      draftContext?.root.nodeId ??
      null
    );
  }

  if (!session) {
    return null;
  }

  switch (rootKey) {
    case "decisions":
      return createDecisionsRootNodeId(session.currentRun.runId);
    case "evidence":
      return createEvidenceRootNodeId(session.currentRun.runId);
    case "model-calls":
      return createModelCallsRootNodeId(session.currentRun.runId);
    case "reports":
      return createReportsRootNodeId(session.currentRun.runId);
    case "run-history":
      return createRunHistoryRootNodeId(session.analysisTaskId);
    case "run-trace":
      return createRunTraceRootNodeId(session.currentRun.runId);
    case "tool-calls":
      return createToolCallsRootNodeId(session.currentRun.runId);
    case "runtime-references":
      return `inspector-root-runtime-references:${session.currentRun.runId}`;
  }
}

function createRunSubject(session: AnalysisSessionViewModel): InspectorSubject {
  return {
    type: "analysisRun",
    analysisTaskId: session.analysisTaskId,
    runId: session.currentRun.runId
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
  const [workspaceViewModel, setWorkspaceViewModel] = useState<AnalysisWorkspaceViewModel | null>(null);
  const [draftContext, setDraftContext] = useState<AnalysisContextRouteState | undefined>(
    options.draftContext
  );
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
  const [selectedModelKey, setSelectedModelKey] = useState<string>(defaultModelOptions[0].key);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedInspectorSubject, setSelectedInspectorSubject] = useState<
    InspectorSubject | undefined
  >(undefined);
  const [inspectorTreeState, setInspectorTreeState] = useState<AnalysisInspectorTreeState>(() =>
    options.draftContext ? { path: [], rootKey: null } : { path: [], rootKey: null }
  );

  useEffect(() => {
    setDraftContext(options.draftContext);
  }, [draftContextSignature]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!bootstrap.conversationId && !bootstrap.runId) {
        setWorkspaceState({ kind: "draft" });
        setWorkspaceViewModel(null);
        return;
      }

      const result = await loader(bootstrap);

      if (cancelled) {
        return;
      }

      setWorkspaceState(getWorkspaceStateFromLoadResult(result));
      setWorkspaceViewModel(result.kind === "ready" ? result.viewModel : null);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [bootstrap, loader]);

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
        draftContext ? { path: [], rootKey: null } : { path: [], rootKey: null }
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
    setInspectorTreeState({
      path: [createRunTraceRootNodeId(selectedSession.currentRun.runId)],
      rootKey: "run-trace"
    });
    setAnalysisDraft(selectedSession.inputComposer.initialDraft);
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

  return {
    composerDraft: getActiveDraft(analysisDraft, composerMode, followUpDraft),
    composerMode,
    composerState,
    composerViewModels,
    currentRun: selectedSession?.currentRun,
    draftContext: workspaceState.kind === "draft" ? draftContext : undefined,
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
    onPopInspectorPath: () => {
      setInspectorTreeState((current) =>
        current.path.length <= 1
          ? { path: [], rootKey: null }
          : {
              ...current,
              path: current.path.slice(0, -1)
            }
      );
    },
    onResetForNewAnalysis: () => {
      composerModeRef.current = "analysis";
      setComposerMode("analysis");
      setComposerState("idle");
      setWorkspaceState({ kind: "draft" });
      setWorkspaceViewModel(null);
      setDraftContext(undefined);
      setAnalysisDraft("");
      setFollowUpDraft("");
      setSelectedConversationId(null);
      setSelectedInspectorSubject(undefined);
      setSelectedMessageId(null);
      setInspectorTreeState({ path: [], rootKey: null });
      setInteractionMessage("");
    },
    onSelectInspectorNode: (nodeId) => {
      setInspectorTreeState((current) => ({
        ...current,
        path: [...current.path, nodeId]
      }));
    },
    onSelectInspectorRoot: (rootKey) => {
      const rootNodeId = getRootNodeId(rootKey, selectedSession, draftContext);

      if (!rootNodeId) {
        return;
      }

      setInspectorTreeState({
        path: [rootNodeId],
        rootKey
      });
    },
    onSelectMessageAnchor: (messageId) => {
      const message = selectedSession?.messages.find((item) => item.messageId === messageId);

      if (!message || message.role !== "assistant") {
        return;
      }

      const { analysisTaskId, runId } = message;

      if (runId == null || analysisTaskId == null) {
        return;
      }

      setSelectedMessageId(messageId);
      setSelectedInspectorSubject({
        type: "analysisRun",
        analysisTaskId,
        runId
      });
      setInspectorTreeState({
        path: [createRunTraceRootNodeId(runId)],
        rootKey: "run-trace"
      });
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
      setInspectorTreeState({
        path: [createRunTraceRootNodeId(nextSession.currentRun.runId)],
        rootKey: "run-trace"
      });
      setInteractionMessage("");
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
        setInteractionMessage(
          createInteractionMessage("当前环境未配置分析提交能力。")
        );
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
            question,
            userId: submitIdentity.userId,
            workspaceId: submitIdentity.workspaceId
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
            loadedSession ? findLatestMessageByRole(loadedSession, "assistant")?.messageId ?? null : null
          );
          setInspectorTreeState(
            loadedSession
              ? {
                  path: [createRunTraceRootNodeId(loadedSession.currentRun.runId)],
                  rootKey: "run-trace"
                }
              : { path: [], rootKey: null }
          );
          setInteractionMessage("");
        } catch (error) {
          setComposerState("idle");
          setInteractionMessage(createInteractionMessage("发送失败，请稍后重试。"));
        }
      })();
    },
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
