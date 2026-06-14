import type { ReactNode } from "react";
import { Select, Space, Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { TitledList } from "../../../shared/ui/lists/TitledList";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";

import type { MetricDetailViewModel, MetricsViewModel } from "../models/metricsViewModel";

export type MetricsSectionsProps = PageRouteProps & {
  viewModel: MetricsViewModel;
};

export type MetricsInspectorPanelProps = {
  viewModel: MetricsViewModel;
};

function buildAnalysisAction(
  metric: MetricDetailViewModel,
  onNavigate: MetricsSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  return createRouteAction({
    iconName: "analysis",
    key: `${metric.metricId}-analysis`,
    label: t("action.metricOpenAnalysis.label"),
    onNavigate,
    route: "analysis",
    routeState: {
      analysisContextPack: metric.analysisContextPack
    },
    title: t("action.metricOpenAnalysis.description"),
    variant: "contextPrimary"
  });
}

function buildLineageAction(
  contextKey: string,
  onNavigate: MetricsSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  return createRouteAction({
    iconName: "data",
    key: `${contextKey}-lineage`,
    label: t("action.metricsOpenDataKnowledge.label"),
    onNavigate,
    route: "data-knowledge",
    variant: "objectDetail"
  });
}

function MetricHeaderCard({
  metric,
  onNavigate,
  t
}: {
  metric: MetricDetailViewModel;
  onNavigate: MetricsSectionsProps["onNavigate"];
  t: ReturnType<typeof useI18n>["t"];
}) {
  const analysisAction = buildAnalysisAction(metric, onNavigate, t);

  return (
    <StatCard
      description={metric.definition}
      meta={
        <Typography.Text type="secondary">
          {`业务域：${metric.businessDomainLabel} / Owner：${metric.ownerTeam}`}
        </Typography.Text>
      }
      supportingMeta={
        <Typography.Text type="secondary">
          {`周期：${metric.period} / As of ${metric.updatedAt}`}
        </Typography.Text>
      }
      tagSlot={
        <Space wrap>
          <StatusTag {...metric.statusView} />
          <RiskBadge {...metric.riskView} />
          <NavigationActionButton action={analysisAction} />
        </Space>
      }
      title={metric.metricName}
      trend={metric.trendLabel}
      value={metric.currentValue}
    />
  );
}

function MetricRelationshipCard({
  metric
}: {
  metric: MetricDetailViewModel;
}) {
  return (
    <ContentCard
      description="当前快照用于解释指标关系和上下文来源；后续会接入事实数据计算。"
      title="指标关系链"
    >
      <TitledList
        items={[
          {
            key: `${metric.metricId}-relationship-sources`,
            summary: (
              <Space direction="vertical" size={4}>
                {metric.contextSources.map((source) => (
                  <Space key={source.key} size={8} wrap>
                    <Typography.Text>{source.title}</Typography.Text>
                    <Typography.Text type="secondary">{source.meta}</Typography.Text>
                  </Space>
                ))}
              </Space>
            ),
            title: "输入来源"
          },
          {
            key: `${metric.metricId}-relationship-formula`,
            summary: metric.formulaSummary,
            title: "公式"
          },
          {
            key: `${metric.metricId}-relationship-snapshot`,
            summary: `${metric.currentValue} · ${metric.period} · As of ${metric.updatedAt}`,
            title: "当前快照"
          },
          {
            key: `${metric.metricId}-relationship-threshold`,
            summary: (
              <Space direction="vertical" size={4}>
                <Typography.Text>{metric.thresholdSummary}</Typography.Text>
                <Space wrap>
                  <RiskBadge {...metric.riskView} />
                  <StatusTag {...metric.statusView} />
                </Space>
              </Space>
            ),
            title: "阈值 / 风险"
          },
          {
            key: `${metric.metricId}-relationship-analysis`,
            summary: "使用 existing analysisContextPack 带当前指标上下文进入 Analysis 草稿态。",
            title: "Analysis"
          }
        ]}
      />
    </ContentCard>
  );
}

function MetricDefinitionCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard
      description="当前阶段只解释业务定义，不新增指标或改写指标规则。"
      eyebrow={metric.businessDomainLabel}
      title="业务定义"
    >
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.definition}
      </Typography.Text>
    </ContentCard>
  );
}

function MetricFormulaCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard description="只读展示公式摘要，不写入配置也不触发底层计算。" title="公式摘要">
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.formulaSummary}
      </Typography.Text>
    </ContentCard>
  );
}

function MetricThresholdCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard
      description="阈值与风险只解释为什么需要继续追问，不运行真实异常规则。"
      title="阈值 / 风险摘要"
    >
      <Space direction="vertical" size={8}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          {metric.thresholdSummary}
        </Typography.Text>
        <Space wrap>
          <RiskBadge {...metric.riskView} />
          <StatusTag {...metric.statusView} />
        </Space>
      </Space>
    </ContentCard>
  );
}

