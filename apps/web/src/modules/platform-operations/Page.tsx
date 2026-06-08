import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  usePlatformOperationsOverviewState,
  type PlatformOperationsOverviewController
} from "./hooks/usePlatformOperationsOverviewState";
import { PlatformOperationsSections } from "./sections/PlatformOperationsSections";

export type PlatformOperationsPageProps = PageRouteProps & {
  platformOperationsState?: PlatformOperationsOverviewController;
};

export function PlatformOperationsPage({
  onNavigate,
  platformOperationsState
}: PlatformOperationsPageProps) {
  const fallbackPlatformOperationsState = usePlatformOperationsOverviewState();
  const controller = platformOperationsState ?? fallbackPlatformOperationsState;

  return (
    <ResponsivePageShell>
      <PlatformOperationsSections controller={controller} onNavigate={onNavigate} />
    </ResponsivePageShell>
  );
}
