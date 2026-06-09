import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { settingsStaticViewModel } from "./fixtures/settingsStaticViewModel";
import { SettingsSections } from "./sections/SettingsSections";

export function SettingsPage({ onNavigate }: PageRouteProps) {
  return (
    <ResponsivePageShell>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </ResponsivePageShell>
  );
}
