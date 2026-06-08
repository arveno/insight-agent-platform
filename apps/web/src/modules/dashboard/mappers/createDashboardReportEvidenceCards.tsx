import { Space, Typography } from "antd";

import type { Translate } from "../../../shared/i18n/translateKey";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import type { NavigateToRoute } from "../../../shared/navigation/navigationTypes";
import type {
  StaticEvidenceEntranceViewModel,
  StaticReportEntranceViewModel
} from "../../../shared/view-model/staticViewModelTypes";

import { mapDashboardEvidenceItem } from "./mapDashboardEvidenceItem";
import type { DashboardReportEvidenceCardItem } from "../components/dashboardComponentTypes";

type CreateDashboardReportEvidenceCardsArgs = {
  evidenceEntrances: StaticEvidenceEntranceViewModel[];
  onNavigate?: NavigateToRoute;
  recentReports: StaticReportEntranceViewModel[];
  t: Translate;
};

export function createDashboardReportEvidenceCards({
  evidenceEntrances,
  onNavigate,
  recentReports,
  t
}: CreateDashboardReportEvidenceCardsArgs): DashboardReportEvidenceCardItem[] {
  const reportCards = recentReports.map((report) => ({
    actions: [
      createRouteAction({
        iconName: "reports",
        key: `${report.key}-view-report`,
        label: t("dashboard.action.viewReports"),
        onNavigate,
        route: "reports",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${report.key}-suggestions`,
        label: t("dashboard.action.viewSuggestions"),
        onNavigate,
        route: "analysis",
        variant: "objectDetail"
      }),
      createRouteAction({
        iconName: "analysis",
        key: `${report.key}-context-analysis`,
        label: t("dashboard.action.analyzeWithContext"),
        onNavigate,
        route: "analysis",
        variant: "contextPrimary"
      })
    ],
    description: t("dashboard.reportEvidence.suggestionSummary"),
    eyebrow: t("dashboard.reportEvidence.recentReportEyebrow"),
    key: report.key,
    meta: (
      <Space wrap>
        <Typography.Text type="secondary">
          {t("dashboard.common.updatedAtPrefix")}
          {report.updatedAt}
        </Typography.Text>
        <Typography.Text type="secondary">
          {report.evidenceCount} {t("dashboard.common.evidenceCountSuffix")}
        </Typography.Text>
      </Space>
    ),
    title: report.title
  }));
  const evidenceCards = evidenceEntrances.map((item) => {
    const evidence = mapDashboardEvidenceItem(t, item);

    return {
      actions: [
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
      ],
      description: evidence.summary,
      eyebrow: t("dashboard.reportEvidence.evidenceEyebrow"),
      key: evidence.key,
      meta: (
        <Space wrap>
          <Typography.Text type="secondary">{evidence.sourceTypeLabel}</Typography.Text>
          {evidence.confidenceText ? (
            <Typography.Text type="secondary">{evidence.confidenceText}</Typography.Text>
          ) : null}
        </Space>
      ),
      title: evidence.title
    };
  });

  return [...reportCards, ...evidenceCards];
}
