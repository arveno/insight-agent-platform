import type { Translate } from "../i18n/translateKey";
import { translateKey } from "../i18n/translateKey";
import type { RiskBadgeProps, RiskLevel } from "../ui/status/RiskBadge";
import type { StatusTagProps } from "../ui/status/StatusTag";

export type SharedStatusKind =
  | "ready"
  | "empty"
  | "error"
  | "loading"
  | "success"
  | "risk"
  | "warning"
  | "disabled"
  | "readonly";

export type SharedStatusViewModel = {
  labelKey: string;
  reason?: string;
  status: SharedStatusKind;
};

export type SharedRiskLevel = "none" | "low" | "medium" | "high" | "critical";

export type SharedRiskViewModel = {
  level: SharedRiskLevel;
  reason?: string;
  title?: string;
  titleKey?: string;
};

const statusToneByKind: Record<SharedStatusViewModel["status"], StatusTagProps["tone"]> = {
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

const riskLevelMap: Record<SharedRiskLevel, RiskLevel> = {
  critical: "critical",
  high: "high",
  low: "low",
  medium: "medium",
  none: "unknown"
};

const riskLevelLabelByLevel: Record<Exclude<SharedRiskLevel, "none">, string> = {
  critical: "Critical risk",
  high: "High risk",
  low: "Low risk",
  medium: "Medium risk"
};

const statusLabelByValue: Record<string, string> = {
  attention: "Attention",
  healthy: "Healthy"
};

const statusToneByValue: Record<string, StatusTagProps["tone"]> = {
  attention: "warning",
  healthy: "success"
};

const sourceTypeLabelByValue: Record<string, string> = {
  dashboardOverview: "经营总览",
  dataTable: "数据表",
  directory: "目录",
  job: "任务",
  knowledgeDocument: "知识文档",
  metric: "指标",
  modelCall: "模型调用",
  platformQuality: "平台质量",
  report: "报告",
  riskSignal: "风险信号",
  riskSummary: "风险摘要",
  sourceEvidence: "证据",
  toolCall: "工具调用"
};

function productRiskReason(reason?: string): string | undefined {
  if (!reason) {
    return undefined;
  }

  return /Surface Contract|\\bGap\\b|阶段限制/.test(reason) ? undefined : reason;
}

export function toStatusTag(
  t: Translate,
  status?: SharedStatusViewModel
): StatusTagProps | undefined {
  if (!status) {
    return undefined;
  }

  return {
    label: translateKey(t, status.labelKey),
    tone: statusToneByKind[status.status]
  };
}

export function toRiskBadge(t: Translate, risk?: SharedRiskViewModel): RiskBadgeProps | undefined {
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

function toDisplayWords(value: string): string {
  return value
    .trim()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment[0]!.toUpperCase() + segment.slice(1).toLowerCase())
    .join(" ");
}

export function parseRiskLevel(value?: string): RiskLevel | undefined {
  const normalizedValue = value?.trim().toLowerCase();

  if (!normalizedValue) {
    return undefined;
  }

  if (/\bcritical\b/.test(normalizedValue)) {
    return "critical";
  }

  if (/\bhigh\b/.test(normalizedValue)) {
    return "high";
  }

  if (/\bmedium\b/.test(normalizedValue)) {
    return "medium";
  }

  if (/\blow\b/.test(normalizedValue)) {
    return "low";
  }

  return undefined;
}

export function formatRiskLevelLabel(level?: SharedRiskLevel | RiskLevel): string | undefined {
  if (!level || level === "none" || level === "unknown") {
    return undefined;
  }

  return riskLevelLabelByLevel[level];
}

export function toRiskBadgeFromLevel(
  level?: SharedRiskLevel | RiskLevel,
  reason?: string
): RiskBadgeProps | undefined {
  const label = formatRiskLevelLabel(level);

  if (!label || !level || level === "none" || level === "unknown") {
    return undefined;
  }

  return {
    label,
    level,
    reason: productRiskReason(reason)
  };
}

export function formatStatusLabel(status?: string): string | undefined {
  const normalizedStatus = status?.trim().toLowerCase();

  if (!normalizedStatus) {
    return undefined;
  }

  return statusLabelByValue[normalizedStatus] ?? toDisplayWords(normalizedStatus);
}

export function toStatusTagFromStatus(status?: string): StatusTagProps | undefined {
  const normalizedStatus = status?.trim().toLowerCase();
  const label = formatStatusLabel(normalizedStatus);

  if (!normalizedStatus || !label) {
    return undefined;
  }

  return {
    label,
    tone: statusToneByValue[normalizedStatus] ?? "default"
  };
}

export function formatSourceTypeLabel(type?: string): string | undefined {
  const normalizedType = type?.trim();

  if (!normalizedType) {
    return undefined;
  }

  return sourceTypeLabelByValue[normalizedType] ?? normalizedType;
}
