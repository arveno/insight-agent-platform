import { Button, Card, Col, Row, Space, Typography } from "antd";

import { AppIcon, RiskBadge, useI18n } from "../../../shared";
import { toRiskBadge } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardQualityPanel({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="operations"
        actionLabel={t("dashboard.action.viewPlatformOperations")}
        actionRoute="platform-operations"
        eyebrow={t("dashboard.quality.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.quality.title")}
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {viewModel.platformQualitySummary.map((item) => {
          const risk = toRiskBadge(t, item.risk);

          return (
            <Col key={item.key} xs={24}>
              <Card>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary">
                        {t("dashboard.quality.itemEyebrow")}
                      </Typography.Text>
                      <Typography.Text strong>{item.label}</Typography.Text>
                      <Typography.Text type="secondary">{item.value}</Typography.Text>
                    </Space>
                    {risk ? <RiskBadge {...risk} /> : null}
                  </Space>
                  <Typography.Text type="secondary">{item.description}</Typography.Text>
                  <Space wrap>
                    <Button onClick={() => onNavigate?.("platform-operations")} type="primary">
                      <AppIcon name="operations" />
                      {t("dashboard.action.viewPlatformOperations")}
                    </Button>
                    <Button onClick={() => onNavigate?.("platform-operations")}>
                      {t("dashboard.action.viewJobDataQuality")}
                    </Button>
                    <Button onClick={() => onNavigate?.("analysis")}>
                      {t("dashboard.action.viewPlatformAnomaly")}
                    </Button>
                    <Button onClick={() => onNavigate?.("data-knowledge")}>
                      {t("dashboard.action.viewDataKnowledge")}
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
