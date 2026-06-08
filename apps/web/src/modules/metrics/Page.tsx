import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
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
    <ResponsivePageShell>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </ResponsivePageShell>
  );
}
