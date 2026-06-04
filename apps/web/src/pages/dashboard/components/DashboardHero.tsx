import { Flex, Space, Typography, theme } from "antd";

import {
  AppActionGroup,
  AppCardGrid,
  type AppActionGroupItem,
  RiskBadge,
  useI18n
} from "../../../shared";
import { toRiskBadge } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";

const heroStyle = {
  border: "1px solid transparent",
  borderRadius: 8,
  padding: 24
};

export function DashboardHero({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const summary = viewModel.dashboardSummary[0];
  const riskBadge = toRiskBadge(t, summary?.risk);
  const anomalyCount = viewModel.anomalyCards.length + viewModel.riskSummary.length;
  const heroActions: AppActionGroupItem[] = [
    {
      iconName: "analysis",
      key: "dashboard-hero-analysis",
      label: t("action.dashboardPrimaryAnalysis.label"),
      onClick: () => onNavigate?.("analysis"),
      variant: "globalPrimary"
    },
    {
      iconName: "metrics",
      key: "dashboard-hero-metrics",
      label: t("dashboard.action.viewMetrics"),
      onClick: () => onNavigate?.("metrics"),
      variant: "moduleEntry"
    },
    {
      iconName: "reports",
      key: "dashboard-hero-reports",
      label: t("dashboard.action.viewReports"),
      onClick: () => onNavigate?.("reports"),
      variant: "moduleEntry"
    }
  ];

  return (
    <section
      style={{
        ...heroStyle,
        background: token.colorBgContainer,
        borderColor: token.colorBorderSecondary
      }}
    >
      <Flex align="start" justify="space-between" wrap="wrap" gap={24}>
        <Space direction="vertical" size={12} style={{ maxWidth: 660 }}>
          <Typography.Text type="secondary">{t("dashboard.hero.eyebrow")}</Typography.Text>
          <Space direction="vertical" size={6}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              {t("dashboard.hero.title")}
            </Typography.Title>
            <Typography.Text type="secondary">{t("dashboard.hero.description")}</Typography.Text>
          </Space>
          <Space wrap>
            {riskBadge ? <RiskBadge {...riskBadge} /> : null}
            <Typography.Text strong>{summary?.value}</Typography.Text>
            <Typography.Text type="secondary">
              {t("dashboard.common.updatedAtPrefix")}
              {viewModel.lastUpdatedAt}
            </Typography.Text>
          </Space>
        </Space>
        <AppActionGroup actions={heroActions} />
      </Flex>
      <div style={{ marginTop: 24 }}>
        <AppCardGrid columns={4}>
          <HeroFact
            label={t("dashboard.hero.fact.metricLabel")}
            value={`${viewModel.businessMetricCards.length} ${t(
              "dashboard.hero.fact.metricCountSuffix"
            )}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.riskAnomalyLabel")}
            value={`${anomalyCount} ${t("dashboard.hero.fact.riskAnomalyCountSuffix")}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.evidenceLabel")}
            value={`${viewModel.evidenceEntrances.length} ${t(
              "dashboard.hero.fact.evidenceCountSuffix"
            )}`}
          />
          <HeroFact
            label={t("dashboard.hero.fact.rightContextLabel")}
            value={t("dashboard.hero.fact.rightContextValue")}
          />
        </AppCardGrid>
      </div>
    </section>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        background: token.colorFillAlter,
        borderRadius: 6,
        minHeight: 84,
        padding: 16,
        width: "100%"
      }}
    >
      <Space direction="vertical" size={4}>
        <Typography.Text type="secondary">{label}</Typography.Text>
        <Typography.Text strong>{value}</Typography.Text>
      </Space>
    </div>
  );
}
