import { settingsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { SettingsSections } from "./sections";

export function SettingsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={settingsStaticViewModel}>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </WebPageScaffold>
  );
}
