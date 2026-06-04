import { metricsStaticViewModel } from "../../features/static-view-models";
import { WebPageScaffold, type WebPageProps } from "../_shared";
import { MetricsSections } from "./sections";

export function MetricsPage({ onNavigate }: WebPageProps) {
  return (
    <WebPageScaffold onNavigate={onNavigate} viewModel={metricsStaticViewModel}>
      <MetricsSections onNavigate={onNavigate} viewModel={metricsStaticViewModel} />
    </WebPageScaffold>
  );
}
