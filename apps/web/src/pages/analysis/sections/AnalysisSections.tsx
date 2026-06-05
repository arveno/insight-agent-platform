import { Alert, Button, Card, Input, List, Space, Typography, theme } from "antd";

import type { AnalysisViewModel } from "../../../features/static-view-models";
import { RiskBadge, StatusTag } from "../../../shared";
import type { WebPageProps } from "../../_shared";

const { TextArea } = Input;

export type AnalysisSectionsProps = WebPageProps & {
  analysisDraft: string;
  followUpDraft: string;
  interactionMessage: string;
  onAnalysisDraftChange: (value: string) => void;
  onAnalysisSubmit: () => void;
  onFollowUpDraftChange: (value: string) => void;
  onFollowUpSubmit: () => void;
  onSelectAnalysisSuggestion: (value: string) => void;
  onSelectFollowUpSuggestion: (value: string) => void;
  selectedSession: AnalysisViewModel["sessions"][number];
  viewModel: AnalysisViewModel;
};

export function AnalysisSections({
  analysisDraft,
  followUpDraft,
  interactionMessage,
  onAnalysisDraftChange,
  onAnalysisSubmit,
  onFollowUpDraftChange,
  onFollowUpSubmit,
  onSelectAnalysisSuggestion,
  onSelectFollowUpSuggestion,
  selectedSession,
  viewModel
}: AnalysisSectionsProps) {
  const { token } = theme.useToken();
  const contextSummary = selectedSession.contextItems
    .slice(0, 3)
    .map((item) => item.value)
    .join(" / ");

  return (
    <Space
      aria-label="Analysis conversation"
      direction="vertical"
      role="region"
      size={token.marginLG}
      style={{ width: "100%" }}
    >
      <section
        style={{
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          padding: token.paddingLG
        }}
      >
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Space direction="vertical" size={4} style={{ maxWidth: 720 }}>
              <Typography.Text type="secondary">Conversation-first</Typography.Text>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {selectedSession.session.title}
              </Typography.Title>
              <Typography.Text type="secondary">
                {selectedSession.session.summary}
              </Typography.Text>
              <Typography.Text type="secondary">
                当前上下文：{contextSummary || viewModel.contextPanelNote}
              </Typography.Text>
            </Space>
            <Space wrap>
              <StatusTag {...toStatusTagLabel(selectedSession.session.status)} />
              {selectedSession.session.risk ? (
                <RiskBadge {...toRiskBadgeLabel(selectedSession.session.risk)} />
              ) : null}
            </Space>
          </Space>
          <Alert
            message={interactionMessage}
            showIcon
            style={{ borderRadius: token.borderRadiusLG }}
            type="info"
          />
        </Space>
      </section>

      <Space
        aria-label="Analysis messages"
        direction="vertical"
        size={token.margin}
        style={{ width: "100%" }}
      >
        <MessageBubble
          content={viewModel.contextPanelNote}
          roleLabel="System"
          subtitle={selectedSession.inputComposer.contextHint}
          tone="system"
          title="当前为静态 Analysis UI"
        />
        <QuestionBubble
          draft={analysisDraft}
          onDraftChange={onAnalysisDraftChange}
          onSelectSuggestion={onSelectAnalysisSuggestion}
          onSubmit={onAnalysisSubmit}
          session={selectedSession}
        />
        <AssistantBubble session={selectedSession} />
      </Space>

      <section
        style={{
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          padding: token.paddingLG
        }}
      >
        <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">Composer</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {selectedSession.followUpComposer.title}
            </Typography.Title>
            <Typography.Text type="secondary">
              {selectedSession.followUpComposer.helperText}
            </Typography.Text>
          </Space>
          <TextArea
            aria-label={selectedSession.followUpComposer.title}
            onChange={(event) => onFollowUpDraftChange(event.target.value)}
            placeholder={selectedSession.followUpComposer.placeholder}
            rows={4}
            value={followUpDraft}
          />
          <Space wrap>
            {selectedSession.followUpComposer.suggestions.map((suggestion) => (
              <Button
                key={suggestion.key}
                onClick={() => onSelectFollowUpSuggestion(suggestion.label)}
                size="small"
                type="default"
              >
                {suggestion.label}
              </Button>
            ))}
          </Space>
          <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
            <Typography.Text type="secondary">
              静态本地提交只更新当前页面提示，不触发真实多轮请求或 Agent。
            </Typography.Text>
            <Button
              color="default"
              disabled={followUpDraft.trim().length === 0}
              onClick={onFollowUpSubmit}
              variant="solid"
            >
              {selectedSession.followUpComposer.submitLabel}
            </Button>
          </Space>
        </Space>
      </section>
    </Space>
  );
}

