import { useEffect, useMemo, useState } from "react";
import { Space, Typography } from "antd";

import { TraceTimeline } from "../../observability/TraceTimeline";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { AppBaseCard } from "../../../shared/ui/cards/AppBaseCard";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import { RightAssistPanel } from "../../../app/shell/RightAssistPanel";
import type { AnalysisConversationController } from "../hooks/useAnalysisConversationState";
import { RunTraceDetailDrawer } from "../components/RunTraceDetailDrawer";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTraceEventId, setSelectedTraceEventId] = useState<string | null>(
    runTrace.events[0]?.eventId ?? null
  );
  const selectedTraceEvent = useMemo(
    () =>
      runTrace.events.find((event) => event.eventId === selectedTraceEventId) ?? runTrace.events[0],
    [runTrace.events, selectedTraceEventId]
  );

  useEffect(() => {
    setDrawerOpen(false);
    setSelectedTraceEventId(runTrace.events[0]?.eventId ?? null);
  }, [runTrace.events, runTrace.runId]);

  const runSummaryItems = [
    { key: "duration", label: "Total duration", value: runTrace.totalDurationText },
    { key: "tokens", label: "Tokens", value: runTrace.tokenUsageText },
    { key: "cost", label: "Cost", value: runTrace.costText },
    { key: "errors", label: "Errors", value: runTrace.errorSummaryText }
  ];

  return (
    <RightAssistPanel title="Run Trace">
      <Space
        aria-label="Analysis inspector"
        direction="vertical"
        size={16}
        style={{ width: "100%" }}
      >
        <AppBaseCard
          description={runTrace.stageSummary}
          eyebrow={`runId: ${runTrace.runId}`}
          meta={
            <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
              {`${workspaceName} · ${runTrace.updatedAtText}`}
            </Typography.Text>
          }
          tagSlot={
            <Space wrap>
              <StatusTag {...toStatusTag(t, runTrace.status)!} />
              {runTrace.risk ? <RiskBadge {...toRiskBadge(t, runTrace.risk)!} /> : null}
            </Space>
          }
          title="Current Run Overview"
        >
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
            }}
          >
            {runSummaryItems.map((item) => (
              <Space direction="vertical" key={item.key} size={2}>
                <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                  {item.label}
                </Typography.Text>
                <Typography.Text style={shellTypographyStyles.cardTitle}>
                  {item.value}
                </Typography.Text>
              </Space>
            ))}
          </div>
        </AppBaseCard>

        <TraceTimeline
          items={runTrace.events.map((event) => ({
            ariaLabel: `查看 Trace 事件详情：${event.title}`,
            description: event.summary,
            key: event.key,
            onClick: () => {
              setSelectedTraceEventId(event.eventId);
              setDrawerOpen(true);
            },
            risk: toRiskBadge(t, event.risk),
            selected: selectedTraceEvent?.eventId === event.eventId,
            status: toStatusTag(t, event.status),
            timestampText: event.timestampText,
            title: event.title
          }))}
        />

        <RunTraceDetailDrawer
          event={selectedTraceEvent}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        />
      </Space>
    </RightAssistPanel>
  );
}
