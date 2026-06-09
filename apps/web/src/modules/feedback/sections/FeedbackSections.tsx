import { Badge, Flex, Space, Typography } from "antd";

import type {
  StaticActionViewModel,
  StaticStatCardViewModel,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { createNavigationActionsFromViewModel } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { PropertyList } from "../../../shared/ui/lists/PropertyList";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import type { FeedbackViewModel } from "../models/feedbackViewModel";

export type FeedbackSectionsProps = PageRouteProps & {
  viewModel: FeedbackViewModel;
};

function renderSummaryCards(
  items: StaticSummaryItemViewModel[],
  t: ReturnType<typeof useI18n>["t"]
) {
  return items.map((item) => {
    const status = toStatusTag(t, item.status);
    const risk = toRiskBadge(t, item.risk);

    return (
      <ContentCard
        description={item.description}
        key={item.key}
        meta={
          item.meta ? (
            <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
              {item.meta}
            </Typography.Text>
          ) : null
        }
        tagSlot={
          status || risk ? (
            <Space wrap>
              {status ? <StatusTag {...status} /> : null}
              {risk ? <RiskBadge {...risk} /> : null}
            </Space>
          ) : undefined
        }
        title={item.label}
      >
        <Typography.Text style={shellTypographyStyles.cardValue}>{item.value}</Typography.Text>
      </ContentCard>
    );
  });
}

function renderStatCards(items: StaticStatCardViewModel[], t: ReturnType<typeof useI18n>["t"]) {
  return items.map((metric) => (
    <StatCard
      supportingMeta={
        <Space wrap>
          {metric.trendText ? (
            <Typography.Text type="secondary">{metric.trendText}</Typography.Text>
          ) : null}
          {typeof metric.evidenceCount === "number" ? (
            <Badge count={metric.evidenceCount} overflowCount={99} />
          ) : null}
        </Space>
      }
      key={metric.key}
      risk={toRiskBadge(t, metric.risk)}
      status={toStatusTag(t, metric.status)}
      title={metric.label}
      value={metric.valueText}
    />
  ));
}

function renderNavigationActions(
  actions: StaticActionViewModel[],
  onNavigate: FeedbackSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  const navigationActions = createNavigationActionsFromViewModel(actions, onNavigate, t);

  if (navigationActions.length === 0) {
    return null;
  }

  return (
    <Flex gap={12} wrap>
      {navigationActions.map((action) => (
        <NavigationActionButton action={action} key={action.key} />
      ))}
    </Flex>
  );
}

export function FeedbackSections({ onNavigate, viewModel }: FeedbackSectionsProps) {
  const { t } = useI18n();
  const pageActions = renderNavigationActions(
    [viewModel.primaryAction, ...viewModel.secondaryActions],
    onNavigate,
    t
  );

  return (
    <SectionStack>
      <PageIntro
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        description={translateKey(t, viewModel.pageDescriptionKey)}
        extra={pageActions}
        supportingText={`${translateKey(t, "chrome.lastUpdated")}: ${viewModel.lastUpdatedAt}`}
        title={translateKey(t, viewModel.pageTitleKey)}
      >
        {renderSummaryCards(viewModel.feedbackOverview, t)}
        {renderStatCards(viewModel.metricCards, t)}
      </PageIntro>

      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[0])}>
        <PropertyList
          items={[
            viewModel.selectedFeedback,
            ...viewModel.feedbackItems,
            ...viewModel.feedbackTypeFilters
          ]}
        />
      </ContentSection>
      <ContentSection
        {...getStaticSectionProps(t, viewModel.mainSections[1])}
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
      >
        {renderSummaryCards(
          [viewModel.feedbackDetail, viewModel.correctionDetail, viewModel.targetObjectContext],
          t
        )}
      </ContentSection>
      <ContentSection
        {...getStaticSectionProps(t, viewModel.mainSections[2])}
        extra={renderNavigationActions(viewModel.secondaryActions, onNavigate, t)}
      >
        <PropertyList items={[...viewModel.badCaseEntrances]} />
      </ContentSection>
    </SectionStack>
  );
}
