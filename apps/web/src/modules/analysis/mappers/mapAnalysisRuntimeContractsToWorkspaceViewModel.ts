import type {
  AnalysisRunContract,
  AnalysisTask,
  ConversationContract,
  Decision,
  MessageContract,
  MessageStreamContract,
  ModelCall,
  Report,
  RunEventContract,
  SourceEvidence,
  ToolCall
} from "../models/runtimeContractTypes";
import type { SharedStatusViewModel } from "../../../shared/utils/viewModelState";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun, AnalysisRunEvent } from "../models/analysisRun";
import type {
  AnalysisComposerViewModel,
  AnalysisDecisionViewModel,
  AnalysisMessageStreamViewModel,
  AnalysisModelDetailViewModel,
  AnalysisSessionViewModel,
  AnalysisSurfaceState,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";

export type AnalysisRuntimeContractsWorkspaceInput = {
  analysisTask: AnalysisTask;
  conversation: ConversationContract;
  currentRun: AnalysisRunContract;
  decisions: Decision[];
  messageStream: MessageStreamContract[];
  messages: MessageContract[];
  modelCalls: ModelCall[];
  reports: Report[];
  runEvents: RunEventContract[];
  sourceEvidence: SourceEvidence[];
  toolCalls: ToolCall[];
};

export type AnalysisRuntimeContractsWorkspaceOptions = {
  contextPanelNote?: string;
  followUpComposerDraft?: string;
  inputComposerDraft?: string;
  modelOptions?: readonly { key: string; label: string }[];
  surfaceStates?: Partial<{
    decisions: AnalysisSurfaceState;
    messageStream: AnalysisSurfaceState;
    modelDetails: AnalysisSurfaceState;
    reportPreview: AnalysisSurfaceState;
    sourceEvidence: AnalysisSurfaceState;
    toolDetails: AnalysisSurfaceState;
  }>;
};

const defaultModelOptions = [
  { key: "default", label: "Default" },
  { key: "reasoning", label: "Reasoning" },
  { key: "fast", label: "Fast" }
] as const;

function formatTimestamp(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "Pending";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Shanghai"
  });
}

function formatUpdatedAtText(timestamp: string | null | undefined): string {
  return `更新于 ${formatTimestamp(timestamp)}`;
}

function formatDuration(
  startedAt: string | null | undefined,
  completedAt: string | null | undefined
): string {
  if (!startedAt || !completedAt) {
    return "Pending";
  }

  const start = new Date(startedAt);
  const end = new Date(completedAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Pending";
  }

  return `${((end.getTime() - start.getTime()) / 1000).toFixed(1)}s`;
}

function sumCost(modelCalls: ModelCall[]): string {
  const totalCost = modelCalls.reduce((sum, modelCall) => sum + modelCall.cost, 0);

  return `¥${totalCost.toFixed(2)}`;
}

function sumTokens(modelCalls: ModelCall[]): string {
  const totalTokens = modelCalls.reduce(
    (sum, modelCall) => sum + modelCall.inputTokens + modelCall.outputTokens,
    0
  );

  return totalTokens.toLocaleString("en-US");
}

function resolveSurfaceState(
  override: AnalysisSurfaceState | undefined,
  itemCount: number
): AnalysisSurfaceState {
  if (override) {
    return override;
  }

  return itemCount > 0 ? "ready" : "empty";
}

function mapRunStatusToViewModel(status: AnalysisRunContract["status"]): SharedStatusViewModel {
  switch (status) {
    case "completed":
      return { labelKey: "state.success.default.title", status: "success" };
    case "running":
    case "queued":
    case "validating":
    case "cancelling":
      return { labelKey: "state.loading.default.title", status: "loading" };
    case "waiting":
    case "expired":
      return { labelKey: "state.warning.default.title", status: "warning" };
    case "failed":
    case "rejected":
    case "cancelled":
      return { labelKey: "state.risk.default.title", status: "risk" };
    case "created":
      return { labelKey: "state.ready.default.title", status: "ready" };
  }
}

function mapDecisionStatusToViewModel(status: Decision["status"]): SharedStatusViewModel {
  switch (status) {
    case "completed":
    case "accepted":
      return { labelKey: "state.success.default.title", status: "success" };
    case "in_progress":
      return { labelKey: "state.loading.default.title", status: "loading" };
    case "proposed":
      return { labelKey: "state.ready.default.title", status: "ready" };
    case "rejected":
      return { labelKey: "state.risk.default.title", status: "risk" };
  }
}

function mapRunEventStatusToViewModel(status: RunEventContract["status"]): SharedStatusViewModel {
  switch (status) {
    case "succeeded":
      return { labelKey: "state.success.default.title", status: "success" };
    case "running":
    case "pending":
      return { labelKey: "state.loading.default.title", status: "loading" };
    case "skipped":
      return { labelKey: "state.warning.default.title", status: "warning" };
    case "failed":
    case "cancelled":
      return { labelKey: "state.risk.default.title", status: "risk" };
  }
}

