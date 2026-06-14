import { Flex, Space, Typography } from "antd";

import { StatCard } from "../../../shared/ui/cards/StatCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import {
  getDashboardNodeContextLabel,
  getDashboardNodeRiskBadge,
  getDashboardNodeStatusTag
} from "../models/dashboardNodeState";
import type { DashboardStatCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({
  metric,
  onNavigate,
  timeRange,
  viewModel
}: DashboardStatCardProps) {
  const { t } = useI18n();
  const isPriorityMetric = metric.sourceRef?.type === "metric" && metric.sourceRef.metricId === "metric-recognized-revenue";
  const description = isPriorityMetric
    ? t("dashboard.metrics.riskDescription")
    : t("dashboard.metrics.defaultDescription");
  const metricContextLabel = getDashboardNodeContextLabel(metric);
  const metricContextPack = viewModel.metricContextPacks[metric.nodeId];

  if (!metricContextPack) {
    throw new Error(`Missing shared metric context pack for dashboard node ${metric.nodeId}.`);
  }

  const metricActions = [
    createRouteAction({
      iconName: "analysis",
      key: `${metric.nodeId}-analyze`,
      label: t("dashboard.action.analyzeAnomaly"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: metricContextPack
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${metric.nodeId}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    })
  ];

  return (
    <StatCard
      description={<Typography.Text type="secondary">{description}</Typography.Text>}
      footerActions={
        <Flex gap={12} wrap>
          {metricActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      meta={
        <Space wrap>
          <Typography.Text type="secondary">{timeRange.label}</Typography.Text>
          {metricContextLabel ? (
            <Typography.Text type="secondary">{metricContextLabel}</Typography.Text>
          ) : null}
        </Space>
      }
      risk={getDashboardNodeRiskBadge(metric, metric.summary)}
      status={getDashboardNodeStatusTag(metric)}
      title={metric.title}
      value={metric.value ?? "--"}
    />
  );
}
