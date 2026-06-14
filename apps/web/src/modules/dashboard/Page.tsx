import { useEffect, useState } from "react";
import { Alert, Flex, Spin, Typography } from "antd";
import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { loadWorkspaceMetrics } from "../../api/adapters/loadWorkspaceMetrics";
import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";
import { useCurrentWorkspaceBinding } from "../../shared/workspace/CurrentWorkspaceBindingProvider";

import { createDashboardViewModel } from "./mappers/createDashboardViewModel";
import type { DashboardSurfaceViewModel } from "./models/dashboardViewModel";
import { DashboardSections } from "./sections/DashboardSections";

type DashboardPageProps = PageRouteProps & {
  metricsLoader?: () => Promise<Metric[]>;
};

export function DashboardPage({
  metricsLoader = loadWorkspaceMetrics,
  onNavigate
}: DashboardPageProps) {
  const workspaceBinding = useCurrentWorkspaceBinding();
  const [selectedTimeRangeKey, setSelectedTimeRangeKey] =
    useState<DashboardSurfaceViewModel["timeRange"]["selectedKey"]>("last_30_days");
  const [viewModel, setViewModel] = useState(() =>
    createDashboardViewModel([], workspaceBinding)
  );
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    setState("loading");

    void metricsLoader()
      .then((metrics) => {
        if (cancelled) {
          return;
        }

        setViewModel(createDashboardViewModel(metrics, workspaceBinding));
        setSelectedTimeRangeKey("last_30_days");
        setState("ready");
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [metricsLoader, workspaceBinding.workspaceId, workspaceBinding.workspaceName]);

  const selectedTimeRange = viewModel.timeRange.options.find(
    (option) => option.key === selectedTimeRangeKey
  );

  if (!selectedTimeRange) {
    throw new Error(`Unknown dashboard time range: ${selectedTimeRangeKey}`);
  }

  if (state === "loading") {
    return (
      <ResponsivePageShell>
        <Flex align="center" justify="center" style={{ minHeight: 320 }} vertical gap={16}>
          <Spin size="large" />
          <Typography.Text type="secondary">正在读取当前 Workspace 的共享指标。</Typography.Text>
        </Flex>
      </ResponsivePageShell>
    );
  }

  if (state === "error") {
    return (
      <ResponsivePageShell>
        <Alert
          message="暂时无法加载 Dashboard 指标。"
          showIcon
          type="error"
        />
      </ResponsivePageShell>
    );
  }

  return (
    <ResponsivePageShell>
      <DashboardSections
        onNavigate={onNavigate}
        onTimeRangeChange={setSelectedTimeRangeKey}
        selectedTimeRange={selectedTimeRange}
        selectedTimeRangeKey={selectedTimeRangeKey}
        viewModel={viewModel}
      />
    </ResponsivePageShell>
  );
}
