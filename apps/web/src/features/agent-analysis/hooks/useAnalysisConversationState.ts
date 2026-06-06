import { useState } from "react";

import { analysisStaticViewModel } from "../fixtures/analysisStaticViewModel";
import type { AnalysisViewModel } from "../models/analysisViewModel";

const defaultSession = analysisStaticViewModel.sessions[0];
const analysisComposerModels = [
  { key: "default", label: "Default" },
  { key: "reasoning", label: "Reasoning" },
  { key: "fast", label: "Fast" }
] as const;

function findSession(
  sessionKey: string
): AnalysisViewModel["sessions"][number] {
  return (
    analysisStaticViewModel.sessions.find((session) => session.key === sessionKey) ?? defaultSession
  );
}

export type AnalysisConversationController = {
  analysisDraft: string;
  composerState: "idle" | "running";
  composerMode: "analysis" | "follow_up";
  followUpDraft: string;
  interactionMessage: string;
  modelOptions: readonly { key: string; label: string }[];
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onComposerAccessoryClick: () => void;
  onComposerModeChange: (mode: "analysis" | "follow_up") => void;
  onComposerStop: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onResetForNewAnalysis: () => void;
  onSelectModel: (key: string) => void;
  onSelectAnalysisSuggestion: (value: string) => void;
  onSelectFollowUpSuggestion: (value: string) => void;
  selectedModelKey: string;
  selectedModelLabel: string;
  onSelectSession: (key: string) => void;
  selectedSession: AnalysisViewModel["sessions"][number];
  selectedSessionKey: string;
};

export function useAnalysisConversationState(): AnalysisConversationController {
  const [selectedSessionKey, setSelectedSessionKey] = useState(defaultSession.key);
  const [analysisDraft, setAnalysisDraft] = useState(defaultSession.inputComposer.initialDraft);
  const [composerState, setComposerState] = useState<"idle" | "running">("idle");
  const [composerMode, setComposerMode] = useState<"analysis" | "follow_up">("follow_up");
  const [followUpDraft, setFollowUpDraft] = useState(defaultSession.followUpComposer.initialDraft);
  const [selectedModelKey, setSelectedModelKey] = useState<string>(analysisComposerModels[0].key);
  const [interactionMessage, setInteractionMessage] = useState("");
  const selectedSession = findSession(selectedSessionKey);
  const selectedModelLabel =
    analysisComposerModels.find((model) => model.key === selectedModelKey)?.label ??
    analysisComposerModels[0].label;

  return {
    analysisDraft,
    composerState,
    composerMode,
    followUpDraft,
    interactionMessage,
    modelOptions: analysisComposerModels,
    onAnalysisDraftChange: setAnalysisDraft,
    onAnalysisSubmit: () => {
      setComposerState("running");
      setInteractionMessage("已切换到本地模拟生成中，不会创建真实 Agent Run 或发送真实请求。");
      setComposerMode("follow_up");
    },
    onComposerAccessoryClick: () => {
      setInteractionMessage("工具与附件入口当前只做静态占位，不会打开真实上传或工具面板。");
    },
    onComposerModeChange: setComposerMode,
    onComposerStop: () => {
      setComposerState("idle");
      setInteractionMessage("已停止本地模拟生成，不会触发真实 streaming cancel 或后端中断。");
    },
    onFollowUpDraftChange: setFollowUpDraft,
    onFollowUpSubmit: () => {
      setComposerState("running");
      setInteractionMessage("已切换到本地模拟生成中，不会触发真实多轮分析、streaming 或轮询。");
      setComposerMode("follow_up");
    },
    onResetForNewAnalysis: () => {
      setSelectedSessionKey(defaultSession.key);
      setAnalysisDraft(defaultSession.inputComposer.initialDraft);
      setComposerState("idle");
      setFollowUpDraft("");
      setComposerMode("analysis");
      setInteractionMessage(
        "已准备新的静态分析入口，仍只更新本地 UI State，不创建真实会话或触发 Agent。"
      );
    },
    onSelectModel: (key) => {
      const matchedModel = analysisComposerModels.find((model) => model.key === key);

      if (!matchedModel) {
        return;
      }

      setSelectedModelKey(matchedModel.key);
      setInteractionMessage(`已切换本地模型选项为 ${matchedModel.label}，不触发真实 Model Gateway。`);
    },
    onSelectAnalysisSuggestion: (value) => {
      setAnalysisDraft(value);
      setComposerState("idle");
      setComposerMode("analysis");
      setInteractionMessage("已用建议问题更新草稿，仍停留在静态 Analysis UI。");
    },
    onSelectFollowUpSuggestion: (value) => {
      setFollowUpDraft(value);
      setComposerState("idle");
      setComposerMode("follow_up");
      setInteractionMessage("已用建议追问更新草稿，不会触发真实会话续跑。");
    },
    onSelectSession: (sessionKey) => {
      const nextSession = findSession(sessionKey);

      setSelectedSessionKey(nextSession.key);
      setAnalysisDraft(nextSession.inputComposer.initialDraft);
      setComposerState("idle");
      setFollowUpDraft(nextSession.followUpComposer.initialDraft);
      setComposerMode("follow_up");
      setInteractionMessage(
        `已切换到「${nextSession.session.title}」静态会话；仅更新 UI State，不加载真实会话或运行数据。`
      );
    },
    selectedModelKey,
    selectedModelLabel,
    selectedSession,
    selectedSessionKey
  };
}
