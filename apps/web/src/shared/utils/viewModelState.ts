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
