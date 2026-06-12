import { Button, Descriptions, Divider, Space, Tag, Typography } from "antd";

import { useI18n } from "../../../shared/i18n/I18nProvider";
import { SidePanel } from "../../../shared/layout/panels/SidePanel";
import { ContentCard } from "../../../shared/ui/cards/ContentCard";
import { EventTimeline } from "../../../shared/ui/lists/EventTimeline";
import { EmptyState } from "../../../shared/ui/states/EmptyState";
import { RiskBadge } from "../../../shared/ui/status/RiskBadge";
import { StatusTag, type StatusTagProps } from "../../../shared/ui/status/StatusTag";
import { shellTypographyStyles } from "../../../shared/theme/typography";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type {
  AnalysisDecisionViewModel,
  AnalysisDraftContextViewModel,
  AnalysisInspectorRouteKey,
  AnalysisInspectorRouteNode,
  AnalysisMessageStreamViewModel,
  AnalysisModelDetailViewModel,
  AnalysisReportPreviewViewModel,
  AnalysisSourceEvidenceViewModel,
  AnalysisSurfaceState,
  AnalysisToolDetailViewModel
} from "../models/analysisViewModel";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";

export type AnalysisInspectorPanelProps = {
  activeInspectorRoute: AnalysisInspectorRouteNode;
  canGoBackInInspector: boolean;
  currentRun?: AnalysisRun;
  decisions: AnalysisDecisionViewModel[];
  decisionsState: AnalysisSurfaceState;
  draftContext?: AnalysisDraftContextViewModel;
  messageStream?: AnalysisMessageStreamViewModel;
  messageStreamState: AnalysisSurfaceState;
  modelDetails: AnalysisModelDetailViewModel[];
  modelDetailsState: AnalysisSurfaceState;
  onBackInspector: () => void;
  onNavigateInspectorRoute: (route: AnalysisInspectorRouteNode) => void;
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

type InspectorHomeCard = {
  buttonLabel: string;
  description: string;
  disabled?: boolean;
  eyebrow?: string;
  key: string;
  route: AnalysisInspectorRouteNode;
  status: StatusTagProps;
  title: string;
};

type InspectorHomeSection = {
  cards: InspectorHomeCard[];
  key: string;
  title: string;
};

function getRouteTitle(route: AnalysisInspectorRouteNode): string {
  switch (route.key) {
    case "home":
      return "Inspector Home";
    case "context-origin":
      return "Context Origin";
    case "source-ref":
      return "Source Ref";
    case "run-trace":
      return "Run Trace";
    case "run-event":
      return "Run Event";
    case "report-preview":
      return "Report Preview";
    case "decision":
      return "Decision";
    case "tool-call":
      return "Tool Call";
    case "model-call":
      return "Model Call";
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

function createHomeSections({
  currentRun,
  decisions,
  draftContext,
  modelDetails,
  reportPreview,
  runEvents,
  selectedRunEvent,
  sourceEvidence,
  toolDetails
}: Pick<
  AnalysisInspectorPanelProps,
  | "currentRun"
  | "decisions"
  | "draftContext"
  | "modelDetails"
  | "reportPreview"
  | "runEvents"
  | "selectedRunEvent"
  | "sourceEvidence"
  | "toolDetails"
>): InspectorHomeSection[] {
  const sections: InspectorHomeSection[] = [];

  if (draftContext || sourceEvidence.length > 0) {
    sections.push({
      cards: [
        {
          buttonLabel: "Open Context Origin",
          description: draftContext
            ? "当前存在一次性 draft context，可在 Inspector 内继续 drill-down。"
            : "当前没有一次性 draft context；该承载位保留给 #202-2 的内容适配。",
          disabled: !draftContext,
          eyebrow: draftContext
            ? `${draftContext.sourceType} · ${draftContext.sourceTitle}`
            : "No draft context",
          key: "context-origin",
          route: { key: "context-origin" },
          status: draftContext
            ? { label: "Ready", tone: "success" }
            : { label: "Disabled", tone: "default" },
          title: "Context Origin"
        },
        {
          buttonLabel: "Open Source Ref",
          description:
            sourceEvidence.length > 0
              ? `当前 run 已绑定 ${sourceEvidence.length} 条来源证据；完整内容适配留给 #202-2。`
              : "当前没有可用 supporting refs；本切片不伪造来源对象。",
          disabled: sourceEvidence.length === 0,
          eyebrow:
            sourceEvidence.length > 0
              ? `${sourceEvidence.length} refs available`
              : "No supporting refs",
          key: "source-ref",
          route: { key: "source-ref" },
          status:
            sourceEvidence.length > 0
              ? { label: "Ready", tone: "success" }
              : { label: "Disabled", tone: "default" },
          title: "Source Ref"
        }
      ],
      key: "origin",
      title: "Origin"
    });
  }

  if (currentRun || selectedRunEvent || runEvents.length > 0) {
    sections.push({
      cards: [
        {
          buttonLabel: "Open Run Trace",
          description: currentRun?.stageSummary ?? "当前没有 run trace 可展示。",
          disabled: !currentRun,
          eyebrow: currentRun ? `runId: ${currentRun.runId}` : "No current run",
          key: "run-trace",
          route: { key: "run-trace" },
          status: currentRun
            ? { label: "Ready", tone: "success" }
            : { label: "Disabled", tone: "default" },
          title: "Run Trace"
        },
        {
          buttonLabel: "Open Run Event",
          description:
            selectedRunEvent?.summary ??
            (runEvents.length > 0
              ? "选择一个事件后可在 Inspector 内查看详情。"
              : "当前没有可用 run event。"),
          disabled: !selectedRunEvent,
          eyebrow: selectedRunEvent ? selectedRunEvent.title : "No selected event",
          key: "run-event",
          route: selectedRunEvent
            ? { eventId: selectedRunEvent.eventId, key: "run-event" }
            : { key: "run-trace" },
          status: selectedRunEvent
            ? { label: "Ready", tone: "success" }
            : { label: "Disabled", tone: "default" },
          title: "Run Event"
        }
      ],
      key: "trace",
      title: "Trace"
    });
  }

  if (reportPreview || decisions.length > 0) {
    sections.push({
      cards: [
        {
          buttonLabel: "Open Report Preview",
          description: reportPreview?.summary ?? "当前没有 report preview。",
          disabled: !reportPreview,
          eyebrow: reportPreview ? reportPreview.title : "No report preview",
          key: "report-preview",
          route: { key: "report-preview" },
          status: reportPreview
            ? { label: "Ready", tone: "success" }
            : { label: "Disabled", tone: "default" },
          title: "Report Preview"
        },
        {
          buttonLabel: "Open Decision",
          description:
            decisions[0]?.title ?? "当前没有 decision；该承载位保持真实空态。",
          disabled: decisions.length === 0,
          eyebrow:
            decisions.length > 0 ? `${decisions.length} decision items` : "No decision",
          key: "decision",
          route: { key: "decision" },
          status:
            decisions.length > 0
              ? { label: "Ready", tone: "success" }
              : { label: "Disabled", tone: "default" },
          title: "Decision"
        }
      ],
      key: "delivery",
      title: "Delivery"
    });
  }

  if (toolDetails.length > 0 || modelDetails.length > 0) {
    sections.push({
      cards: [
        {
          buttonLabel: "Open Tool Call",
          description:
            toolDetails[0]?.summary ?? "当前没有 tool call；该承载位保持真实空态。",
          disabled: toolDetails.length === 0,
          eyebrow:
            toolDetails.length > 0 ? `${toolDetails.length} tool calls` : "No tool calls",
          key: "tool-call",
          route: { key: "tool-call" },
          status:
            toolDetails.length > 0
              ? { label: "Ready", tone: "success" }
              : { label: "Disabled", tone: "default" },
          title: "Tool Call"
        },
        {
          buttonLabel: "Open Model Call",
          description:
            modelDetails[0]
              ? `${modelDetails[0].provider} · ${modelDetails[0].latencyText}`
              : "当前没有 model call；该承载位保持真实空态。",
          disabled: modelDetails.length === 0,
          eyebrow:
            modelDetails.length > 0 ? `${modelDetails.length} model calls` : "No model calls",
          key: "model-call",
          route: { key: "model-call" },
          status:
            modelDetails.length > 0
              ? { label: "Ready", tone: "success" }
              : { label: "Disabled", tone: "default" },
          title: "Model Call"
        }
      ],
      key: "execution",
      title: "Execution"
    });
  }

  return sections;
}

function InspectorHomePanel({
  currentRun,
  decisions,
  draftContext,
  modelDetails,
  onNavigateInspectorRoute,
  reportPreview,
  runEvents,
  selectedRunEvent,
  sourceEvidence,
  toolDetails
}: Pick<
  AnalysisInspectorPanelProps,
  | "currentRun"
  | "decisions"
  | "draftContext"
  | "modelDetails"
  | "onNavigateInspectorRoute"
  | "reportPreview"
  | "runEvents"
  | "selectedRunEvent"
  | "sourceEvidence"
  | "toolDetails"
>) {
  const sections = createHomeSections({
    currentRun,
    decisions,
    draftContext,
    modelDetails,
    reportPreview,
    runEvents,
    selectedRunEvent,
    sourceEvidence,
    toolDetails
  });

  if (sections.length === 0) {
    return (
      <EmptyState
        description="当前没有上下文或 run。发送前可直接输入问题，或从带上下文入口进入。"
        title="Inspector Home"
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {sections.map((section) => (
        <Space direction="vertical" key={section.key} size={12} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>{section.title}</Typography.Text>
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            {section.cards.map((card) => (
              <ContentCard
                description={card.description}
                eyebrow={card.eyebrow}
                footerActions={
                  <Button
                    aria-label={card.buttonLabel}
                    disabled={card.disabled}
                    onClick={() => onNavigateInspectorRoute(card.route)}
                    type="default"
                  >
                    {card.buttonLabel.replace("Open ", "")}
                  </Button>
                }
                key={card.key}
                tagSlot={<StatusTag {...card.status} />}
                title={card.title}
              />
            ))}
          </Space>
        </Space>
      ))}
    </Space>
  );
}

function ContextOriginPanel({
  draftContext,
  onNavigateInspectorRoute,
  sourceEvidence
}: Pick<
  AnalysisInspectorPanelProps,
  "draftContext" | "onNavigateInspectorRoute" | "sourceEvidence"
>) {
  if (!draftContext) {
    return (
      <ContentCard
        description="本切片只建立 layered navigation foundation；Context Origin 的完整内容适配留给 #202-2。"
        title="Context Origin"
      />
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentCard
        description="当前先建立 Inspector 内部层级导航；summary / chips / supporting refs 的正式内容拟合由 #202-2 承接。"
        eyebrow={`${draftContext.sourceType} · ${draftContext.sourceId}`}
        tagSlot={<StatusTag label="Draft" tone="processing" />}
        title={draftContext.sourceTitle}
      >
        <Space size={[8, 8]} wrap>
          {draftContext.chips.map((chip) => (
            <Tag key={chip}>{chip}</Tag>
          ))}
        </Space>
      </ContentCard>

      <ContentCard
        description={
          sourceEvidence.length > 0
            ? `当前 run surfaces 可见 ${sourceEvidence.length} 条来源证据；完整 SourceRef 内容不在本切片实现。`
            : "当前没有 supporting refs；本切片不伪造来源对象。"
        }
        footerActions={
          <Button
            aria-label="Open Source Ref"
            disabled={sourceEvidence.length === 0}
            onClick={() => onNavigateInspectorRoute({ key: "source-ref" })}
            type="default"
          >
            Source Ref
          </Button>
        }
        title="Source Ref"
      />
    </Space>
  );
}

function SourceRefPanel({
  draftContext,
  sourceEvidence,
  sourceEvidenceState
}: Pick<
  AnalysisInspectorPanelProps,
  "draftContext" | "sourceEvidence" | "sourceEvidenceState"
>) {
  if (!draftContext && sourceEvidence.length === 0) {
    return renderSurfaceState(sourceEvidenceState, "Source Ref");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentCard
        description="本切片只建立 SourceRef 的 Inspector 路由承载位；canonical refs 内容适配与 stable href 策略留给 #202-2。"
        eyebrow={draftContext ? `${draftContext.sourceType} · draft` : "runtime placeholder"}
        title="Source Ref Foundation"
      />
      {sourceEvidence.length > 0 ? (
        sourceEvidence.map((evidence) => (
          <ContentCard
            description="当前只展示真实存在的来源条目，不提供 deep link 或 fake ref。"
            eyebrow={`${evidence.sourceType} · ${evidence.confidenceText}`}
            key={evidence.sourceEvidenceId}
            tagSlot={<StatusTag label="Placeholder" tone="warning" />}
            title={evidence.title}
          />
        ))
      ) : (
        <ContentCard
          description="当前没有 supporting refs；UI 不会为了完整性伪造来源对象。"
          title="No Source Ref"
        />
      )}
    </Space>
  );
}

function RunTracePanel({
  currentRun,
  onSelectRunEvent,
  runEvents,
  selectedRunEventId,
  workspaceName
}: Pick<
  AnalysisInspectorPanelProps,
  "currentRun" | "onSelectRunEvent" | "runEvents" | "selectedRunEventId" | "workspaceName"
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
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
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
    </Space>
  );
}

function RunEventPanel({ selectedRunEvent }: Pick<AnalysisInspectorPanelProps, "selectedRunEvent">) {
  const { t } = useI18n();

  if (!selectedRunEvent) {
    return <EmptyState description="当前没有已选中的 run event。" title="Run Event" />;
  }

  const resourceItems = [
    selectedRunEvent.toolName
      ? {
          key: "tool-name",
          label: "Tool",
          children: <Typography.Text code>{selectedRunEvent.toolName}</Typography.Text>
        }
      : null,
    selectedRunEvent.modelName
      ? {
          key: "model-name",
          label: "Model",
          children: <Typography.Text code>{selectedRunEvent.modelName}</Typography.Text>
        }
      : null,
    selectedRunEvent.tokenUsageText
      ? {
          key: "token-usage",
          label: "Tokens",
          children: selectedRunEvent.tokenUsageText
        }
      : null,
    selectedRunEvent.costText
      ? {
          key: "cost",
          label: "Cost",
          children: selectedRunEvent.costText
        }
      : null
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentCard
        description={selectedRunEvent.summary}
        eyebrow={selectedRunEvent.eventType}
        tagSlot={
          <Space wrap>
            <StatusTag {...toStatusTag(t, selectedRunEvent.statusViewModel)!} />
            {selectedRunEvent.riskViewModel ? (
              <RiskBadge {...toRiskBadge(t, selectedRunEvent.riskViewModel)!} />
            ) : null}
          </Space>
        }
        title={selectedRunEvent.title}
      />

      <Descriptions
        column={1}
        items={[
          {
            key: "timestamp",
            label: "Timestamp",
            children: selectedRunEvent.timestampText ?? "N/A"
          },
          {
            key: "duration",
            label: "Duration",
            children: selectedRunEvent.durationText ?? "N/A"
          }
        ]}
        size="small"
      />

      <Divider style={{ marginBlock: 0 }} />

      <ContentCard description={selectedRunEvent.detail} title="Event Detail" />

      {selectedRunEvent.inputSummary ? (
        <ContentCard description={selectedRunEvent.inputSummary} title="Input Summary" />
      ) : null}

      {selectedRunEvent.outputSummary ? (
        <ContentCard description={selectedRunEvent.outputSummary} title="Output Summary" />
      ) : null}

      {resourceItems.length > 0 ? <Descriptions column={1} items={resourceItems} size="small" /> : null}
    </Space>
  );
}

function ToolCallPanel({
  toolDetails,
  toolDetailsState
}: Pick<AnalysisInspectorPanelProps, "toolDetails" | "toolDetailsState">) {
  const { t } = useI18n();

  if (toolDetails.length === 0) {
    return renderSurfaceState(toolDetailsState, "Tool Call");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {toolDetails.map((toolDetail) => (
        <ContentCard
          description={toolDetail.summary}
          eyebrow={`runId: ${toolDetail.runId}`}
          key={toolDetail.toolCallId}
          tagSlot={<StatusTag {...toStatusTag(t, toolDetail.statusViewModel)!} />}
          title={toolDetail.toolName}
        />
      ))}
    </Space>
  );
}

function ModelCallPanel({
  modelDetails,
  modelDetailsState
}: Pick<AnalysisInspectorPanelProps, "modelDetails" | "modelDetailsState">) {
  const { t } = useI18n();

  if (modelDetails.length === 0) {
    return renderSurfaceState(modelDetailsState, "Model Call");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {modelDetails.map((modelDetail) => (
        <ContentCard
          description={`${modelDetail.provider} · ${modelDetail.latencyText} · ${modelDetail.costText}`}
          eyebrow={`runId: ${modelDetail.runId}`}
          key={modelDetail.modelCallId}
          tagSlot={<StatusTag {...toStatusTag(t, modelDetail.statusViewModel)!} />}
          title={modelDetail.modelId}
        >
          <Typography.Text type="secondary">
            Tokens: {modelDetail.tokenUsageText}
          </Typography.Text>
        </ContentCard>
      ))}
    </Space>
  );
}

function ReportPreviewPanel({
  decisions,
  onNavigateInspectorRoute,
  reportPreview,
  reportPreviewState
}: Pick<
  AnalysisInspectorPanelProps,
  "decisions" | "onNavigateInspectorRoute" | "reportPreview" | "reportPreviewState"
>) {
  if (!reportPreview) {
    return renderSurfaceState(reportPreviewState, "Report Preview");
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ContentCard
        description={reportPreview.summary}
        eyebrow={`runId: ${reportPreview.runId}`}
        footerActions={
          decisions.length > 0 ? (
            <Button onClick={() => onNavigateInspectorRoute({ key: "decision" })} type="default">
              Open Decision
            </Button>
          ) : null
        }
        title="Report Preview"
      >
        <Space direction="vertical" size={6} style={{ width: "100%" }}>
          <Typography.Text style={shellTypographyStyles.cardTitle}>
            {reportPreview.title}
          </Typography.Text>
          {reportPreview.sections.map((section) => (
            <div key={section.key}>
              <Typography.Text style={shellTypographyStyles.meta}>{section.title}</Typography.Text>
              <Typography.Paragraph style={{ marginBottom: 0 }}>
                {section.content}
              </Typography.Paragraph>
            </div>
          ))}
        </Space>
      </ContentCard>
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

function routeDescription(routeKey: AnalysisInspectorRouteKey): string | undefined {
  switch (routeKey) {
    case "home":
      return "Layered navigation stays inside the Analysis Inspector and does not replace the current Analysis page.";
    case "context-origin":
      return "Context Origin content fit is intentionally bounded; this slice establishes the internal Inspector route only.";
    case "source-ref":
      return "SourceRef deep content and stable href behavior remain bounded to #202-2.";
    case "run-trace":
      return "Run trace events drill down inside the Inspector stack instead of using browser back.";
    case "run-event":
      return "Run event detail is rendered inside the Inspector stack.";
    case "report-preview":
      return "Report preview remains inside the Inspector; opening a full source page is out of scope for this slice.";
    case "decision":
      return "Decision detail remains inside the Inspector stack.";
    case "tool-call":
      return "Tool call detail remains inside the Inspector stack.";
    case "model-call":
      return "Model call detail remains inside the Inspector stack.";
  }
}

export function AnalysisInspectorPanel({
  activeInspectorRoute,
  canGoBackInInspector,
  currentRun,
  decisions,
  decisionsState,
  draftContext,
  messageStream,
  messageStreamState,
  modelDetails,
  modelDetailsState,
  onBackInspector,
  onNavigateInspectorRoute,
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

  let content;

  switch (activeInspectorRoute.key) {
    case "home":
      content = (
        <InspectorHomePanel
          currentRun={currentRun}
          decisions={decisions}
          draftContext={draftContext}
          modelDetails={modelDetails}
          onNavigateInspectorRoute={onNavigateInspectorRoute}
          reportPreview={reportPreview}
          runEvents={runEvents}
          selectedRunEvent={selectedRunEvent}
          sourceEvidence={sourceEvidence}
          toolDetails={toolDetails}
        />
      );
      break;
    case "context-origin":
      content = (
        <ContextOriginPanel
          draftContext={draftContext}
          onNavigateInspectorRoute={onNavigateInspectorRoute}
          sourceEvidence={sourceEvidence}
        />
      );
      break;
    case "source-ref":
      content = (
        <SourceRefPanel
          draftContext={draftContext}
          sourceEvidence={sourceEvidence}
          sourceEvidenceState={sourceEvidenceState}
        />
      );
      break;
    case "run-trace":
      content = (
        <RunTracePanel
          currentRun={currentRun}
          onSelectRunEvent={onSelectRunEvent}
          runEvents={runEvents}
          selectedRunEventId={selectedRunEventId}
          workspaceName={workspaceName}
        />
      );
      break;
    case "run-event":
      content = <RunEventPanel selectedRunEvent={selectedRunEvent} />;
      break;
    case "report-preview":
      content = (
        <ReportPreviewPanel
          decisions={decisions}
          onNavigateInspectorRoute={onNavigateInspectorRoute}
          reportPreview={reportPreview}
          reportPreviewState={reportPreviewState}
        />
      );
      break;
    case "decision":
      content = <DecisionPanel decisions={decisions} decisionsState={decisionsState} />;
      break;
    case "tool-call":
      content = (
        <ToolCallPanel toolDetails={toolDetails} toolDetailsState={toolDetailsState} />
      );
      break;
    case "model-call":
      content = (
        <ModelCallPanel modelDetails={modelDetails} modelDetailsState={modelDetailsState} />
      );
      break;
  }

  const actions = (
    <Space>
      {activeInspectorRoute.key !== "home" ? (
        <Button onClick={() => onNavigateInspectorRoute({ key: "home" })} type="text">
          Home
        </Button>
      ) : null}
      {canGoBackInInspector ? (
        <Button onClick={onBackInspector} type="text">
          Back
        </Button>
      ) : null}
    </Space>
  );

  return (
    <SidePanel
      actions={actions}
      description={routeDescription(activeInspectorRoute.key)}
      title={getRouteTitle(activeInspectorRoute)}
    >
      <Space aria-label="Analysis inspector" direction="vertical" size={16} style={{ width: "100%" }}>
        {content}
      </Space>
    </SidePanel>
  );
}
