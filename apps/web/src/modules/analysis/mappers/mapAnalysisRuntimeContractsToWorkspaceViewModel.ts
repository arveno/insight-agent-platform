import type {
  AnalysisRunContract,
  ConversationContract,
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
  AnalysisResultSummaryViewModel,
  AnalysisSessionViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";

export type AnalysisRuntimeContractsWorkspaceInput = {
  conversation: ConversationContract;
  currentRun: AnalysisRunContract;
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
        contextHint: "Conversation 是交互主线；后续真实实现由 POST /analysis-runs 接入运行链路。",
        helperText: "当前展示 contract-backed 静态输入区，不发送真实请求。",
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
        contextHint: "继续追问会复用当前 conversationId / runId 主线。",
        helperText: "当前展示 contract-backed 静态追问区，不触发真实 streaming。",
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

  const session: AnalysisSessionViewModel = {
    contextPack,
    conversationId: input.conversation.conversationId,
    currentRun,
    followUpComposer: createComposerViewModel(
      "follow_up",
      options?.followUpComposerDraft ?? "如果缩小时间窗口，这个结论是否仍然成立？"
    ),
    inputComposer: createComposerViewModel(
      "analysis",
      options?.inputComposerDraft ?? assistantMessage?.content ?? input.conversation.title
    ),
    messages,
    reportPreview: report
      ? {
          reportId: report.reportId,
          runId: report.runId,
          summary: report.summary,
          title: report.title
        }
      : undefined,
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
      runId: item.runId,
      sourceEvidenceId: item.sourceEvidenceId,
      sourceType: item.sourceType,
      summary: item.snippet,
      title: item.title
    })),
    toolDetails: input.toolCalls.map((toolCall) => ({
      runId: toolCall.runId,
      statusViewModel: mapRunEventStatusToViewModel(toolCall.status),
      summary:
        toolCall.output && Object.keys(toolCall.output).length > 0
          ? JSON.stringify(toolCall.output)
          : (toolCall.errorMessage ?? toolCall.permission),
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName
    }))
  };

  return {
    contextPanelNote:
      options?.contextPanelNote ??
      "当前 Analysis 使用 contracts-backed 静态数据源；真实业务接入时只替换 API 数据来源，不改 UI 结构主线。",
    modelOptions: options?.modelOptions ?? defaultModelOptions,
    sessions: [session]
  };
}
