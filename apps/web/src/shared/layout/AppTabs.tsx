import { Tabs, type TabsProps } from "antd";

export type AppTabsProps = TabsProps;

/**
 * 平级信息组容器。
 *
 * Tab label 与内容由调用方 ViewModel / i18n 注入；
 * 组件不改变页面职责，也不隐藏关键状态摘要。
 */
export function AppTabs(props: AppTabsProps) {
  return <Tabs {...props} />;
}