function createComposerViewModel(
  mode: "analysis" | "follow_up",
  draft: string
): AnalysisComposerViewModel {
  return mode === "analysis"
    ? {
        contextHint: "",
        helperText: "",
        initialDraft: draft,
        key: "analysis-input",
        placeholder: "输入你想分析的问题",
        submitLabel: "发送",
        suggestions: [
          { key: "analysis-suggestion-why", label: "请解释当前异常的主因。" },
          { key: "analysis-suggestion-split", label: "请拆分关键维度继续分析。" }
        ],
        title: "输入你想分析的问题"
      }
    : {
        contextHint: "",
        helperText: "",
        initialDraft: draft,
        key: "follow-up-input",
        placeholder: "输入你想分析的问题",
        submitLabel: "发送",
        suggestions: [
          { key: "follow-up-suggestion-split", label: "拆分关键维度继续追问" },
          { key: "follow-up-suggestion-next", label: "整理下一步动作" }
        ],
        title: "输入你想分析的问题"
      };
}

function mapMessages(messages: MessageContract[]): AnalysisMessage[] {
  return messages.map((message) => ({
    analysisTaskId: message.analysisTaskId,
    content: message.content,
    completedAt: message.completedAt,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
    footerText:
      message.role === "assistant" && message.runId
        ? "点击消息查看本次运行。"
        : message.role === "user" && message.analysisTaskId
          ? "点击消息查看本次请求上下文。"
          : undefined,
    messageId: message.messageId,
    metaText:
      message.role === "system"
        ? "系统消息"
        : undefined,
    reportId: message.reportId,
    role: message.role,
    runId: message.runId,
    sourceEvidenceIds: message.sourceEvidenceIds,
    status: message.status,
    toolCallIds: message.toolCallIds,
    turnId: message.turnId
  }));
}

function mapMessageStream(
  messageStream: MessageStreamContract[]
): AnalysisMessageStreamViewModel | undefined {
  if (messageStream.length === 0) {
    return undefined;
  }

  const orderedStream = messageStream.slice().sort((left, right) => left.sequence - right.sequence);
  const lastEvent = orderedStream.at(-1)!;

  return {
    eventCount: orderedStream.length,
    messageId: lastEvent.messageId,
    replayText: orderedStream.map((event) => event.delta).join(""),
    runId: lastEvent.runId,
    status: lastEvent.status,
    updatedAtText: formatUpdatedAtText(lastEvent.occurredAt)
  };
}

function mapRunEvents(runEvents: RunEventContract[]): AnalysisRunEvent[] {
  return runEvents
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .map((event) => ({
      costText: undefined,
      detail: event.summary,
      durationText: formatDuration(event.startedAt, event.completedAt),
      errorType: event.errorCode ?? undefined,
      eventId: event.eventId,
      eventType: event.eventType,
      evidenceRefs: event.refType === "SourceEvidence" && event.refId ? [event.refId] : undefined,
      inputSummary: event.nodeName,
      modelName: event.agentName,
      outputSummary: event.errorMessage ?? undefined,
      runId: event.runId,
      status: event.status,
      statusViewModel: mapRunEventStatusToViewModel(event.status),
      summary: event.summary,
      timestampText: formatTimestamp(event.occurredAt),
      title: `${event.sequence + 1}. ${event.eventType}`,
      tokenUsageText: undefined,
      toolName: event.toolName ?? undefined
    }));
}

function mapCurrentRun(
  currentRun: AnalysisRunContract,
  modelCalls: ModelCall[],
  runEvents: RunEventContract[]
): AnalysisRun {
  const lastRunEvent = runEvents
    .slice()
    .sort((left, right) => left.sequence - right.sequence)
    .at(-1);

  return {
    costText: sumCost(modelCalls),
    errorSummaryText: currentRun.failureCode
      ? `${currentRun.failureCode}${currentRun.terminalReason ? ` · ${currentRun.terminalReason}` : ""}`
      : (currentRun.terminalReason ?? "0 blocking issues"),
    phase: currentRun.phase,
    runId: currentRun.runId,
    stageSummary:
      lastRunEvent?.summary ?? `当前运行停留在 ${currentRun.phase} / ${currentRun.status}。`,
    status: currentRun.status,
    statusViewModel: mapRunStatusToViewModel(currentRun.status),
    tokenUsageText: sumTokens(modelCalls),
    totalDurationText: formatDuration(currentRun.startedAt, currentRun.completedAt),
    updatedAtText: formatUpdatedAtText(
      currentRun.completedAt ??
        currentRun.failedAt ??
        currentRun.cancelledAt ??
        currentRun.waitingSince ??
        currentRun.startedAt ??
        currentRun.createdAt
    )
  };
}

