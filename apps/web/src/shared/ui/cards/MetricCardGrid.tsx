import { Badge, Col, Row, Space, Typography, theme } from "antd";

import type { StaticMetricCardViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../i18n/I18nProvider";
import { toRiskBadge, toStatusTag } from "../../utils/viewModelState";

import { MetricCard } from "./MetricCard";

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
