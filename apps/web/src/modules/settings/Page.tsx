import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { WebPageProps } from "../../shared/navigation/navigationTypes";

import { settingsStaticViewModel } from "./fixtures/settingsStaticViewModel";
import { SettingsSections } from "./sections/SettingsSections";

export function SettingsPage({ onNavigate }: WebPageProps) {
  return (
    <PageScaffold onNavigate={onNavigate} viewModel={settingsStaticViewModel}>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </PageScaffold>
  );
}
