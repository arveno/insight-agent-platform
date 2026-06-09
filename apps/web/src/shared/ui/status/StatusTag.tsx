import type { ReactNode } from "react";
import { Tag, theme } from "antd";

/**
 * Status Primitive：StatusTag 支持的稳定视觉 tone。
 *
 * 只表达展示层的状态颜色语义，不等同于后端原始状态字段。
 * 调用方必须先把业务状态映射成这里允许的 tone。
 */
export type StatusTone = "default" | "processing" | "success" | "warning" | "error";

/**
 * Status Primitive：StatusTag 的公共 props 契约。
 *
 * 基于 Ant Tag，只描述 label、tone 和可选图标。
 * 不做状态推断、多字段兜底或业务完成态判断。
 */
export type StatusTagProps = {
  icon?: ReactNode;
  label: string;
  /** 展示层 tone，必须来自稳定的 ViewModel 映射。 */
  tone?: StatusTone;
};

/**
 * Status Primitive：跨页面状态标签边界。
 *
 * label 与 tone 必须来自 contract enum 映射后的 ViewModel；
 * 这里不兼容多个状态字段，也不推断业务完成状态。
 */
export function StatusTag({ icon, label, tone = "default" }: StatusTagProps) {
  const { token } = theme.useToken();
  const statusTokenByTone: Record<
    StatusTone,
    { backgroundColor: string; borderColor: string; color: string }
  > = {
    default: {
      backgroundColor: token.colorFillQuaternary,
      borderColor: token.colorBorderSecondary,
      color: token.colorTextSecondary
    },
    error: {
      backgroundColor: token.colorErrorBg,
      borderColor: token.colorErrorBorder,
      color: token.colorErrorText
    },
    processing: {
      backgroundColor: token.colorInfoBg,
      borderColor: token.colorInfoBorder,
      color: token.colorInfoText
    },
    success: {
      backgroundColor: token.colorSuccessBg,
      borderColor: token.colorSuccessBorder,
      color: token.colorSuccessText
    },
    warning: {
      backgroundColor: token.colorWarningBg,
      borderColor: token.colorWarningBorder,
      color: token.colorWarningText
    }
  };

  return (
    <Tag icon={icon} style={statusTokenByTone[tone]}>
      {label}
    </Tag>
  );
}
