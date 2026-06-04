import { Typography } from "antd";

import { AppActionGroup, AppBaseCard, RiskBadge, useI18n } from "../../../shared";
import { toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { DashboardRiskCardProps } from "./dashboardComponentTypes";

export function DashboardRiskOverview({
  isRiskSummary = false,
  item,
  onNavigate
}: DashboardRiskCardProps) {
  const { t } = useI18n();
  const risk = toRiskBadge(t, item.risk);
  const eyebrow = isRiskSummary
    ? t("dashboard.risk.summaryEyebrow")
    : t("dashboard.risk.anomalyEyebrow");
  const description = isRiskSummary ? item.description : t("dashboard.risk.anomalyDescription");
  const riskActions = [
    createRouteAction({
      iconName: "analysis",
      key: `${item.key}-context-analysis`,
      label: t("dashboard.action.analyzeWithContext"),
      onNavigate,
      route: "analysis",
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${item.key}-detail`,
      label: t("dashboard.action.viewAnomaly"),
      onNavigate,
      route: "analysis",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${item.key}-trace`,
      label: t("dashboard.action.viewTrace"),
      onNavigate,
      route: "observability",
      variant: "sourceLink"
    })
  ];

  return (
    <AppBaseCard
      description={description}
      eyebrow={eyebrow}
      footerActions={<AppActionGroup actions={riskActions} />}
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      {isRiskSummary ? null : <Typography.Text>{item.value}</Typography.Text>}
    </AppBaseCard>
  );
}
