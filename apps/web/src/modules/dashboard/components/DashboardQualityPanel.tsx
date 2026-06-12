import { Flex, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { toRiskBadge } from "../../../shared/utils/viewModelState";
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
      routeState: {
        draftContextPack: {
          chips: [item.value, risk?.label ?? "风险待确认", t("dashboard.quality.itemEyebrow")],
          sourceId: item.key,
          sourceTitle: item.label,
          sourceType: "evidence",
          suggestedPrompt: `请基于 ${item.label} 的平台质量摘要，解释当前异常风险与后续排查重点。`,
          summary: item.description ?? `${item.label} 当前值 ${item.value}。`
        }
      },
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
    <ContentCard
      description={item.description}
      eyebrow={t("dashboard.quality.itemEyebrow")}
      footerActions={
        <Flex gap={12} wrap>
          {qualityActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      <Typography.Text>{item.value}</Typography.Text>
    </ContentCard>
  );
}
