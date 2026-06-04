import { Card, Col, Divider, Row, Space, Typography } from "antd";

import { AppActionGroup, type AppActionGroupItem, useI18n } from "../../../shared";
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
        actionLabel={t("dashboard.action.viewAllReports")}
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
              {viewModel.recentReports.map((report) => {
                const reportActions: AppActionGroupItem[] = [
                  {
                    iconName: "reports",
                    key: `${report.key}-view-report`,
                    label: t("dashboard.action.viewReports"),
                    onClick: () => onNavigate?.("reports"),
                    variant: "objectDetail"
                  },
                  {
                    key: `${report.key}-suggestions`,
                    label: t("dashboard.action.viewSuggestions"),
                    onClick: () => onNavigate?.("analysis"),
                    variant: "objectDetail"
                  },
                  {
                    iconName: "analysis",
                    key: `${report.key}-context-analysis`,
                    label: t("dashboard.action.analyzeWithContext"),
                    onClick: () => onNavigate?.("analysis"),
                    variant: "contextPrimary"
                  }
                ];

                return (
                  <div key={report.key}>
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Space
                        align="start"
                        style={{ justifyContent: "space-between", width: "100%" }}
                      >
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
                      <AppActionGroup actions={reportActions} />
                    </Space>
                  </div>
                );
              })}
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
              {evidenceItems.map((evidence, index) => {
                const evidenceActions: AppActionGroupItem[] = [
                  {
                    key: `${evidence.key}-view-evidence`,
                    label: t("dashboard.action.viewEvidence"),
                    onClick: () => onNavigate?.("reports"),
                    variant: "sourceLink"
                  },
                  {
                    iconName: "data",
                    key: `${evidence.key}-source`,
                    label: t("dashboard.action.viewDataKnowledge"),
                    onClick: () => onNavigate?.("data-knowledge"),
                    variant: "sourceLink"
                  },
                  {
                    iconName: "observability",
                    key: `${evidence.key}-trace`,
                    label: t("dashboard.action.viewTrace"),
                    onClick: () => onNavigate?.("observability"),
                    variant: "sourceLink"
                  }
                ];

                return (
                  <div key={evidence.key}>
                    {index > 0 ? <Divider style={{ margin: "4px 0 12px" }} /> : null}
                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                      <Space
                        align="start"
                        style={{ justifyContent: "space-between", width: "100%" }}
                      >
                        <Space direction="vertical" size={2}>
                          <Typography.Text strong>{evidence.title}</Typography.Text>
                          <Typography.Text type="secondary">
                            {evidence.sourceTypeLabel}
                            {evidence.confidenceText ? ` · ${evidence.confidenceText}` : null}
                          </Typography.Text>
                        </Space>
                      </Space>
                      <Typography.Text type="secondary">{evidence.summary}</Typography.Text>
                      <AppActionGroup actions={evidenceActions} />
                    </Space>
                  </div>
                );
              })}
            </Space>
          </Card>
        </Col>
      </Row>
    </section>
  );
}
