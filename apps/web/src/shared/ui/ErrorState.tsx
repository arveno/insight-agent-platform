import { Alert } from "antd";

type ErrorStateProps = {
  message?: string;
  description?: string;
};

export function ErrorState({
  message = "发生错误",
  description = "请稍后重试或查看运行日志。"
}: ErrorStateProps) {
  return <Alert type="error" showIcon message={message} description={description} />;
}
