import type { ReactNode } from "react";
import { Tag, Tooltip } from "antd";

export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type RiskBadgeProps = {
  icon?: ReactNode;
  label: string;
  level?: RiskLevel;
  reason?: string;
};

const riskColors: Record<RiskLevel, string> = {
  critical: "red",
  high: "volcano",
  low: "green",
  medium: "gold",
  unknown: "default"
};

/**
 * 风险等级展示边界。
 *
 * 风险级别由 mapper / ViewModel 提供；
 * shared/ui 只负责稳定视觉表达，不自行计算风险。
 */
export function RiskBadge({ icon, label, level = "unknown", reason }: RiskBadgeProps) {
  const badge = (
    <Tag color={riskColors[level]} icon={icon}>
      {label}
    </Tag>
  );

  return reason ? <Tooltip title={reason}>{badge}</Tooltip> : badge;
}
