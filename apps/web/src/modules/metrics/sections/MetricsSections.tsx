import { Space, Typography } from "antd";

import type { StaticRiskViewModel, StaticStatusViewModel } from "../../../app/shell/models/staticViewModelTypes";
import type { WebPageProps } from "../../../app/router/pageProps";
import { AppActionGroup } from "../../../shared/ui/actions/AppActionGroup";
import { MetricCard } from "../../../shared/ui/cards/MetricCard";
import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { AppSection } from "../../../shared/layout/sections/AppSection";
import { AppSectionStack } from "../../../shared/layout/sections/AppSectionStack";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";

import { createRouteAction } from "../../../app/router/createRouteAction";
import { SourceEvidenceList } from "../../analysis/SourceEvidenceList";
import { toEvidenceItem } from "../../analysis/viewModelAdapters";
import type { MetricDetailViewModel, MetricsViewModel } from "../models/metricsViewModel";

export type MetricsSectionsProps = WebPageProps & {
  viewModel: MetricsViewModel;
};

function buildTagSlot(
  t: ReturnType<typeof useI18n>["t"],
  {
    risk,
    status
  }: {
    risk?: StaticRiskViewModel;
    status?: StaticStatusViewModel;
  }
) {
  const statusTag = toStatusTag(t, status);
  const riskBadge = toRiskBadge(t, risk);

  if (!statusTag && !riskBadge) {
    return undefined;
  }

  return (
    <Space wrap>
      {statusTag ? <StatusTag {...statusTag} /> : null}
      {riskBadge ? <RiskBadge {...riskBadge} /> : null}
    </Space>
  );
}

function buildAnalysisAction(
  contextKey: string,
  onNavigate: MetricsSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  return createRouteAction({
    iconName: "analysis",
    key: `${contextKey}-analysis`,
    label: t("action.metricOpenAnalysis.label"),
    onNavigate,
    route: "analysis",
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
    <AppBaseCard
      description="当前阶段只展示指标业务定义，不提供配置写入或规则编辑。"
      eyebrow={metric.businessDomain}
      title="业务定义"
    >
      <Typography.Text style={{ display: "block", fontWeight: 600 }}>
        {metric.definition}
      </Typography.Text>
    </AppBaseCard>
  );
}

function MetricSummaryCard({
  metric,
  t
}: {
  metric: MetricDetailViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <MetricCard
      description={`时间范围：${metric.timeRange}`}
      evidenceSummary={`${metric.evidenceItems.length} 条证据`}
      key={`${metric.key}-summary`}
      meta={<Typography.Text type="secondary">业务域：{metric.businessDomain}</Typography.Text>}
      risk={toRiskBadge(t, metric.risk)}
      status={toStatusTag(t, metric.status)}
      title="当前摘要"
      trend={metric.trend}
      value={metric.currentValue}
    />
  );
}

function MetricFormulaCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <AppBaseCard
      description="业务公式和技术字段映射只读展示，不触发真实计算或更新。"
      title="公式"
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>
          业务公式：{metric.formula.businessFormula}
        </Typography.Text>
        <Typography.Text>技术字段：{metric.formula.technicalFormula}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

function MetricThresholdCard({
  metric,
  t
}: {
  metric: MetricDetailViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description="阈值和异常规则只解释什么时候需要追问，不运行真实规则引擎。"
      title="阈值 / 异常规则"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {metric.thresholdRules.map((rule) => (
          <Space direction="vertical" key={rule.key} size={4} style={{ width: "100%" }}>
            <Space wrap>
              <Typography.Text style={{ fontWeight: 600 }}>{rule.label}</Typography.Text>
              {rule.risk ? <RiskBadge {...toRiskBadge(t, rule.risk)!} /> : null}
            </Space>
            <Typography.Text>{rule.condition}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function MetricLineageCard({ metric }: { metric: MetricDetailViewModel }) {
  return (
    <AppBaseCard
      description="字段来源只做语义解释，不执行真实 SQL、真实查询或跨 Workspace 下钻。"
      title="字段血缘摘要"
    >
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        {metric.lineageSources.map((source) => (
          <Space direction="vertical" key={source.key} size={4} style={{ width: "100%" }}>
            <Typography.Text style={{ fontWeight: 600 }}>{source.label}</Typography.Text>
            <Typography.Text>{source.source}</Typography.Text>
            <Typography.Text type="secondary">{source.description}</Typography.Text>
          </Space>
        ))}
      </Space>
    </AppBaseCard>
  );
}

function MetricEvidenceCard({
  metric,
  t
}: {
  metric: MetricDetailViewModel;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description="证据入口只展示当前指标的静态摘要，不展示 raw API、DB row、Tool 输出或模型原文。"
      title="证据摘要"
    >
      <SourceEvidenceList items={metric.evidenceItems.map((item) => toEvidenceItem(t, item))} />
    </AppBaseCard>
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
    <AppBaseCard
      description="动作只表示导航到 Analysis 草稿态或数据血缘页面，不创建真实 conversation、run 或 Agent 执行。"
      title="动作"
    >
      <AppActionGroup
        actions={[
          buildAnalysisAction(metric.analysisContext.metricId, onNavigate, t),
          buildLineageAction(metric.metricId, onNavigate, t)
        ]}
      />
    </AppBaseCard>
  );
}

export function MetricsSections({ onNavigate, viewModel }: MetricsSectionsProps) {
  const { t } = useI18n();
  const sectionByKey = Object.fromEntries(
    viewModel.mainSections.map((section) => [section.key, section])
  );
  const selectedMetric = viewModel.selectedMetric;

  return (
    <AppSectionStack>
      <AppSection
        columns={3}
        title={translateKey(t, sectionByKey["metrics-overview"].titleKey)}
      >
        {viewModel.summaryCards.map((item) => (
          <AppBaseCard
            description={item.description}
            key={item.key}
            tagSlot={buildTagSlot(t, item)}
            title={item.label}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>
              {item.value}
            </Typography.Text>
          </AppBaseCard>
        ))}
        <AppBaseCard description={viewModel.workspaceNotice} key="metrics-workspace-notice" title="Workspace 绑定">
          <Typography.Text style={{ display: "block", fontWeight: 600 }}>
            当前指标目录属于当前 Workspace。
          </Typography.Text>
        </AppBaseCard>
        <AppBaseCard description={viewModel.readonlyNotice} key="metrics-readonly-boundary" title="只读边界">
          <Typography.Text style={{ display: "block", fontWeight: 600 }}>
            不新增指标，不编辑公式，不编辑阈值。
          </Typography.Text>
        </AppBaseCard>
      </AppSection>

      <AppSection
        columns={2}
        title={`${translateKey(t, sectionByKey["selected-metric-detail"].titleKey)}：${selectedMetric.metricName}`}
      >
        <MetricDefinitionCard metric={selectedMetric} />
        <MetricSummaryCard metric={selectedMetric} t={t} />
        <MetricFormulaCard metric={selectedMetric} />
        <MetricThresholdCard metric={selectedMetric} t={t} />
        <MetricLineageCard metric={selectedMetric} />
        <MetricEvidenceCard metric={selectedMetric} t={t} />
        <MetricActionsCard metric={selectedMetric} onNavigate={onNavigate} t={t} />
      </AppSection>
    </AppSectionStack>
  );
}
