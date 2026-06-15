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
};

export function useAnalysisShellSlots({
  businessDomainId,
  onBackToRoot,
  routeState
}: UseAnalysisShellSlotsParams): ShellRegionSlots {
  const controller = useAnalysisWorkspaceController({
    draftContext: routeState?.analysisContextPack,
    draftContextNodeDisplay: routeState?.analysisContextNodeDisplay,
    submitIdentity: {
      businessDomainId
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
        contextPanelNote={
          controller.selectedSession
            ? "点击消息后，右侧会显示对应的分析详情与上下文。"
            : "右侧会显示当前草稿将要附带的分析详情。"
        }
        contextNodeDisplay={controller.draftContextNodeDisplay}
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
