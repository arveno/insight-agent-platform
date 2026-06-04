import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";

import { AppIcon } from "../../../shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardReportEvidencePanel({ onNavigate, viewModel }: DashboardComponentProps) {
  return (
    <section>
      <DashboardSectionHeader
        actionIcon="reports"
        actionLabel="查看 Reports"
        actionRoute="reports"
        eyebrow="Reports & Evidence"
        onNavigate={onNavigate}
        title="报告与证据入口"
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col lg={12} xs={24}>
          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">Recent report</Typography.Text>
                <Typography.Text strong>最近报告与建议动作</Typography.Text>
              </Space>
              {viewModel.recentReports.map((report) => (
                <div key={report.key}>
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                      <Typography.Text strong>{report.title}</Typography.Text>
                      <Typography.Text type="secondary">{report.evidenceCount} 条证据</Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">更新时间：{report.updatedAt}</Typography.Text>
                    <Space wrap>
                      <Button onClick={() => onNavigate?.("reports")} type="primary">
                        <AppIcon name="reports" />
                        查看报告
                      </Button>
                      <Button onClick={() => onNavigate?.("analysis")}>报告相关建议动作</Button>
                      <Button onClick={() => onNavigate?.("analysis")}>带上下文打开分析</Button>
                    </Space>
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
        <Col lg={12} xs={24}>
          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">Evidence</Typography.Text>
                <Typography.Text strong>相关证据与来源</Typography.Text>
              </Space>
              {viewModel.evidenceEntrances.map((evidence, index) => (
                <div key={evidence.key}>
                  {index > 0 ? <Divider style={{ margin: "4px 0 12px" }} /> : null}
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{evidence.title}</Typography.Text>
                        <Typography.Text type="secondary">
                          {evidence.sourceType} · {evidence.confidenceText}
                        </Typography.Text>
                      </Space>
                    </Space>
                    <Typography.Text type="secondary">{evidence.summary}</Typography.Text>
                    <Space wrap>
                      <Button onClick={() => onNavigate?.("reports")} size="small">
                        查看 Evidence
                      </Button>
                      <Button onClick={() => onNavigate?.("data-knowledge")} size="small">
                        查看 Data & Knowledge
                      </Button>
                      <Button onClick={() => onNavigate?.("observability")} size="small">
                        查看 Trace
                      </Button>
                    </Space>
                  </Space>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
