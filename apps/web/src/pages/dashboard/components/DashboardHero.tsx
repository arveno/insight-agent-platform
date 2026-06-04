import { Button, Col, Flex, Row, Space, Typography, theme } from "antd";

import { AppIcon, RiskBadge, useI18n } from "../../../shared";
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
          <Typography.Text type="secondary">Business Dashboard</Typography.Text>
          <Space direction="vertical" size={6}>
            <Typography.Title level={2} style={{ margin: 0 }}>
              经营状态总览
            </Typography.Title>
            <Typography.Text type="secondary">
              将核心指标、风险异常、报告证据和平台质量组织为可追问的业务工作台。
            </Typography.Text>
          </Space>
          <Space wrap>
            {riskBadge ? <RiskBadge {...riskBadge} /> : null}
            <Typography.Text strong>{summary?.value}</Typography.Text>
            <Typography.Text type="secondary">更新时间：{viewModel.lastUpdatedAt}</Typography.Text>
          </Space>
        </Space>
        <Space wrap>
          <Button onClick={() => onNavigate?.("analysis")} type="primary">
            <AppIcon name="analysis" />
            发起分析
          </Button>
          <Button onClick={() => onNavigate?.("metrics")}>
            <AppIcon name="metrics" />
            查看指标
          </Button>
          <Button onClick={() => onNavigate?.("reports")}>
            <AppIcon name="reports" />
            查看报告
          </Button>
        </Space>
      </Flex>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col lg={6} md={12} xs={24}>
          <HeroFact label="核心指标" value={`${viewModel.businessMetricCards.length} 项`} />
        </Col>
        <Col lg={6} md={12} xs={24}>
          <HeroFact label="风险异常" value={`${anomalyCount} 项关注`} />
        </Col>
        <Col lg={6} md={12} xs={24}>
          <HeroFact label="相关证据" value={`${viewModel.evidenceEntrances.length} 条`} />
        </Col>
        <Col lg={6} md={12} xs={24}>
          <HeroFact label="右侧上下文" value="证据 / Trace / 建议动作" />
        </Col>
      </Row>
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
        padding: 16
      }}
    >
      <Space direction="vertical" size={4}>
        <Typography.Text type="secondary">{label}</Typography.Text>
        <Typography.Text strong>{value}</Typography.Text>
      </Space>
    </div>
  );
}
