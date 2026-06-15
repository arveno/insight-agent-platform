import { Flex, Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";
import type { DashboardRiskCardProps } from "./dashboardComponentTypes";

export function DashboardRiskOverview({
  item,
  onNavigate,
  viewModel
}: DashboardRiskCardProps) {
  const { t } = useI18n();
  const itemDisplay = viewModel.nodeDisplay[item.nodeId];
  const risk = toRiskBadge(t, itemDisplay?.risk);
  const status = toStatusTag(t, itemDisplay?.status);
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
    })
  ];

  return (
    <ContentCard
      description={item.summary}
      eyebrow={t("dashboard.risk.anomalyEyebrow")}
      footerActions={
        <Flex gap={12} wrap>
          {riskActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      meta={
        item.chips?.length ? (
          <Typography.Text type="secondary">{item.chips.join(" · ")}</Typography.Text>
        ) : null
      }
      tagSlot={
        risk || status ? (
          <Space wrap>
            {status ? <StatusTag {...status} /> : null}
            {risk ? <RiskBadge {...risk} /> : null}
          </Space>
        ) : null
      }
      title={item.title}
    >
      {itemDisplay?.valueText || itemDisplay?.trendText ? (
        <Typography.Text>
          {[itemDisplay.valueText, itemDisplay.trendText].filter(Boolean).join(" · ")}
        </Typography.Text>
      ) : null}
    </ContentCard>
  );
}
