import type { ReactNode } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Tag, Typography, theme } from "antd";
import type { MenuProps } from "antd";

import { shellThemeTokens } from "../../shared/theme/tokens";
import type { WorkspaceOptionViewModel } from "../../shared/workspace/workspaceOptionViewModel";

export type HeaderBarProps = {
  currentUserRole: ReactNode;
  currentWorkspaceId: string;
  currentWorkspaceName: ReactNode;
  feedback?: ReactNode;
  onSelectWorkspace?: (workspaceId: string) => void;
  workspaces: WorkspaceOptionViewModel[];
};

export function HeaderBar({
  currentUserRole,
  currentWorkspaceId,
  currentWorkspaceName,
  feedback,
  onSelectWorkspace,
  workspaces
}: HeaderBarProps) {
  const { token } = theme.useToken();
  const workspaceItems: MenuProps["items"] = workspaces.map((workspace) => {
    const isCurrentWorkspace = workspace.workspaceId === currentWorkspaceId;

    return {
      disabled: isCurrentWorkspace || !onSelectWorkspace,
      key: workspace.workspaceId,
      label: (
        <Flex align="center" justify="space-between" gap={token.marginSM}>
          <Space direction="vertical" size={0}>
            <Typography.Text>{workspace.name}</Typography.Text>
            <Typography.Text
              style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM }}
            >
              {workspace.role}
            </Typography.Text>
          </Space>
          <Space align="center" size={8}>
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              {workspace.role}
            </Tag>
            {isCurrentWorkspace ? <Tag style={{ marginInlineEnd: 0 }}>当前工作区</Tag> : null}
          </Space>
        </Flex>
      )
    };
  });

  return (
    <Flex
      align="center"
      justify="flex-start"
      style={{
        gap: token.margin,
        height: "100%",
        paddingInline: shellThemeTokens.headerPaddingInline
      }}
    >
      <Space direction="vertical" size={4}>
        <Dropdown
          menu={{
            items: workspaceItems,
            onClick: ({ key }) => {
              onSelectWorkspace?.(String(key));
            }
          }}
          trigger={["click"]}
        >
          <Button
            aria-label="当前工作区"
            style={{
              alignItems: "center",
              background: token.colorBgElevated,
              borderColor: token.colorBorderSecondary,
              display: "inline-flex",
              gap: token.marginXS,
              height: "auto",
              paddingBlock: 4
            }}
            type="default"
          >
            <Typography.Text>{currentWorkspaceName}</Typography.Text>
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              {currentUserRole}
            </Tag>
            <DownOutlined />
          </Button>
        </Dropdown>
        {feedback ? (
          <Typography.Text
            style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM }}
          >
            {feedback}
          </Typography.Text>
        ) : null}
      </Space>
    </Flex>
  );
}
