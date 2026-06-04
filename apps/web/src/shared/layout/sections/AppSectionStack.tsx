import { Space } from "antd";

import type { AppSectionStackProps } from "./sectionTypes";

export function AppSectionStack({ children }: AppSectionStackProps) {
  return (
    <Space direction="vertical" size={24} style={{ padding: 24, width: "100%" }}>
      {children}
    </Space>
  );
}
