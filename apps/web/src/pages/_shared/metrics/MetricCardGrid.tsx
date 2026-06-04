import { Badge, Col, Row, Space, Typography, theme } from "antd";

import type { StaticMetricCardViewModel } from "../../../app/models";
import { MetricCard, useI18n } from "../../../shared";
import { toRiskBadge, toStatusTag } from "../adapters";

export type MetricCardGridProps = {
  items: StaticMetricCardViewModel[];
};

export function MetricCardGrid({ items }: MetricCardGridProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      {items.map((metric) => (
        <Col key={metric.key} lg={8} md={12} xs={24}>
          <MetricCard
            evidenceSummary={
              <Space wrap>
                {metric.trendText ? (
                  <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
                ) : null}
                {typeof metric.evidenceCount === "number" ? (
                  <Badge
                    count={metric.evidenceCount}
                    overflowCount={99}
                    style={{ backgroundColor: token.colorPrimary }}
                  />
                ) : null}
              </Space>
            }
            risk={toRiskBadge(t, metric.risk)}
            status={toStatusTag(t, metric.status)}
            title={metric.label}
            value={metric.valueText}
          />
        </Col>
      ))}
    </Row>
  );
}
