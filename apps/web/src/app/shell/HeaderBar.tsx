import type { ReactNode } from "react";
import { Button, Flex, Space, Tag, Typography, theme } from "antd";

import { shellThemeTokens } from "../../shared/theme/tokens";

export type HeaderBarProps = {
  currentUserEmail?: ReactNode;
  currentUserName: ReactNode;
  currentUserRole: ReactNode;
  currentWorkspaceName: ReactNode;
  feedback?: ReactNode;
  logoutLabel: ReactNode;
  onLogout?: () => void;
  onOpenWorkspaceSelection?: () => void;
  workspaceSwitchLabel: ReactNode;
};

export function HeaderBar({
  currentUserEmail,
  currentUserName,
  currentUserRole,
  currentWorkspaceName,
  feedback,
  logoutLabel,
  onLogout,
  onOpenWorkspaceSelection,
  workspaceSwitchLabel
}: HeaderBarProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      align="center"
      justify="space-between"
      style={{
        gap: token.margin,
        height: "100%",
        paddingInline: shellThemeTokens.headerPaddingInline
      }}
    >
      <Space direction="vertical" size={2}>
        <Space align="center" size={8} wrap>
          <Typography.Text>{currentWorkspaceName}</Typography.Text>
          <Tag color="blue" style={{ marginInlineEnd: 0 }}>
            {currentUserRole}
          </Tag>
        </Space>
        {feedback ? (
          <Typography.Text
            style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM }}
          >
            {feedback}
          </Typography.Text>
        ) : null}
      </Space>
      <Space align="center" size={12}>
        <Space direction="vertical" size={0}>
          <Typography.Text style={{ lineHeight: 1.2 }}>{currentUserName}</Typography.Text>
          <Typography.Text
            style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM, lineHeight: 1.2 }}
          >
            {currentUserEmail}
          </Typography.Text>
        </Space>
        <Button onClick={onOpenWorkspaceSelection} type="default">
          {workspaceSwitchLabel}
        </Button>
        <Button onClick={onLogout} type="text">
          {logoutLabel}
        </Button>
      </Space>
    </Flex>
  );
}
