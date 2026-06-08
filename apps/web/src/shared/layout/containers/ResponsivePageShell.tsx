import type { ReactNode } from "react";
import { Flex, Grid, Space } from "antd";

import { shellThemeTokens } from "../../theme/tokens";

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
  const showRightAside = Boolean(isWide && rightAside);

  return (
    <Space
      direction="vertical"
      size={shellThemeTokens.pageSectionGap}
      style={{ padding: shellThemeTokens.pagePadding, width: "100%" }}
    >
      {header}
      {filters}
      <Flex
        align="stretch"
        gap={shellThemeTokens.pageSectionGap}
        vertical={!showRightAside}
      >
        <main style={{ flex: "1 1 auto", minWidth: 0 }}>{children}</main>
        {rightAside}
      </Flex>
    </Space>
  );
}
