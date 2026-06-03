import type { ReactNode } from "react";
import { Alert } from "antd";

export type ErrorStateProps = {
  action?: ReactNode;
  description?: string;
  title: string;
};

/**
 * 统一错误态展示边界。
 *
 * ErrorState 只展示调用方传入的错误摘要和轻操作；
 * 不执行真实重试、不解析 raw error，也不替代业务 status。
 */
export function ErrorState({ action, description, title }: ErrorStateProps) {
  return <Alert type="error" showIcon message={title} description={description} action={action} />;
}
