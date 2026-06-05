import { useAnalysisConversationState, type AnalysisConversationController } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import { ResponsivePageShell } from "../../shared";
import { type WebPageProps } from "../_shared";
import { AnalysisSections } from "./sections";

export type AnalysisPageContentProps = WebPageProps & {
  conversationState: AnalysisConversationController;
};

export function AnalysisPageContent({
  conversationState,
}: AnalysisPageContentProps) {
  return (
    <ResponsivePageShell>
      <AnalysisSections
        analysisDraft={conversationState.analysisDraft}
        composerMode={conversationState.composerMode}
        followUpDraft={conversationState.followUpDraft}
        interactionMessage={conversationState.interactionMessage}
        onAnalysisDraftChange={conversationState.onAnalysisDraftChange}
        onAnalysisSubmit={conversationState.onAnalysisSubmit}
        onFollowUpDraftChange={conversationState.onFollowUpDraftChange}
        onFollowUpSubmit={conversationState.onFollowUpSubmit}
        onSelectAnalysisSuggestion={conversationState.onSelectAnalysisSuggestion}
        onSelectFollowUpSuggestion={conversationState.onSelectFollowUpSuggestion}
        selectedSession={conversationState.selectedSession}
      />
    </ResponsivePageShell>
  );
}

export function AnalysisPage({ onNavigate }: WebPageProps) {
  const conversationState = useAnalysisConversationState();

  return <AnalysisPageContent conversationState={conversationState} onNavigate={onNavigate} />;
}
