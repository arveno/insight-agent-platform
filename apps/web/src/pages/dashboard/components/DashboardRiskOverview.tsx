import { Card, Col, Row, Space, Typography } from "antd";

import { AppActionGroup, type AppActionGroupItem, RiskBadge, useI18n } from "../../../shared";
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
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {riskItems.map((item) => {
          const risk = toRiskBadge(t, item.risk);
          const isRiskSummary = viewModel.riskSummary.some((riskItem) => riskItem.key === item.key);
          const eyebrow = isRiskSummary ? t("dashboard.risk.summaryEyebrow") : item.value;
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
            <Col key={item.key} lg={12} xs={24}>
              <Card>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary">{eyebrow}</Typography.Text>
                      <Typography.Text strong>{item.label}</Typography.Text>
                    </Space>
                    {risk ? <RiskBadge {...risk} /> : null}
                  </Space>
                  <Typography.Text type="secondary">{description}</Typography.Text>
                  <AppActionGroup actions={riskActions} />
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </section>
  );
}
