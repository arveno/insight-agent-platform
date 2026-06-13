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
  workspaceId
}: UseAnalysisShellSlotsParams): ShellRegionSlots {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.analysisContextPack,
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
        contextPanelNote={controller.selectedSession ? "Inspector roots are generated from the selected subject." : "Draft context is shown as a tree detail browser."}
        draftContext={controller.draftContext}
        inspectorTreeState={controller.inspectorTreeState}
        onPopInspectorPath={controller.onPopInspectorPath}
        onSelectInspectorNode={controller.onSelectInspectorNode}
        onSelectInspectorRoot={controller.onSelectInspectorRoot}
        selectedInspectorSubject={controller.selectedInspectorSubject}
        selectedSession={controller.selectedSession}
        workspaceState={controller.workspaceState}
      />
    )
  };
}
