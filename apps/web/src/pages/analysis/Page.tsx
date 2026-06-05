import { useAnalysisConversationState, type AnalysisConversationController } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import { analysisStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { AnalysisSections } from "./sections";

export type AnalysisPageContentProps = WebPageProps & {
  conversationState: AnalysisConversationController;
};

export function AnalysisPageContent({
  conversationState,
  onNavigate
}: AnalysisPageContentProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={analysisStaticViewModel}>
      <AnalysisSections
        analysisDraft={conversationState.analysisDraft}
        followUpDraft={conversationState.followUpDraft}
        interactionMessage={conversationState.interactionMessage}
        onAnalysisDraftChange={conversationState.onAnalysisDraftChange}
        onAnalysisSubmit={conversationState.onAnalysisSubmit}
        onFollowUpDraftChange={conversationState.onFollowUpDraftChange}
        onFollowUpSubmit={conversationState.onFollowUpSubmit}
        onSelectAnalysisSuggestion={conversationState.onSelectAnalysisSuggestion}
        onSelectFollowUpSuggestion={conversationState.onSelectFollowUpSuggestion}
        onNavigate={onNavigate}
        selectedSession={conversationState.selectedSession}
        viewModel={analysisStaticViewModel}
      />
    </WebPageScaffold>
  );
}

export function AnalysisPage({ onNavigate }: WebPageProps) {
  const conversationState = useAnalysisConversationState();

  return <AnalysisPageContent conversationState={conversationState} onNavigate={onNavigate} />;
}
