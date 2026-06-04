import { Typography } from "antd";

import { AppActionGroup, AppBaseCard, AppSection, useI18n } from "../../../shared";
import {
  EvidencePanel,
  ReportEntranceList,
  TracePanel,
  toReportItem
} from "../../_shared";
import { createRouteAction } from "../../_shared/actions";
import type { AnalysisComponentProps } from "./analysisComponentTypes";

export function AnalysisEntrancesPanel({ onNavigate, viewModel }: AnalysisComponentProps) {
  const { t } = useI18n();

  return (
    <AppSection
      columns={3}
      eyebrow={t("analysis.entrances.sectionEyebrow")}
      title={t("analysis.entrances.sectionTitle")}
    >
      <AppBaseCard
        eyebrow={t("analysis.evidence.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "evidence",
                key: "analysis-evidence-reports",
                label: t("analysis.action.viewEvidence"),
                onNavigate,
                route: "reports",
                variant: "sourceLink"
              }),
              createRouteAction({
                iconName: "source",
                key: "analysis-evidence-data",
                label: t("analysis.action.viewDataKnowledge"),
                onNavigate,
                route: "data-knowledge",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.evidence.cardTitle")}
      >
        <EvidencePanel items={viewModel.evidenceEntrances} />
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.trace.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "trace",
                key: "analysis-trace-observability",
                label: t("analysis.action.viewTrace"),
                onNavigate,
                route: "observability",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.trace.cardTitle")}
      >
        <TracePanel items={viewModel.traceEntrances} />
      </AppBaseCard>

      <AppBaseCard
        eyebrow={t("analysis.report.cardEyebrow")}
        footerActions={
          <AppActionGroup
            actions={[
              createRouteAction({
                iconName: "reports",
                key: "analysis-report-reports",
                label: t("analysis.action.viewReports"),
                onNavigate,
                route: "reports",
                variant: "sourceLink"
              }),
              createRouteAction({
                iconName: "reports",
                key: "analysis-report-suggestions",
                label: t("analysis.action.viewSuggestions"),
                onNavigate,
                route: "reports",
                variant: "sourceLink"
              })
            ]}
          />
        }
        title={t("analysis.report.cardTitle")}
      >
        <Typography.Text type="secondary">{t("analysis.report.description")}</Typography.Text>
        <ReportEntranceList
          items={viewModel.reportEntrances.map((item) => toReportItem(t, item))}
        />
      </AppBaseCard>
    </AppSection>
  );
}
