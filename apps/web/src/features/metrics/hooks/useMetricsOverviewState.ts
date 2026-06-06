import { useEffect, useMemo, useState } from "react";

import {
  createMetricsViewModel,
  defaultMetricsWorkspaceBinding
} from "../fixtures";
import type { MetricsViewModel, MetricsWorkspaceBinding } from "../models";

const defaultSelectedMetricKey = createMetricsViewModel().selectedMetric.key;

function findMetricKey(viewModel: MetricsViewModel, metricKey: string) {
  return viewModel.metrics.find((metric) => metric.key === metricKey)?.key ?? defaultSelectedMetricKey;
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
  workspaceBinding: MetricsWorkspaceBinding = defaultMetricsWorkspaceBinding
): MetricsOverviewController {
  const [searchValue, setSearchValue] = useState("");
  const [selectedMetricKey, setSelectedMetricKey] = useState(defaultSelectedMetricKey);
  const viewModel = useMemo(
    () => createMetricsViewModel(selectedMetricKey, workspaceBinding),
    [selectedMetricKey, workspaceBinding]
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
  }, [workspaceBinding.workspaceId]);

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
