import type { ReactNode } from "react";
import type { ButtonProps } from "antd";

import type { IconName } from "../../icons/iconTypes";

/**
 * UI Primitive：ActionButton 支持的稳定视觉变体。
 *
 * 基于 Ant Button 的项目级薄封装语义，只表达按钮的通用视觉层次。
 * 不表达路由、权限、排序或任何业务流程判断。
 */
export type ActionButtonVariant =
  | "globalPrimary"
  | "contextPrimary"
  | "moduleEntry"
  | "objectDetail"
  | "sourceLink";

/**
 * UI Primitive：ActionButton 的公共 props 契约。
 *
 * 基于 Ant Button，只描述按钮视觉和基础交互。
 * 不包含导航、排序、权限或业务判断；调用方若需要 route-aware 行为，
 * 必须通过 shared/navigation 的行为包装组合实现。
 */
export type ActionButtonProps = Omit<
  ButtonProps,
  "children" | "color" | "icon" | "size" | "type" | "variant"
> & {
  children: ReactNode;
  /** 项目级图标名；只影响前置图标显示，不承载业务状态。 */
  iconName?: IconName;
  /** 稳定视觉变体；调用方不得把业务语义编码进 variant 命名。 */
  variant: ActionButtonVariant;
};
