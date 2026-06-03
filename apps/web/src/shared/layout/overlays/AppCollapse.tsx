import { Collapse, type CollapseProps } from "antd";

export type AppCollapseProps = CollapseProps;

/**
 * 次级信息折叠容器。
 *
 * Collapse 只承接高密度详情或 Mobile 降级展示；
 * header 必须由调用方提供可扫描的状态 / 风险摘要。
 */
export function AppCollapse(props: AppCollapseProps) {
  return <Collapse {...props} />;
}
