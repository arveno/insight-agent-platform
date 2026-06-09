import { useMemo, useRef, useState } from "react";

import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
import type {
  AnalysisComposerMode,
  AnalysisInspectorPanelKey,
  AnalysisSessionViewModel
} from "../models/analysisViewModel";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";

const defaultSession = analysisStaticViewModel.sessions[0];

function findSession(conversationId: string): AnalysisSessionViewModel {
  return (
    analysisStaticViewModel.sessions.find((session) => session.conversationId === conversationId) ??
    defaultSession
  );
}

type ComposerState = "idle" | "running";

export type AnalysisWorkspaceController = {
  activeInspectorPanel: AnalysisInspectorPanelKey;
  composerDraft: string;
  composerMode: AnalysisComposerMode;
  composerState: ComposerState;
  currentRun: AnalysisRun;
  interactionMessage: string;
  isRunTraceDetailOpen: boolean;
  messages: AnalysisMessage[];
  modelOptions: typeof analysisStaticViewModel.modelOptions;
  onCloseRunTraceDetail: () => void;
  onComposerAccessoryClick: () => void;
  onComposerDraftChange: (value: string) => void;
  onComposerModeChange: (mode: AnalysisComposerMode) => void;
  onComposerStop: () => void;
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
  selectedSession: AnalysisSessionViewModel;
  selectedConversationId: string;
  selectedSourceEvidenceId: string | null;
  selectedToolCallId: string | null;
  sessionSearchQuery: string;
  sessions: AnalysisSessionViewModel[];
  visibleSessions: AnalysisSessionViewModel[];
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

function getFirstRunEventId(session: AnalysisSessionViewModel): string | null {
  return session.runEvents[0]?.eventId ?? null;
}

export function useAnalysisWorkspaceController(): AnalysisWorkspaceController {
  const [selectedConversationId, setSelectedConversationId] = useState(
    defaultSession.conversationId
  );
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [analysisDraft, setAnalysisDraft] = useState(defaultSession.inputComposer.initialDraft);
  const [followUpDraft, setFollowUpDraft] = useState(defaultSession.followUpComposer.initialDraft);
  const [composerMode, setComposerMode] = useState<AnalysisComposerMode>("follow_up");
  const composerModeRef = useRef<AnalysisComposerMode>("follow_up");
  const [composerState, setComposerState] = useState<ComposerState>("idle");
  const [selectedModelKey, setSelectedModelKey] = useState(
    analysisStaticViewModel.modelOptions[0].key
  );
  const [interactionMessage, setInteractionMessage] = useState("");
  const [activeInspectorPanel, setActiveInspectorPanel] =
    useState<AnalysisInspectorPanelKey>("run-trace");
  const [selectedRunEventId, setSelectedRunEventId] = useState<string | null>(
    getFirstRunEventId(defaultSession)
  );
  const [isRunTraceDetailOpen, setIsRunTraceDetailOpen] = useState(false);
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(
    defaultSession.toolDetails[0]?.toolCallId ?? null
  );
  const [selectedSourceEvidenceId, setSelectedSourceEvidenceId] = useState<string | null>(
    defaultSession.sourceEvidence[0]?.sourceEvidenceId ?? null
  );
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    defaultSession.reportPreview?.reportId ?? null
  );
  const selectedSession = findSession(selectedConversationId);
  const visibleSessions = useMemo(() => {
    const normalizedQuery = sessionSearchQuery.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return analysisStaticViewModel.sessions;
    }

    return analysisStaticViewModel.sessions.filter((session) =>
      session.sessionSummary.title.toLowerCase().includes(normalizedQuery)
    );
  }, [sessionSearchQuery]);
  const selectedRunEvent = useMemo(
    () =>
      selectedSession.runEvents.find((event) => event.eventId === selectedRunEventId) ??
      selectedSession.runEvents[0],
    [selectedRunEventId, selectedSession.runEvents]
  );
  const selectedModelLabel =
    analysisStaticViewModel.modelOptions.find((model) => model.key === selectedModelKey)?.label ??
    analysisStaticViewModel.modelOptions[0].label;

  return {
    activeInspectorPanel,
    composerDraft: getActiveDraft(analysisDraft, composerMode, followUpDraft),
    composerMode,
    composerState,
    currentRun: selectedSession.currentRun,
    interactionMessage,
    isRunTraceDetailOpen,
    messages: selectedSession.messages,
    modelOptions: analysisStaticViewModel.modelOptions,
    onCloseRunTraceDetail: () => {
      setIsRunTraceDetailOpen(false);
    },
    onComposerAccessoryClick: () => {
      setInteractionMessage(
        createInteractionMessage("工具与附件入口当前只做静态占位，不会打开真实上传或工具面板。")
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
        createInteractionMessage("已停止本地模拟生成，不会触发真实 streaming cancel 或后端中断。")
      );
    },
    onResetForNewAnalysis: () => {
      setSelectedConversationId(defaultSession.conversationId);
      setSessionSearchQuery("");
      setAnalysisDraft(defaultSession.inputComposer.initialDraft);
      setFollowUpDraft("");
      composerModeRef.current = "analysis";
      setComposerMode("analysis");
      setComposerState("idle");
      setActiveInspectorPanel("run-trace");
      setSelectedRunEventId(getFirstRunEventId(defaultSession));
      setIsRunTraceDetailOpen(false);
      setSelectedToolCallId(defaultSession.toolDetails[0]?.toolCallId ?? null);
      setSelectedSourceEvidenceId(defaultSession.sourceEvidence[0]?.sourceEvidenceId ?? null);
      setSelectedReportId(defaultSession.reportPreview?.reportId ?? null);
      setInteractionMessage(
        createInteractionMessage(
          "已准备新的静态分析入口，仍只更新本地 UI State，不创建真实会话或触发 Agent。"
        )
      );
    },
    onSelectModel: (key) => {
      const nextModel = analysisStaticViewModel.modelOptions.find((model) => model.key === key);

      if (!nextModel) {
        return;
      }

      setSelectedModelKey(nextModel.key);
      setInteractionMessage(
        createInteractionMessage(
          `已切换本地模型选项为 ${nextModel.label}，不触发真实 Model Gateway。`
        )
      );
    },
    onSelectRunEvent: (eventId) => {
      setActiveInspectorPanel("run-trace");
      setSelectedRunEventId(eventId);
      setIsRunTraceDetailOpen(true);
    },
    onSelectSession: (conversationId) => {
      const nextSession = findSession(conversationId);

      setSelectedConversationId(nextSession.conversationId);
      setAnalysisDraft(nextSession.inputComposer.initialDraft);
      setFollowUpDraft(nextSession.followUpComposer.initialDraft);
      composerModeRef.current = "follow_up";
      setComposerMode("follow_up");
      setComposerState("idle");
      setActiveInspectorPanel("run-trace");
      setSelectedRunEventId(getFirstRunEventId(nextSession));
      setIsRunTraceDetailOpen(false);
      setSelectedToolCallId(nextSession.toolDetails[0]?.toolCallId ?? null);
      setSelectedSourceEvidenceId(nextSession.sourceEvidence[0]?.sourceEvidenceId ?? null);
      setSelectedReportId(nextSession.reportPreview?.reportId ?? null);
      setInteractionMessage(
        createInteractionMessage(
          `已切换到「${nextSession.sessionSummary.title}」静态会话；仅更新 UI State，不加载真实会话或运行数据。`
        )
      );
    },
    onSessionSearchChange: setSessionSearchQuery,
    onSubmitComposer: () => {
      setComposerState("running");
      setInteractionMessage(
        createInteractionMessage("已切换到本地模拟生成中，不会创建真实 Agent Run 或发送真实请求。")
      );
    },
    runEvents: selectedSession.runEvents,
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
    sessions: analysisStaticViewModel.sessions,
    visibleSessions
  };
}
