import { Flex, Spin } from "antd";

/**
 * State Pattern：LoadingState 的公共 props 契约。
 *
 * 只描述通用加载文案，不承接进度计算、轮询或任务状态机。
 */
export type LoadingStateProps = {
  /** 已格式化的加载提示文本；通常来自 i18n 或 ViewModel。 */
  label?: string;
};

/**
 * State Pattern：统一加载态展示边界。
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
