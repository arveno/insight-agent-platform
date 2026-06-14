import { useState } from "react";
import type { LoginRequest } from "@insight-agent/contracts/generated/typescript";
import { Alert, Button, Card, Flex, Form, Input, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../../shared/theme/tokens";

type LoginPageProps = {
  onLogin: (payload: LoginRequest) => Promise<void>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const { token } = theme.useToken();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const showSeedLoginHint = import.meta.env.VITE_SHOW_SEED_LOGIN_HINT === "true";

  const handleFinish = async (values: LoginRequest) => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await onLogin(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
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
        <Card
          style={{
            background: token.colorBgElevated,
            borderColor: token.colorBorderSecondary,
            maxWidth: 420,
            width: "100%"
          }}
        >
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Space direction="vertical" size={6}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                登录 Insight Agent
              </Typography.Title>
              <Typography.Text type="secondary">
                使用正式 Auth API 建立会话，然后进入工作区选择。
              </Typography.Text>
            </Space>

            {errorMessage ? <Alert message={errorMessage} showIcon type="error" /> : null}

            <Form<LoginRequest> layout="vertical" onFinish={handleFinish} requiredMark={false}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[{ message: "请输入邮箱。", required: true }]}
              >
                <Input autoComplete="username" placeholder="name@company.com" />
              </Form.Item>
              <Form.Item
                label="密码"
                name="password"
                rules={[{ message: "请输入密码。", required: true }]}
              >
                <Input.Password autoComplete="current-password" placeholder="请输入密码" />
              </Form.Item>
              <Button block htmlType="submit" loading={submitting} type="primary">
                登录
              </Button>
            </Form>

            {showSeedLoginHint ? (
              <Alert
                message="开发提示"
                description="zoe@northstar.example.com / zoe-password"
                showIcon
                type="info"
              />
            ) : null}
          </Space>
        </Card>
      </Flex>
    </main>
  );
}
