import type { ReactNode } from "react";
import { Tag, Tooltip, theme } from "antd";

export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

export type RiskBadgeProps = {
  icon?: ReactNode;
  label: string;
  level?: RiskLevel;
  reason?: string;
};

/**
 * 风险等级展示边界。
 *
 * 风险级别由 mapper / ViewModel 提供；
 * shared/ui 只负责稳定视觉表达，不自行计算风险。
 */
export function RiskBadge({ icon, label, level = "unknown", reason }: RiskBadgeProps) {
  const { token } = theme.useToken();
  const riskTokenByLevel: Record<
    RiskLevel,
    { backgroundColor: string; borderColor: string; color: string }
  > = {
    critical: {
      backgroundColor: token.colorErrorBg,
      borderColor: token.colorErrorBorder,
      color: token.colorErrorText
    },
    high: {
      backgroundColor: token.colorWarningBg,
      borderColor: token.colorWarningBorder,
      color: token.colorWarningText
    },
    low: {
      backgroundColor: token.colorSuccessBg,
      borderColor: token.colorSuccessBorder,
      color: token.colorSuccessText
    },
    medium: {
      backgroundColor: token.colorWarningBg,
      borderColor: token.colorWarningBorder,
      color: token.colorWarningText
    },
    unknown: {
      backgroundColor: token.colorFillQuaternary,
      borderColor: token.colorBorderSecondary,
      color: token.colorTextSecondary
    }
  };
  const badge = (
    <Tag icon={icon} style={riskTokenByLevel[level]}>
      {label}
    </Tag>
  );

  return reason ? <Tooltip title={reason}>{badge}</Tooltip> : badge;
}
