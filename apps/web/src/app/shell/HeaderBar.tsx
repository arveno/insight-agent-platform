import type { ReactNode } from "react";
import { CheckOutlined, DownOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Space, Typography, theme } from "antd";
import type { ItemType } from "antd/es/menu/interface";

import { shellThemeTokens } from "../../shared/theme/tokens";

export type HeaderBarWorkspaceOption = {
  name: string;
  workspaceId: string;
};

export type HeaderBarProps = {
  currentWorkspaceName: ReactNode;
  feedback?: ReactNode;
  manageWorkspaceLabel: ReactNode;
  onOpenWorkspaceManagement?: () => void;
  onSelectWorkspace?: (workspaceId: string) => void;
  selectedWorkspaceId: string;
  workspaceMenuLabel: ReactNode;
  workspaces: HeaderBarWorkspaceOption[];
};

/**
 * Header 内容区边界。
 *
 * HeaderBar 只承接当前 workspace 的静态选择入口；
 * 不实现真实搜索、权限决策、偏好持久化、用户管理或 API 数据刷新。
 */
export function HeaderBar({
  currentWorkspaceName,
  feedback,
  manageWorkspaceLabel,
  onOpenWorkspaceManagement,
  onSelectWorkspace,
  selectedWorkspaceId,
  workspaceMenuLabel,
  workspaces
}: HeaderBarProps) {
  const { token } = theme.useToken();
  const items: ItemType[] = [
    {
      disabled: true,
      key: "workspace-menu-title",
      label: <Typography.Text type="secondary">{workspaceMenuLabel}</Typography.Text>
    },
    ...workspaces.map((workspace) => ({
      icon:
        workspace.workspaceId === selectedWorkspaceId ? (
          <CheckOutlined style={{ color: token.colorPrimary }} />
        ) : undefined,
      key: workspace.workspaceId,
      label: workspace.name
    })),
    { type: "divider" },
    {
      key: "workspace-management",
      label: manageWorkspaceLabel
    }
  ];

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
      <Dropdown
        menu={{
          items,
          onClick: ({ key }) => {
            if (key === "workspace-management") {
              onOpenWorkspaceManagement?.();
              return;
            }

            onSelectWorkspace?.(String(key));
          }
        }}
        placement="bottomLeft"
        trigger={["click"]}
      >
        <Button
          size="small"
          style={{
            borderRadius: shellThemeTokens.borderRadiusSM,
            color: token.colorText,
            height: "auto",
            paddingBlock: 4,
            paddingInline: 0
          }}
          type="text"
        >
          <Space size={4}>
            <Typography.Text>{currentWorkspaceName}</Typography.Text>
            <DownOutlined style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM }} />
          </Space>
        </Button>
      </Dropdown>
      {feedback ? (
        <Typography.Text style={{ color: token.colorTextDescription, fontSize: token.fontSizeSM }}>
          {feedback}
        </Typography.Text>
      ) : null}
    </Flex>
  );
}
