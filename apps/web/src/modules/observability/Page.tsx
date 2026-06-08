import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { observabilityStaticViewModel } from "./fixtures/observabilityStaticViewModel";
import { ObservabilitySections } from "./sections/ObservabilitySections";

export function ObservabilityPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={observabilityStaticViewModel}>
      <ObservabilitySections onNavigate={onNavigate} viewModel={observabilityStaticViewModel} />
    </WebPageScaffold>
  );
}
