import { Card, Col, Divider, Row, Space, Typography } from "antd";

import { AppActionButton, useI18n } from "../../../shared";
import { toEvidenceItem } from "../../_shared";
import type { DashboardComponentProps } from "./dashboardComponentTypes";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

export function DashboardReportEvidencePanel({ onNavigate, viewModel }: DashboardComponentProps) {
  const { t } = useI18n();
  const evidenceItems = viewModel.evidenceEntrances.map((item) => toEvidenceItem(t, item));

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
                    <Typography.Text type="secondary">
                      {t("dashboard.reportEvidence.suggestionSummary")}
                    </Typography.Text>
                    <Space wrap>
                      <AppActionButton
                        iconName="reports"
                        onClick={() => onNavigate?.("reports")}
                        variant="moduleEntry"
                      >
                        {t("dashboard.action.viewReports")}
                      </AppActionButton>
                      <AppActionButton
                        onClick={() => onNavigate?.("analysis")}
                        variant="objectDetail"
                      >
                        {t("dashboard.action.viewSuggestions")}
                      </AppActionButton>
                      <AppActionButton
                        onClick={() => onNavigate?.("analysis")}
                        variant="contextPrimary"
                      >
                        {t("dashboard.action.analyzeWithContext")}
                      </AppActionButton>
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
              {evidenceItems.map((evidence, index) => (
                <div key={evidence.key}>
                  {index > 0 ? <Divider style={{ margin: "4px 0 12px" }} /> : null}
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{evidence.title}</Typography.Text>
                        <Typography.Text type="secondary">
                          {evidence.sourceTypeLabel}
                          {evidence.confidenceText ? ` · ${evidence.confidenceText}` : null}
                        </Typography.Text>
                      </Space>
                    </Space>
                    <Typography.Text type="secondary">{evidence.summary}</Typography.Text>
                    <Space wrap>
                      <AppActionButton onClick={() => onNavigate?.("reports")} variant="sourceLink">
                        {t("dashboard.action.viewEvidence")}
                      </AppActionButton>
                      <AppActionButton
                        onClick={() => onNavigate?.("data-knowledge")}
                        variant="sourceLink"
                      >
                        {t("dashboard.action.viewDataKnowledge")}
                      </AppActionButton>
                      <AppActionButton
                        onClick={() => onNavigate?.("observability")}
                        variant="sourceLink"
                      >
                        {t("dashboard.action.viewTrace")}
                      </AppActionButton>
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
