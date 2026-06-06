import { useMetricsOverviewState } from "../../features/metrics/hooks";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { MetricsSections } from "./sections";

export function MetricsPage({ metricsState, onNavigate }: WebPageProps) {
  const fallbackMetricsState = useMetricsOverviewState();
  const controller = metricsState ?? fallbackMetricsState;

  return (
    <WebPageScaffold hideHeaderActions onNavigate={onNavigate} viewModel={controller.viewModel}>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </WebPageScaffold>
  );
}
