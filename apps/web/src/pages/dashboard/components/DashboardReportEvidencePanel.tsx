import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";

import { AppIcon, useI18n } from "../../../shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardReportEvidencePanel({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();

  return (
    <section>
      <DashboardSectionHeader
        actionIcon="reports"
        actionLabel={t("dashboard.action.viewReports")}
        actionRoute="reports"
        eyebrow={t("dashboard.reportEvidence.eyebrow")}
        onNavigate={onNavigate}
        title={t("dashboard.reportEvidence.title")}
      />
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col lg={12} xs={24}>
          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Space direction="vertical" size={4}>
                <Typography.Text type="secondary">
                  {t("dashboard.reportEvidence.recentReportEyebrow")}
                </Typography.Text>
                <Typography.Text strong>
                  {t("dashboard.reportEvidence.recentReportTitle")}
                </Typography.Text>
              </Space>
              {viewModel.recentReports.map((report) => (
                <div key={report.key}>
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                      <Typography.Text strong>{report.title}</Typography.Text>
                      <Typography.Text type="secondary">
                        {report.evidenceCount} {t("dashboard.common.evidenceCountSuffix")}
                      </Typography.Text>
                    </Space>
                    <Typography.Text type="secondary">
                      {t("dashboard.common.updatedAtPrefix")}
                      {report.updatedAt}
                    </Typography.Text>
                    <Space wrap>
                      <Button onClick={() => onNavigate?.("reports")} type="primary">
                        <AppIcon name="reports" />
                        {t("dashboard.action.viewReports")}
                      </Button>
                      <Button onClick={() => onNavigate?.("analysis")}>
                        {t("dashboard.action.viewSuggestions")}
                      </Button>
                      <Button onClick={() => onNavigate?.("analysis")}>
                        {t("dashboard.action.analyzeWithContext")}
                      </Button>
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
                <Typography.Text type="secondary">
                  {t("dashboard.reportEvidence.evidenceEyebrow")}
                </Typography.Text>
                <Typography.Text strong>
                  {t("dashboard.reportEvidence.evidenceTitle")}
                </Typography.Text>
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
                        {t("dashboard.action.viewEvidence")}
                      </Button>
                      <Button onClick={() => onNavigate?.("data-knowledge")} size="small">
                        {t("dashboard.action.viewDataKnowledge")}
                      </Button>
                      <Button onClick={() => onNavigate?.("observability")} size="small">
                        {t("dashboard.action.viewTrace")}
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
