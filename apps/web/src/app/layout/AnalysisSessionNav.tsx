import { ArrowLeftOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../features/static-view-models";
import { RiskBadge, StatusTag } from "../../shared";

export type AnalysisSessionNavProps = {
  onBack: () => void;
  onCreateNewAnalysis: () => void;
  onSearchChange: (value: string) => void;
  onSelectSession: (key: string) => void;
  searchValue: string;
  selectedSessionKey: string;
  sessions: AnalysisViewModel["sessions"];
};

const statusLabelByKey = {
  disabled: "不可操作",
  empty: "暂无数据",
  error: "错误态",
  loading: "加载中",
  ready: "就绪",
  readonly: "只读",
  risk: "存在风险",
  success: "成功",
  warning: "注意"
} as const;

const riskLabelByLevel = {
  critical: "严重风险",
  high: "高风险",
  low: "低风险",
  medium: "中风险",
  none: "未知风险"
} as const;

export function AnalysisSessionNav({
  onBack,
  onCreateNewAnalysis,
  onSearchChange,
  onSelectSession,
  searchValue,
  selectedSessionKey,
  sessions
}: AnalysisSessionNavProps) {
  const { token } = theme.useToken();

  return (
    <nav
      aria-label="Analysis session navigation"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.margin,
        paddingInline: token.padding,
        paddingTop: token.paddingSM
      }}
    >
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        style={{ justifyContent: "flex-start" }}
        type="text"
      >
        分析
      </Button>

      <Input
        aria-label="搜索会话"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="搜索会话"
        prefix={<SearchOutlined />}
        value={searchValue}
      />

      <Button icon={<PlusOutlined />} onClick={onCreateNewAnalysis} type="default">
        新建分析
      </Button>

      <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
        {sessions.length === 0 ? (
          <Typography.Text type="secondary">暂无匹配会话</Typography.Text>
        ) : null}
        {sessions.map((session) => {
          const isSelected = session.key === selectedSessionKey;

          return (
            <button
              aria-pressed={isSelected}
              key={session.key}
              onClick={() => onSelectSession(session.key)}
              style={{
                appearance: "none",
                background: isSelected ? token.colorFillAlter : token.colorBgContainer,
                border: `1px solid ${
                  isSelected ? token.colorText : token.colorBorderSecondary
                }`,
                borderRadius: token.borderRadiusLG,
                cursor: "pointer",
                padding: token.paddingSM,
                textAlign: "left",
                width: "100%"
              }}
              type="button"
            >
              <Space direction="vertical" size={token.marginXXS} style={{ width: "100%" }}>
                <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
                  <Typography.Text strong>{session.session.title}</Typography.Text>
                  <Space wrap size={token.marginXXS}>
                    <StatusTag
                      label={statusLabelByKey[session.session.status.status] ?? "就绪"}
                      tone={
                        session.session.status.status === "loading"
                          ? "processing"
                          : session.session.status.status === "warning" ||
                              session.session.status.status === "risk"
                            ? "warning"
                            : session.session.status.status === "success" ||
                                session.session.status.status === "ready"
                              ? "success"
                              : "default"
                      }
                    />
                    {session.session.risk ? (
                      <RiskBadge
                        label={
                          session.session.risk.title ??
                          riskLabelByLevel[session.session.risk.level]
                        }
                        level={
                          session.session.risk.level === "none"
                            ? "unknown"
                            : session.session.risk.level
                        }
                      />
                    ) : null}
                  </Space>
                </Space>
                <Typography.Text type="secondary">{session.session.contextLabel}</Typography.Text>
                <Typography.Text type="secondary">{session.session.updatedAtText}</Typography.Text>
              </Space>
            </button>
          );
        })}
      </Space>
    </nav>
  );
}
