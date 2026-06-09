import type { ReactNode } from "react";
import { Alert } from "antd";

import type { RiskLevel } from "../status/RiskBadge";

/**
 * State Pattern：WarningState 的公共 props 契约。
 *
 * 用于风险或告警提示展示。
 * 不承接治理规则判断、权限判断或自动修复逻辑。
 */
export type WarningStateProps = {
  /** 风险提示下的补充 action slot；具体行为由调用方决定。 */
  action?: ReactNode;
  description?: string;
  message: string;
  /** 只影响提示条视觉 tone，不代表完整治理策略。 */
  riskLevel?: RiskLevel;
};

const alertTypes: Record<RiskLevel, "info" | "warning" | "error"> = {
  critical: "error",
  high: "error",
  low: "info",
  medium: "warning",
  unknown: "warning"
};

/**
 * State Pattern：跨页面风险提示横幅。
 *
 * 只展示调用方传入的风险摘要和操作入口；
 * 不自动执行风险操作，也不替代 Governance / Audit 事实源。
 */
export function WarningState({
  action,
  description,
  message,
  riskLevel = "unknown"
}: WarningStateProps) {
  return (
    <Alert
      type={alertTypes[riskLevel]}
      showIcon
      message={message}
      description={description}
      action={action}
    />
  );
}
