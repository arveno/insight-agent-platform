import { Button, Card, Col, Row, Space, Typography } from "antd";

import { AppIcon, RiskBadge, useI18n } from "../../../shared";
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
        actionLabel="查看治理风险"
        actionRoute="governance"
        eyebrow="Risk & Anomaly"
        onNavigate={onNavigate}
        title="风险与异常摘要"
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {riskItems.map((item) => {
          const risk = toRiskBadge(t, item.risk);

          return (
            <Col key={item.key} lg={12} xs={24}>
              <Card>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                    <Space direction="vertical" size={4}>
                      <Typography.Text type="secondary">{item.value}</Typography.Text>
                      <Typography.Text strong>{item.label}</Typography.Text>
                    </Space>
                    {risk ? <RiskBadge {...risk} /> : null}
                  </Space>
                  <Typography.Text type="secondary">{item.description}</Typography.Text>
                  <Space wrap>
                    <Button onClick={() => onNavigate?.("analysis")} type="primary">
                      <AppIcon name="analysis" />
                      带上下文打开分析
                    </Button>
                    <Button onClick={() => onNavigate?.("analysis")}>查看异常详情</Button>
                    <Button onClick={() => onNavigate?.("observability")}>查看 Trace</Button>
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
