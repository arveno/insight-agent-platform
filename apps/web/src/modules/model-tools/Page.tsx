import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { modelToolsStaticViewModel } from "./fixtures/modelToolsStaticViewModel";
import { ModelToolsSections } from "./sections/ModelToolsSections";

export function ModelToolsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={modelToolsStaticViewModel}>
      <ModelToolsSections onNavigate={onNavigate} viewModel={modelToolsStaticViewModel} />
    </WebPageScaffold>
  );
}
