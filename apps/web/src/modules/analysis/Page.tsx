import { theme } from "antd";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useAnalysisConversationState,
  type AnalysisConversationController
} from "./hooks/useAnalysisConversationState";
import { AnalysisSections } from "./sections/AnalysisSections";

export type AnalysisPageContentProps = PageRouteProps & {
  conversationState: AnalysisConversationController;
};

export function AnalysisPageContent({
  conversationState
}: AnalysisPageContentProps) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        padding: token.paddingLG,
        width: "100%"
      }}
    >
      <div style={{ display: "flex", flex: "1 1 auto", minHeight: 0, minWidth: 0 }}>
        <AnalysisSections
          analysisDraft={conversationState.analysisDraft}
          composerState={conversationState.composerState}
          composerMode={conversationState.composerMode}
          followUpDraft={conversationState.followUpDraft}
          interactionMessage={conversationState.interactionMessage}
          onAnalysisDraftChange={conversationState.onAnalysisDraftChange}
          onAnalysisSubmit={conversationState.onAnalysisSubmit}
          onComposerAccessoryClick={conversationState.onComposerAccessoryClick}
          onFollowUpDraftChange={conversationState.onFollowUpDraftChange}
          onFollowUpSubmit={conversationState.onFollowUpSubmit}
          onComposerStop={conversationState.onComposerStop}
          onSelectModel={conversationState.onSelectModel}
          selectedModelKey={conversationState.selectedModelKey}
          selectedModelLabel={conversationState.selectedModelLabel}
          modelOptions={conversationState.modelOptions}
          selectedSession={conversationState.selectedSession}
        />
      </div>
    </div>
  );
}

export function AnalysisPage({ onNavigate }: PageRouteProps) {
  const conversationState = useAnalysisConversationState();

  return <AnalysisPageContent conversationState={conversationState} onNavigate={onNavigate} />;
}
