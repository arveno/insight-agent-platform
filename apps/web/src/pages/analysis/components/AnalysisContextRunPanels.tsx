import { List, Space, Typography } from "antd";

import type { StaticSummaryItemViewModel } from "../../../app/models";
import {
  AppActionGroup,
  AppBaseCard,
  AppSection,
  RiskBadge,
  StatusTag,
  type I18nMessageKey,
  useI18n
} from "../../../shared";
import { toRiskBadge, toStatusTag } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

const sourceRows: Array<{
  detailRoute: Parameters<typeof createRouteAction>[0]["route"];
  iconName: Parameters<typeof createRouteAction>[0]["iconName"];
  key: string;
  labelKey: I18nMessageKey;
  summaryKey: I18nMessageKey;
}> = [
  {
    detailRoute: "dashboard",
    iconName: "dashboard",
    key: "dashboard",
    labelKey: "analysis.source.dashboard.label",
    summaryKey: "analysis.source.dashboard.summary"
  },
  {
    detailRoute: "metrics",
    iconName: "metrics",
    key: "metrics",
    labelKey: "analysis.source.metrics.label",
    summaryKey: "analysis.source.metrics.summary"
  },
  {
    detailRoute: "reports",
    iconName: "reports",
    key: "reports",
    labelKey: "analysis.source.reports.label",
    summaryKey: "analysis.source.reports.summary"
  },
  {
    detailRoute: "observability",
    iconName: "trace",
    key: "observability",
    labelKey: "analysis.source.observability.label",
    summaryKey: "analysis.source.observability.summary"
  },
  {
    detailRoute: "evaluation",
    iconName: "evaluation",
    key: "evaluation-feedback",
    labelKey: "analysis.source.evaluationFeedback.label",
    summaryKey: "analysis.source.evaluationFeedback.summary"
  },
  {
    detailRoute: "model-tools",
    iconName: "models",
    key: "model-tools",
    labelKey: "analysis.source.modelTools.label",
    summaryKey: "analysis.source.modelTools.summary"
  }
];

export function AnalysisContextRunPanels({ onNavigate, viewModel }: AnalysisComponentProps) {
  const { t } = useI18n();

  return (
    <AppSection
      columns={2}
      eyebrow={t("analysis.context.sectionEyebrow")}
      title={t("analysis.context.sectionTitle")}
    >
      <AppBaseCard
        eyebrow={t("analysis.context.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "analysis",
                key: "analysis-context-current",
                label: t("analysis.action.openWithContext"),
                onNavigate,
                route: "analysis",
                variant: "contextPrimary"
              }),
              createRouteAction({
                iconName: "metrics",
                key: "analysis-context-metrics",
                label: t("analysis.action.viewSource"),
                onNavigate,
                route: "metrics",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.context.cardTitle")}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {viewModel.analysisContext.map((item) => (
            <SummaryItemLine item={item} key={item.key} />
          ))}
          <List
            dataSource={sourceRows}
            renderItem={(source) => (
              <List.Item
                actions={[
                  <AppActionGroup
                    actions={[
                      createRouteAction({
                        iconName: source.iconName,
                        key: `${source.key}-source`,
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
        </Space>
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.runs.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "analysis",
                key: "analysis-runs-continue",
                label: t("analysis.action.continueConversation"),
                onNavigate,
                route: "analysis",
                variant: "contextPrimary"
              }),
              createRouteAction({
                iconName: "trace",
                key: "analysis-runs-trace",
                label: t("analysis.action.viewTrace"),
                onNavigate,
                route: "observability",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.runs.cardTitle")}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <SummaryItemLine item={viewModel.selectedRun} titleOverride={t("analysis.runs.current")} />
          <List
            dataSource={viewModel.runList}
            renderItem={(run) => (
              <List.Item>
                <SummaryItemLine item={run} />
              </List.Item>
            )}
            size="small"
          />
        </Space>
      </AppBaseCard>
    </AppSection>
  );
}

function SummaryItemLine({
  item,
  titleOverride
}: {
  item: StaticSummaryItemViewModel;
  titleOverride?: string;
}) {
  const { t } = useI18n();
  const statusTag = item.status?.status === "ready" ? undefined : toStatusTag(t, item.status);
  const riskBadge = toRiskBadge(t, item.risk);

  return (
    <Space direction="vertical" size={6} style={{ width: "100%" }}>
      <Space wrap>
        <Typography.Text strong>{titleOverride ?? item.label}</Typography.Text>
        {statusTag ? <StatusTag {...statusTag} /> : null}
        {riskBadge ? <RiskBadge {...riskBadge} /> : null}
      </Space>
      <Typography.Text>{item.value}</Typography.Text>
      {item.description ? <Typography.Text type="secondary">{item.description}</Typography.Text> : null}
    </Space>
  );
}
