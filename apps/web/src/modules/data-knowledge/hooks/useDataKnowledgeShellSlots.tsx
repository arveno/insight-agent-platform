import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";
import { DataKnowledgePageContent } from "../Page";
import { DataKnowledgeListNav } from "../navigation/DataKnowledgeListNav";
import { DataKnowledgeInspectorPanel } from "../panels/DataKnowledgeInspectorPanel";

import { useDataKnowledgeOverviewState } from "./useDataKnowledgeOverviewState";

export type UseDataKnowledgeShellSlotsParams = {
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  workspaceId?: string;
  workspaceName?: string;
};

export function useDataKnowledgeShellSlots({
  onBackToRoot,
  onNavigate,
  workspaceId,
  workspaceName
}: UseDataKnowledgeShellSlotsParams): ShellRegionSlots {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const controller = useDataKnowledgeOverviewState({
    workspaceId: workspaceId ?? currentWorkspaceBinding.workspaceId,
    workspaceName: workspaceName ?? currentWorkspaceBinding.workspaceName
  });

  return {
    leftNav: <DataKnowledgeListNav controller={controller} onBack={onBackToRoot} />,
    mainContent: <DataKnowledgePageContent controller={controller} onNavigate={onNavigate} />,
    rightAssistPanel: (
      <DataKnowledgeInspectorPanel controller={controller} onNavigate={onNavigate} />
    )
  };
}
