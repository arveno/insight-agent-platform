import { findRuntimeMetric, runtimeMetricsFixtures } from "../../../shared/test/fixtures/runtimeMetrics";
import type { MetricsViewModel, MetricsWorkspaceBinding } from "../models/metricsViewModel";
import { createMetricsViewModel as createSharedMetricsViewModel } from "../mappers/createMetricsViewModel";

export const defaultMetricsWorkspaceBinding: MetricsWorkspaceBinding = {
  workspaceId: "workspace-northstar-retail-china",
  workspaceName: "Northstar Retail China"
};

export function createMetricsViewModel(
  selectedMetricKey = "metric-recognized-revenue",
  workspaceBinding = defaultMetricsWorkspaceBinding
): MetricsViewModel {
  return createSharedMetricsViewModel({
    metrics: runtimeMetricsFixtures,
    selectedMetric: findRuntimeMetric(selectedMetricKey),
    workspaceBinding
  });
}

export const metricsStaticViewModel = createMetricsViewModel();
