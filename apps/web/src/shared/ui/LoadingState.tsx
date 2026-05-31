import { Spin } from "antd";

type LoadingStateProps = {
  tip?: string;
};

export function LoadingState({ tip = "加载中" }: LoadingStateProps) {
  return <Spin tip={tip} />;
}
