import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { settingsStaticViewModel } from "./fixtures/settingsStaticViewModel";
import { SettingsSections } from "./sections/SettingsSections";

export function SettingsPage({ onNavigate }: PageRouteProps) {
  return (
    <PageScaffold hideHeader onNavigate={onNavigate} viewModel={settingsStaticViewModel}>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </PageScaffold>
  );
}
