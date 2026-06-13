import { Flex, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";
import type { DashboardQualityCardProps } from "./dashboardComponentTypes";

export function DashboardQualityPanel({ item, onNavigate, viewModel }: DashboardQualityCardProps) {
  const { t } = useI18n();
  const risk = { label: "中风险", level: "medium" as const };
  const qualityActions = [
    createRouteAction({
      iconName: "operations",
      key: `${item.nodeId}-operations`,
      label: t("dashboard.action.viewPlatformOperations"),
      onNavigate,
      route: "platform-operations",
      variant: "moduleEntry"
    }),
    createRouteAction({
      iconName: "operations",
      key: `${item.nodeId}-job-quality`,
      label: t("dashboard.action.viewJobDataQuality"),
      onNavigate,
      route: "platform-operations",
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${item.nodeId}-platform-anomaly`,
      label: t("dashboard.action.viewPlatformAnomaly"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: createDashboardAnalysisContextPack({
          nodeId: item.nodeId,
          suggestedPrompt: `请基于 ${item.title} 的平台质量摘要，解释当前异常风险与后续排查重点。`,
          viewModel
        })
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${item.nodeId}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    })
  ];

  return (
    <ContentCard
      description={item.summary}
      eyebrow={t("dashboard.quality.itemEyebrow")}
      footerActions={
        <Flex gap={12} wrap>
          {qualityActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.title}
    >
      <Typography.Text>{item.value}</Typography.Text>
    </ContentCard>
  );
}
