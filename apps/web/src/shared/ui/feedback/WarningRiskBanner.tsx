import type { ReactNode } from "react";
import { Alert } from "antd";

import type { RiskLevel } from "../status/RiskBadge";

export type WarningRiskBannerProps = {
  action?: ReactNode;
  description?: string;
  message: string;
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
 * 跨页面风险提示横幅。
 *
 * 只展示调用方传入的风险摘要和操作入口；
 * 不自动执行风险操作，也不替代 Governance / Audit 事实源。
 */
export function WarningRiskBanner({
  action,
  description,
  message,
  riskLevel = "unknown"
}: WarningRiskBannerProps) {
  return <Alert type={alertTypes[riskLevel]} showIcon message={message} description={description} action={action} />;
}
