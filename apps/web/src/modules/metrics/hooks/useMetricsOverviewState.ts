import { useEffect, useMemo, useState } from "react";

import { createMetricsViewModel } from "../fixtures/metricsStaticViewModel";
import type { MetricsViewModel, MetricsWorkspaceBinding } from "../models/metricsViewModel";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";

const defaultSelectedMetricKey = createMetricsViewModel().selectedMetric.key;

function findMetricKey(viewModel: MetricsViewModel, metricKey: string) {
  return (
    viewModel.metrics.find((metric) => metric.key === metricKey)?.key ?? defaultSelectedMetricKey
  );
}

export type MetricsOverviewController = {
  filteredMetrics: MetricsViewModel["metrics"];
  onSearchChange: (value: string) => void;
  onSelectMetric: (key: string) => void;
  searchValue: string;
  selectedMetricKey: string;
  viewModel: MetricsViewModel;
};

export function useMetricsOverviewState(
  workspaceBinding?: MetricsWorkspaceBinding
): MetricsOverviewController {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const resolvedWorkspaceBinding = workspaceBinding ?? currentWorkspaceBinding;
  const [searchValue, setSearchValue] = useState("");
  const [selectedMetricKey, setSelectedMetricKey] = useState(defaultSelectedMetricKey);
  const viewModel = useMemo(
    () => createMetricsViewModel(selectedMetricKey, resolvedWorkspaceBinding),
    [resolvedWorkspaceBinding, selectedMetricKey]
  );
  const filteredMetrics = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return viewModel.metrics;
    }

    return viewModel.metrics.filter((metric) =>
      metric.metricName.toLowerCase().includes(normalizedQuery)
    );
  }, [searchValue, viewModel.metrics]);

  useEffect(() => {
    setSearchValue("");
    setSelectedMetricKey(defaultSelectedMetricKey);
  }, [resolvedWorkspaceBinding.workspaceId]);

  return {
    filteredMetrics,
    onSearchChange: setSearchValue,
    onSelectMetric: (key) => {
      setSelectedMetricKey(findMetricKey(viewModel, key));
    },
    searchValue,
    selectedMetricKey,
    viewModel
  };
}
