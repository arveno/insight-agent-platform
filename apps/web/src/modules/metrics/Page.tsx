import { Alert, Flex, Spin, Typography } from "antd";
import type { Metric } from "@insight-agent/contracts/generated/typescript";

import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import {
  useMetricsOverviewState,
  type MetricsOverviewController
} from "./hooks/useMetricsOverviewState";
import { MetricsSections } from "./sections/MetricsSections";

type MetricsPageProps = PageRouteProps & {
  metricLoader?: (metricId: string) => Promise<Metric>;
  metricsLoader?: () => Promise<Metric[]>;
};

export type MetricsPageContentProps = PageRouteProps & {
  controller: MetricsOverviewController;
};

export function MetricsPage({
  metricLoader,
  metricsLoader,
  onNavigate
}: MetricsPageProps) {
  const controller = useMetricsOverviewState(undefined, {
    metricLoader,
    metricsLoader
  });

  return <MetricsPageContent controller={controller} onNavigate={onNavigate} />;
}

export function MetricsPageContent({ controller, onNavigate }: MetricsPageContentProps) {
  if (controller.state === "loading") {
    return (
      <ResponsivePageShell>
        <Flex align="center" justify="center" style={{ minHeight: 320 }} vertical gap={16}>
          <Spin size="large" />
          <Typography.Text type="secondary">正在读取当前 Workspace 的共享指标。</Typography.Text>
        </Flex>
      </ResponsivePageShell>
    );
  }

  if (controller.state === "error") {
    return (
      <ResponsivePageShell>
        <Alert message={controller.errorMessage ?? "暂时无法加载 Metrics。"} showIcon type="error" />
      </ResponsivePageShell>
    );
  }

  if (!controller.viewModel) {
    return (
      <ResponsivePageShell>
        <Typography.Text type="secondary">当前 Workspace 暂无共享指标。</Typography.Text>
      </ResponsivePageShell>
    );
  }

  return (
    <ResponsivePageShell>
      <MetricsSections onNavigate={onNavigate} viewModel={controller.viewModel} />
    </ResponsivePageShell>
  );
}
