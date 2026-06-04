import type {
  StaticEvidenceEntranceViewModel,
  StaticReportEntranceViewModel,
  StaticRiskLevel,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticSummaryItemViewModel,
  StaticTraceEntranceViewModel
} from "../../../app/models";
import type { I18nMessageKey, RiskBadgeProps, RiskLevel, StatusTagProps } from "../../../shared";
import { translateKey, type Translate } from "../text";

const statusToneByKind: Record<StaticStatusViewModel["status"], StatusTagProps["tone"]> = {
  disabled: "default",
  empty: "default",
  error: "error",
  loading: "processing",
  readonly: "default",
  ready: "success",
  risk: "warning",
  success: "success",
  warning: "warning"
};

const riskLevelMap: Record<StaticRiskLevel, RiskLevel> = {
  critical: "critical",
  high: "high",
  low: "low",
  medium: "medium",
  none: "unknown"
};

const evidenceSourceTypeKeyByLabel: Record<string, I18nMessageKey> = {
  "DataQualityCheck / Job": "evidence.sourceType.dataQualityJob",
  "Metric / Report": "evidence.sourceType.metricReport"
};

const evidenceConfidenceKeyByText: Record<string, I18nMessageKey> = {
  High: "evidence.confidence.high",
  Medium: "evidence.confidence.medium"
};

const evidenceSummaryKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.summary.metricRevenue",
  "quality-job-evidence": "evidence.summary.qualityJob"
};

const evidenceTitleKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.title.metricRevenue",
  "quality-job-evidence": "evidence.title.qualityJob"
};

const traceTitleKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.title.analysisRunSummary",
  "tool-permission-trace": "trace.title.toolPermissionCheck"
};

const traceEventKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.event.analysisRunSummary",
  "tool-permission-trace": "trace.event.toolPermissionCheck"
};

function translateMappedText(
  t: Translate,
  value: string | undefined,
  keyMap: Record<string, I18nMessageKey>
): string | undefined {
  if (!value) {
    return undefined;
  }

  const key = keyMap[value];

  return key ? translateKey(t, key) : value;
}

function productRiskReason(reason?: string): string | undefined {
  if (!reason) {
    return undefined;
  }

  return /Surface Contract|\bGap\b|阶段限制/.test(reason) ? undefined : reason;
}

export function toStatusTag(
  t: Translate,
  status?: StaticStatusViewModel
): StatusTagProps | undefined {
  if (!status) {
    return undefined;
  }

  return {
    label: translateKey(t, status.labelKey),
    tone: statusToneByKind[status.status]
  };
}

export function toRiskBadge(t: Translate, risk?: StaticRiskViewModel): RiskBadgeProps | undefined {
  if (!risk) {
    return undefined;
  }

  return {
    label: risk.titleKey
      ? translateKey(t, risk.titleKey)
      : (risk.title ?? translateKey(t, "risk.unknown.title")),
    level: riskLevelMap[risk.level],
    reason: productRiskReason(risk.reason)
  };
}

export function actionDescription(
  t: Translate,
  action: { description?: string; descriptionKey?: string }
): string | undefined {
  return action.descriptionKey ? translateKey(t, action.descriptionKey) : action.description;
}

export function toEvidenceItem(t: Translate, item: StaticEvidenceEntranceViewModel) {
  const summaryKey = evidenceSummaryKeyByEvidenceKey[item.key];
  const titleKey = evidenceTitleKeyByEvidenceKey[item.key];

  return {
    confidenceText: translateMappedText(t, item.confidenceText, evidenceConfidenceKeyByText),
    key: item.key,
    sourceTypeLabel:
      translateMappedText(t, item.sourceType, evidenceSourceTypeKeyByLabel) ?? item.sourceType,
    summary: summaryKey ? translateKey(t, summaryKey) : item.summary,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}

export function toTraceItem(t: Translate, item: StaticTraceEntranceViewModel) {
  const eventKey = traceEventKeyByTraceKey[item.key];
  const titleKey = traceTitleKeyByTraceKey[item.key];

  return {
    description: item.latencyText,
    key: item.key,
    risk: toRiskBadge(t, item.risk),
    status: toStatusTag(t, item.status),
    timestampText: eventKey ? translateKey(t, eventKey) : item.eventId,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}

export function toReportItem(
  t: Translate,
  item: StaticReportEntranceViewModel
): StaticSummaryItemViewModel {
  return {
    description: `${translateKey(t, "table.column.updatedAt")}: ${item.updatedAt}`,
    key: item.key,
    label: item.title,
    status: item.status,
    value: `${translateKey(t, "table.column.evidenceCount")}: ${item.evidenceCount}`
  };
}
