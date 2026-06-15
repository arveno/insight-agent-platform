import type {
  AnalysisTaskContextPack,
  Metric,
  MetricContextSource,
  SourceRef
} from "@insight-agent/contracts/generated/typescript";

import {
  createAnalysisContextPackFromTree,
  createDraftAnalysisTaskOwnerRef
} from "../../shared/navigation/analysisContextPack";

const businessDomainLabels: Record<string, string> = {
  "business-domain-delivery-operations": "履约运营",
  "business-domain-margin-analysis": "利润结构",
  "business-domain-revenue-quality": "营收质量",
  "business-domain-supply-chain-efficiency": "供应链效率"
};

function joinSnakeCase(...parts: string[]): string {
  return parts.join("_");
}

const metricContextSourceTypeLabels: Record<string, string> = {
  dataTable: "数据表",
  knowledgeDocument: "知识文档",
  report: "报告",
  sourceEvidence: "证据"
};

const metricContextSourceRoleLabels: Record<string, string> = {
  [joinSnakeCase("primary", "table")]: "主表",
  [joinSnakeCase("supporting", "document")]: "支撑文档",
  [joinSnakeCase("supporting", "evidence")]: "支撑证据",
  [joinSnakeCase("supporting", "report")]: "支撑报告"
};

function normalizePeriodKey(period: string): string {
  return period
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeTrendMagnitude(trendValue: string): string {
  return trendValue.replace(/^[+-]/, "");
}

export function formatMetricBusinessDomainLabel(businessDomainId: string): string {
  return businessDomainLabels[businessDomainId] ?? businessDomainId;
}

export function formatMetricContextSourceTypeLabel(sourceType: MetricContextSource["sourceType"]): string {
  return metricContextSourceTypeLabels[sourceType] ?? sourceType;
}

export function formatMetricContextSourceRoleLabel(role: MetricContextSource["role"]): string {
  return metricContextSourceRoleLabels[role] ?? role;
}

export function formatMetricDisplayValue(metric: Metric): string {
  return metric.currentValue;
}

export function formatMetricTrendLabel(metric: Metric): string {
  const magnitude = normalizeTrendMagnitude(metric.trendValue);

  switch (metric.trendDirection) {
    case "up":
      return `上升 ${magnitude}`;
    case "down":
      return `下降 ${magnitude}`;
    case "flat":
      return `持平 ${magnitude}`;
  }
}

function buildMetricContextSourceRef(source: MetricContextSource): SourceRef {
  switch (source.sourceType) {
    case "dataTable":
      return {
        tableId: source.sourceId,
        type: "dataTable"
      };
    case "knowledgeDocument":
      return {
        knowledgeDocumentId: source.sourceId,
        type: "knowledgeDocument"
      };
    case "sourceEvidence":
      return {
        sourceEvidenceId: source.sourceId,
        type: "sourceEvidence"
      };
    case "report":
      return {
        reportId: source.sourceId,
        type: "report"
      };
  }
}

export function buildMetricAnalysisContextPack(metric: Metric): AnalysisTaskContextPack {
  const owner = createDraftAnalysisTaskOwnerRef();
  const businessDomainLabel = formatMetricBusinessDomainLabel(metric.businessDomainId);
  const trendLabel = formatMetricTrendLabel(metric);
  const currentValue = formatMetricDisplayValue(metric);

  return createAnalysisContextPackFromTree({
    capturedAt: metric.updatedAt,
    root: {
      capturedAt: metric.updatedAt,
      children: metric.contextSources.map((source) => ({
        chips: [
          formatMetricContextSourceTypeLabel(source.sourceType),
          formatMetricContextSourceRoleLabel(source.role)
        ],
        kind: source.sourceType,
        nodeId: `metric-context-${metric.metricId}-${source.metricContextSourceId}`,
        owner,
        role: "inputContext",
        sourceRef: buildMetricContextSourceRef(source),
        summary: source.summary,
        title: source.title
      })),
      chips: [
        businessDomainLabel,
        metric.period,
        trendLabel
      ],
      kind: "metric",
      nodeId: `metric-context-${metric.metricId}`,
      owner,
      role: "inputContext",
      sourceRef: {
        metricId: metric.metricId,
        type: "metric"
      },
      summary: `当前值 ${currentValue}，阈值 ${metric.thresholdSummary}，趋势 ${trendLabel}，可结合公式和上下文来源继续分析。`,
      timeRange: {
        key: normalizePeriodKey(metric.period),
        label: metric.period
      },
      title: metric.name,
      value: currentValue
    },
    suggestedPrompt: `请基于 ${metric.name} 在 ${metric.period} 的表现，解释 ${trendLabel} 的主要原因，并给出下一步建议。`
  });
}
