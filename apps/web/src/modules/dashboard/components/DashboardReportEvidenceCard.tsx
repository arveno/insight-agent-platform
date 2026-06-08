import { Flex, Space, Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";

import { mapDashboardEvidenceItem } from "../mappers/mapDashboardEvidenceItem";
import type { DashboardReportEvidenceCardProps } from "./dashboardComponentTypes";

export function DashboardReportEvidenceCard({
  item,
  onNavigate
}: DashboardReportEvidenceCardProps) {
  const { t } = useI18n();

  if (item.kind === "report") {
    const reportActions = [
      createRouteAction({
        iconName: "reports",
        key: `${item.report.key}-view-report`,
        label: t("dashboard.action.viewReports"),
        onNavigate,
        route: "reports",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${item.report.key}-suggestions`,
        label: t("dashboard.action.viewSuggestions"),
        onNavigate,
        route: "analysis",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${item.report.key}-context-analysis`,
        label: t("dashboard.action.analyzeWithContext"),
        onNavigate,
        route: "analysis",
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
              {item.report.updatedAt}
            </Typography.Text>
            <Typography.Text type="secondary">
              {item.report.evidenceCount} {t("dashboard.common.evidenceCountSuffix")}
            </Typography.Text>
          </Space>
        }
        title={item.report.title}
      />
    );
  }

  const evidence = mapDashboardEvidenceItem(t, item.evidence);
  const evidenceActions = [
    createRouteAction({
      iconName: "evidence",
      key: `${evidence.key}-view-evidence`,
      label: t("dashboard.action.viewEvidence"),
      onNavigate,
      route: "reports",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "data",
      key: `${evidence.key}-source`,
      label: t("dashboard.action.viewDataKnowledge"),
      onNavigate,
      route: "data-knowledge",
      variant: "sourceLink"
    }),
    createRouteAction({
      iconName: "trace",
      key: `${evidence.key}-trace`,
      label: t("dashboard.action.viewTrace"),
      onNavigate,
      route: "observability",
      variant: "sourceLink"
    })
  ];

  return (
    <ContentCard
      description={evidence.summary}
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
          <Typography.Text type="secondary">{evidence.sourceTypeLabel}</Typography.Text>
          {evidence.confidenceText ? (
            <Typography.Text type="secondary">{evidence.confidenceText}</Typography.Text>
          ) : null}
        </Space>
      }
      title={evidence.title}
    />
  );
}
