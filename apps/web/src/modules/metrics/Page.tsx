import { PageScaffold } from "../../shared/layout/containers/PageScaffold";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useMetricsOverviewState,
  type MetricsOverviewController
} from "./hooks/useMetricsOverviewState";
import { MetricsSections } from "./sections/MetricsSections";

export type MetricsPageProps = PageRouteProps & {
  metricsState?: MetricsOverviewController;
};

export function MetricsPage({ metricsState, onNavigate }: MetricsPageProps) {
  const fallbackMetricsState = useMetricsOverviewState();
  const controller = metricsState ?? fallbackMetricsState;

  return (
    <PageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </PageScaffold>
  );
}
