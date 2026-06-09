import type { ReactNode } from "react";

import { shellThemeTokens } from "../../theme/tokens";

export type ResponsivePageShellProps = {
  children: ReactNode;
};

/**
 * 页面响应式承接容器。
 *
 * 只负责页面 padding、最外层宽度和 children 承载。
 */
export function ResponsivePageShell({ children }: ResponsivePageShellProps) {
  return (
    <main
      style={{
        boxSizing: "border-box",
        padding: shellThemeTokens.pagePadding,
        width: "100%"
      }}
    >
      {children}
    </main>
  );
}
