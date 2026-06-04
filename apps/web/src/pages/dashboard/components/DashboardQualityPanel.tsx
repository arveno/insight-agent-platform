import { Typography } from "antd";

import { AppActionGroup, AppContentCard, RiskBadge, useI18n } from "../../../shared";
import { toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { DashboardQualityCardProps } from "./dashboardComponentTypes";

export function DashboardQualityPanel({ item, onNavigate }: DashboardQualityCardProps) {
  const { t } = useI18n();
  const risk = toRiskBadge(t, item.risk);
  const qualityActions = [
    createRouteAction({
      iconName: "operations",
      key: `${item.key}-operations`,
      label: t("dashboard.action.viewPlatformOperations"),
      onNavigate,
      route: "platform-operations",
      variant: "moduleEntry"
    }),
    createRouteAction({
      iconName: "operations",
      key: `${item.key}-job-quality`,
      label: t("dashboard.action.viewJobDataQuality"),
      onNavigate,
      route: "platform-operations",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${item.key}-platform-anomaly`,
      label: t("dashboard.action.viewPlatformAnomaly"),
      onNavigate,
      route: "analysis",
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${item.key}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    })
  ];

  return (
    <AppContentCard
      description={item.description}
      eyebrow={t("dashboard.quality.itemEyebrow")}
      footerActions={<AppActionGroup actions={qualityActions} />}
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      <Typography.Text>{item.value}</Typography.Text>
    </AppContentCard>
  );
}
