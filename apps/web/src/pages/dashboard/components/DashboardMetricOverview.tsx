import { Space, Typography } from "antd";

import { AppActionGroup, MetricCard, useI18n } from "../../../shared";
import { toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { DashboardMetricCardProps } from "./dashboardComponentTypes";

export function DashboardMetricOverview({ metric, onNavigate }: DashboardMetricCardProps) {
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
    <MetricCard
      description={<Typography.Text type="secondary">{description}</Typography.Text>}
      footerActions={<AppActionGroup actions={metricActions} />}
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
      title={metric.label}
      value={metric.valueText}
    />
  );
}
