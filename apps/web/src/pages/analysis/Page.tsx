import { useState } from "react";

import { analysisStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { AnalysisSections } from "./sections";

const defaultSession = analysisStaticViewModel.sessions[0];

function findSession(sessionKey: string) {
  return (
    analysisStaticViewModel.sessions.find((session) => session.key === sessionKey) ?? defaultSession
  );
}

export function AnalysisPage({ onNavigate }: WebPageProps) {
  const [selectedSessionKey, setSelectedSessionKey] = useState(defaultSession.key);
  const [analysisDraft, setAnalysisDraft] = useState(defaultSession.inputComposer.initialDraft);
  const [followUpDraft, setFollowUpDraft] = useState(defaultSession.followUpComposer.initialDraft);
  const [feedbackValue, setFeedbackValue] = useState<string | undefined>(
    defaultSession.feedback.initialValue
  );
  const [interactionMessage, setInteractionMessage] = useState(
    "当前展示静态 Analysis 会话。页面交互只更新 UI State，不创建真实 Agent Run。"
  );
  const selectedSession = findSession(selectedSessionKey);

  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={analysisStaticViewModel}>
      <AnalysisSections
        analysisDraft={analysisDraft}
        feedbackValue={feedbackValue}
        followUpDraft={followUpDraft}
        interactionMessage={interactionMessage}
        onAnalysisDraftChange={setAnalysisDraft}
        onAnalysisSubmit={() => {
          setInteractionMessage("已记录当前分析问题草稿，不会创建真实 Agent Run 或发送真实请求。");
        }}
        onFeedbackChange={setFeedbackValue}
        onFeedbackSubmit={() => {
          if (!feedbackValue) {
            return;
          }

          setInteractionMessage("已记录本地反馈选择，不会写入 Feedback、Bad Case 或 Evaluation。");
        }}
        onFollowUpDraftChange={setFollowUpDraft}
        onFollowUpSubmit={() => {
          setInteractionMessage("已记录当前追问草稿，不会触发真实多轮分析、streaming 或轮询。");
        }}
        onSelectAnalysisSuggestion={(value) => {
          setAnalysisDraft(value);
          setInteractionMessage("已用建议问题更新草稿，仍停留在静态 Analysis UI。");
        }}
        onSelectFollowUpSuggestion={(value) => {
          setFollowUpDraft(value);
          setInteractionMessage("已用建议追问更新草稿，不会触发真实会话续跑。");
        }}
        onSelectSession={(sessionKey) => {
          const nextSession = findSession(sessionKey);

          setSelectedSessionKey(nextSession.key);
          setAnalysisDraft(nextSession.inputComposer.initialDraft);
          setFollowUpDraft(nextSession.followUpComposer.initialDraft);
          setFeedbackValue(nextSession.feedback.initialValue);
          setInteractionMessage(
            `已切换到「${nextSession.session.title}」静态会话；仅更新 UI State，不加载真实会话或运行数据。`
          );
        }}
        onNavigate={onNavigate}
        selectedSession={selectedSession}
        selectedSessionKey={selectedSessionKey}
        viewModel={analysisStaticViewModel}
      />
    </WebPageScaffold>
  );
}
