import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { observabilityStaticViewModel } from "./fixtures/observabilityStaticViewModel";
import { ObservabilitySections } from "./sections/ObservabilitySections";

export function ObservabilityPage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={observabilityStaticViewModel}>
      <ObservabilitySections onNavigate={onNavigate} viewModel={observabilityStaticViewModel} />
    </PageScaffold>
  );
}
