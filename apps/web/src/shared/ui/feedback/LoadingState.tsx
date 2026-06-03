import { Flex, Spin } from "antd";

export type LoadingStateProps = {
  label?: string;
};

/**
 * 统一加载态展示边界。
 *
 * label 由调用方从 i18n 或 ViewModel 注入；
 * 组件本身不伪造任务状态或长任务进度。
 */
export function LoadingState({ label }: LoadingStateProps) {
  return (
    <Flex align="center" justify="center" style={{ minHeight: 120 }}>
      <Spin tip={label} />
    </Flex>
  );
}
