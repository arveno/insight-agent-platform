import type { ReactNode } from "react";
import { Grid, Space } from "antd";

import { shellThemeTokens } from "../../theme";

export type ResponsivePageShellProps = {
  children: ReactNode;
  filters?: ReactNode;
  header?: ReactNode;
  rightAside?: ReactNode;
};

/**
 * 页面响应式承接容器。
 *
 * Web / Mobile 可分展示编排，但 children 输入保持同一 ViewModel 链路；
 * 组件不创建 Mobile 独立业务模型。
 */
export function ResponsivePageShell({
  children,
  filters,
  header,
  rightAside
}: ResponsivePageShellProps) {
  const screens = Grid.useBreakpoint();
  const isWide = Boolean(screens.lg);

  return (
    <Space
      direction="vertical"
      size={shellThemeTokens.pageSectionGap}
      style={{ padding: shellThemeTokens.pagePadding, width: "100%" }}
    >
      {header}
      {filters}
      <div
        style={{
          display: "grid",
          gap: shellThemeTokens.pageSectionGap,
          gridTemplateColumns: isWide && rightAside ? "minmax(0, 1fr) 360px" : "minmax(0, 1fr)"
        }}
      >
        <main>{children}</main>
        {rightAside}
      </div>
    </Space>
  );
}
