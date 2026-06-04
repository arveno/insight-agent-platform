import type { ReactNode } from "react";
import { Tag, theme } from "antd";

export type StatusTone = "default" | "processing" | "success" | "warning" | "error";

export type StatusTagProps = {
  icon?: ReactNode;
  label: string;
  tone?: StatusTone;
};

/**
 * 跨页面状态标签边界。
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
