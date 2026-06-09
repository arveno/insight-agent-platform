import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import { AnalysisWorkspace } from "../components/AnalysisWorkspace";
import { AnalysisSessionNav } from "../navigation/AnalysisSessionNav";
import { AnalysisInspectorPanel } from "../panels/AnalysisInspectorPanel";

import { useAnalysisWorkspaceController } from "./useAnalysisWorkspaceController";

export type UseAnalysisShellSlotsParams = {
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  workspaceName: string;
};

export function useAnalysisShellSlots({
  onBackToRoot,
  workspaceName
}: UseAnalysisShellSlotsParams): ShellRegionSlots {
  const controller = useAnalysisWorkspaceController();

  return {
    leftNav: (
      <AnalysisSessionNav
        onBack={onBackToRoot}
        onCreateNewAnalysis={controller.onResetForNewAnalysis}
        onSearchChange={controller.onSessionSearchChange}
        onSelectSession={controller.onSelectSession}
        searchValue={controller.sessionSearchQuery}
        selectedSessionId={controller.selectedSessionId}
        sessions={controller.visibleSessions}
      />
    ),
    mainContent: <AnalysisWorkspace controller={controller} />,
    rightAssistPanel: (
      <AnalysisInspectorPanel
        activeInspectorPanel={controller.activeInspectorPanel}
        currentRun={controller.currentRun}
        isRunTraceDetailOpen={controller.isRunTraceDetailOpen}
        onCloseRunTraceDetail={controller.onCloseRunTraceDetail}
        onSelectRunEvent={controller.onSelectRunEvent}
        runEvents={controller.runEvents}
        selectedRunEvent={controller.selectedRunEvent}
        selectedRunEventId={controller.selectedRunEventId}
        workspaceName={workspaceName}
      />
    )
  };
}
