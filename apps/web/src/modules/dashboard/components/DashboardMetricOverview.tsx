import { Flex, Space, Typography } from "antd";

import { StatCard } from "../../../shared/ui/cards/StatCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { DashboardStatCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({
  metric,
  onNavigate,
  timeRange,
  viewModel
}: DashboardStatCardProps) {
  const { t } = useI18n();
  const metricContextPack = viewModel.metricContextPacks[metric.nodeId];
  const metricDisplay = viewModel.nodeDisplay[metric.nodeId];

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
      description={<Typography.Text type="secondary">{metric.summary}</Typography.Text>}
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
          {metric.chips?.map((chip) => (
            <Typography.Text key={chip} type="secondary">
              {chip}
            </Typography.Text>
          ))}
        </Space>
      }
      risk={toRiskBadge(t, metricDisplay?.risk)}
      status={toStatusTag(t, metricDisplay?.status)}
      title={metric.title}
      value={metric.value ?? "--"}
    />
  );
}
