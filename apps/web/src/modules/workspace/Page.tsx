import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { workspaceStaticViewModel } from "./fixtures/workspaceStaticViewModel";
import { WorkspaceSections } from "./sections/WorkspaceSections";

export function WorkspacePage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={workspaceStaticViewModel}>
      <WorkspaceSections onNavigate={onNavigate} viewModel={workspaceStaticViewModel} />
    </PageScaffold>
  );
}
