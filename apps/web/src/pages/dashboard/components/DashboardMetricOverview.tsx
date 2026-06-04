import { Space, Typography } from "antd";

import {
  AppActionGroup,
  AppCardGrid,
  type AppActionGroupItem,
  MetricCard,
  useI18n
} from "../../../shared";
import { toRiskBadge } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardMetricOverview({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="metrics"
        actionLabel={t("dashboard.action.viewMetrics")}
        actionRoute="metrics"
        eyebrow={t("dashboard.metrics.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.metrics.title")}
      />
      <div style={{ marginTop: 16 }}>
        <AppCardGrid columns={2}>
          {viewModel.businessMetricCards.map((metric) => {
            const risk = toRiskBadge(t, metric.risk);
            const displayRisk = risk?.reason
              ? { ...risk, reason: t("dashboard.metrics.riskDescription") }
              : risk;
            const description =
              metric.risk.level === "low"
                ? t("dashboard.metrics.defaultDescription")
                : t("dashboard.metrics.riskDescription");
            const metricActions: AppActionGroupItem[] = [
              ...(metric.risk.level !== "low"
                ? [
                    {
                      iconName: "analysis" as const,
                      key: `${metric.key}-analyze`,
                      label: t("dashboard.action.analyzeAnomaly"),
                      onClick: () => onNavigate?.("analysis"),
                      variant: "contextPrimary" as const
                    }
                  ]
                : []),
              {
                iconName: "data",
                key: `${metric.key}-source`,
                label: t("dashboard.action.viewDataKnowledge"),
                onClick: () => onNavigate?.("data-knowledge"),
                variant: "sourceLink"
              }
            ];

            return (
              <MetricCard
                key={metric.key}
                description={<Typography.Text type="secondary">{description}</Typography.Text>}
                footerActions={<AppActionGroup actions={metricActions} />}
                meta={
                  <Space wrap>
                    <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
                    {typeof metric.evidenceCount === "number" ? (
                      <Typography.Text type="secondary">
                        {metric.evidenceCount} {t("dashboard.common.relatedEvidenceCountSuffix")}
                      </Typography.Text>
                    ) : null}
                  </Space>
                }
                risk={displayRisk}
                title={metric.label}
                value={metric.valueText}
              />
            );
          })}
        </AppCardGrid>
      </div>
    </section>
  );
}
