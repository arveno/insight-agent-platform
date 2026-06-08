import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { observabilityStaticViewModel } from "./fixtures/observabilityStaticViewModel";
import { ObservabilitySections } from "./sections/ObservabilitySections";

export function ObservabilityPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <ObservabilitySections onNavigate={onNavigate} viewModel={observabilityStaticViewModel} />
    </ResponsivePageShell>
  );
}
