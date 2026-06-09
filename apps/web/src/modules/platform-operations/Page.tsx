import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { usePlatformOperationsOverviewState } from "./hooks/usePlatformOperationsOverviewState";
import { PlatformOperationsSections } from "./sections/PlatformOperationsSections";

export function PlatformOperationsPage({ onNavigate }: PageRouteProps) {
  const fallbackPlatformOperationsState = usePlatformOperationsOverviewState();

  return (
    <ResponsivePageShell>
      <PlatformOperationsSections
        controller={fallbackPlatformOperationsState}
        onNavigate={onNavigate}
      />
    </ResponsivePageShell>
  );
}
