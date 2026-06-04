import { Space, Typography } from "antd";

import type { ReportsViewModel } from "../../../features/static-view-models";
import { DecisionCard, FeedbackPanel, ReportSection, useI18n } from "../../../shared";
import {
  ActionBar,
  EvidencePanel,
  ReportEntranceList,
  SummaryCardGrid,
  SummaryTable,
  WebSection,
  summaryDescription,
  summaryMeta,
  toReportItem,
  toRiskBadge,
  toStatusTag,
  type WebPageProps
} from "../../_shared";

export type ReportsSectionsProps = WebPageProps & {
  viewModel: ReportsViewModel;
};

export function ReportsSections({ onNavigate, viewModel }: ReportsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <WebSection section={viewModel.mainSections[0]}>
        <ReportEntranceList items={viewModel.reportsList.map((item) => toReportItem(t, item))} />
      </WebSection>
      <WebSection section={viewModel.mainSections[1]}>
        <SummaryCardGrid items={[viewModel.reportReader]} />
        <SummaryTable items={[viewModel.selectedReport].map((item) => toReportItem(t, item))} />
      </WebSection>
      <WebSection section={viewModel.mainSections[2]}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {viewModel.reportSections.map((section) => (
            <ReportSection
              content={summaryDescription(section) ?? section.value}
              evidenceSummary={summaryMeta(section)}
              key={section.key}
              risk={toRiskBadge(t, section.risk)}
              title={section.label}
            />
          ))}
          {viewModel.decisionSummary.map((decision) => (
            <DecisionCard
              description={decision.actionSuggestions.join(" / ")}
              key={decision.key}
              risk={toRiskBadge(t, decision.risk)}
              status={toStatusTag(t, decision.status)}
              title={decision.title}
            />
          ))}
          <FeedbackPanel
            disabled
            helperText={viewModel.feedbackEntrance.types.join(" / ")}
            options={[
              { label: t("feedback.option.useful"), value: "useful" },
              { label: t("feedback.option.issue"), value: "issue" }
            ]}
            submitLabel={t("feedback.submit")}
            targetTitle={viewModel.feedbackEntrance.targetId}
            title={viewModel.feedbackEntrance.title}
          />
          <EvidencePanel items={viewModel.sourceEvidenceEntrances} />
          <ActionBar actions={[viewModel.followUpContext]} onNavigate={onNavigate} t={t} />
          <Typography.Text type="secondary">
            {viewModel.actionSuggestions.join(" / ")}
          </Typography.Text>
        </Space>
      </WebSection>
    </Space>
  );
}
