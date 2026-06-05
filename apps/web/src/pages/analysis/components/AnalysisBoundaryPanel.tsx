import { List, Space, Typography } from "antd";

import { AppActionGroup, AppBaseCard, AppSection, type I18nMessageKey, useI18n } from "../../../shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

const crossPageSources: Array<{
  detailRoute: Parameters<typeof createRouteAction>[0]["route"];
  key: string;
  labelKey: I18nMessageKey;
  summaryKey: I18nMessageKey;
}> = [
  {
    detailRoute: "dashboard",
    key: "dashboard",
    labelKey: "analysis.source.dashboard.label",
    summaryKey: "analysis.source.dashboard.boundary"
  },
  {
    detailRoute: "metrics",
    key: "metrics",
    labelKey: "analysis.source.metrics.label",
    summaryKey: "analysis.source.metrics.boundary"
  },
  {
    detailRoute: "reports",
    key: "reports",
    labelKey: "analysis.source.reports.label",
    summaryKey: "analysis.source.reports.boundary"
  },
  {
    detailRoute: "observability",
    key: "observability",
    labelKey: "analysis.source.observability.label",
    summaryKey: "analysis.source.observability.boundary"
  },
  {
    detailRoute: "evaluation",
    key: "evaluation",
    labelKey: "analysis.source.evaluation.label",
    summaryKey: "analysis.source.evaluation.boundary"
  },
  {
    detailRoute: "feedback",
    key: "feedback",
    labelKey: "analysis.source.feedback.label",
    summaryKey: "analysis.source.feedback.boundary"
  },
  {
    detailRoute: "model-tools",
    key: "model-tools",
    labelKey: "analysis.source.modelTools.label",
    summaryKey: "analysis.source.modelTools.boundary"
  }
];

const responsibilityKeys = [
  "analysis.boundary.trace",
  "analysis.boundary.report",
  "analysis.boundary.evaluation",
  "analysis.boundary.feedback",
  "analysis.boundary.modelTools",
  "analysis.boundary.dataKnowledge",
  "analysis.boundary.metrics",
  "analysis.boundary.platform"
] as const;

export function AnalysisBoundaryPanel({ onNavigate }: AnalysisComponentProps) {
  const { t } = useI18n();

  return (
    <AppSection
      columns={2}
      eyebrow={t("analysis.boundary.sectionEyebrow")}
      title={t("analysis.boundary.sectionTitle")}
    >
      <AppBaseCard
        eyebrow={t("analysis.crossPage.cardEyebrow")}
        title={t("analysis.crossPage.cardTitle")}
      >
        <List
          dataSource={crossPageSources}
          renderItem={(source) => (
            <List.Item
              actions={[
                <AppActionGroup
                  actions={[
                    createRouteAction({
                      key: `${source.key}-detail`,
                      label: t("analysis.action.viewSource"),
                      onNavigate,
                      route: source.detailRoute,
                      variant: "sourceLink"
                    })
                  ]}
                  key={`${source.key}-actions`}
                />
              ]}
            >
              <List.Item.Meta
                description={t(source.summaryKey)}
                title={<Typography.Text strong>{t(source.labelKey)}</Typography.Text>}
              />
            </List.Item>
          )}
          size="small"
        />
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.boundary.cardEyebrow")}
        title={t("analysis.boundary.cardTitle")}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{t("analysis.boundary.description")}</Typography.Text>
          <List
            dataSource={[...responsibilityKeys]}
            renderItem={(key) => (
              <List.Item>
                <Typography.Text>{t(key)}</Typography.Text>
              </List.Item>
            )}
            size="small"
          />
        </Space>
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.assist.cardEyebrow")}
        title={t("analysis.assist.cardTitle")}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text>{t("analysis.assist.description")}</Typography.Text>
          <Typography.Text type="secondary">{t("analysis.assist.detailBoundary")}</Typography.Text>
        </Space>
      </AppBaseCard>
    </AppSection>
  );
}
