import { settingsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { SettingsSections } from "./sections/SettingsSections";

export function SettingsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={settingsStaticViewModel}>
      <SettingsSections onNavigate={onNavigate} viewModel={settingsStaticViewModel} />
    </WebPageScaffold>
  );
}
