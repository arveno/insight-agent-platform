import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { modelToolsStaticViewModel } from "./fixtures/modelToolsStaticViewModel";
import { ModelToolsSections } from "./sections/ModelToolsSections";

export function ModelToolsPage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={modelToolsStaticViewModel}>
      <ModelToolsSections onNavigate={onNavigate} viewModel={modelToolsStaticViewModel} />
    </PageScaffold>
  );
}
