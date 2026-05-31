import { Empty } from "antd";

type EmptyStateProps = {
  description?: string;
};

export function EmptyState({ description = "暂无数据" }: EmptyStateProps) {
  return <Empty description={description} />;
}
