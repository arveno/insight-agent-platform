import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import { MetricsPageContent } from "../Page";
import { defaultMetricsWorkspaceBinding } from "../fixtures/metricsStaticViewModel";
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
  workspaceId = defaultMetricsWorkspaceBinding.workspaceId,
  workspaceName = defaultMetricsWorkspaceBinding.workspaceName
}: UseMetricsShellSlotsParams): ShellRegionSlots {
  const controller = useMetricsOverviewState({
    workspaceId,
    workspaceName
  });

  return {
    leftNav: <MetricsListNav controller={controller} onBack={onBackToRoot} />,
    mainContent: <MetricsPageContent controller={controller} onNavigate={onNavigate} />
  };
}
