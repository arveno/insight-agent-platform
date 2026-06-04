import { Typography } from "antd";

import {
  AppActionGroup,
  AppCardGrid,
  AppContentCard,
  type AppActionGroupItem,
  RiskBadge,
  useI18n
} from "../../../shared";
import { toRiskBadge } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardRiskOverview({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();
  const riskItems = [...viewModel.anomalyCards, ...viewModel.riskSummary];

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="governance"
        actionLabel={t("dashboard.action.viewGovernanceRisk")}
        actionRoute="governance"
        eyebrow={t("dashboard.risk.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.risk.title")}
      />
      <div style={{ marginTop: 16 }}>
        <AppCardGrid columns={2}>
          {riskItems.map((item) => {
            const risk = toRiskBadge(t, item.risk);
            const isRiskSummary = viewModel.riskSummary.some(
              (riskItem) => riskItem.key === item.key
            );
            const eyebrow = isRiskSummary
              ? t("dashboard.risk.summaryEyebrow")
              : t("dashboard.risk.anomalyEyebrow");
            const description = isRiskSummary
              ? item.description
              : t("dashboard.risk.anomalyDescription");
            const riskActions: AppActionGroupItem[] = [
              {
                iconName: "analysis",
                key: `${item.key}-context-analysis`,
                label: t("dashboard.action.analyzeWithContext"),
                onClick: () => onNavigate?.("analysis"),
                variant: "contextPrimary"
              },
              {
                iconName: "analysis",
                key: `${item.key}-detail`,
                label: t("dashboard.action.viewAnomaly"),
                onClick: () => onNavigate?.("analysis"),
                variant: "objectDetail"
              },
              {
                iconName: "observability",
                key: `${item.key}-trace`,
                label: t("dashboard.action.viewTrace"),
                onClick: () => onNavigate?.("observability"),
                variant: "sourceLink"
              }
            ];

            return (
              <AppContentCard
                description={description}
                eyebrow={eyebrow}
                footerActions={<AppActionGroup actions={riskActions} />}
                key={item.key}
                tagSlot={risk ? <RiskBadge {...risk} /> : null}
                title={item.label}
              >
                {isRiskSummary ? null : <Typography.Text>{item.value}</Typography.Text>}
              </AppContentCard>
            );
          })}
        </AppCardGrid>
      </div>
    </section>
  );
}
