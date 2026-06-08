import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { governanceStaticViewModel } from "./fixtures/governanceStaticViewModel";
import { GovernanceSections } from "./sections/GovernanceSections";

export function GovernancePage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={governanceStaticViewModel}>
      <GovernanceSections onNavigate={onNavigate} viewModel={governanceStaticViewModel} />
    </PageScaffold>
  );
}
