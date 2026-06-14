import { Flex, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";
import type { DashboardRiskCardProps } from "./dashboardComponentTypes";

export function DashboardRiskOverview({
  isRiskSummary = false,
  item,
  onNavigate,
  viewModel
}: DashboardRiskCardProps) {
  const { t } = useI18n();
  const risk = {
    label: item.value ?? "风险待确认",
    level: "medium" as const
  };
  const eyebrow = isRiskSummary
    ? t("dashboard.risk.summaryEyebrow")
    : t("dashboard.risk.anomalyEyebrow");
  const description = isRiskSummary ? item.summary : t("dashboard.risk.anomalyDescription");
  const riskActions = [
    createRouteAction({
      iconName: "analysis",
      key: `${item.nodeId}-context-analysis`,
      label: t("dashboard.action.analyzeWithContext"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: createDashboardAnalysisContextPack({
          nodeId: item.nodeId,
          suggestedPrompt: `请基于 Dashboard 中的${item.title}，解释当前风险信号，并给出下一步核查建议。`,
          viewModel
        })
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${item.nodeId}-detail`,
      label: t("dashboard.action.viewAnomaly"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: createDashboardAnalysisContextPack({
          nodeId: item.nodeId,
          suggestedPrompt: `请继续拆解 ${item.title} 的异常信号，并说明需要优先验证的证据。`,
          viewModel
        })
      },
      variant: "objectDetail"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${item.nodeId}-trace`,
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
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.title}
    >
      {isRiskSummary ? null : <Typography.Text>{item.value}</Typography.Text>}
    </ContentCard>
  );
}
