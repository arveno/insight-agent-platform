import { Space } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import type { SectionStackProps } from "./sectionTypes";

export function SectionStack({ children }: SectionStackProps) {
  return (
    <Space direction="vertical" size={shellThemeTokens.pageSectionGap} style={{ width: "100%" }}>
      {children}
    </Space>
  );
}
