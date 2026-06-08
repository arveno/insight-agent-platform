import { List, Space, Typography } from "antd";

import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { AppSection } from "../../../shared/layout/sections/AppSection";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import { ActionBar } from "../../../app/router/RouteActionBar";
import type { WebPageProps } from "../../../app/router/pageProps";

import { SourceEvidenceList } from "../../analysis/SourceEvidenceList";
import { FeedbackPanel } from "../../feedback/FeedbackPanel";
import { DecisionCard } from "../DecisionCard";
import type { ReportsViewModel } from "../models/reportsViewModel";
import { ReportSection } from "../ReportSection";
export type ReportsSectionsProps = WebPageProps & {
  viewModel: ReportsViewModel;
};

export function ReportsSections({ onNavigate, viewModel }: ReportsSectionsProps) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={shellThemeTokens.pageSectionGap} style={{ width: "100%" }}>
      <AppBaseCard
        description={viewModel.selectedReport.summary}
        eyebrow={viewModel.selectedReport.sourceContext}
        meta={
          <Space wrap size={[12, 8]}>
            {[
              `reportId: ${viewModel.selectedReport.reportId}`,
              `runId: ${viewModel.selectedReport.runId}`,
              `workspaceId: ${viewModel.selectedReport.workspaceId}`,
              `createdAt: ${viewModel.selectedReport.createdAt}`
            ].map((item) => (
              <Typography.Text key={item} type="secondary" style={shellTypographyStyles.meta}>
                {item}
              </Typography.Text>
            ))}
          </Space>
        }
        title={viewModel.selectedReport.title}
      />

      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[0])} useGrid={false}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {viewModel.reportSections.map((section) => (
            <ReportSection
              content={section.content}
              evidenceSummary={section.evidenceSummary}
              key={section.reportSectionId}
              risk={toRiskBadge(t, section.risk)}
              title={section.title}
            />
          ))}
        </Space>
      </AppSection>

      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[1])} useGrid={false}>
        <SourceEvidenceList
          items={viewModel.sourceEvidence.map((evidence) => ({
            confidenceText: evidence.confidenceText,
            key: evidence.sourceEvidenceId,
            sourceTypeLabel: evidence.sourceTypeLabel,
            summary: evidence.summary,
            title: evidence.title
          }))}
        />
      </AppSection>

      <AppSection {...getStaticSectionProps(t, viewModel.mainSections[2])} useGrid={false}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {t("reports.reader.decisions.title")}
          </Typography.Text>
          {viewModel.decisions.map((decision) => (
            <DecisionCard
              description={decision.actionSuggestions.join(" / ")}
              evidenceSummary={decision.evidenceSummary}
              key={decision.decisionId}
              risk={toRiskBadge(t, decision.risk)}
              status={toStatusTag(t, decision.status)}
              title={decision.title}
            />
          ))}

          <AppBaseCard
            description={t("reports.reader.actionSuggestions.description")}
            title={t("reports.reader.actionSuggestions.title")}
          >
            <List
              dataSource={viewModel.actionSuggestions}
              renderItem={(suggestion) => <List.Item>{suggestion.summary}</List.Item>}
            />
          </AppBaseCard>

          <FeedbackPanel
            helperText={viewModel.feedbackEntrance.types.join(" / ")}
            options={[
              { label: t("feedback.option.useful"), value: "useful" },
              { label: t("feedback.option.issue"), value: "issue" }
            ]}
            submitLabel={viewModel.feedbackEntrance.title}
            targetTitle={viewModel.selectedReport.title}
            title={t("reports.reader.feedback.title")}
            value="useful"
          />

          <AppBaseCard
            description={t("reports.reader.followUp.description")}
            footerActions={
              <ActionBar actions={[viewModel.followUpAction]} onNavigate={onNavigate} t={t} />
            }
            title={t("reports.reader.followUp.title")}
          />
        </Space>
      </AppSection>
    </Space>
  );
}
