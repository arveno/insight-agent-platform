import { Flex, Typography } from "antd";

import type { PageRouteProps } from "../../../shared/navigation/navigationTypes";
import { StatCard } from "../../../shared/ui/cards/StatCard";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { PageIntro } from "../../../shared/layout/containers/PageIntro";
import { ContentSection } from "../../../shared/layout/sections/ContentSection";
import { SectionStack } from "../../../shared/layout/sections/SectionStack";
import { NavigationActionButton } from "../../../shared/navigation/NavigationActionButton";
import { TitledList } from "../../../shared/ui/lists/TitledList";

import { createRouteAction } from "../../../shared/navigation/createRouteAction";
import type { MetricDetailViewModel, MetricsViewModel } from "../models/metricsViewModel";

export type MetricsSectionsProps = PageRouteProps & {
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

function MetricDefinitionCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard
      description="当前阶段只展示指标业务定义，不提供配置写入、权限管理或规则编辑。"
      eyebrow={metric.businessDomainLabel}
      title="业务定义"
    >
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.definition}
      </Typography.Text>
    </ContentCard>
  );
}

function MetricSummaryCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <StatCard
      description={`时间范围：${metric.period}`}
      key={`${metric.key}-summary`}
      meta={
        <Typography.Text type="secondary">
          业务域：{metric.businessDomainLabel} / Owner：{metric.ownerTeam}
        </Typography.Text>
      }
      supportingMeta={`状态 ${metric.status} / 风险 ${metric.riskLevel}`}
      title="当前摘要"
      trend={metric.trendLabel}
      value={metric.currentValue}
    />
  );
}

function MetricFormulaCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard description="只读展示公式摘要，不触发真实计算或更新。" title="公式摘要">
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.formulaSummary}
      </Typography.Text>
    </ContentCard>
  );
}

function MetricThresholdCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard
      description="阈值和风险摘要只解释什么时候需要继续追问，不运行真实规则引擎。"
      title="阈值 / 风险摘要"
    >
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.thresholdSummary}
      </Typography.Text>
      <Typography.Text type="secondary">当前风险等级：{metric.riskLevel}</Typography.Text>
    </ContentCard>
  );
}

function MetricContextSourcesCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <ContentCard
      description="上下文来源只展示摘要和 canonical sourceRef，不展示 detail 页面或 raw payload。"
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

function MetricActionsCard({
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
      description="动作只表示导航到 Analysis 草稿态或数据血缘页面，不创建真实 conversation、run 或 Agent 执行。"
      title="动作"
    >
      <Flex gap={12} wrap>
        {[
          buildAnalysisAction(metric, onNavigate, t),
          buildLineageAction(metric.metricId, onNavigate, t)
        ].map((action) => (
          <NavigationActionButton action={action} key={action.key} />
        ))}
      </Flex>
    </ContentCard>
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
        colProps={{ md: 12, xl: 8, xs: 24 }}
        contentLayout="cards"
        description={translateKey(t, viewModel.pageDescriptionKey)}
        eyebrow={translateKey(t, sectionByKey["metrics-overview"].titleKey)}
        supportingText={`${translateKey(t, "chrome.lastUpdated")}: ${viewModel.lastUpdatedAt}`}
        title={translateKey(t, viewModel.pageTitleKey)}
      >
        {viewModel.summaryCards.map((item) => (
          <ContentCard
            description={item.description}
            key={item.key}
            title={item.label}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {item.value}
            </Typography.Text>
          </ContentCard>
        ))}
        <ContentCard
          description={viewModel.workspaceNotice}
          key="metrics-workspace-notice"
          title="Workspace 绑定"
        >
          <Typography.Text style={{ display: "block", fontWeight: 600 }}>
            当前指标目录属于当前 Workspace。
          </Typography.Text>
        </ContentCard>
        <ContentCard
          description={viewModel.readonlyNotice}
          key="metrics-readonly-boundary"
          title="只读边界"
        >
          <Typography.Text style={{ display: "block", fontWeight: 600 }}>
            不新增指标，不编辑公式，不编辑阈值。
          </Typography.Text>
        </ContentCard>
      </PageIntro>

      <ContentSection
        colProps={{ md: 12, xs: 24 }}
        contentLayout="cards"
        title={`${translateKey(t, sectionByKey["selected-metric-detail"].titleKey)}：${selectedMetric.metricName}`}
      >
        <MetricDefinitionCard metric={selectedMetric} />
        <MetricSummaryCard metric={selectedMetric} />
        <MetricFormulaCard metric={selectedMetric} />
        <MetricThresholdCard metric={selectedMetric} />
        <MetricContextSourcesCard metric={selectedMetric} />
        <MetricActionsCard metric={selectedMetric} onNavigate={onNavigate} t={t} />
      </ContentSection>
    </SectionStack>
  );
}
