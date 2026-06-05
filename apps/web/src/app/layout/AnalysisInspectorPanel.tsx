import { Space, Typography } from "antd";

import type { AnalysisConversationController } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import { RightAssistPanel, RiskBadge, StatusTag, TraceTimeline, type I18nMessageKey, useI18n } from "../../shared";
import type { AppShellInspectorViewModel } from "../models";
import { toRiskBadge, toStatusTag } from "../../pages/_shared";

export type AnalysisInspectorPanelProps = {
  conversationState: Pick<
    AnalysisConversationController,
    "analysisDraft" | "feedbackValue" | "followUpDraft" | "selectedSession"
  >;
  inspector: AppShellInspectorViewModel;
  workspaceName: string;
};

export function AnalysisInspectorPanel({
  conversationState,
  inspector,
  workspaceName
}: AnalysisInspectorPanelProps) {
  const { t } = useI18n();
  const session = conversationState.selectedSession;
  const contextSummary = session.contextItems
    .slice(0, 3)
    .map((item) => item.value)
    .join(" / ");
  const metricsToolStep = session.planSteps.find((step) => step.title.includes("指标"));
  const evidenceSummary = session.evidenceItems
    .slice(0, 2)
    .map((item) => item.title)
    .join(" / ");
  const integrationSummary = inspector.integrationNotes
    .slice(0, 4)
    .map((note) => note.split("：")[0])
    .join(" / ");

  return (
    <RightAssistPanel description={inspector.summary} title="Run Trace">
      <Space
        aria-label="Analysis inspector"
        direction="vertical"
        size={16}
        style={{ width: "100%" }}
      >
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
          <Space direction="vertical" size={4}>
            <Typography.Text strong>当前 Run 状态</Typography.Text>
            <Typography.Text type="secondary">{session.runOverview.stageSummary}</Typography.Text>
            <Typography.Text type="secondary">{session.runOverview.updatedAtText}</Typography.Text>
          </Space>
          <Space wrap>
            <StatusTag {...toStatusTag(t, session.runOverview.status)!} />
            {session.runOverview.risk ? (
              <RiskBadge {...toRiskBadge(t, session.runOverview.risk)!} />
            ) : null}
          </Space>
        </Space>

        <TraceTimeline
          items={[
            {
              description: conversationState.analysisDraft,
              key: `${session.key}-trace-question`,
              status: toStatusTag(t, session.planSteps[0]?.status ?? session.runOverview.status),
              timestampText: session.planSteps[0]?.timestampText,
              title: "1. 接收用户问题"
            },
            {
              description: `${workspaceName} / ${session.session.contextLabel} / ${contextSummary}`,
              key: `${session.key}-trace-context`,
              risk: toRiskBadge(t, session.contextItems.find((item) => item.risk)?.risk ?? undefined),
              status: toStatusTag(t, session.session.status),
              title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
            },
            {
              description: session.planSteps[0]?.description ?? session.runOverview.phaseLabel,
              key: `${session.key}-trace-plan`,
              status: toStatusTag(t, session.planSteps[0]?.status ?? session.runOverview.status),
              timestampText: session.planSteps[0]?.timestampText,
              title: "3. 生成分析计划"
            },
            {
              description: `静态检查 ${session.runOverview.toolSummary}，不执行真实权限校验或 Tool Calling。`,
              key: `${session.key}-trace-permission`,
              risk: toRiskBadge(t, session.runOverview.risk),
              status: toStatusTag(t, session.runOverview.status),
              title: "4. 检查工具权限"
            },
            {
              description:
                metricsToolStep?.description ?? "静态展示指标摘要工具返回的阈值与趋势摘要。",
              key: `${session.key}-trace-metrics-tool`,
              status: toStatusTag(t, metricsToolStep?.status ?? session.runOverview.status),
              timestampText: metricsToolStep?.timestampText,
              title: "5. 调用指标摘要工具"
            },
            {
              description: `Evidence / RAG 来源：${evidenceSummary}`,
              key: `${session.key}-trace-evidence`,
              risk: toRiskBadge(t, session.evidenceItems.find((item) => item.risk)?.risk ?? undefined),
              status: toStatusTag(t, session.traceSummary.status),
              title: "6. 召回 Evidence / RAG 来源"
            },
            {
              description: session.resultSummary.conclusion,
              key: `${session.key}-trace-summary`,
              risk: toRiskBadge(t, session.resultSummary.risk),
              status: toStatusTag(t, session.resultSummary.status),
              timestampText: session.traceSummary.updatedAtText,
              title: "7. 生成分析摘要"
            },
            {
              description: createFollowUpDescription({
                feedbackTitle: session.feedback.title,
                followUpDraft: conversationState.followUpDraft,
                reportTitle: session.reportEntry.title,
                selectedFeedback: conversationState.feedbackValue
              }),
              key: `${session.key}-trace-follow-up`,
              risk: toRiskBadge(t, session.traceSummary.risk),
              status: toStatusTag(t, session.traceSummary.status),
              title: "8. 等待用户追问 / 反馈"
            }
          ]}
        />

        <Typography.Text type="secondary">
          技术对接：{integrationSummary || t(inspector.titleKey as I18nMessageKey)}。
        </Typography.Text>
      </Space>
    </RightAssistPanel>
  );
}

function createFollowUpDescription({
  feedbackTitle,
  followUpDraft,
  reportTitle,
  selectedFeedback
}: {
  feedbackTitle: string;
  followUpDraft: string;
  reportTitle: string;
  selectedFeedback?: string;
}) {
  const followUpText =
    followUpDraft.trim().length > 0
      ? `当前追问草稿：${followUpDraft}`
      : "当前仍等待新的追问输入。";
  const feedbackText = selectedFeedback
    ? `本地反馈状态：${selectedFeedback}。`
    : `${feedbackTitle} 仍只保留静态入口。`;

  return `${followUpText} ${feedbackText} ${reportTitle} 当前只作为静态沉淀入口，不触发真实报告生成。`;
}
