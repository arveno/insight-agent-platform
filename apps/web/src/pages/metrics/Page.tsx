import { useMetricsOverviewState } from "../../features/metrics/hooks/useMetricsOverviewState";
import { WebPageScaffold } from "../_shared/scaffold/WebPageScaffold";
import type { WebPageProps } from "../_shared/types";
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
