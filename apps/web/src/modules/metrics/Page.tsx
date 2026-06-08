import { WebPageScaffold } from "../../app/shell/WebPageScaffold";
import type { WebPageProps } from "../../app/router/pageProps";

import { useMetricsOverviewState } from "./hooks/useMetricsOverviewState";
import { MetricsSections } from "./sections/MetricsSections";

export function MetricsPage({ metricsState, onNavigate }: WebPageProps) {
  const fallbackMetricsState = useMetricsOverviewState();
  const controller = metricsState ?? fallbackMetricsState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </WebPageScaffold>
  );
}
