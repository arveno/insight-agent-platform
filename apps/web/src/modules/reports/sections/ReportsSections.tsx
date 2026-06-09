import { Flex, List, Space, Typography } from "antd";

import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { createNavigationActionsFromViewModel } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { shellThemeTokens } from "../../../shared/theme/tokens";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { TitledList } from "../../../shared/ui/lists/TitledList";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";

import { DecisionCard } from "../components/DecisionCard";
import { ReportFeedbackPanel } from "../components/ReportFeedbackPanel";
import { ReportSection } from "../components/ReportSection";
import type { ReportsViewModel } from "../models/reportsViewModel";
export type ReportsSectionsProps = PageRouteProps & {
  viewModel: ReportsViewModel;
};

export function ReportsSections({ onNavigate, viewModel }: ReportsSectionsProps) {
  const { t } = useI18n();
  const followUpActions = createNavigationActionsFromViewModel(
    [viewModel.followUpAction],
    onNavigate,
    t
  );
  const pageActions = createNavigationActionsFromViewModel(
    [viewModel.primaryAction, ...viewModel.secondaryActions],
    onNavigate,
    t
  );

  return (
    <SectionStack>
      <PageIntro
        description={viewModel.selectedReport.summary}
        eyebrow={translateKey(t, viewModel.pageTitleKey)}
        extra={
          pageActions.length > 0 ? (
            <Flex gap={shellThemeTokens.cardGridGap} wrap>
              {pageActions.map((action) => (
                <NavigationActionButton action={action} key={action.key} />
              ))}
            </Flex>
          ) : undefined
        }
        supportingText={`${translateKey(t, "chrome.lastUpdated")}: ${viewModel.lastUpdatedAt}`}
        title={viewModel.selectedReport.title}
      >
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
      </PageIntro>

      <ContentSection
        {...getStaticSectionProps(t, viewModel.mainSections[0])}
        contentLayout="stack"
      >
        {viewModel.reportSections.map((section) => (
          <ReportSection
            content={section.content}
            evidenceSummary={section.evidenceSummary}
            key={section.reportSectionId}
            risk={toRiskBadge(t, section.risk)}
            title={section.title}
          />
        ))}
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

      <ContentSection
        {...getStaticSectionProps(t, viewModel.mainSections[2])}
        contentLayout="stack"
      >
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

        <ReportFeedbackPanel
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
      </ContentSection>
    </SectionStack>
  );
}
