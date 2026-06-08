import { Typography } from "antd";

import { AppActionGroup } from "../../../shared/ui/actions/AppActionGroup";
import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toRiskBadge } from "../../_shared/adapters/viewModelAdapters";
import { createRouteAction } from "../../_shared/actions/createRouteAction";
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
    <AppBaseCard
      description={item.description}
      eyebrow={t("dashboard.quality.itemEyebrow")}
      footerActions={<AppActionGroup actions={qualityActions} />}
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      <Typography.Text>{item.value}</Typography.Text>
    </AppBaseCard>
  );
}
