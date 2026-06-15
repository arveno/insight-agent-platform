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
      label: t("dashboard.action.analyzeMetric"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: metricContextPack
      },
      variant: "contextPrimary"
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
        metric.chips?.length ? (
          <Typography.Text type="secondary">{metric.chips.join(" · ")}</Typography.Text>
        ) : null
      }
      risk={toRiskBadge(t, metricDisplay?.risk)}
      status={toStatusTag(t, metricDisplay?.status)}
      title={metric.title}
      value={metric.value ?? "--"}
    />
  );
}
