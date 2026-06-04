import type { ReactNode } from "react";
import { Card, Space, Typography } from "antd";

import { shellThemeTokens } from "../../theme";
import { EmptyState, type EmptyStateProps } from "../../ui";

export type RightAssistPanelProps = {
  actions?: ReactNode;
  children?: ReactNode;
  description?: ReactNode;
  empty?: EmptyStateProps;
  open?: boolean;
  title: ReactNode;
  width?: number;
};

/**
 * 右侧辅助面板容器。
 *
 * 只承接页面传入的 Evidence / Trace / Report / Audit 等 slot；
 * 不在 shared/layout 内定义具体业务内容。
 */
export function RightAssistPanel({
  actions,
  children,
  description,
  empty,
  open = true,
  title,
  width = 360
}: RightAssistPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <aside
      style={{
        alignSelf: "stretch",
        background: shellThemeTokens.colorBgContainer,
        borderLeft: `1px solid ${shellThemeTokens.colorBorder}`,
        flex: `0 0 ${width}px`,
        maxWidth: width,
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        width
      }}
    >
      <Card bordered={false} style={{ minHeight: "100%" }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
            <Space direction="vertical" size={4}>
              <Typography.Text strong>{title}</Typography.Text>
              {description ? (
                <Typography.Text type="secondary">{description}</Typography.Text>
              ) : null}
            </Space>
            {actions}
          </Space>
          {children ?? <EmptyState {...empty} />}
        </Space>
      </Card>
    </aside>
  );
}
