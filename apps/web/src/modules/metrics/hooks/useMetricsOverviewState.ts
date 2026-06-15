import { useEffect, useMemo, useState } from "react";
import type { Metric } from "@insight-agent/contracts/generated/typescript";

import {
  loadWorkspaceMetric,
  loadWorkspaceMetrics
} from "../../../api/adapters/loadWorkspaceMetrics";
import type { MetricsViewModel, MetricsWorkspaceBinding } from "../models/metricsViewModel";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";
import {
  createMetricListItems,
  createMetricsViewModel
} from "../mappers/createMetricsViewModel";

type MetricsLoaderSet = {
  metricLoader?: (metricId: string) => Promise<Metric>;
  metricsLoader?: () => Promise<Metric[]>;
};

function findMetricKey(metrics: Metric[], metricKey: string) {
  return metrics.find((metric) => metric.metricId === metricKey)?.metricId ?? metrics[0]?.metricId ?? null;
}

export type MetricsOverviewController = {
  errorMessage?: string;
  filteredMetrics: ReturnType<typeof createMetricListItems>;
  onSearchChange: (value: string) => void;
  onSelectMetric: (key: string) => void;
  searchValue: string;
  selectedMetricKey: string | null;
  state: "error" | "loading" | "ready";
  viewModel: MetricsViewModel | null;
};

export function useMetricsOverviewState(
  workspaceBinding?: MetricsWorkspaceBinding,
  loaders: MetricsLoaderSet = {}
): MetricsOverviewController {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const resolvedWorkspaceBinding = workspaceBinding ?? currentWorkspaceBinding;
  const metricsLoader = loaders.metricsLoader ?? loadWorkspaceMetrics;
  const metricLoader = loaders.metricLoader ?? loadWorkspaceMetric;
  const [searchValue, setSearchValue] = useState("");
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [selectedMetricKey, setSelectedMetricKey] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [state, setState] = useState<"error" | "loading" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [hasLoadedMetricsList, setHasLoadedMetricsList] = useState(false);
  const viewModel = useMemo(
    () =>
      selectedMetric
        ? createMetricsViewModel({
            metrics,
            selectedMetric,
            workspaceBinding: resolvedWorkspaceBinding
          })
        : null,
    [metrics, resolvedWorkspaceBinding, selectedMetric]
  );
  const metricItems = useMemo(() => createMetricListItems(metrics), [metrics]);
  const filteredMetrics = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return metricItems;
    }

    return metricItems.filter((metric) =>
      metric.metricName.toLowerCase().includes(normalizedQuery)
    );
  }, [metricItems, searchValue]);

  useEffect(() => {
    setSearchValue("");
    setMetrics([]);
    setSelectedMetric(null);
    setSelectedMetricKey(null);
    setErrorMessage(undefined);
    setHasLoadedMetricsList(false);
    setState("loading");

    let cancelled = false;

    void metricsLoader()
      .then((nextMetrics) => {
        if (cancelled) {
          return;
        }

        setMetrics(nextMetrics);
        setSelectedMetricKey(nextMetrics[0]?.metricId ?? null);
        setHasLoadedMetricsList(true);
        if (nextMetrics.length === 0) {
          setState("ready");
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState("error");
        setErrorMessage("暂时无法加载当前 Workspace 的共享指标。");
      });

    return () => {
      cancelled = true;
    };
  }, [metricsLoader, resolvedWorkspaceBinding.workspaceId]);

  useEffect(() => {
    if (!hasLoadedMetricsList) {
      return;
    }

    if (!selectedMetricKey) {
      setSelectedMetric(null);
      setState("ready");
      return;
    }

    let cancelled = false;
    setState("loading");

    void metricLoader(selectedMetricKey)
      .then((metric) => {
        if (cancelled) {
          return;
        }

        setSelectedMetric(metric);
        setState("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState("error");
        setErrorMessage("暂时无法加载当前指标详情。");
      });

    return () => {
      cancelled = true;
    };
  }, [
    hasLoadedMetricsList,
    metricLoader,
    resolvedWorkspaceBinding.workspaceId,
    selectedMetricKey
  ]);

  return {
    errorMessage,
    filteredMetrics,
    onSearchChange: setSearchValue,
    onSelectMetric: (key) => {
      const nextMetricKey = findMetricKey(metrics, key);

      setSelectedMetricKey(nextMetricKey);
    },
    searchValue,
    selectedMetricKey,
    state,
    viewModel
  };
}
