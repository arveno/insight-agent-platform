import { Flex, Space, Typography } from "antd";

import type { I18nMessageKey } from "../../../shared/i18n/messages";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey, type Translate } from "../../../shared/i18n/translateKey";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";

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
  "metric-revenue-evidence": "evidence.summary.metricRevenue",
  "quality-job-evidence": "evidence.summary.qualityJob"
};

const titleKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.title.metricRevenue",
  "quality-job-evidence": "evidence.title.qualityJob"
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
    const reportDraftContextPack = {
      chips: [
        `${props.report.evidenceCount} 条证据`,
        `更新时间 ${props.report.updatedAt}`
      ],
      sourceId: props.report.reportId,
      sourceTitle: props.report.title,
      sourceType: "report",
      suggestedPrompt: `请基于报告《${props.report.title}》继续分析关键证据和后续建议。`,
      summary: t("dashboard.reportEvidence.suggestionSummary")
    };
    const reportActions = [
      createRouteAction({
        iconName: "reports",
        key: `${props.report.key}-view-report`,
        label: t("dashboard.action.viewReports"),
        onNavigate,
        route: "reports",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.key}-suggestions`,
        label: t("dashboard.action.viewSuggestions"),
        onNavigate,
        route: "analysis",
        routeState: {
          draftContextPack: reportDraftContextPack
        },
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${props.report.key}-context-analysis`,
        label: t("dashboard.action.analyzeWithContext"),
        onNavigate,
        route: "analysis",
        routeState: {
          draftContextPack: reportDraftContextPack
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
              {t("dashboard.common.updatedAtPrefix")}
              {props.report.updatedAt}
            </Typography.Text>
            <Typography.Text type="secondary">
              {props.report.evidenceCount} {t("dashboard.common.evidenceCountSuffix")}
            </Typography.Text>
          </Space>
        }
        title={props.report.title}
      />
    );
  }

  const evidenceTitleKey = titleKeyByEvidenceKey[props.evidence.key];
  const evidenceSummaryKey = summaryKeyByEvidenceKey[props.evidence.key];
  const evidenceTitle = evidenceTitleKey ? translateKey(t, evidenceTitleKey) : props.evidence.title;
  const evidenceSummary = evidenceSummaryKey
    ? translateKey(t, evidenceSummaryKey)
    : props.evidence.summary;
  const evidenceSourceTypeLabel =
    translateMappedText(t, props.evidence.sourceType, sourceTypeKeyByLabel) ??
    props.evidence.sourceType;
  const evidenceConfidenceText = translateMappedText(
    t,
    props.evidence.confidenceText,
    confidenceKeyByText
  );
  const evidenceActions = [
    createRouteAction({
      iconName: "evidence",
      key: `${props.evidence.key}-view-evidence`,
      label: t("dashboard.action.viewEvidence"),
      onNavigate,
      route: "reports",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "analysis",
      key: `${props.evidence.key}-context-analysis`,
      label: t("dashboard.action.analyzeWithContext"),
      onNavigate,
      route: "analysis",
      routeState: {
        draftContextPack: {
          chips: [evidenceSourceTypeLabel, evidenceConfidenceText ?? "可信度未标注"],
          sourceId: props.evidence.sourceId,
          sourceTitle: evidenceTitle,
          sourceType: "evidence",
          suggestedPrompt: `请基于证据《${evidenceTitle}》继续分析它对当前经营判断的影响。`,
          summary: evidenceSummary
        }
      },
      variant: "contextPrimary"
    }),
    createRouteAction({
      iconName: "data",
      key: `${props.evidence.key}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${props.evidence.key}-trace`,
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
