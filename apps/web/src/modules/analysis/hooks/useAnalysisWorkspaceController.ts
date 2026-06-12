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
import type { DraftContextPack } from "../../../shared/navigation/navigationTypes";
import type {
  AnalysisComposerMode,
  AnalysisComposerViewModel,
  AnalysisDraftContextViewModel,
  AnalysisInspectorRouteNode,
  AnalysisSessionViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";
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
  draftContext?: DraftContextPack;
  loader?: AnalysisWorkspaceDataLoader;
  submitIdentity?: AnalysisDraftSubmitIdentity;
  submitter?: AnalysisDraftSubmitter;
};

export type AnalysisWorkspaceController = {
  activeInspectorRoute: AnalysisInspectorRouteNode;
  canGoBackInInspector: boolean;
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
  messages: AnalysisMessage[];
  modelOptions: readonly { key: string; label: string }[];
  onBackInspector: () => void;
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
  onNavigateInspectorRoute: (route: AnalysisInspectorRouteNode) => void;
  onResetForNewAnalysis: () => void;
  onSelectModel: (key: string) => void;
  onSelectRunEvent: (eventId: string) => void;
  onSelectSession: (conversationId: string) => void;
  onSessionSearchChange: (value: string) => void;
  onSubmitComposer: () => void;
  runEvents: AnalysisRunEvent[];
  selectedModelKey: string;
  selectedModelLabel: string;
  selectedReportId: string | null;
  selectedRunEvent?: AnalysisRunEvent;
  selectedRunEventId: string | null;
  selectedSession?: AnalysisSessionViewModel;
  selectedConversationId: string | null;
  selectedSourceEvidenceId: string | null;
  selectedToolCallId: string | null;
  sessionSearchQuery: string;
  sessions: AnalysisSessionViewModel[];
  visibleSessions: AnalysisSessionViewModel[];
  workspaceState: AnalysisWorkspaceState;
};

function createInteractionMessage(text: string): string {
  return text;
}

function createDraftComposerViewModels(
  draftContext?: DraftContextPack
): AnalysisWorkspaceController["composerViewModels"] {
  const contextHint = draftContext
    ? `当前草稿上下文来自 ${draftContext.sourceType} · ${draftContext.sourceTitle}。`
    : "当前处于新聊天草稿态，发送前不会创建 Conversation 或 AnalysisRun。";
  const helperText = draftContext
    ? "发送后才会把 DraftContextPack 固化为本次 AnalysisTask.contextPack snapshot。"
    : "可以直接输入问题，或从 Dashboard / Metrics / Reports / Evidence / Run Trace 带上下文进入。";

  return {
    analysis: {
      contextHint,
      helperText,
      initialDraft: draftContext?.suggestedPrompt ?? "",
      key: "draft-analysis",
      placeholder: "例如：解释最近收入增速变化，并给出下一步建议。",
      submitLabel: "发送消息",
      suggestions: [],
      title: "新聊天草稿"
    },
    followUp: {
      contextHint,
      helperText: "当前还没有已创建的会话；如需发送，仍会以新的 AnalysisTask 开始。",
      initialDraft: draftContext?.suggestedPrompt ?? "",
      key: "draft-follow-up",
      placeholder: "补充你希望一起发送的约束、时间范围或证据线索。",
      submitLabel: "发送消息",
      suggestions: [],
      title: "草稿补充"
    }
  };
}

function getDraftContextSignature(draftContext?: DraftContextPack): string {
  if (!draftContext) {
    return "";
  }

  return [
    draftContext.sourceType,
    draftContext.sourceId,
    draftContext.sourceTitle,
    draftContext.summary,
    draftContext.suggestedPrompt,
    draftContext.chips.join("|")
  ].join("::");
}

function getActiveDraft(
  analysisDraft: string,
  composerMode: AnalysisComposerMode,
  followUpDraft: string
): string {
  return composerMode === "analysis" ? analysisDraft : followUpDraft;
}

function getFirstRunEventId(session: AnalysisSessionViewModel | undefined): string | null {
  return session?.runEvents[0]?.eventId ?? null;
}

function createInitialInspectorRoute(
  bootstrap: AnalysisRuntimeBootstrap,
  draftContext?: DraftContextPack
): AnalysisInspectorRouteNode {
  if (bootstrap.conversationId || bootstrap.runId) {
    return { key: "run-trace" };
  }

  if (draftContext) {
    return { key: "context-origin" };
  }

  return { key: "home" };
}

function getDefaultInspectorRoute(
  workspaceState: AnalysisWorkspaceState,
  draftContext?: DraftContextPack
): AnalysisInspectorRouteNode {
  if (workspaceState.kind === "draft") {
    return draftContext ? { key: "context-origin" } : { key: "home" };
  }

  if (workspaceState.kind === "ready") {
    return { key: "run-trace" };
  }

  return { key: "home" };
}

