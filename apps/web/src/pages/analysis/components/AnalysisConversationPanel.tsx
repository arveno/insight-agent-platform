import { List, Space, Typography } from "antd";

import {
  AppActionGroup,
  AppBaseCard,
  AppSection,
  RiskBadge,
  SourceEvidenceList,
  useI18n
} from "../../../shared";
import { toEvidenceItem, toRiskBadge } from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

const followUpQuestionKeys = [
  "analysis.followUp.question.revenue",
  "analysis.followUp.question.evidence",
  "analysis.followUp.question.report"
] as const;

export function AnalysisConversationPanel({ onNavigate, viewModel }: AnalysisComponentProps) {
  const { t } = useI18n();
  const result = viewModel.resultPreview[0];
  const resultRisk = toRiskBadge(t, result?.risk);
  const contextRisk = toRiskBadge(t, viewModel.analysisContext[0]?.risk);

  return (
    <AppSection
      columns={2}
      eyebrow={t("analysis.conversation.sectionEyebrow")}
      title={t("analysis.conversation.sectionTitle")}
    >
      <AppBaseCard
        eyebrow={t("analysis.result.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "analysis",
                key: "analysis-result-follow-up",
                label: t("analysis.action.continueQuestion"),
                onNavigate,
                route: "analysis",
                variant: "contextPrimary"
              }),
              createRouteAction({
                iconName: "evidence",
                key: "analysis-result-evidence",
                label: t("analysis.action.viewEvidence"),
                onNavigate,
                route: "reports",
                variant: "sourceLink"
              }),
              createRouteAction({
                iconName: "reports",
                key: "analysis-result-report",
                label: t("analysis.action.viewReports"),
                onNavigate,
                route: "reports",
                variant: "sourceLink"
              })
            ]}
          />
        }
        meta={
          <SourceEvidenceList
            empty={{ title: t("state.empty.default.title") }}
            items={viewModel.evidenceEntrances.slice(0, 1).map((item) => toEvidenceItem(t, item))}
          />
        }
        tagSlot={resultRisk ? <RiskBadge {...resultRisk} /> : null}
        title={t("analysis.result.cardTitle")}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text>{result?.value}</Typography.Text>
          <Typography.Text type="secondary">{t("analysis.result.description")}</Typography.Text>
        </Space>
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.anomaly.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "risk",
                key: "analysis-anomaly-analyze",
                label: t("analysis.action.analyzeAnomaly"),
                onNavigate,
                route: "analysis",
                variant: "contextPrimary"
              }),
              createRouteAction({
                iconName: "metrics",
                key: "analysis-anomaly-metrics",
                label: t("analysis.action.viewSource"),
                onNavigate,
                route: "metrics",
                variant: "sourceLink"
              })
            ]}
          />
        }
        tagSlot={contextRisk ? <RiskBadge {...contextRisk} /> : null}
        title={t("analysis.anomaly.cardTitle")}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text>{viewModel.analysisContext[0]?.value}</Typography.Text>
          <Typography.Text type="secondary">{t("analysis.anomaly.description")}</Typography.Text>
        </Space>
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.followUp.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "analysis",
                key: "analysis-follow-up-action",
                label: t("analysis.action.continueQuestion"),
                onNavigate,
                route: "analysis",
                variant: "contextPrimary"
              })
            ]}
          />
        }
        title={t("analysis.followUp.cardTitle")}
      >
        <List
          dataSource={[...followUpQuestionKeys]}
          renderItem={(questionKey) => (
            <List.Item>
              <Typography.Text>{t(questionKey)}</Typography.Text>
            </List.Item>
          )}
          size="small"
        />
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.result.boundaryEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "trace",
                key: "analysis-result-trace",
                label: t("analysis.action.viewTrace"),
                onNavigate,
                route: "observability",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.result.boundaryTitle")}
      >
        <Typography.Text type="secondary">{t("analysis.result.boundaryDescription")}</Typography.Text>
      </AppBaseCard>
    </AppSection>
  );
}
