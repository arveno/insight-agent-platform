import { Button, Col, Row, Space, Typography } from "antd";

import { AppIcon, MetricCard, useI18n } from "../../../shared";
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
        {viewModel.businessMetricCards.map((metric) => (
          <Col key={metric.key} lg={12} xs={24}>
            <MetricCard
              actions={
                <Space wrap>
                  {metric.risk.level !== "low" ? (
                    <Button onClick={() => onNavigate?.("analysis")} size="small" type="primary">
                      {t("dashboard.action.analyzeAnomaly")}
                    </Button>
                  ) : null}
                  <Button onClick={() => onNavigate?.("metrics")} size="small">
                    {t("dashboard.action.viewMetrics")}
                  </Button>
                </Space>
              }
              description={
                <Typography.Text type="secondary">
                  {metric.risk.reason ?? t("dashboard.metrics.defaultDescription")}
                </Typography.Text>
              }
              evidenceSummary={
                <Space wrap>
                  <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
                  {typeof metric.evidenceCount === "number" ? (
                    <Typography.Text type="secondary">
                      {metric.evidenceCount} {t("dashboard.common.relatedEvidenceCountSuffix")}
                    </Typography.Text>
                  ) : null}
                  <Button onClick={() => onNavigate?.("data-knowledge")} size="small" type="link">
                    <AppIcon name="data" />
                    {t("dashboard.action.viewDataKnowledge")}
                  </Button>
                </Space>
              }
              risk={toRiskBadge(t, metric.risk)}
              title={metric.label}
              value={metric.valueText}
            />
          </Col>
        ))}
      </Row>
    </section>
  );
}
