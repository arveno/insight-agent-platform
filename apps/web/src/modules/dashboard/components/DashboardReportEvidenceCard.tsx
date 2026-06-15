import { Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";

import type { DashboardReportEvidenceCardProps } from "./dashboardComponentTypes";

export function DashboardReportEvidenceCard(props: DashboardReportEvidenceCardProps) {
  const { t } = useI18n();

  if (props.kind === "report") {
    return (
      <ContentCard
        description={props.report.summary}
        eyebrow={t("dashboard.reportEvidence.recentReportEyebrow")}
        meta={
          props.report.chips?.length ? (
            <Typography.Text type="secondary">{props.report.chips.join(" · ")}</Typography.Text>
          ) : null
        }
        title={props.report.title}
      />
    );
  }

  return (
    <ContentCard
      description={props.evidence.summary}
      eyebrow={t("dashboard.reportEvidence.evidenceEyebrow")}
      meta={
        props.evidence.chips?.length ? (
          <Typography.Text type="secondary">{props.evidence.chips.join(" · ")}</Typography.Text>
        ) : null
      }
      title={props.evidence.title}
    />
  );
}
