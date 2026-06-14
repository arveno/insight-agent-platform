import { useState } from "react";
import { Alert, Button, Card, Col, Flex, Row, Space, Tag, Typography } from "antd";

type WorkspaceSelectionOptionViewModel = {
  membershipId: string;
  name: string;
  role: string;
  workspaceId: string;
};

type WorkspaceSelectionPageProps = {
  currentWorkspaceId?: string | null;
  displayName: string;
  onSelectWorkspace: (workspaceId: string) => Promise<void>;
  workspaces: WorkspaceSelectionOptionViewModel[];
};

export function WorkspaceSelectionPage({
  currentWorkspaceId,
  displayName,
  onSelectWorkspace,
  workspaces
}: WorkspaceSelectionPageProps) {
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
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
        <Space direction="vertical" size={20} style={{ maxWidth: 960, width: "100%" }}>
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

          <Row gutter={[16, 16]}>
            {workspaces.map((workspace) => {
              const isCurrentWorkspace = workspace.workspaceId === currentWorkspaceId;
              const isPending = workspace.workspaceId === pendingWorkspaceId;

              return (
                <Col key={workspace.membershipId} md={12} xs={24}>
                  <Card>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <Space align="center" size={8} wrap>
                        <Typography.Title level={5} style={{ margin: 0 }}>
                          {workspace.name}
                        </Typography.Title>
                        <Tag color="blue">{workspace.role}</Tag>
                        {isCurrentWorkspace ? <Tag>当前工作区</Tag> : null}
                      </Space>
                      <Typography.Text type="secondary">
                        workspaceId: {workspace.workspaceId}
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
                </Col>
              );
            })}
          </Row>
        </Space>
      </Flex>
    </main>
  );
}
