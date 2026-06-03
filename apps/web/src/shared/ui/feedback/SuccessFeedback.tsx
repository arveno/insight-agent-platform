import type { ReactNode } from "react";
import { Alert } from "antd";

export type SuccessFeedbackProps = {
  action?: ReactNode;
  description?: string;
  message: string;
};

/**
 * 成功反馈展示边界。
 *
 * 仅表达 UI 操作反馈，不替代业务对象的 completed / passed / succeeded 状态。
 */
export function SuccessFeedback({ action, description, message }: SuccessFeedbackProps) {
  return <Alert type="success" showIcon message={message} description={description} action={action} />;
}
