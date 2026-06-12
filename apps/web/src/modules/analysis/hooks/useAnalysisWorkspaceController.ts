import { useEffect, useMemo, useRef, useState } from "react";

import {
  loadAnalysisRuntimeWorkspace,
  type AnalysisRuntimeBootstrap,
  type AnalysisWorkspaceLoadResult
} from "../../../api/adapters/loadAnalysisRuntimeWorkspace";
import type {
  AnalysisComposerMode,
  AnalysisInspectorPanelKey,
  AnalysisSessionViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";

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
      kind: "ready";
    };

export type AnalysisWorkspaceDataLoader = (
  bootstrap: AnalysisRuntimeBootstrap
) => Promise<AnalysisWorkspaceLoadResult>;

export type UseAnalysisWorkspaceControllerOptions = {
  bootstrap?: AnalysisRuntimeBootstrap;
  loader?: AnalysisWorkspaceDataLoader;
};

export type AnalysisWorkspaceController = {
  activeInspectorPanel: AnalysisInspectorPanelKey;
  composerDraft: string;
  composerMode: AnalysisComposerMode;
  composerState: ComposerState;
  currentRun?: AnalysisRun;
  interactionMessage: string;
  isRunTraceDetailOpen: boolean;
  messages: AnalysisMessage[];
  modelOptions: readonly { key: string; label: string }[];
  onCloseRunTraceDetail: () => void;
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
  onOpenInspectorPanel: (panel: AnalysisInspectorPanelKey) => void;
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
  const [workspaceState, setWorkspaceState] = useState<AnalysisWorkspaceState>(() =>
    bootstrap.conversationId || bootstrap.runId
      ? {
          description: "正在读取 Conversation / AnalysisRun / delivery surfaces。",
          kind: "loading",
          title: "Loading analysis runtime"
        }
      : {
          description:
            "当前没有 conversationId 或 runId。请从带上下文入口进入 Analysis，或通过 URL 提供 bootstrap id。",
          kind: "empty",
          title: "No analysis runtime selected"
        }
  );
  const [workspaceViewModel, setWorkspaceViewModel] = useState<AnalysisWorkspaceViewModel | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [analysisDraft, setAnalysisDraft] = useState("");
  const [followUpDraft, setFollowUpDraft] = useState("");
  const [composerMode, setComposerMode] = useState<AnalysisComposerMode>("follow_up");
  const composerModeRef = useRef<AnalysisComposerMode>("follow_up");
  const [composerState, setComposerState] = useState<ComposerState>("idle");
  const [selectedModelKey, setSelectedModelKey] = useState<string>(defaultModelOptions[0].key);
  const [interactionMessage, setInteractionMessage] = useState("");
  const [activeInspectorPanel, setActiveInspectorPanel] =
    useState<AnalysisInspectorPanelKey>("run-trace");
  const [selectedRunEventId, setSelectedRunEventId] = useState<string | null>(null);
  const [isRunTraceDetailOpen, setIsRunTraceDetailOpen] = useState(false);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(null);
  const [selectedSourceEvidenceId, setSelectedSourceEvidenceId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!bootstrap.conversationId && !bootstrap.runId) {
        setWorkspaceState({
          description:
            "当前没有 conversationId 或 runId。请从带上下文入口进入 Analysis，或通过 URL 提供 bootstrap id。",
          kind: "empty",
          title: "No analysis runtime selected"
        });
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
  const selectedSession =
    sessions.find((session) => session.conversationId === selectedConversationId) ?? sessions[0];

  useEffect(() => {
    if (sessions.length === 0) {
      setSelectedConversationId(null);
      return;
    }

    setSelectedConversationId((currentConversationId) =>
      currentConversationId &&
      sessions.some((session) => session.conversationId === currentConversationId)
        ? currentConversationId
        : sessions[0]!.conversationId
    );
  }, [sessions]);

  useEffect(() => {
    if (!selectedSession) {
      setAnalysisDraft("");
      setFollowUpDraft("");
      setSelectedRunEventId(null);
      setSelectedToolCallId(null);
      setSelectedSourceEvidenceId(null);
      setSelectedReportId(null);
      return;
    }

    setAnalysisDraft(selectedSession.inputComposer.initialDraft);
    setFollowUpDraft(selectedSession.followUpComposer.initialDraft);
    setSelectedRunEventId(getFirstRunEventId(selectedSession));
    setSelectedToolCallId(selectedSession.toolDetails[0]?.toolCallId ?? null);
    setSelectedSourceEvidenceId(selectedSession.sourceEvidence[0]?.sourceEvidenceId ?? null);
    setSelectedReportId(selectedSession.reportPreview?.reportId ?? null);
  }, [selectedSession]);

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
  const modelOptions = workspaceViewModel?.modelOptions ?? defaultModelOptions;
  const selectedModelLabel =
    modelOptions.find((model) => model.key === selectedModelKey)?.label ?? modelOptions[0]?.label ?? "Default";

  return {
    activeInspectorPanel,
    composerDraft: getActiveDraft(analysisDraft, composerMode, followUpDraft),
    composerMode,
    composerState,
    currentRun: selectedSession?.currentRun,
    interactionMessage,
    isRunTraceDetailOpen,
    messages: selectedSession?.messages ?? [],
    modelOptions,
    onCloseRunTraceDetail: () => {
      setIsRunTraceDetailOpen(false);
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
    onOpenInspectorPanel: (panel) => {
      setActiveInspectorPanel(panel);
      setIsRunTraceDetailOpen(false);
    },
    onResetForNewAnalysis: () => {
      composerModeRef.current = "analysis";
      setComposerMode("analysis");
      setComposerState("idle");
      setAnalysisDraft("");
      setFollowUpDraft("");
      setInteractionMessage(
        createInteractionMessage(
          "当前 issue 只接 read surfaces；新建 Analysis write path 需要后续 issue 接入。"
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
      setActiveInspectorPanel("run-trace");
      setSelectedRunEventId(eventId);
      setIsRunTraceDetailOpen(true);
    },
    onSelectSession: (conversationId) => {
      const nextSession = sessions.find((session) => session.conversationId === conversationId);

      if (!nextSession) {
        return;
      }

      setSelectedConversationId(nextSession.conversationId);
      setComposerState("idle");
      setActiveInspectorPanel("run-trace");
      setIsRunTraceDetailOpen(false);
      setInteractionMessage(
        createInteractionMessage(`已切换到真实会话 ${nextSession.conversationId}。`)
      );
    },
    onSessionSearchChange: setSessionSearchQuery,
    onSubmitComposer: () => {
      setComposerState("idle");
      setInteractionMessage(
        createInteractionMessage("当前 issue 只接 read surfaces；Analysis write path 暂未实现。")
      );
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
