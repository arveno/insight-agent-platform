import { Flex, List, Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import {
  createNavigationActionsFromViewModel
} from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { TitledList } from "../../../shared/ui/lists/TitledList";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { WebPageProps } from "../../../shared/navigation/navigationTypes";

import { FeedbackPanel } from "../../feedback/FeedbackPanel";
import { DecisionCard } from "../DecisionCard";
import type { ReportsViewModel } from "../models/reportsViewModel";
import { ReportSection } from "../ReportSection";
export type ReportsSectionsProps = WebPageProps & {
  viewModel: ReportsViewModel;
};

export function ReportsSections({ onNavigate, viewModel }: ReportsSectionsProps) {
  const { t } = useI18n();
  const followUpActions = createNavigationActionsFromViewModel(
    [viewModel.followUpAction],
    onNavigate,
    t
  );

  return (
    <Space direction="vertical" size={shellThemeTokens.pageSectionGap} style={{ width: "100%" }}>
      <ContentCard
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

      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[0])}>
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
      </ContentSection>

      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[1])}>
        <TitledList
          items={viewModel.sourceEvidence.map((evidence) => ({
            key: evidence.sourceEvidenceId,
            meta: (
              <Space wrap>
                <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                  {evidence.sourceTypeLabel}
                </Typography.Text>
                {evidence.confidenceText ? (
                  <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                    {evidence.confidenceText}
                  </Typography.Text>
                ) : null}
              </Space>
            ),
            summary: evidence.summary,
            title: evidence.title
          }))}
        />
      </ContentSection>

      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[2])}>
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

          <ContentCard
            description={t("reports.reader.actionSuggestions.description")}
            title={t("reports.reader.actionSuggestions.title")}
          >
            <List
              dataSource={viewModel.actionSuggestions}
              renderItem={(suggestion) => <List.Item>{suggestion.summary}</List.Item>}
            />
          </ContentCard>

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

          <ContentCard
            description={t("reports.reader.followUp.description")}
            footerActions={
              <Flex gap={12} wrap>
                {followUpActions.map((action) => (
                  <NavigationActionButton action={action} key={action.key} />
                ))}
              </Flex>
            }
            title={t("reports.reader.followUp.title")}
          />
        </Space>
      </ContentSection>
    </Space>
  );
}
