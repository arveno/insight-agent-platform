import type { ReactNode } from "react";
import { Tag } from "antd";

export type StatusTone = "default" | "processing" | "success" | "warning" | "error";

export type StatusTagProps = {
  icon?: ReactNode;
  label: string;
  tone?: StatusTone;
};

const statusColors: Record<StatusTone, string> = {
  default: "default",
  error: "error",
  processing: "processing",
  success: "success",
  warning: "warning"
};

/**
 * 跨页面状态标签边界。
 *
 * label 与 tone 必须来自 contract enum 映射后的 ViewModel；
 * 这里不兼容多个状态字段，也不推断业务完成状态。
 */
export function StatusTag({ icon, label, tone = "default" }: StatusTagProps) {
  return (
    <Tag color={statusColors[tone]} icon={icon}>
      {label}
    </Tag>
  );
}
