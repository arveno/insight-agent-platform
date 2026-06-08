import type { ReactNode } from "react";
import { Alert } from "antd";

/**
 * State Pattern：ErrorState 的公共 props 契约。
 *
 * 只描述错误摘要和补充 action。
 * 不解析 raw error，不承接重试策略或业务恢复逻辑。
 */
export type ErrorStateProps = {
  /** 错误态下的补充操作 slot；具体重试逻辑由调用方实现。 */
  action?: ReactNode;
  description?: string;
  title: string;
};

/**
 * State Pattern：统一错误态展示边界。
 *
 * ErrorState 只展示调用方传入的错误摘要和轻操作；
 * 不执行真实重试、不解析 raw error，也不替代业务 status。
 */
export function ErrorState({ action, description, title }: ErrorStateProps) {
  return <Alert type="error" showIcon message={title} description={description} action={action} />;
}
