import { Flex, Space, Typography } from "antd";

import type { I18nMessageKey } from "../../../shared/i18n/messages";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey, type Translate } from "../../../shared/i18n/translateKey";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { createDashboardAnalysisContextPack } from "../mappers/createDashboardAnalysisContextPack";

import type { DashboardReportEvidenceCardProps } from "./dashboardComponentTypes";

const sourceTypeKeyByLabel: Record<string, I18nMessageKey> = {
  "DataQualityCheck / Job": "evidence.sourceType.dataQualityJob",
  "Metric / Report": "evidence.sourceType.metricReport"
};

const confidenceKeyByText: Record<string, I18nMessageKey> = {
  High: "evidence.confidence.high",
  Medium: "evidence.confidence.medium"
};

const summaryKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "dashboard-node-evidence-revenue-summary": "evidence.summary.metricRevenue",
  "dashboard-node-evidence-quality-job": "evidence.summary.qualityJob"
};

const titleKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "dashboard-node-evidence-revenue-summary": "evidence.title.metricRevenue",
  "dashboard-node-evidence-quality-job": "evidence.title.qualityJob"
};

function translateMappedText(
  t: Translate,
  value: string | undefined,
  keyMap: Record<string, I18nMessageKey>
) {
  if (!value) {
    return undefined;
  }

  const key = keyMap[value];

  return key ? translateKey(t, key) : value;
}

export function DashboardReportEvidenceCard(props: DashboardReportEvidenceCardProps) {
  const { onNavigate } = props;
  const { t } = useI18n();

  if (props.kind === "report") {
    const reportActions = [
      createRouteAction({
        iconName: "reports",
        key: `${props.report.nodeId}-view-report`,
        label: t("dashboard.action.viewReports"),
        onNavigate,
        route: "reports",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.nodeId}-suggestions`,
        label: t("dashboard.action.viewSuggestions"),
        onNavigate,
        route: "analysis",
        routeState: {
          analysisContextPack: createDashboardAnalysisContextPack({
            nodeId: props.report.nodeId,
            suggestedPrompt: `请基于报告《${props.report.title}》继续分析关键证据和后续建议。`,
            viewModel: props.viewModel
          })
        },
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.nodeId}-context-analysis`,
        label: t("dashboard.action.analyzeWithContext"),
        onNavigate,
        route: "analysis",
        routeState: {
          analysisContextPack: createDashboardAnalysisContextPack({
            nodeId: props.report.nodeId,
            suggestedPrompt: `请基于报告《${props.report.title}》继续分析关键证据和后续建议。`,
            viewModel: props.viewModel
          })
        },
        variant: "contextPrimary"
      })
    ];

    return (
      <ContentCard
        description={t("dashboard.reportEvidence.suggestionSummary")}
        eyebrow={t("dashboard.reportEvidence.recentReportEyebrow")}
        footerActions={
          <Flex gap={12} wrap>
            {reportActions.map((action) => (
              <NavigationActionButton action={action} key={action.key} />
            ))}
          </Flex>
        }
        meta={
          <Space wrap>
            <Typography.Text type="secondary">
              {props.report.chips?.[1] ?? "更新时间未提供"}
            </Typography.Text>
            <Typography.Text type="secondary">
              {props.report.chips?.[0] ?? `0 ${t("dashboard.common.evidenceCountSuffix")}`}
            </Typography.Text>
          </Space>
        }
        title={props.report.title}
      />
    );
  }

  const evidenceTitleKey = titleKeyByEvidenceKey[props.evidence.nodeId];
  const evidenceSummaryKey = summaryKeyByEvidenceKey[props.evidence.nodeId];
  const evidenceTitle = evidenceTitleKey ? translateKey(t, evidenceTitleKey) : props.evidence.title;
  const evidenceSummary = evidenceSummaryKey ? translateKey(t, evidenceSummaryKey) : props.evidence.summary;
  const evidenceSourceTypeLabel =
    translateMappedText(t, props.evidence.chips?.[0], sourceTypeKeyByLabel) ?? props.evidence.chips?.[0];
  const evidenceConfidenceText = translateMappedText(t, props.evidence.chips?.[1], confidenceKeyByText);
  const evidenceActions = [
    createRouteAction({
      iconName: "evidence",
      key: `${props.evidence.nodeId}-view-evidence`,
      label: t("dashboard.action.viewEvidence"),
      onNavigate,
      route: "reports",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${props.evidence.nodeId}-context-analysis`,
      label: t("dashboard.action.analyzeWithContext"),
      onNavigate,
      route: "analysis",
      routeState: {
        analysisContextPack: createDashboardAnalysisContextPack({
          nodeId: props.evidence.nodeId,
          suggestedPrompt: `请基于证据《${evidenceTitle}》继续分析它对当前经营判断的影响。`,
          viewModel: props.viewModel
        })
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${props.evidence.nodeId}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${props.evidence.nodeId}-trace`,
      label: t("dashboard.action.viewTrace"),
      onNavigate,
      route: "observability",
      variant: "sourceLink"
    })
  ];

  return (
    <ContentCard
      description={evidenceSummary}
      eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
      footerActions={
        <Flex gap={12} wrap>
          {evidenceActions.map((action) => (
            <NavigationActionButton action={action} key={action.key} />
          ))}
        </Flex>
      }
      meta={
        <Space wrap>
          <Typography.Text type="secondary">{evidenceSourceTypeLabel}</Typography.Text>
          {evidenceConfidenceText ? (
            <Typography.Text type="secondary">{evidenceConfidenceText}</Typography.Text>
          ) : null}
        </Space>
      }
      title={evidenceTitle}
    />
  );
}