function MetricContextSourcesCard({
  metric,
  onNavigate,
  t
}: {
  metric: MetricDetailViewModel;
  onNavigate: MetricsSectionsProps["onNavigate"];
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <ContentCard
      description="上下文来源只展示摘要、sourceType 和 role，不展开 detail 页面或 raw payload。"
      footerActions={
        <NavigationActionButton action={buildLineageAction(metric.metricId, onNavigate, t)} />
      }
      title="上下文来源摘要"
    >
      <TitledList
        items={metric.contextSources.map((source) => ({
          key: source.key,
          meta: <Typography.Text type="secondary">{source.meta}</Typography.Text>,
          summary: source.description,
          title: source.title
        }))}
      />
    </ContentCard>
  );
}

function InspectorSection({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Typography.Text strong>{title}</Typography.Text>
      {children}
    </Space>
  );
}

export function MetricsInspectorPanel({ viewModel }: MetricsInspectorPanelProps) {
  const { t } = useI18n();
  const selectedMetric = viewModel.selectedMetric;

  return (
    <SidePanel
      description={translateKey(t, viewModel.rightAssistSummary.descriptionKey)}
      title={translateKey(t, viewModel.rightAssistSummary.titleKey)}
    >
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <InspectorSection title="时间范围">
          <Select
            aria-label="Metrics time range"
            options={viewModel.inspector.timeRangeOptions.map((option) => ({
              disabled: option.disabled,
              label: option.label,
              value: option.key
            }))}
            style={{ width: "100%" }}
            value={viewModel.inspector.selectedTimeRangeKey}
          />
        </InspectorSection>

        <InspectorSection title="Workspace 指标总览">
          <StatCard title="共享指标数" value={viewModel.inspector.workspaceSummaryItems[1]?.value ?? "0"} />
          {viewModel.inspector.workspaceSummaryItems.map((item) => (
            <Typography.Text key={item.key} type="secondary">
              {`${item.label}: ${item.value}`}
            </Typography.Text>
          ))}
        </InspectorSection>

        <InspectorSection title="风险分布">
          <TitledList
            items={viewModel.inspector.riskDistribution.map((item) => ({
              key: item.key,
              summary: `${item.value} metrics`,
              title: item.label
            }))}
          />
        </InspectorSection>

        <InspectorSection title="业务域分布">
          <TitledList
            items={viewModel.inspector.businessDomainDistribution.map((item) => ({
              key: item.key,
              summary: `${item.value} metrics`,
              title: item.label
            }))}
          />
        </InspectorSection>

        <InspectorSection title="有风险指标">
          <TitledList
            items={viewModel.inspector.atRiskMetrics.map((item) => ({
              key: item.key,
              meta: (
                <Space wrap>
                  <RiskBadge {...item.riskView} />
                  <StatusTag {...item.statusView} />
                </Space>
              ),
              summary: `${item.currentValue} · ${item.thresholdSummary}`,
              title: item.metricName
            }))}
          />
        </InspectorSection>

        <InspectorSection title="来源类型摘要">
          <TitledList
            items={viewModel.inspector.contextSourceTypeDistribution.map((item) => ({
              key: item.key,
              summary: `${item.value} sources`,
              title: item.label
            }))}
          />
        </InspectorSection>

        <InspectorSection title="只读边界">
          <Space direction="vertical" size={4}>
            {viewModel.inspector.readonlyBoundaryItems.map((item) => (
              <Typography.Text key={item} type="secondary">
                {`• ${item}`}
              </Typography.Text>
            ))}
            <Typography.Text type="secondary">
              {`${selectedMetric.metricName} 仍使用 existing analysisContextPack 带上下文进入 Analysis。`}
            </Typography.Text>
          </Space>
        </InspectorSection>
      </Space>
    </SidePanel>
  );
}

export function MetricsSections({ onNavigate, viewModel }: MetricsSectionsProps) {
  const { t } = useI18n();
  const sectionByKey = Object.fromEntries(
    viewModel.mainSections.map((section) => [section.key, section])
  );
  const selectedMetric = viewModel.selectedMetric;

  return (
    <SectionStack>
      <PageIntro
        contentLayout="cards"
        description={translateKey(t, viewModel.pageDescriptionKey)}
        eyebrow={translateKey(t, sectionByKey["metrics-overview"].titleKey)}
        supportingText={`${translateKey(t, "chrome.lastUpdated")}: ${viewModel.lastUpdatedAt}`}
        title={translateKey(t, viewModel.pageTitleKey)}
      />

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        title={`${translateKey(t, sectionByKey["selected-metric-detail"].titleKey)}：${selectedMetric.metricName}`}
      >
        <MetricHeaderCard metric={selectedMetric} onNavigate={onNavigate} t={t} />
        <MetricRelationshipCard metric={selectedMetric} />
        <MetricDefinitionCard metric={selectedMetric} />
        <MetricFormulaCard metric={selectedMetric} />
        <MetricThresholdCard metric={selectedMetric} />
        <MetricContextSourcesCard metric={selectedMetric} onNavigate={onNavigate} t={t} />
      </ContentSection>
    </SectionStack>
  );
}
