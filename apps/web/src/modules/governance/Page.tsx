import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { governanceStaticViewModel } from "./fixtures/governanceStaticViewModel";
import { GovernanceSections } from "./sections/GovernanceSections";

export function GovernancePage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <GovernanceSections onNavigate={onNavigate} viewModel={governanceStaticViewModel} />
    </ResponsivePageShell>
  );
}
