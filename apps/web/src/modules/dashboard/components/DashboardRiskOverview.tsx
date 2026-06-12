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
      routeState: {
        draftContextPack: {
          chips: [item.value, risk?.label ?? "风险待确认", eyebrow],
          sourceId: item.key,
          sourceTitle: item.label,
          sourceType: isRiskSummary ? "dashboard" : "runTrace",
          suggestedPrompt: `请基于 Dashboard 中的${item.label}，解释当前风险信号，并给出下一步核查建议。`,
          summary: item.description ?? `${item.label} 当前值为 ${item.value}。`
        }
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${item.key}-detail`,
      label: t("dashboard.action.viewAnomaly"),
      onNavigate,
      route: "analysis",
      routeState: {
        draftContextPack: {
          chips: [item.value, risk?.label ?? "风险待确认", "Dashboard"],
          sourceId: item.key,
          sourceTitle: item.label,
          sourceType: "runTrace",
          suggestedPrompt: `请继续拆解 ${item.label} 的异常信号，并说明需要优先验证的证据。`,
          summary: item.description ?? `${item.label} 当前值为 ${item.value}。`
        }
      },
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
      tagSlot={risk ? <RiskBadge {...risk} /> : null}
      title={item.label}
    >
      {isRiskSummary ? null : <Typography.Text>{item.value}</Typography.Text>}
    </ContentCard>
  );
}
