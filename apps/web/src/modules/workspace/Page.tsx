import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { workspaceStaticViewModel } from "./fixtures/workspaceStaticViewModel";
import { WorkspaceSections } from "./sections/WorkspaceSections";

export function WorkspacePage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <WorkspaceSections onNavigate={onNavigate} viewModel={workspaceStaticViewModel} />
    </ResponsivePageShell>
  );
}
