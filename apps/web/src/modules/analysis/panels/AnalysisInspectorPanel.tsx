import { Space, Typography } from "antd";

import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { EventTimeline } from "../../../shared/ui/lists/EventTimeline";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { AnalysisInspectorPanelKey } from "../models/analysisViewModel";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";
import { RunTraceDetailDrawer } from "../components/RunTraceDetailDrawer";
import { useI18n } from "../../../shared/i18n/I18nProvider";

export type AnalysisInspectorPanelProps = {
  activeInspectorPanel: AnalysisInspectorPanelKey;
  currentRun: AnalysisRun;
  isRunTraceDetailOpen: boolean;
  onCloseRunTraceDetail: () => void;
  onSelectRunEvent: (eventId: string) => void;
  runEvents: AnalysisRunEvent[];
  selectedRunEvent?: AnalysisRunEvent;
  selectedRunEventId: string | null;
  workspaceName: string;
};

function getPanelTitle(activeInspectorPanel: AnalysisInspectorPanelKey): string {
  switch (activeInspectorPanel) {
    case "memory-context":
      return "Memory Context";
    case "report-preview":
      return "Report Preview";
    case "run-trace":
      return "Run Trace";
    case "source-evidence":
      return "Source Evidence";
    case "tool-detail":
      return "Tool Detail";
  }
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <ContentCard
      description="当前轮次只固定 Inspector 落点，后续真实 Tool / Source / Report / Memory 能力会挂回这里。"
      title={title}
    />
  );
}

export function AnalysisInspectorPanel({
  activeInspectorPanel,
  currentRun,
  isRunTraceDetailOpen,
  onCloseRunTraceDetail,
  onSelectRunEvent,
  runEvents,
  selectedRunEvent,
  selectedRunEventId,
  workspaceName
}: AnalysisInspectorPanelProps) {
  const { t } = useI18n();
  const runSummaryItems = [
    { key: "duration", label: "Total duration", value: currentRun.totalDurationText },
    { key: "tokens", label: "Tokens", value: currentRun.tokenUsageText },
    { key: "cost", label: "Cost", value: currentRun.costText },
    { key: "errors", label: "Errors", value: currentRun.errorSummaryText }
  ];

  return (
    <SidePanel title={getPanelTitle(activeInspectorPanel)}>
      <Space
        aria-label="Analysis inspector"
        direction="vertical"
        size={16}
        style={{ width: "100%" }}
      >
        {activeInspectorPanel === "run-trace" ? (
          <>
            <ContentCard
              description={currentRun.stageSummary}
              eyebrow={`runId: ${currentRun.runId}`}
              meta={
                <Typography.Text type="secondary" style={shellTypographyStyles.meta}>
                  {`${workspaceName} · ${currentRun.updatedAtText}`}
                </Typography.Text>
              }
              tagSlot={
                <Space wrap>
                  <StatusTag {...toStatusTag(t, currentRun.statusViewModel)!} />
                  {currentRun.riskViewModel ? (
                    <RiskBadge {...toRiskBadge(t, currentRun.riskViewModel)!} />
                  ) : null}
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
            </ContentCard>

            <EventTimeline
              items={runEvents.map((event) => ({
                ariaLabel: `查看 Trace 事件详情：${event.title}`,
                description: event.summary,
                key: event.eventId,
                onClick: () => onSelectRunEvent(event.eventId),
                risk: toRiskBadge(t, event.riskViewModel),
                selected: selectedRunEventId === event.eventId,
                status: toStatusTag(t, event.statusViewModel),
                timestampText: event.timestampText,
                title: event.title
              }))}
            />

            <RunTraceDetailDrawer
              event={selectedRunEvent}
              onClose={onCloseRunTraceDetail}
              open={isRunTraceDetailOpen}
            />
          </>
        ) : (
          <PlaceholderPanel title={getPanelTitle(activeInspectorPanel)} />
        )}
      </Space>
    </SidePanel>
  );
}
