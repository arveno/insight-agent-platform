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
        actionLabel="查看 Metrics"
        actionRoute="metrics"
        eyebrow="Key Metrics"
        onNavigate={onNavigate}
        title="核心经营指标总览"
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {viewModel.businessMetricCards.map((metric) => (
          <Col key={metric.key} lg={12} xs={24}>
            <MetricCard
              actions={
                <Space wrap>
                  {metric.risk.level !== "low" ? (
                    <Button onClick={() => onNavigate?.("analysis")} size="small" type="primary">
                      核心指标异常入口
                    </Button>
                  ) : null}
                  <Button onClick={() => onNavigate?.("metrics")} size="small">
                    查看指标
                  </Button>
                </Space>
              }
              description={
                <Typography.Text type="secondary">
                  {metric.risk.reason ?? "指标摘要用于快速判断经营表现，详情进入 Metrics。"}
                </Typography.Text>
              }
              evidenceSummary={
                <Space wrap>
                  <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
                  {typeof metric.evidenceCount === "number" ? (
                    <Typography.Text type="secondary">{metric.evidenceCount} 条相关证据</Typography.Text>
                  ) : null}
                  <Button onClick={() => onNavigate?.("data-knowledge")} size="small" type="link">
                    <AppIcon name="data" />
                    查看数据与知识
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
