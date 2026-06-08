import { Badge, Flex, Space, Tabs, Typography } from "antd";

import type {
  StaticActionViewModel,
  StaticStatCardViewModel,
  StaticSummaryItemViewModel
} from "../../../shared/view-model/staticViewModelTypes";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { createNavigationActionsFromViewModel } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { getStaticSectionProps } from "../../../shared/layout/sections/getStaticSectionProps";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { PropertyList } from "../../../shared/ui/lists/PropertyList";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { translateKey } from "../../../shared/i18n/translateKey";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import type { ModelToolsViewModel } from "../models/modelToolsViewModel";

export type ModelToolsSectionsProps = PageRouteProps & {
  viewModel: ModelToolsViewModel;
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

function renderStatCards(
  items: StaticStatCardViewModel[],
  t: ReturnType<typeof useI18n>["t"]
) {
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
  onNavigate: ModelToolsSectionsProps["onNavigate"],
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

export function ModelToolsSections({ onNavigate, viewModel }: ModelToolsSectionsProps) {
  const { t } = useI18n();
  const pageActions = renderNavigationActions(
    [viewModel.primaryAction, ...viewModel.secondaryActions],
    onNavigate,
    t
  );
  const tabContentByKey = {
    modelConfigs: <PropertyList items={[viewModel.selectedModelConfig, ...viewModel.modelConfigs]} />,
    promptVersions: (
      <PropertyList items={[viewModel.selectedPromptVersion, ...viewModel.promptVersions]} />
    ),
    ragStrategies: (
      <PropertyList items={[viewModel.selectedRagStrategy, ...viewModel.ragStrategies]} />
    ),
    routingPolicies: (
      <PropertyList items={[viewModel.selectedRoutingPolicy, ...viewModel.routingPolicies]} />
    ),
    toolDefinitions: (
      <PropertyList items={[viewModel.selectedToolDefinition, ...viewModel.toolDefinitions]} />
    )
  } as const;

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
        {renderSummaryCards([viewModel.configDetail, ...viewModel.permissionSummaryEntries], t)}
        {renderStatCards(viewModel.metricCards, t)}
      </PageIntro>

      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[0])}>
        <Tabs
          activeKey={viewModel.selectedTab}
          items={viewModel.modelToolsTabs.map((tab) => ({
            children: tabContentByKey[tab.key as keyof typeof tabContentByKey],
            key: tab.key,
            label: (
              <Space>
                {translateKey(t, tab.labelKey)}
                {typeof tab.count === "number" ? <Badge count={tab.count} size="small" /> : null}
              </Space>
            )
          }))}
        />
      </ContentSection>
      <ContentSection {...getStaticSectionProps(t, viewModel.mainSections[2])}>
        {renderNavigationActions(
          [
            ...viewModel.permissionEntrances,
            ...viewModel.relatedDataKnowledgeEntrances,
            ...viewModel.runtimeObservationEntrances
          ],
          onNavigate,
          t
        )}
      </ContentSection>
    </SectionStack>
  );
}
