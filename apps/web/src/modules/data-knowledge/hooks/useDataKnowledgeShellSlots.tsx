import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import { DataKnowledgePage } from "../Page";
import { defaultDataKnowledgeWorkspaceBinding } from "../fixtures/dataKnowledgeStaticViewModel";
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
  workspaceId = defaultDataKnowledgeWorkspaceBinding.workspaceId,
  workspaceName = defaultDataKnowledgeWorkspaceBinding.workspaceName
}: UseDataKnowledgeShellSlotsParams): ShellRegionSlots {
  const controller = useDataKnowledgeOverviewState({
    workspaceId,
    workspaceName
  });

  return {
    leftNav: <DataKnowledgeListNav controller={controller} onBack={onBackToRoot} />,
    mainContent: <DataKnowledgePage dataKnowledgeState={controller} onNavigate={onNavigate} />,
    rightAssistPanel: (
      <DataKnowledgeInspectorPanel controller={controller} onNavigate={onNavigate} />
    )
  };
}
