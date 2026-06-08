import { Flex, Space, Typography } from "antd";

import { StatCard } from "../../../shared/ui/cards/StatCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { toRiskBadge } from "../../../shared/utils/viewModelState";
import type { DashboardStatCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({ metric, onNavigate }: DashboardStatCardProps) {
  const { t } = useI18n();
  const risk = toRiskBadge(t, metric.risk);
  const displayRisk = risk?.reason
    ? { ...risk, reason: t("dashboard.metrics.riskDescription") }
    : risk;
  const description =
    metric.risk.level === "low"
      ? t("dashboard.metrics.defaultDescription")
      : t("dashboard.metrics.riskDescription");
  const metricActions = [
    ...(metric.risk.level !== "low"
      ? [
          createRouteAction({
            iconName: "analysis",
            key: `${metric.key}-analyze`,
            label: t("dashboard.action.analyzeAnomaly"),
            onNavigate,
            route: "analysis",
            variant: "contextPrimary"
          })
        ]
      : []),
    createRouteAction({
      iconName: "data",
      key: `${metric.key}-source`,
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
          <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
          {typeof metric.evidenceCount === "number" ? (
            <Typography.Text type="secondary">
              {metric.evidenceCount} {t("dashboard.common.relatedEvidenceCountSuffix")}
            </Typography.Text>
          ) : null}
        </Space>
      }
      risk={displayRisk}
      style={{ flex: "1 1 320px", minWidth: 0 }}
      title={metric.label}
      value={metric.valueText}
    />
  );
}
