import type {
  StaticRiskLevel,
  StaticRiskViewModel,
  StaticStatusViewModel
} from "../../app/shell/models/staticViewModelTypes";
import type { Translate } from "../i18n/translateKey";
import { translateKey } from "../i18n/translateKey";
import type { RiskBadgeProps, RiskLevel } from "../ui/status/RiskBadge";
import type { StatusTagProps } from "../ui/status/StatusTag";

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

  return /Surface Contract|\\bGap\\b|阶段限制/.test(reason) ? undefined : reason;
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
