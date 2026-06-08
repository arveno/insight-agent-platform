import type { ReactNode } from "react";
import { Card, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../shared/theme/tokens";
import { shellTypographyStyles } from "../../shared/theme/typography";
import { EmptyState } from "../../shared/ui/feedback/EmptyState";
import type { EmptyStateProps } from "../../shared/ui/feedback/EmptyState";

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
  width = shellThemeTokens.inspectorWidth
}: RightAssistPanelProps) {
  const { token } = theme.useToken();

  if (!open) {
    return null;
  }

  return (
    <aside
      style={{
        alignSelf: "stretch",
        background: token.colorBgElevated,
        borderLeft: `${shellThemeTokens.surfaceBorderWidth}px solid ${token.colorBorderSecondary}`,
        flex: `0 0 ${width}px`,
        maxWidth: width,
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        width
      }}
    >
      <Card
        style={{ background: "transparent", minHeight: "100%" }}
        styles={{ body: { padding: shellThemeTokens.panelPadding } }}
        variant="borderless"
      >
        <Space
          direction="vertical"
          size={shellThemeTokens.shellSectionGap}
          style={{ width: "100%" }}
        >
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }}>
            <Space direction="vertical" size={4}>
              <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
              {description ? (
                <Typography.Text type="secondary" style={shellTypographyStyles.cardDescription}>
                  {description}
                </Typography.Text>
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
