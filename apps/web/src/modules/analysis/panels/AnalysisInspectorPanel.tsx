import { Space, Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { EventTimeline } from "../../../shared/ui/lists/EventTimeline";
import { EmptyState } from "../../../shared/ui/states/EmptyState";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import { RunTraceDetailDrawer } from "../components/RunTraceDetailDrawer";
import type {
  AnalysisDecisionViewModel,
  AnalysisInspectorPanelKey,
  AnalysisMessageStreamViewModel,
  AnalysisModelDetailViewModel,
  AnalysisReportPreviewViewModel,
  AnalysisSourceEvidenceViewModel,
  AnalysisSurfaceState,
  AnalysisToolDetailViewModel
} from "../models/analysisViewModel";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";

export type AnalysisInspectorPanelProps = {
  activeInspectorPanel: AnalysisInspectorPanelKey;
  currentRun?: AnalysisRun;
  decisions: AnalysisDecisionViewModel[];
  decisionsState: AnalysisSurfaceState;
  isRunTraceDetailOpen: boolean;
  messageStream?: AnalysisMessageStreamViewModel;
  messageStreamState: AnalysisSurfaceState;
  modelDetails: AnalysisModelDetailViewModel[];
  modelDetailsState: AnalysisSurfaceState;
  onCloseRunTraceDetail: () => void;
  onOpenInspectorPanel: (panel: AnalysisInspectorPanelKey) => void;
  onSelectRunEvent: (eventId: string) => void;
  reportPreview?: AnalysisReportPreviewViewModel;
  reportPreviewState: AnalysisSurfaceState;
  runEvents: AnalysisRunEvent[];
  selectedRunEvent?: AnalysisRunEvent;
  selectedRunEventId: string | null;
  sourceEvidence: AnalysisSourceEvidenceViewModel[];
  sourceEvidenceState: AnalysisSurfaceState;
  toolDetails: AnalysisToolDetailViewModel[];
  toolDetailsState: AnalysisSurfaceState;
  workspaceName: string;
};

function getPanelTitle(activeInspectorPanel: AnalysisInspectorPanelKey): string {
  switch (activeInspectorPanel) {
    case "decision-detail":
      return "Decision";
    case "memory-context":
      return "Memory Context";
    case "report-preview":
      return "Report Preview";
    case "run-trace":
      return "Run Trace";
    case "source-evidence":
      return "Source Evidence";
    case "tool-detail":
      return "Tool / Model";
  }
}

function renderSurfaceState(state: AnalysisSurfaceState, title: string) {
  if (state === "notImplemented") {
    return (
      <ContentCard
        description="当前 runtime route 返回 501 NOT_IMPLEMENTED。该承载位保留，但不伪造静态业务结果。"
        title={title}
      />
    );
  }

  if (state === "unavailable") {
    return (
      <ContentCard
        description="当前 runtime route 暂时不可用。请检查后端服务或 bootstrap id。"
        title={title}
      />
    );
  }

  return <EmptyState description="当前没有可展示的数据。" title={title} />;
}

function RunTracePanel({
  currentRun,
  isRunTraceDetailOpen,
  onCloseRunTraceDetail,
  onSelectRunEvent,
  runEvents,
  selectedRunEvent,
  selectedRunEventId,
  workspaceName
}: Pick<
  AnalysisInspectorPanelProps,
  | "currentRun"
  | "isRunTraceDetailOpen"
  | "onCloseRunTraceDetail"
  | "onSelectRunEvent"
  | "runEvents"
  | "selectedRunEvent"
  | "selectedRunEventId"
  | "workspaceName"
>) {
  const { t } = useI18n();

  if (!currentRun) {
    return <EmptyState description="当前没有可展示的 run。" title="Run Trace" />;
  }

  const runSummaryItems = [
    { key: "duration", label: "Total duration", value: currentRun.totalDurationText },
    { key: "tokens", label: "Tokens", value: currentRun.tokenUsageText },
    { key: "cost", label: "Cost", value: currentRun.costText },
    { key: "errors", label: "Errors", value: currentRun.errorSummaryText }
  ];

  return (
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
              <Typography.Text style={shellTypographyStyles.cardTitle}>{item.value}</Typography.Text>
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
  );
}

function ToolModelPanel({
  modelDetails,
  modelDetailsState,
  toolDetails,
  toolDetailsState
}: Pick<
  AnalysisInspectorPanelProps,
  "modelDetails" | "modelDetailsState" | "toolDetails" | "toolDetailsState"
>) {
  const { t } = useI18n();

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {toolDetails.length > 0 ? (
        toolDetails.map((toolDetail) => (
          <ContentCard
            description={toolDetail.summary}
            eyebrow={`runId: ${toolDetail.runId}`}
            key={toolDetail.toolCallId}
            title={toolDetail.toolName}
          >
            <StatusTag {...toStatusTag(t, toolDetail.statusViewModel)!} />
          </ContentCard>
        ))
      ) : (
        renderSurfaceState(toolDetailsState, "Tool Calls")
      )}

      {modelDetails.length > 0 ? (
        modelDetails.map((modelDetail) => (
          <ContentCard
            description={`${modelDetail.provider} · ${modelDetail.latencyText} · ${modelDetail.costText}`}
            eyebrow={`runId: ${modelDetail.runId}`}
            key={modelDetail.modelCallId}
            title={modelDetail.modelId}
          >
            <Space wrap>
              <StatusTag {...toStatusTag(t, modelDetail.statusViewModel)!} />
              <Typography.Text type="secondary">
                Tokens: {modelDetail.tokenUsageText}
              </Typography.Text>
            </Space>
          </ContentCard>
        ))
      ) : (
        renderSurfaceState(modelDetailsState, "Model Calls")
      )}
    </Space>
  );
}

