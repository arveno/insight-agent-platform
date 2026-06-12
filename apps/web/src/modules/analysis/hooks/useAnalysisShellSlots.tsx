import type { AppRouteState, NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import { AnalysisWorkspace } from "../components/AnalysisWorkspace";
import { AnalysisSessionNav } from "../navigation/AnalysisSessionNav";
import { AnalysisInspectorPanel } from "../panels/AnalysisInspectorPanel";

import { useAnalysisWorkspaceController } from "./useAnalysisWorkspaceController";

export type UseAnalysisShellSlotsParams = {
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  routeState?: AppRouteState;
  workspaceName: string;
};

export function useAnalysisShellSlots({
  onBackToRoot,
  routeState,
  workspaceName
}: UseAnalysisShellSlotsParams): ShellRegionSlots {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.draftContextPack
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
        activeInspectorPanel={controller.activeInspectorPanel}
        currentRun={controller.currentRun}
        decisions={controller.selectedSession?.decisions ?? []}
        decisionsState={controller.selectedSession?.decisionsState ?? "empty"}
        draftContext={controller.draftContext}
        isRunTraceDetailOpen={controller.isRunTraceDetailOpen}
        messageStream={controller.selectedSession?.messageStream}
        messageStreamState={controller.selectedSession?.messageStreamState ?? "empty"}
        modelDetails={controller.selectedSession?.modelDetails ?? []}
        modelDetailsState={controller.selectedSession?.modelDetailsState ?? "empty"}
        onCloseRunTraceDetail={controller.onCloseRunTraceDetail}
        onOpenInspectorPanel={controller.onOpenInspectorPanel}
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
