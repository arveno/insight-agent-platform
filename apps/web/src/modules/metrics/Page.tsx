import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useMetricsOverviewState,
  type MetricsOverviewController
} from "./hooks/useMetricsOverviewState";
import { MetricsSections } from "./sections/MetricsSections";

export type MetricsPageContentProps = PageRouteProps & {
  controller: MetricsOverviewController;
};

export function MetricsPage({ onNavigate }: PageRouteProps) {
  const controller = useMetricsOverviewState();

  return <MetricsPageContent controller={controller} onNavigate={onNavigate} />;
}

export function MetricsPageContent({ controller, onNavigate }: MetricsPageContentProps) {
  return (
    <ResponsivePageShell>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </ResponsivePageShell>
  );
}
