import { Space, theme } from "antd";

import type { AppSectionStackProps } from "./sectionTypes";

export function AppSectionStack({ children }: AppSectionStackProps) {
  const { token } = theme.useToken();

  return (
    <Space
      direction="vertical"
      size={token.marginLG}
      style={{ padding: token.paddingLG, width: "100%" }}
    >
      {children}
    </Space>
  );
}