function isSameInspectorRoute(
  left: AnalysisInspectorRouteNode | undefined,
  right: AnalysisInspectorRouteNode
): boolean {
  if (!left) {
    return false;
  }

  if (left.key !== right.key) {
    return false;
  }

  if (left.key === "run-event" && right.key === "run-event") {
    return left.eventId === right.eventId;
  }

  return true;
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
    [
      options.draftContext?.chips,
      options.draftContext?.sourceId,
      options.draftContext?.sourceTitle,
      options.draftContext?.sourceType,
      options.draftContext?.suggestedPrompt,
      options.draftContext?.summary
    ]
  );
  const [workspaceState, setWorkspaceState] = useState<AnalysisWorkspaceState>(() =>
    bootstrap.conversationId || bootstrap.runId
      ? {
          description: "正在读取 Conversation / AnalysisRun / delivery surfaces。",
          kind: "loading",
          title: "Loading analysis runtime"
        }
      : { kind: "draft" }
  );
  const [workspaceViewModel, setWorkspaceViewModel] = useState<AnalysisWorkspaceViewModel | null>(null);
  const [draftContext, setDraftContext] = useState<DraftContextPack | undefined>(options.draftContext);
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
  const [inspectorRouteStack, setInspectorRouteStack] = useState<AnalysisInspectorRouteNode[]>([
    createInitialInspectorRoute(bootstrap, options.draftContext)
  ]);
  const inspectorRouteStackRef = useRef<AnalysisInspectorRouteNode[]>(inspectorRouteStack);
  const inspectorNavigationModeRef = useRef<"auto" | "manual">("auto");
  const [selectedRunEventId, setSelectedRunEventId] = useState<string | null>(null);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(null);
  const [selectedSourceEvidenceId, setSelectedSourceEvidenceId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const applyInspectorNavigationState = (
    nextStack: AnalysisInspectorRouteNode[],
    nextMode: "auto" | "manual"
  ) => {
    inspectorRouteStackRef.current = nextStack;
    inspectorNavigationModeRef.current = nextMode;
    setInspectorRouteStack(nextStack);
  };

  const replaceInspectorRouteStack = (
    route: AnalysisInspectorRouteNode,
    mode: "auto" | "manual"
  ) => {
    applyInspectorNavigationState([route], mode);
  };

  const pushInspectorRoute = (route: AnalysisInspectorRouteNode) => {
    const currentStack = inspectorRouteStackRef.current;
    const currentRoute = currentStack.at(-1);

    if (isSameInspectorRoute(currentRoute, route)) {
      inspectorNavigationModeRef.current = "manual";
      return;
    }

    applyInspectorNavigationState([...currentStack, route], "manual");
  };

  const popInspectorRoute = () => {
    const currentStack = inspectorRouteStackRef.current;

    if (currentStack.length <= 1) {
      inspectorNavigationModeRef.current = "manual";
      return;
    }

    applyInspectorNavigationState(currentStack.slice(0, -1), "manual");
  };

  useEffect(() => {
    setDraftContext(options.draftContext);
  }, [draftContextSignature]);

  useEffect(() => {
    if (inspectorNavigationModeRef.current !== "auto") {
      return;
    }

    const defaultRoute = getDefaultInspectorRoute(workspaceState, draftContext);
    const currentStack = inspectorRouteStackRef.current;

    if (currentStack.length === 1 && isSameInspectorRoute(currentStack[0], defaultRoute)) {
      return;
    }

    replaceInspectorRouteStack(defaultRoute, "auto");
  }, [draftContext, workspaceState]);

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
    if (!selectedSession) {
      setSelectedRunEventId(null);
      setSelectedToolCallId(null);
      setSelectedSourceEvidenceId(null);
      setSelectedReportId(null);

      if (workspaceState.kind === "draft") {
        setAnalysisDraft(draftContext?.suggestedPrompt ?? "");
        setFollowUpDraft("");
      } else {
        setAnalysisDraft("");
        setFollowUpDraft("");
      }

      return;
    }

    setAnalysisDraft(selectedSession.inputComposer.initialDraft);
    setFollowUpDraft(selectedSession.followUpComposer.initialDraft);
    setSelectedRunEventId(getFirstRunEventId(selectedSession));
    setSelectedToolCallId(selectedSession.toolDetails[0]?.toolCallId ?? null);
    setSelectedSourceEvidenceId(selectedSession.sourceEvidence[0]?.sourceEvidenceId ?? null);
    setSelectedReportId(selectedSession.reportPreview?.reportId ?? null);
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

  const selectedRunEvent = useMemo(
    () =>
      selectedSession?.runEvents.find((event) => event.eventId === selectedRunEventId) ??
      selectedSession?.runEvents[0],
    [selectedRunEventId, selectedSession]
  );
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
    activeInspectorRoute: inspectorRouteStack.at(-1) ?? { key: "home" },
    canGoBackInInspector: inspectorRouteStack.length > 1,
    composerDraft: getActiveDraft(analysisDraft, composerMode, followUpDraft),
    composerMode,
    composerState,
    composerViewModels,
    currentRun: selectedSession?.currentRun,
    draftContext: workspaceState.kind === "draft" ? draftContext : undefined,
    interactionMessage,
    messages: selectedSession?.messages ?? [],
    modelOptions,
    onBackInspector: () => {
      popInspectorRoute();
    },
    onComposerAccessoryClick: () => {
      setInteractionMessage(
        createInteractionMessage("当前 issue 只接 read surfaces；附件和工具 write path 暂未实现。")
      );
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
      setInteractionMessage(
        createInteractionMessage("当前页面未建立真实 streaming cancel，停止动作不可用。")
      );
    },
    onNavigateInspectorRoute: (route) => {
      pushInspectorRoute(route);
    },
    onResetForNewAnalysis: () => {
      composerModeRef.current = "analysis";
      setComposerMode("analysis");
      setComposerState("idle");
      setWorkspaceState({ kind: "draft" });
      setDraftContext(undefined);
      setAnalysisDraft("");
      setFollowUpDraft("");
      setSelectedConversationId(null);
      replaceInspectorRouteStack({ key: "home" }, "auto");
      setInteractionMessage(
        createInteractionMessage(
          "已进入新聊天草稿态。发送前不会创建 Conversation 或 AnalysisRun；发送后才会进入正式 submit 链路。"
        )
      );
    },
    onSelectModel: (key) => {
      const nextModel = modelOptions.find((model) => model.key === key);

      if (!nextModel) {
        return;
      }

      setSelectedModelKey(nextModel.key);
      setInteractionMessage(
        createInteractionMessage(`已切换模型展示选项为 ${nextModel.label}。`)
      );
    },
    onSelectRunEvent: (eventId) => {
      if (workspaceState.kind === "draft") {
        return;
      }

      setSelectedRunEventId(eventId);
      pushInspectorRoute({ eventId, key: "run-event" });
    },
    onSelectSession: (conversationId) => {
      const nextSession = sessions.find((session) => session.conversationId === conversationId);

      if (!nextSession) {
        return;
      }

      composerModeRef.current = "follow_up";
      setComposerMode("follow_up");
      setWorkspaceState({ kind: "ready" });
      setDraftContext(undefined);
      setSelectedConversationId(nextSession.conversationId);
      setComposerState("idle");
      replaceInspectorRouteStack({ key: "run-trace" }, "auto");
      setInteractionMessage(
        createInteractionMessage(`已切换到真实会话 ${nextSession.conversationId}。`)
      );
    },
    onSessionSearchChange: setSessionSearchQuery,
    onSubmitComposer: () => {
      const question = getActiveDraft(analysisDraft, composerModeRef.current, followUpDraft).trim();
      const submitIdentity = options.submitIdentity;

      if (question.length === 0) {
        setComposerState("idle");
        setInteractionMessage(createInteractionMessage("请输入要提交的 Analysis 问题。"));
        return;
      }

      if (!submitIdentity) {
        setComposerState("idle");
        setInteractionMessage(
          createInteractionMessage(
            "当前页面未提供 workspaceId / userId / businessDomainId，无法发起 Analysis submit。"
          )
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
              createInteractionMessage(loadResult.description ?? "Analysis submit succeeded, but runtime workspace could not be loaded.")
            );
            return;
          }

          composerModeRef.current = "follow_up";
          setWorkspaceViewModel(loadResult.viewModel);
          setWorkspaceState({ kind: "ready" });
          setSelectedConversationId(submitResult.conversation.conversationId);
          setDraftContext(undefined);
          setAnalysisDraft("");
          setFollowUpDraft("");
          setComposerMode("follow_up");
          setComposerState("idle");
          if (workspaceState.kind !== "ready" || inspectorNavigationModeRef.current === "auto") {
            replaceInspectorRouteStack({ key: "run-trace" }, "auto");
          }
          setInteractionMessage("");
        } catch (error) {
          setComposerState("idle");
          setInteractionMessage(
            createInteractionMessage(
              error instanceof Error ? error.message : "Analysis submit failed."
            )
          );
        }
      })();
    },
    runEvents: selectedSession?.runEvents ?? [],
    selectedModelKey,
    selectedModelLabel,
    selectedReportId,
    selectedRunEvent,
    selectedRunEventId,
    selectedSession,
    selectedConversationId,
    selectedSourceEvidenceId,
    selectedToolCallId,
    sessionSearchQuery,
    sessions,
    visibleSessions,
    workspaceState
  };
}
