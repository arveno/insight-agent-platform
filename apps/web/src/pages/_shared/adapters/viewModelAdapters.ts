import type {
  StaticEvidenceEntranceViewModel,
  StaticReportEntranceViewModel,
  StaticRiskLevel,
  StaticRiskViewModel,
  StaticStatusViewModel,
  StaticSummaryItemViewModel,
  StaticTraceEntranceViewModel
} from "../../../app/models";
import type { RiskBadgeProps, RiskLevel, StatusTagProps } from "../../../shared";
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

export function toEvidenceItem(item: StaticEvidenceEntranceViewModel) {
  return {
    confidenceText: item.confidenceText,
    key: item.key,
    sourceTypeLabel: item.sourceType,
    summary: item.summary,
    title: item.title
  };
}

export function toTraceItem(t: Translate, item: StaticTraceEntranceViewModel) {
  return {
    description: item.latencyText,
    key: item.key,
    risk: toRiskBadge(t, item.risk),
    status: toStatusTag(t, item.status),
    timestampText: item.eventId,
    title: item.title
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
