import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import type { StaticSectionViewModel } from "../../../app/models";
import { StatusTag, useI18n } from "../../../shared";
import { toStatusTag } from "../adapters";
import { translateKey } from "../text";

export type WebSectionProps = {
  children: ReactNode;
  section: StaticSectionViewModel;
};

export function WebSection({ children, section }: WebSectionProps) {
  const { t } = useI18n();

  return (
    <Card
      title={
        <Space wrap>
          <Typography.Text strong>{translateKey(t, section.titleKey)}</Typography.Text>
          <StatusTag {...toStatusTag(t, section.status)!} />
        </Space>
      }
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Typography.Text type="secondary">
          {translateKey(t, section.descriptionKey)}
        </Typography.Text>
        {children}
      </Space>
    </Card>
  );
}
