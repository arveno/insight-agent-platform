import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { modelToolsStaticViewModel } from "./fixtures/modelToolsStaticViewModel";
import { ModelToolsSections } from "./sections/ModelToolsSections";

export function ModelToolsPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <ModelToolsSections onNavigate={onNavigate} viewModel={modelToolsStaticViewModel} />
    </ResponsivePageShell>
  );
}
