import { modelToolsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
import { ModelToolsSections } from "./sections/ModelToolsSections";

export function ModelToolsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={modelToolsStaticViewModel}>
      <ModelToolsSections onNavigate={onNavigate} viewModel={modelToolsStaticViewModel} />
    </WebPageScaffold>
  );
}
