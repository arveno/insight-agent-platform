import { Space, Typography } from "antd";

import type { AnalysisConversationController } from "../../features/agent-analysis/hooks/useAnalysisConversationState";
import { RightAssistPanel, RiskBadge, StatusTag, TraceTimeline, useI18n } from "../../shared";
import { toRiskBadge, toStatusTag } from "../../pages/_shared";

export type AnalysisInspectorPanelProps = {
  conversationState: Pick<AnalysisConversationController, "selectedSession">;
  workspaceName: string;
};

export function AnalysisInspectorPanel({
  conversationState,
  workspaceName
}: AnalysisInspectorPanelProps) {
  const { t } = useI18n();
  const { runTrace } = conversationState.selectedSession;

  return (
    <RightAssistPanel title="Run Trace">
      <Space aria-label="Analysis inspector" direction="vertical" size={16} style={{ width: "100%" }}>
        <Space align="start" style={{ justifyContent: "space-between", width: "100%" }} wrap>
          <Space direction="vertical" size={4}>
            <Typography.Text strong>当前 Run 状态</Typography.Text>
            <Typography.Text type="secondary">{workspaceName}</Typography.Text>
            <Typography.Text type="secondary">{`runId: ${runTrace.runId}`}</Typography.Text>
            <Typography.Text type="secondary">{runTrace.stageSummary}</Typography.Text>
            <Typography.Text type="secondary">{runTrace.updatedAtText}</Typography.Text>
          </Space>
          <Space wrap>
            <StatusTag {...toStatusTag(t, runTrace.status)!} />
            {runTrace.risk ? <RiskBadge {...toRiskBadge(t, runTrace.risk)!} /> : null}
          </Space>
        </Space>

        <TraceTimeline
          items={runTrace.events.map((event) => ({
            description: event.description ?? event.meta,
            key: event.key,
            risk: toRiskBadge(t, event.risk),
            status: toStatusTag(t, event.status),
            timestampText: event.timestampText,
            title: event.title
          }))}
        />
      </Space>
    </RightAssistPanel>
  );
}
