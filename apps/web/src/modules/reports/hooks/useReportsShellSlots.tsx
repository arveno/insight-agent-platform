import type { ShellRegionSlots } from "../../../shared/layout/ShellRegionSlots";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import { ReportsPage } from "../Page";
import { ReportsListNav } from "../navigation/ReportsListNav";

import { useReportsReaderState } from "./useReportsReaderState";

export type UseReportsShellSlotsParams = {
  onBackToRoot: () => void;
  onNavigate?: NavigateToRoute;
};

export function useReportsShellSlots({
  onBackToRoot,
  onNavigate
}: UseReportsShellSlotsParams): ShellRegionSlots {
  const controller = useReportsReaderState();

  return {
    leftNav: <ReportsListNav controller={controller} onBack={onBackToRoot} />,
    mainContent: <ReportsPage onNavigate={onNavigate} reportsState={controller} />
  };
}
