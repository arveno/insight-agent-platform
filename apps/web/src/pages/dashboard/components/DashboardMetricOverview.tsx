import { Col, Row, Space, Typography } from "antd";

import { AppActionButton, MetricCard, useI18n } from "../../../shared";
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
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {viewModel.businessMetricCards.map((metric) => {
          const risk = toRiskBadge(t, metric.risk);
          const displayRisk = risk?.reason
            ? { ...risk, reason: t("dashboard.metrics.riskDescription") }
            : risk;
          const description =
            metric.risk.level === "low"
              ? t("dashboard.metrics.defaultDescription")
              : t("dashboard.metrics.riskDescription");

          return (
            <Col key={metric.key} lg={12} xs={24}>
              <MetricCard
                actions={
                  <Space wrap>
                    {metric.risk.level !== "low" ? (
                      <AppActionButton
                        onClick={() => onNavigate?.("analysis")}
                        variant="contextPrimary"
                      >
                        {t("dashboard.action.analyzeAnomaly")}
                      </AppActionButton>
                    ) : null}
                  </Space>
                }
                description={<Typography.Text type="secondary">{description}</Typography.Text>}
                evidenceSummary={
                  <Space wrap>
                    <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
                    {typeof metric.evidenceCount === "number" ? (
                      <Typography.Text type="secondary">
                        {metric.evidenceCount} {t("dashboard.common.relatedEvidenceCountSuffix")}
                      </Typography.Text>
                    ) : null}
                    <AppActionButton
                      iconName="data"
                      onClick={() => onNavigate?.("data-knowledge")}
                      variant="sourceLink"
                    >
                      {t("dashboard.action.viewDataKnowledge")}
                    </AppActionButton>
                  </Space>
                }
                risk={displayRisk}
                title={metric.label}
                value={metric.valueText}
              />
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
