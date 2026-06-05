import { List, Space, Typography, theme } from "antd";

import type { StaticRouteKey } from "../models";
import type { AnalysisConversationController } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import {
  AppActionGroup,
  AppBaseCard,
  FeedbackPanel,
  ReportSection,
  RightAssistPanel,
  RiskBadge,
  SourceEvidenceList,
  StatusTag,
  TraceTimeline,
  type I18nMessageKey,
  useI18n
} from "../../shared";
import type { AppShellInspectorViewModel } from "../models";
import { createRouteAction, toRiskBadge, toStatusTag } from "../../pages/_shared";

export type AnalysisInspectorPanelProps = {
  conversationState: Pick<
    AnalysisConversationController,
    "feedbackValue" | "onFeedbackChange" | "onFeedbackSubmit" | "selectedSession"
  >;
  inspector: AppShellInspectorViewModel;
  onNavigate?: (route: StaticRouteKey) => void;
  workspaceName: string;
};

export function AnalysisInspectorPanel({
  conversationState,
  inspector,
  onNavigate,
  workspaceName
}: AnalysisInspectorPanelProps) {
  const { t } = useI18n();
  const { token } = theme.useToken();
  const session = conversationState.selectedSession;
  const traceAction = createRouteAction({
    iconName: "observability",
    key: `${session.traceSummary.key}-inspector-route`,
    label: session.traceSummary.actionLabel,
    onNavigate,
    route: session.traceSummary.targetRoute,
    variant: "moduleEntry"
  });
  const reportAction = createRouteAction({
    iconName: "reports",
    key: `${session.reportEntry.key}-inspector-route`,
    label: session.reportEntry.actionLabel,
    onNavigate,
    route: session.reportEntry.targetRoute,
    variant: "moduleEntry"
  });

  return (
    <RightAssistPanel
      description={inspector.summary}
      title={t(inspector.titleKey as I18nMessageKey)}
    >
      <Space
        aria-label="Analysis inspector"
        direction="vertical"
        size={token.margin}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Typography.Text strong>当前上下文</Typography.Text>
          <Typography.Text type="secondary">{`当前工作区: ${workspaceName}`}</Typography.Text>
          <Typography.Text type="secondary">{session.session.contextLabel}</Typography.Text>
        </Space>

        <AppBaseCard
          description={session.runOverview.stageSummary}
          eyebrow={session.runOverview.phaseLabel}
          tagSlot={
            <Space wrap>
              <StatusTag {...toStatusTag(t, session.runOverview.status)!} />
              {session.runOverview.risk ? <RiskBadge {...toRiskBadge(t, session.runOverview.risk)!} /> : null}
            </Space>
          }
          title="当前 Run 状态"
        >
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Typography.Text strong>{session.runOverview.ownerLabel}</Typography.Text>
            <Typography.Text type="secondary">{session.runOverview.toolSummary}</Typography.Text>
            <Typography.Text type="secondary">{session.runOverview.updatedAtText}</Typography.Text>
          </Space>
        </AppBaseCard>

        <AppBaseCard
          description="静态展示 Plan / Step / Tool Calling，不执行真实 Runtime、Tool 或 streaming。"
          title="Plan / Step / Tool Calling"
        >
          <TraceTimeline
            items={session.planSteps.map((step) => ({
              description: step.description ?? step.meta,
              key: step.key,
              risk: toRiskBadge(t, step.risk),
              status: toStatusTag(t, step.status),
              timestampText: step.timestampText,
              title: step.title
            }))}
          />
        </AppBaseCard>

        <AppBaseCard
          description="Evidence / RAG 来源只展示静态摘要，不接真实知识检索或证据 API。"
          title="Evidence / RAG 来源"
        >
          <SourceEvidenceList
            items={session.evidenceItems.map((item) => ({
              confidenceText: item.confidenceText,
              key: item.key,
              risk: toRiskBadge(t, item.risk),
              sourceTypeLabel: item.sourceTypeLabel,
              summary: item.relatedContext ? `${item.summary} ${item.relatedContext}` : item.summary,
              title: item.title
            }))}
          />
        </AppBaseCard>

        <AppBaseCard
          description={session.traceSummary.description}
          footerActions={<AppActionGroup actions={[traceAction]} />}
          tagSlot={
            <Space wrap>
              <StatusTag {...toStatusTag(t, session.traceSummary.status)!} />
              {session.traceSummary.risk ? (
                <RiskBadge {...toRiskBadge(t, session.traceSummary.risk)!} />
              ) : null}
            </Space>
          }
          title="Run Trace 摘要"
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <Typography.Text strong>{session.traceSummary.eventCountText}</Typography.Text>
            <TraceTimeline
              items={session.traceSummary.items.map((item) => ({
                description: item.description ?? item.meta,
                key: item.key,
                risk: toRiskBadge(t, item.risk),
                status: toStatusTag(t, item.status),
                timestampText: item.timestampText,
                title: item.title
              }))}
            />
          </Space>
        </AppBaseCard>

        <AppBaseCard
          description={session.resultSummary.conclusion}
          tagSlot={
            <Space wrap>
              <StatusTag {...toStatusTag(t, session.resultSummary.status)!} />
              {session.resultSummary.risk ? (
                <RiskBadge {...toRiskBadge(t, session.resultSummary.risk)!} />
              ) : null}
            </Space>
          }
          title={session.resultSummary.title}
        >
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            <div>
              <Typography.Text strong>关键发现</Typography.Text>
              <List
                dataSource={session.resultSummary.findingBullets}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0, paddingTop: token.marginXXS }}>
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
                  <List.Item style={{ paddingInline: 0, paddingTop: token.marginXXS }}>
                    <Typography.Text>{item}</Typography.Text>
                  </List.Item>
                )}
                split={false}
              />
            </div>
            <Typography.Text type="secondary">{session.resultSummary.evidenceSummary}</Typography.Text>
          </Space>
        </AppBaseCard>

        <FeedbackPanel
          helperText={session.feedback.helperText}
          onChange={conversationState.onFeedbackChange}
          onSubmit={conversationState.onFeedbackSubmit}
          options={session.feedback.options}
          submitLabel={session.feedback.submitLabel}
          targetTitle={session.feedback.targetTitle}
          title={session.feedback.title}
          value={conversationState.feedbackValue}
        />

        <ReportSection
          actions={<AppActionGroup actions={[reportAction]} />}
          content={session.reportEntry.description}
          evidenceSummary={session.reportEntry.evidenceSummary}
          title={session.reportEntry.title}
        />

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>能力说明</Typography.Text>
          {inspector.capabilityNotes.map((note) => (
            <Typography.Paragraph key={note} style={{ margin: 0 }}>
              {`• ${note}`}
            </Typography.Paragraph>
          ))}
        </Space>

        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text strong>技术对接</Typography.Text>
          {inspector.integrationNotes.map((note) => (
            <Typography.Paragraph key={note} style={{ margin: 0 }}>
              {`• ${note}`}
            </Typography.Paragraph>
          ))}
        </Space>
      </Space>
    </RightAssistPanel>
  );
}
