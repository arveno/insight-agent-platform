import type { ReactNode } from "react";
import { Space, Typography } from "antd";

import type { MetricsViewModel } from "../../../features/static-view-models";
import type {
  MetricsAnalysisContextViewModel,
  MetricsDetailCardViewModel
} from "../../../features/metrics/models";
import {
  AppActionGroup,
  AppBaseCard,
  AppSection,
  AppSectionStack,
  MetricCard,
  RiskBadge,
  SourceEvidenceList,
  StatusTag,
  useI18n
} from "../../../shared";
import {
  createRouteAction,
  toEvidenceItem,
  toRiskBadge,
  toStatusTag,
  translateKey,
  type WebPageProps
} from "../../_shared";

export type MetricsSectionsProps = WebPageProps & {
  viewModel: MetricsViewModel;
};

function buildTagSlot(
  t: ReturnType<typeof useI18n>["t"],
  {
    risk,
    status
  }: {
    risk?: MetricsDetailCardViewModel["risk"];
    status?: MetricsDetailCardViewModel["status"];
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

function buildEvidenceAction(
  contextKey: string,
  onNavigate: MetricsSectionsProps["onNavigate"],
  t: ReturnType<typeof useI18n>["t"]
) {
  return createRouteAction({
    iconName: "evidence",
    key: `${contextKey}-evidence`,
    label: t("action.metricsOpenEvidence.label"),
    onNavigate,
    route: "reports",
    variant: "sourceLink"
  });
}

function MetricsDetailCard({
  card,
  t,
  footerActions
}: {
  card: MetricsDetailCardViewModel;
  footerActions?: ReactNode;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <AppBaseCard
      description={card.description}
      eyebrow={card.eyebrow}
      footerActions={footerActions}
      meta={card.meta ? <Typography.Text type="secondary">{card.meta}</Typography.Text> : null}
      tagSlot={buildTagSlot(t, card)}
      title={card.title}
    >
      {card.value ? (
        <Typography.Text style={{ display: "block", fontWeight: 600 }}>{card.value}</Typography.Text>
      ) : null}
    </AppBaseCard>
  );
}

function MetricContextCard({
  context,
  footerActions
}: {
  context: MetricsAnalysisContextViewModel;
  footerActions: ReactNode;
}) {
  return (
    <AppBaseCard
      description="点击入口只表示带上下文进入 Analysis 新聊天草稿态，不创建真实 conversation 或 run。"
      eyebrow={context.workspaceId}
      footerActions={footerActions}
      meta={
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Typography.Text type="secondary">timeRange: {context.timeRange}</Typography.Text>
          <Typography.Text type="secondary">trend: {context.trend}</Typography.Text>
          <Typography.Text type="secondary">riskLevel: {context.riskLevel}</Typography.Text>
          <Typography.Text type="secondary">threshold: {context.threshold}</Typography.Text>
        </Space>
      }
      title={context.metricName}
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Typography.Text style={{ fontWeight: 600 }}>
          metricId: {context.metricId}
        </Typography.Text>
        <Typography.Text>currentValue: {context.currentValue}</Typography.Text>
        <Typography.Text>formula: {context.formula}</Typography.Text>
        <Typography.Text>lineage: {context.lineage}</Typography.Text>
        <Typography.Text>evidenceRefs: {context.evidenceRefs.join(", ")}</Typography.Text>
      </Space>
    </AppBaseCard>
  );
}

export function MetricsSections({ onNavigate, viewModel }: MetricsSectionsProps) {
  const { t } = useI18n();
  const sectionByKey = Object.fromEntries(viewModel.mainSections.map((section) => [section.key, section]));
  const analysisSectionAction = buildAnalysisAction("metrics-section", onNavigate, t);
  const lineageSectionAction = buildLineageAction("metrics-lineage", onNavigate, t);
  const evidenceSectionAction = buildEvidenceAction("metrics-evidence", onNavigate, t);

  return (
    <AppSectionStack>
      <AppSection
        columns={4}
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
        title={translateKey(t, sectionByKey["metric-catalog"].titleKey)}
      >
        {viewModel.metricCatalogCards.map((metricCard) => (
          <MetricCard
            description="业务指标卡片只解释当前值、趋势、风险和证据入口。"
            evidenceSummary={`${metricCard.evidenceCount ?? 0} 条证据`}
            footerActions={
              <AppActionGroup
                actions={[
                  buildAnalysisAction(metricCard.key, onNavigate, t),
                  buildLineageAction(metricCard.key, onNavigate, t)
                ]}
              />
            }
            key={metricCard.key}
            risk={toRiskBadge(t, metricCard.risk)}
            status={toStatusTag(t, metricCard.status)}
            title={metricCard.label}
            trend={metricCard.trendText}
            value={metricCard.valueText}
          />
        ))}
        {viewModel.metricDirectory.map((item) => (
          <AppBaseCard
            description={item.description}
            footerActions={
              <AppActionGroup
                actions={[
                  buildAnalysisAction(item.key, onNavigate, t),
                  buildLineageAction(item.key, onNavigate, t)
                ]}
              />
            }
            key={item.key}
            meta={item.meta ? <Typography.Text type="secondary">{item.meta}</Typography.Text> : null}
            tagSlot={buildTagSlot(t, item)}
            title={item.label}
          >
            <Typography.Text style={{ display: "block", fontWeight: 600 }}>{item.value}</Typography.Text>
          </AppBaseCard>
        ))}
      </AppSection>

      <AppSection
        columns={2}
        title={translateKey(t, sectionByKey["formula-threshold"].titleKey)}
      >
        {viewModel.formulaThresholdCards.map((card) => (
          <MetricsDetailCard
            card={card}
            footerActions={<AppActionGroup actions={[buildAnalysisAction(card.key, onNavigate, t)]} />}
            key={card.key}
            t={t}
          />
        ))}
      </AppSection>

      <AppSection
        columns={2}
        title={translateKey(t, sectionByKey["trend-anomaly"].titleKey)}
      >
        {viewModel.trendAnomalyCards.map((metricCard) => (
          <MetricCard
            description="趋势 / 异常只解释为什么值得追问，不执行真实异常规则。"
            evidenceSummary={`${metricCard.evidenceCount ?? 0} 条证据`}
            footerActions={
              <AppActionGroup actions={[buildAnalysisAction(`${metricCard.key}-anomaly`, onNavigate, t)]} />
            }
            key={metricCard.key}
            risk={toRiskBadge(t, metricCard.risk)}
            status={toStatusTag(t, metricCard.status)}
            title={metricCard.label}
            trend={metricCard.trendText}
            value={metricCard.valueText}
          />
        ))}
      </AppSection>

      <AppSection
        action={lineageSectionAction}
        columns={2}
        title={translateKey(t, sectionByKey["lineage-source"].titleKey)}
      >
        {viewModel.lineageSourceCards.map((card) => (
          <MetricsDetailCard
            card={card}
            footerActions={<AppActionGroup actions={[buildLineageAction(card.key, onNavigate, t)]} />}
            key={card.key}
            t={t}
          />
        ))}
      </AppSection>

      <AppSection
        action={evidenceSectionAction}
        columns={2}
        title={translateKey(t, sectionByKey["evidence-entry"].titleKey)}
      >
        <AppBaseCard
          description="证据入口只展示脱敏后的静态摘要，不展示 raw API、DB row、Tool 输出或模型原文。"
          key="metrics-evidence-list"
          title="指标证据入口"
        >
          <SourceEvidenceList items={viewModel.evidenceEntrances.map((item) => toEvidenceItem(t, item))} />
        </AppBaseCard>
        <AppBaseCard
          description="证据入口与 Workspace 绑定；切换 Workspace 后证据引用和来源对象都可能变化。"
          key="metrics-evidence-scope"
          title="证据范围"
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Typography.Text>sourceEvidence 只作为只读入口展示。</Typography.Text>
            <Typography.Text>证据不会在本页触发真实查询、真实分析或真实 Agent Run。</Typography.Text>
          </Space>
        </AppBaseCard>
      </AppSection>

      <AppSection
        action={analysisSectionAction}
        columns={2}
        title={translateKey(t, sectionByKey["analysis-context"].titleKey)}
      >
        {viewModel.metricContexts.map((context) => (
          <MetricContextCard
            context={context}
            footerActions={<AppActionGroup actions={[buildAnalysisAction(context.key, onNavigate, t)]} />}
            key={context.key}
          />
        ))}
      </AppSection>
    </AppSectionStack>
  );
}
