import type { AppRouteState, NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import { AnalysisWorkspace } from "../components/AnalysisWorkspace";
import { AnalysisSessionNav } from "../navigation/AnalysisSessionNav";
import { AnalysisInspectorPanel } from "../panels/AnalysisInspectorPanel";

import { useAnalysisWorkspaceController } from "./useAnalysisWorkspaceController";

export type UseAnalysisShellSlotsParams = {
  businessDomainId: string;
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  routeState?: AppRouteState;
  userId: string;
  workspaceId: string;
  workspaceName: string;
};

export function useAnalysisShellSlots({
  businessDomainId,
  onBackToRoot,
  routeState,
  userId,
  workspaceId,
  workspaceName
}: UseAnalysisShellSlotsParams): ShellRegionSlots {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.draftContextPack,
    submitIdentity: {
      businessDomainId,
      userId,
      workspaceId
    }
  });

  return {
    leftNav: (
      <AnalysisSessionNav
        onBack={onBackToRoot}
        onCreateNewAnalysis={controller.onResetForNewAnalysis}
        onSearchChange={controller.onSessionSearchChange}
        onSelectSession={controller.onSelectSession}
        searchValue={controller.sessionSearchQuery}
        selectedConversationId={controller.selectedConversationId}
        sessions={controller.visibleSessions}
      />
    ),
    mainContent: <AnalysisWorkspace controller={controller} />,
    rightAssistPanel: (
      <AnalysisInspectorPanel
        activeInspectorRoute={controller.activeInspectorRoute}
        canGoBackInInspector={controller.canGoBackInInspector}
        currentRun={controller.currentRun}
        decisions={controller.selectedSession?.decisions ?? []}
        decisionsState={controller.selectedSession?.decisionsState ?? "empty"}
        draftContext={controller.draftContext}
        messageStream={controller.selectedSession?.messageStream}
        messageStreamState={controller.selectedSession?.messageStreamState ?? "empty"}
        modelDetails={controller.selectedSession?.modelDetails ?? []}
        modelDetailsState={controller.selectedSession?.modelDetailsState ?? "empty"}
        onBackInspector={controller.onBackInspector}
        onNavigateInspectorRoute={controller.onNavigateInspectorRoute}
        onSelectRunEvent={controller.onSelectRunEvent}
        reportPreview={controller.selectedSession?.reportPreview}
        reportPreviewState={controller.selectedSession?.reportPreviewState ?? "empty"}
        runEvents={controller.runEvents}
        selectedRunEvent={controller.selectedRunEvent}
        selectedRunEventId={controller.selectedRunEventId}
        sourceEvidence={controller.selectedSession?.sourceEvidence ?? []}
        sourceEvidenceState={controller.selectedSession?.sourceEvidenceState ?? "empty"}
        toolDetails={controller.selectedSession?.toolDetails ?? []}
        toolDetailsState={controller.selectedSession?.toolDetailsState ?? "empty"}
        workspaceName={workspaceName}
      />
    )
  };
}
