import type { ReactNode } from "react";
import { Tag, Tooltip, theme } from "antd";

/**
 * Status Primitive：RiskBadge 支持的稳定风险等级。
 *
 * 只表达展示层风险级别，不替代治理规则、审计策略或业务判断。
 * 调用方必须先把业务风险映射成这里允许的 level。
 */
export type RiskLevel = "low" | "medium" | "high" | "critical" | "unknown";

/**
 * Status Primitive：RiskBadge 的公共 props 契约。
 *
 * 基于 Ant Tag / Tooltip，只描述 label、level 和可选原因说明。
 * 不计算风险，不依赖业务对象，也不解析治理策略。
 */
export type RiskBadgeProps = {
  icon?: ReactNode;
  label: string;
  /** 展示层风险等级，必须来自稳定的 ViewModel 映射。 */
  level?: RiskLevel;
  /** 可选提示文案；只用于解释当前展示结果，不承接业务对象。 */
  reason?: string;
};

/**
 * Status Primitive：风险等级展示边界。
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
