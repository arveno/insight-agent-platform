import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { settingsStaticViewModel } from "./fixtures/settingsStaticViewModel";
import { SettingsSections } from "./sections/SettingsSections";

export function SettingsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={settingsStaticViewModel}>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </WebPageScaffold>
  );
}
