import { Flex, Space, Typography } from "antd";

import { StatCard } from "../../../shared/ui/cards/StatCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";
import type { DashboardStatCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({
  metric,
  onNavigate,
  timeRange,
  viewModel
}: DashboardStatCardProps) {
  const { t } = useI18n();
  const isPriorityMetric = metric.nodeId === "dashboard-node-metric-revenue";
  const description = isPriorityMetric
    ? t("dashboard.metrics.riskDescription")
    : t("dashboard.metrics.defaultDescription");
  const metricActions = [
    ...(isPriorityMetric
      ? [
          createRouteAction({
            iconName: "analysis",
            key: `${metric.nodeId}-analyze`,
            label: t("dashboard.action.analyzeAnomaly"),
            onNavigate,
            route: "analysis",
            routeState: {
              analysisContextPack: createDashboardAnalysisContextPack({
                nodeId: metric.nodeId,
                suggestedPrompt: `请分析 Dashboard 中指标 ${metric.title} 的异常表现，并结合相关证据给出下一步建议。`,
                viewModel
              })
            },
            variant: "contextPrimary"
          })
        ]
      : []),
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
          {metric.chips?.map((chip) => (
            <Typography.Text key={chip} type="secondary">
              {chip}
            </Typography.Text>
          ))}
        </Space>
      }
      risk={
        isPriorityMetric
          ? {
              label: "中风险",
              level: "medium",
              reason: t("dashboard.metrics.riskDescription")
            }
          : { label: "低风险", level: "low" }
      }
      title={metric.title}
      value={metric.value ?? "--"}
    />
  );
}
