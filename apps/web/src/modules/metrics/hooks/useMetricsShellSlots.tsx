import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";
import { MetricsPageContent } from "../Page";
import { MetricsListNav } from "../navigation/MetricsListNav";

import { useMetricsOverviewState } from "./useMetricsOverviewState";

export type UseMetricsShellSlotsParams = {
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
  workspaceId?: string;
  workspaceName?: string;
};

export function useMetricsShellSlots({
  onBackToRoot,
  onNavigate,
  workspaceId,
  workspaceName
}: UseMetricsShellSlotsParams): ShellRegionSlots {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const controller = useMetricsOverviewState({
    workspaceId: workspaceId ?? currentWorkspaceBinding.workspaceId,
    workspaceName: workspaceName ?? currentWorkspaceBinding.workspaceName
  });

  return {
    leftNav: <MetricsListNav controller={controller} onBack={onBackToRoot} />,
    mainContent: <MetricsPageContent controller={controller} onNavigate={onNavigate} />
  };
}
