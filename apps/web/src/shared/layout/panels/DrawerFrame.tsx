import type { ReactNode } from "react";
import { Drawer, type DrawerProps } from "antd";

export type DrawerFrameProps = Omit<DrawerProps, "children" | "title"> & {
  children: ReactNode;
  title: ReactNode;
};

/**
 * 详情抽屉容器。
 *
 * Drawer 内容由页面 / feature slot 注入；
 * shared/layout 不承载长报告主阅读或业务详情清洗。
 */
export function DrawerFrame({ children, title, ...drawerProps }: DrawerFrameProps) {
  return (
    <Drawer {...drawerProps} title={title}>
      {children}
    </Drawer>
  );
}