function summarizeToolOutput(toolCall: ToolCall): string {
  if (toolCall.errorMessage) {
    return toolCall.errorMessage;
  }

  if (!toolCall.output || Object.keys(toolCall.output).length === 0) {
    return `权限 ${toolCall.permission}，无结构化输出摘要。`;
  }

  for (const key of ["conclusion", "summary", "result", "message"]) {
    const value = toolCall.output[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return `输出字段：${Object.keys(toolCall.output).join(", ")}`;
}

function mapModelDetails(modelCalls: ModelCall[]): AnalysisModelDetailViewModel[] {
  return modelCalls.map((modelCall) => ({
    costText: `¥${modelCall.cost.toFixed(2)}`,
    latencyText: `${modelCall.latencyMs} ms`,
    modelCallId: modelCall.modelCallId,
    modelId: modelCall.modelId,
    provider: modelCall.provider,
    runId: modelCall.runId,
    statusViewModel: mapRunEventStatusToViewModel(modelCall.status),
    tokenUsageText: (modelCall.inputTokens + modelCall.outputTokens).toLocaleString("en-US")
  }));
}

function mapDecisions(decisions: Decision[]): AnalysisDecisionViewModel[] {
  return decisions.map((decision) => ({
    createdAtText: formatUpdatedAtText(decision.createdAt),
    decisionId: decision.decisionId,
    reportId: decision.reportId,
    runId: decision.runId,
    status: decision.status,
    statusViewModel: mapDecisionStatusToViewModel(decision.status),
    title: decision.title
  }));
}

export function mapAnalysisRuntimeContractsToWorkspaceViewModel(
  input: AnalysisRuntimeContractsWorkspaceInput,
  options?: AnalysisRuntimeContractsWorkspaceOptions
): AnalysisWorkspaceViewModel {
  const messages = mapMessages(input.messages);
  const runEvents = mapRunEvents(input.runEvents);
  const currentRun = mapCurrentRun(input.currentRun, input.modelCalls, input.runEvents);
  const assistantMessage = input.messages.find((message) => message.role === "assistant");
  const report = input.reports[0];
  const messageStream = mapMessageStream(input.messageStream);
  const modelDetails = mapModelDetails(input.modelCalls);
  const decisions = mapDecisions(input.decisions);

  const session: AnalysisSessionViewModel = {
    analysisTaskContextPack: input.analysisTask.contextPack,
    analysisTaskId: input.analysisTask.analysisTaskId,
    conversationId: input.conversation.conversationId,
    currentRun,
    decisions,
    decisionsState: resolveSurfaceState(options?.surfaceStates?.decisions, decisions.length),
    followUpComposer: createComposerViewModel(
      "follow_up",
      options?.followUpComposerDraft ?? ""
    ),
    inputComposer: createComposerViewModel(
      "analysis",
      options?.inputComposerDraft ??
        input.analysisTask.contextPack?.suggestedPrompt ??
        assistantMessage?.content ??
        input.analysisTask.question
    ),
    messageStream,
    messageStreamState: resolveSurfaceState(
      options?.surfaceStates?.messageStream,
      input.messageStream.length
    ),
    messages,
    modelDetails,
    modelDetailsState: resolveSurfaceState(options?.surfaceStates?.modelDetails, modelDetails.length),
    reportPreview: report
      ? {
          reportId: report.reportId,
          runId: report.runId,
          sections: report.sections.map((section) => ({
            content: section.content,
            key: section.reportSectionId,
            title: section.title
          })),
          sourceEvidenceIds: report.sourceEvidence ?? [],
          summary: report.summary,
          title: report.title
        }
      : undefined,
    reportPreviewState: resolveSurfaceState(options?.surfaceStates?.reportPreview, report ? 1 : 0),
    runEvents,
    sessionSummary: {
      conversationId: input.conversation.conversationId,
      contextLabel: input.analysisTask.contextPack?.root.title ?? "空白上下文",
      runLabel: `Run: ${input.currentRun.runId}`,
      statusViewModel: currentRun.statusViewModel,
      summary: assistantMessage?.content ?? input.analysisTask.question,
      title: input.conversation.title,
      updatedAtText: formatUpdatedAtText(input.conversation.updatedAt)
    },
    sourceEvidence: input.sourceEvidence.map((item) => ({
      confidenceText: `${Math.round(item.confidence * 100)}%`,
      runId: item.runId,
      sourceEvidenceId: item.sourceEvidenceId,
      sourceType: item.sourceType,
      summary: item.snippet,
      title: item.title
    })),
    sourceEvidenceState: resolveSurfaceState(
      options?.surfaceStates?.sourceEvidence,
      input.sourceEvidence.length
    ),
    toolDetails: input.toolCalls.map((toolCall) => ({
      runId: toolCall.runId,
      statusViewModel: mapRunEventStatusToViewModel(toolCall.status),
      summary: summarizeToolOutput(toolCall),
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName
    })),
    toolDetailsState: resolveSurfaceState(options?.surfaceStates?.toolDetails, input.toolCalls.length)
  };

  return {
    contextPanelNote:
      options?.contextPanelNote ?? "点击消息后，右侧会显示对应的分析详情与上下文。",
    modelOptions: options?.modelOptions ?? defaultModelOptions,
    sessions: [session]
  };
}
