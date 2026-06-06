import { Space } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import type { AppSectionStackProps } from "./sectionTypes";

export function AppSectionStack({ children }: AppSectionStackProps) {
  return (
    <Space
      direction="vertical"
      size={shellThemeTokens.pageSectionGap}
      style={{ padding: shellThemeTokens.pagePadding, width: "100%" }}
    >
      {children}
    </Space>
  );
}
