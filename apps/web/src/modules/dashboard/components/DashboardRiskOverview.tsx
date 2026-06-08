import { Flex, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { toRiskBadge } from "../../../shared/utils/viewModelState";
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
    <ContentCard
      description={description}
      eyebrow={eyebrow}
      footerActions={
        <Flex gap={12} wrap>
          {riskActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      style={{ flex: "1 1 320px", minWidth: 0 }}
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      {isRiskSummary ? null : <Typography.Text>{item.value}</Typography.Text>}
    </ContentCard>
  );
}
