import type {
  AnalysisRunContract,
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
  AnalysisContextPackViewModel,
  AnalysisDecisionViewModel,
  AnalysisModelDetailViewModel,
  AnalysisResultSummaryViewModel,
  AnalysisSurfaceState,
  AnalysisSessionViewModel,
  AnalysisMessageStreamViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";

export type AnalysisRuntimeContractsWorkspaceInput = {
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
  contextPack?: Partial<AnalysisContextPackViewModel>;
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

function createContextPack(
  conversation: ConversationContract,
  options?: AnalysisRuntimeContractsWorkspaceOptions
): AnalysisContextPackViewModel {
  const contextPack = options?.contextPack;
  const sourceObject = contextPack?.sourceObject ?? conversation.title;
  const sourceRoute = contextPack?.sourceRoute ?? "Analysis conversation";
  const timeRange = contextPack?.timeRange ?? "Current scope";
  const workspace = contextPack?.workspace ?? conversation.workspaceId;

  return {
    sourceObject,
    sourceRoute,
    stripText: contextPack?.stripText ?? `来自 ${sourceRoute} · ${sourceObject} · ${timeRange}`,
    systemText:
      contextPack?.systemText ??
      `当前会话挂载在 ${conversation.conversationId}，真实业务接入后由 Conversation / Message / AnalysisRun contracts 驱动。`,
    timeRange,
    workspace
  };
}

function createComposerViewModel(
  mode: "analysis" | "follow_up",
  draft: string
): AnalysisComposerViewModel {
  return mode === "analysis"
    ? {
        contextHint: "正式 submit 会创建或复用 Conversation，并形成新的 AnalysisTask / AnalysisRun。",
        helperText:
          "发送后进入 runtime conversation；assistant / report / decision 仍由后续 runtime delivery 链路产生。",
        initialDraft: draft,
        key: "analysis-input",
        placeholder: "描述要分析的问题、约束和期望结果。",
        submitLabel: "发起分析",
        suggestions: [
          { key: "analysis-suggestion-why", label: "请解释当前异常的主因。" },
          { key: "analysis-suggestion-split", label: "请拆分关键维度继续分析。" }
        ],
        title: "分析任务输入区"
      }
    : {
        contextHint: "继续追问会复用当前 Conversation，并创建新的 AnalysisTask / AnalysisRun。",
        helperText: "当前页面通过 canonical POST /analysis-tasks/submit 进入正式 write path。",
        initialDraft: draft,
        key: "follow-up-input",
        placeholder: "继续追问当前结论，例如要求拆分渠道、时间范围或证据。",
        submitLabel: "继续追问",
        suggestions: [
          { key: "follow-up-suggestion-split", label: "拆分关键维度继续追问" },
          { key: "follow-up-suggestion-next", label: "整理下一步动作" }
        ],
        title: "后续追问"
      };
}

function mapMessages(
  messages: MessageContract[],
  contextPack: AnalysisContextPackViewModel,
  sourceEvidence: SourceEvidence[],
  toolCalls: ToolCall[]
): AnalysisMessage[] {
  const evidenceTitleById = new Map(
    sourceEvidence.map((item) => [item.sourceEvidenceId, item.title] as const)
  );
  const toolNameById = new Map(toolCalls.map((item) => [item.toolCallId, item.toolName] as const));

  return messages.map((message) => ({
    content: message.content,
    completedAt: message.completedAt,
    conversationId: message.conversationId,
    createdAt: message.createdAt,
    footerText:
      message.role === "assistant" && message.runId ? "完整执行过程见右侧 Run Trace。" : undefined,
    messageId: message.messageId,
    metaText: message.role === "system" ? contextPack.stripText : undefined,
    reportId: message.reportId,
    role: message.role,
    runId: message.runId,
    sourceEvidenceIds: message.sourceEvidenceIds,
    status: message.status,
    supportingItems:
      message.role === "assistant"
        ? message.sourceEvidenceIds
            .map((sourceEvidenceId) => evidenceTitleById.get(sourceEvidenceId))
            .filter((item): item is string => Boolean(item))
        : message.role === "tool"
          ? message.toolCallIds
              .map((toolCallId) => toolNameById.get(toolCallId))
              .filter((item): item is string => Boolean(item))
          : undefined,
    supportingTitle:
      message.role === "assistant" ? "相关证据" : message.role === "tool" ? "相关工具" : undefined,
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
    updatedAtText: formatUpdatedAtText(lastEvent.occurredAt),
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

  const prioritizedKeys = ["conclusion", "summary", "result", "message"];

  for (const key of prioritizedKeys) {
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

function createResultSummary(
  reports: Report[],
  sourceEvidence: SourceEvidence[],
  assistantMessage: MessageContract | undefined
): AnalysisResultSummaryViewModel {
  const report = reports[0];

  return {
    actionSuggestions: report?.sections.map((section) => section.title).slice(0, 3) ?? [],
    conclusion: assistantMessage?.content ?? report?.summary ?? "当前尚无助手结论。",
    evidenceSummary:
      sourceEvidence.length > 0
        ? `引用 ${sourceEvidence.length} 条 SourceEvidence。`
        : "当前尚未绑定 SourceEvidence。",
    findingBullets: sourceEvidence.map((item) => item.snippet).slice(0, 3),
    key: `result-${report?.reportId ?? "pending"}`,
    statusViewModel: report
      ? { labelKey: "state.success.default.title", status: "success" }
      : { labelKey: "state.loading.default.title", status: "loading" },
    title: report?.title ?? "结果摘要"
  };
}

export function mapAnalysisRuntimeContractsToWorkspaceViewModel(
  input: AnalysisRuntimeContractsWorkspaceInput,
  options?: AnalysisRuntimeContractsWorkspaceOptions
): AnalysisWorkspaceViewModel {
  const contextPack = createContextPack(input.conversation, options);
  const messages = mapMessages(input.messages, contextPack, input.sourceEvidence, input.toolCalls);
  const runEvents = mapRunEvents(input.runEvents);
  const currentRun = mapCurrentRun(input.currentRun, input.modelCalls, input.runEvents);
  const assistantMessage = input.messages.find((message) => message.role === "assistant");
  const resultSummary = createResultSummary(input.reports, input.sourceEvidence, assistantMessage);
  const report = input.reports[0];
  const messageStream = mapMessageStream(input.messageStream);
  const modelDetails = mapModelDetails(input.modelCalls);
  const decisions = mapDecisions(input.decisions);

  const session: AnalysisSessionViewModel = {
    contextPack,
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
      options?.inputComposerDraft ?? assistantMessage?.content ?? input.conversation.title
    ),
    messages,
    messageStream,
    messageStreamState: resolveSurfaceState(
      options?.surfaceStates?.messageStream,
      input.messageStream.length
    ),
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
    resultSummary,
    runEvents,
    sessionSummary: {
      conversationId: input.conversation.conversationId,
      contextLabel: contextPack.sourceRoute,
      runLabel: `Run: ${input.currentRun.runId}`,
      statusViewModel: currentRun.statusViewModel,
      summary: resultSummary.conclusion,
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
      options?.contextPanelNote ??
      "当前 Analysis 工作区通过 contracts-backed runtime read surfaces 驱动，UI 只消费 mapper 后的 ViewModel。",
    modelOptions: options?.modelOptions ?? defaultModelOptions,
    sessions: [session]
  };
}