function SourceEvidencePanel({
  sourceEvidence,
  sourceEvidenceState
}: Pick<AnalysisInspectorPanelProps, "sourceEvidence" | "sourceEvidenceState">) {
  if (sourceEvidence.length === 0) {
    return renderSurfaceState(sourceEvidenceState, "Source Evidence");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {sourceEvidence.map((evidence) => (
        <ContentCard
          description={evidence.summary}
          eyebrow={`${evidence.sourceType} · ${evidence.confidenceText}`}
          key={evidence.sourceEvidenceId}
          title={evidence.title}
        />
      ))}
    </Space>
  );
}

function ReportPreviewPanel({
  decisions,
  reportPreview,
  reportPreviewState
}: Pick<AnalysisInspectorPanelProps, "decisions" | "reportPreview" | "reportPreviewState">) {
  const { t } = useI18n();

  if (!reportPreview) {
    return renderSurfaceState(reportPreviewState, "Report Preview");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentCard
        description={reportPreview.summary}
        eyebrow={`runId: ${reportPreview.runId}`}
        title="Report Preview"
      >
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {reportPreview.title}
          </Typography.Text>
          {reportPreview.sections.map((section) => (
            <div key={section.key}>
              <Typography.Text style={shellTypographyStyles.meta}>{section.title}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>{section.content}</Typography.Paragraph>
            </div>
          ))}
        </Space>
      </ContentCard>

      {decisions.length > 0 ? (
        decisions.map((decision) => (
          <ContentCard
            description={decision.createdAtText}
            eyebrow={`reportId: ${decision.reportId}`}
            key={decision.decisionId}
            tagSlot={<StatusTag {...toStatusTag(t, decision.statusViewModel)!} />}
            title="Decision"
          >
            <Typography.Paragraph style={{ marginBottom: 0 }}>{decision.title}</Typography.Paragraph>
          </ContentCard>
        ))
      ) : null}
    </Space>
  );
}

function DecisionPanel({
  decisions,
  decisionsState
}: Pick<AnalysisInspectorPanelProps, "decisions" | "decisionsState">) {
  const { t } = useI18n();

  if (decisions.length === 0) {
    return renderSurfaceState(decisionsState, "Decision");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {decisions.map((decision) => (
        <ContentCard
          description={decision.createdAtText}
          eyebrow={`reportId: ${decision.reportId}`}
          key={decision.decisionId}
          tagSlot={<StatusTag {...toStatusTag(t, decision.statusViewModel)!} />}
          title="Decision"
        >
          <Typography.Paragraph style={{ marginBottom: 0 }}>{decision.title}</Typography.Paragraph>
        </ContentCard>
      ))}
    </Space>
  );
}

export function AnalysisInspectorPanel({
  activeInspectorPanel,
  currentRun,
  decisions,
  decisionsState,
  isRunTraceDetailOpen,
  messageStream,
  messageStreamState,
  modelDetails,
  modelDetailsState,
  onCloseRunTraceDetail,
  onOpenInspectorPanel,
  onSelectRunEvent,
  reportPreview,
  reportPreviewState,
  runEvents,
  selectedRunEvent,
  selectedRunEventId,
  sourceEvidence,
  sourceEvidenceState,
  toolDetails,
  toolDetailsState,
  workspaceName
}: AnalysisInspectorPanelProps) {
  void messageStream;
  void messageStreamState;
  void onOpenInspectorPanel;

  let content;

  switch (activeInspectorPanel) {
    case "run-trace":
      content = (
        <RunTracePanel
          currentRun={currentRun}
          isRunTraceDetailOpen={isRunTraceDetailOpen}
          onCloseRunTraceDetail={onCloseRunTraceDetail}
          onSelectRunEvent={onSelectRunEvent}
          runEvents={runEvents}
          selectedRunEvent={selectedRunEvent}
          selectedRunEventId={selectedRunEventId}
          workspaceName={workspaceName}
        />
      );
      break;
    case "tool-detail":
      content = (
        <ToolModelPanel
          modelDetails={modelDetails}
          modelDetailsState={modelDetailsState}
          toolDetails={toolDetails}
          toolDetailsState={toolDetailsState}
        />
      );
      break;
    case "source-evidence":
      content = (
        <SourceEvidencePanel
          sourceEvidence={sourceEvidence}
          sourceEvidenceState={sourceEvidenceState}
        />
      );
      break;
    case "report-preview":
      content = (
        <ReportPreviewPanel
          decisions={decisions}
          reportPreview={reportPreview}
          reportPreviewState={reportPreviewState}
        />
      );
      break;
    case "decision-detail":
      content = <DecisionPanel decisions={decisions} decisionsState={decisionsState} />;
      break;
    case "memory-context":
      content = (
        <ContentCard
          description="MemoryContext 不在本 issue 范围内，当前保留结构化承载位。"
          title="Memory Context"
        />
      );
      break;
  }

  return (
    <SidePanel title={getPanelTitle(activeInspectorPanel)}>
      <Space aria-label="Analysis inspector" direction="vertical" size={16} style={{ width: "100%" }}>
        {content}
      </Space>
    </SidePanel>
  );
}