function MessageBubble({
  content,
  roleLabel,
  subtitle,
  tone,
  title
}: {
  content: string;
  roleLabel: string;
  subtitle?: string;
  tone: "assistant" | "system" | "user";
  title: string;
}) {
  const { token } = theme.useToken();
  const backgroundByTone = {
    assistant: token.colorBgElevated,
    system: token.colorFillAlter,
    user: token.colorBgContainer
  };
  const borderByTone = {
    assistant: token.colorBorderSecondary,
    system: token.colorBorder,
    user: token.colorText
  };

  return (
    <Card
      styles={{ body: { padding: token.paddingLG } }}
      style={{
        background: backgroundByTone[tone],
        borderColor: borderByTone[tone],
        borderRadius: token.borderRadiusLG,
        width: "100%"
      }}
    >
      <Space direction="vertical" size={token.marginXS} style={{ width: "100%" }}>
        <Typography.Text type="secondary">{roleLabel}</Typography.Text>
        <Typography.Text strong>{title}</Typography.Text>
        {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
        <Typography.Paragraph style={{ margin: 0 }}>{content}</Typography.Paragraph>
      </Space>
    </Card>
  );
}

function QuestionBubble({
  draft,
  onDraftChange,
  onSelectSuggestion,
  onSubmit,
  session
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSelectSuggestion: (value: string) => void;
  onSubmit: () => void;
  session: AnalysisViewModel["sessions"][number];
}) {
  const { token } = theme.useToken();

  return (
    <Card
      styles={{ body: { padding: token.paddingLG } }}
      style={{ borderColor: token.colorText, borderRadius: token.borderRadiusLG, width: "100%" }}
    >
      <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">User</Typography.Text>
          <Typography.Text strong>当前分析问题</Typography.Text>
          <Typography.Text type="secondary">{session.inputComposer.helperText}</Typography.Text>
        </Space>
        <TextArea
          aria-label={session.inputComposer.title}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={session.inputComposer.placeholder}
          rows={5}
          value={draft}
        />
        <Space wrap>
          {session.inputComposer.suggestions.map((suggestion) => (
            <Button
              key={suggestion.key}
              onClick={() => onSelectSuggestion(suggestion.label)}
              size="small"
              type="default"
            >
              {suggestion.label}
            </Button>
          ))}
        </Space>
        <Space align="center" style={{ justifyContent: "space-between", width: "100%" }} wrap>
          <Typography.Text type="secondary">
            当前会话标题和上下文来自静态 ViewModel；提交不会创建真实会话。
          </Typography.Text>
          <Button
            color="default"
            disabled={draft.trim().length === 0}
            onClick={onSubmit}
            variant="solid"
          >
            {session.inputComposer.submitLabel}
          </Button>
        </Space>
      </Space>
    </Card>
  );
}

function AssistantBubble({ session }: { session: AnalysisViewModel["sessions"][number] }) {
  const { token } = theme.useToken();

  return (
    <Card
      styles={{ body: { padding: token.paddingLG } }}
      style={{
        background: token.colorBgElevated,
        borderColor: token.colorBorderSecondary,
        borderRadius: token.borderRadiusLG,
        width: "100%"
      }}
    >
      <Space direction="vertical" size={token.margin} style={{ width: "100%" }}>
        <Space direction="vertical" size={4}>
          <Typography.Text type="secondary">Assistant</Typography.Text>
          <Typography.Text strong>分析结果摘要</Typography.Text>
          <Typography.Text type="secondary">{session.runOverview.phaseLabel}</Typography.Text>
        </Space>
        <Typography.Paragraph style={{ margin: 0 }}>
          {session.resultSummary.conclusion}
        </Typography.Paragraph>
        <div>
          <Typography.Text strong>关键发现</Typography.Text>
          <List
            dataSource={session.resultSummary.findingBullets}
            renderItem={(item) => (
              <List.Item style={{ paddingInline: 0, paddingTop: token.marginXS }}>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
            split={false}
          />
        </div>
        <div>
          <Typography.Text strong>建议动作</Typography.Text>
          <List
            dataSource={session.resultSummary.actionSuggestions}
            renderItem={(item) => (
              <List.Item style={{ paddingInline: 0, paddingTop: token.marginXS }}>
                <Typography.Text>{item}</Typography.Text>
              </List.Item>
            )}
            split={false}
          />
        </div>
        <Typography.Text type="secondary">
          更完整的 Run / Trace / Evidence / Feedback / Report 信息已迁移到右侧 Inspector。
        </Typography.Text>
      </Space>
    </Card>
  );
}

function toStatusTagLabel(status: AnalysisViewModel["sessions"][number]["session"]["status"]) {
  return {
    label:
      status.status === "loading"
        ? "加载中"
        : status.status === "warning"
          ? "注意"
          : status.status === "risk"
            ? "存在风险"
            : status.status === "success"
              ? "成功"
              : "就绪",
    tone:
      status.status === "loading"
        ? "processing"
        : status.status === "warning" || status.status === "risk"
          ? "warning"
          : status.status === "success" || status.status === "ready"
            ? "success"
            : "default"
  } as const;
}

function toRiskBadgeLabel(risk: NonNullable<AnalysisViewModel["sessions"][number]["session"]["risk"]>) {
  const riskLabelByLevel = {
    critical: "严重风险",
    high: "高风险",
    low: "低风险",
    medium: "中风险",
    none: "未知风险"
  } as const;

  return {
    label: risk.title ?? riskLabelByLevel[risk.level],
    level: risk.level === "none" ? "unknown" : risk.level
  } as const;
}
