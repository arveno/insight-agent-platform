import { modelToolsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { ModelToolsSections } from "./sections";

export function ModelToolsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={modelToolsStaticViewModel}>
      <ModelToolsSections onNavigate={onNavigate} viewModel={modelToolsStaticViewModel} />
    </WebPageScaffold>
  );
}
