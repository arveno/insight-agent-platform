import { useState } from "react";
import { Alert, Button, Card, Flex, Space, Tag, Typography, theme } from "antd";

import { shellThemeTokens } from "../../../shared/theme/tokens";
import type { WorkspaceOptionViewModel } from "../../../shared/workspace/workspaceOptionViewModel";

type WorkspaceSelectionPageProps = {
  currentWorkspaceId?: string | null;
  displayName: string;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  workspaces: WorkspaceOptionViewModel[];
};

export function WorkspaceSelectionPage({
  currentWorkspaceId,
  displayName,
  onSelectWorkspace,
  workspaces
}: WorkspaceSelectionPageProps) {
  const { token } = theme.useToken();
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectWorkspace = async (workspaceId: string) => {
    setPendingWorkspaceId(workspaceId);
    setErrorMessage(null);

    try {
      await onSelectWorkspace(workspaceId);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "切换工作区失败，请稍后重试。");
    } finally {
      setPendingWorkspaceId(null);
    }
  };

  return (
    <main
      style={{
        alignItems: "center",
        background: token.colorBgLayout,
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: shellThemeTokens.pagePadding
      }}
    >
      <Flex align="center" justify="center" style={{ width: "100%" }}>
        <Space direction="vertical" size={20} style={{ maxWidth: 520, width: "100%" }}>
          <Space direction="vertical" size={6}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              选择工作区
            </Typography.Title>
            <Typography.Text type="secondary">
              {displayName} 已登录。请选择本次进入的工作区和对应 membership role。
            </Typography.Text>
          </Space>

          {errorMessage ? <Alert message={errorMessage} showIcon type="error" /> : null}
          {workspaces.length === 0 ? (
            <Alert
              message="当前账号没有可用的 WorkspaceMembership。"
              showIcon
              type="warning"
            />
          ) : null}

          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {workspaces.map((workspace) => {
              const isCurrentWorkspace = workspace.workspaceId === currentWorkspaceId;
              const isPending = workspace.workspaceId === pendingWorkspaceId;

              return (
                <Card
                  key={workspace.membershipId}
                  style={{
                    background: token.colorBgElevated,
                    borderColor: token.colorBorderSecondary
                  }}
                >
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Space align="center" size={8} wrap>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {workspace.name}
                      </Typography.Title>
                      <Tag color="blue">{workspace.role}</Tag>
                      {isCurrentWorkspace ? <Tag>当前工作区</Tag> : null}
                    </Space>
                    <Typography.Text type="secondary">
                      选择此工作区以继续当前会话，并应用对应 membership role。
                    </Typography.Text>
                    <Button
                      block
                      loading={isPending}
                      onClick={() => void handleSelectWorkspace(workspace.workspaceId)}
                      type="primary"
                    >
                      {isCurrentWorkspace ? "继续进入" : "进入工作区"}
                    </Button>
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Space>
      </Flex>
    </main>
  );
}
