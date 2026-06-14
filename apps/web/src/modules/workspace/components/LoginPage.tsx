import { useState } from "react";
import type { LoginRequest } from "@insight-agent/contracts/generated/typescript";
import { Alert, Button, Card, Flex, Form, Input, Space, Typography } from "antd";

type LoginPageProps = {
  onLogin: (payload: LoginRequest) => Promise<void>;
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Flex align="center" justify="center" style={{ minHeight: "100%" }}>
        <Card style={{ maxWidth: 420, width: "100%" }}>
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
                <Input autoComplete="username" placeholder="zoe@northstar.example.com" />
              </Form.Item>
              <Form.Item
                label="密码"
                name="password"
                rules={[{ message: "请输入密码。", required: true }]}
              >
                <Input.Password autoComplete="current-password" placeholder="zoe-password" />
              </Form.Item>
              <Button block htmlType="submit" loading={submitting} type="primary">
                登录
              </Button>
            </Form>

            <Typography.Paragraph style={{ marginBottom: 0 }}>
              Seed user:
              <br />
              `zoe@northstar.example.com` / `zoe-password`
            </Typography.Paragraph>
          </Space>
        </Card>
      </Flex>
    </main>
  );
}
