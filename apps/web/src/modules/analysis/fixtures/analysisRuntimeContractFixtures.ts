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
import type { AnalysisRuntimeContractsWorkspaceInput } from "../mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel";

export type AnalysisRuntimeContractSessionFixture = {
  drafts: {
    followUp: string;
    input: string;
  };
  input: AnalysisRuntimeContractsWorkspaceInput;
  presentation: {
    sourceObject: string;
    sourceRoute: string;
    timeRange: string;
    workspaceName: string;
  };
};

function createConversation({
  conversationId,
  currentRunId,
  title,
  updatedAt,
  userId,
  workspaceId
}: {
  conversationId: string;
  currentRunId: string;
  title: string;
  updatedAt: string;
  userId: string;
  workspaceId: string;
}): ConversationContract {
  return {
    conversationId,
    createdAt: "2026-06-05T11:08:00+08:00",
    currentRunId,
    status: "active",
    title,
    updatedAt,
    userId,
    workspaceId
  };
}

function createRun({
  analysisTaskId,
  completedAt,
  createdAt,
  phase,
  runId,
  startedAt,
  status,
  userId,
  workspaceId
}: {
  analysisTaskId: string;
  completedAt: string | null;
  createdAt: string;
  phase: AnalysisRunContract["phase"];
  runId: string;
  startedAt: string | null;
  status: AnalysisRunContract["status"];
  userId: string;
  workspaceId: string;
}): AnalysisRunContract {
  return {
    analysisTaskId,
    cancelRequestedAt: null,
    cancelledAt: null,
    cancellingAt: null,
    completedAt,
    createdAt,
    expiredAt: null,
    failedAt: null,
    failureCode: null,
    originalRunId: null,
    outcome: status === "completed" ? "success" : null,
    phase,
    queuedAt: status === "created" ? null : createdAt,
    rejectedAt: null,
    retryOfRunId: null,
    retryable: true,
    runId,
    startedAt,
    status,
    terminalReason: null,
    timeoutAt: null,
    userId,
    validatingAt: status === "created" ? null : createdAt,
    waitingFor: null,
    waitingSince: null,
    workspaceId
  };
}

function createMessage({
  analysisTaskId,
  content,
  conversationId,
  createdAt,
  messageId,
  reportId,
  role,
  runId,
  sourceEvidenceIds,
  status,
  toolCallIds,
  turnId
}: {
  analysisTaskId: string | null;
  content: string;
  conversationId: string;
  createdAt: string;
  messageId: string;
  reportId: string | null;
  role: MessageContract["role"];
  runId: string | null;
  sourceEvidenceIds: string[];
  status: MessageContract["status"];
  toolCallIds: string[];
  turnId: string;
}): MessageContract {
  return {
    analysisTaskId,
    completedAt: status === "streaming" ? null : createdAt,
    content,
    conversationId,
    createdAt,
    messageId,
    reportId,
    role,
    runId,
    sourceEvidenceIds,
    status,
    toolCallIds,
    turnId
  };
}

function createRunEvent({
  eventId,
  eventType,
  phase,
  runId,
  sequence,
  status,
  summary,
  toolName
}: {
  eventId: string;
  eventType: RunEventContract["eventType"];
  phase: RunEventContract["phase"];
  runId: string;
  sequence: number;
  status: RunEventContract["status"];
  summary: string;
  toolName?: string | null;
}): RunEventContract {
  const occurredAt = `2026-06-05T11:${String(8 + sequence).padStart(2, "0")}:00+08:00`;

  return {
    actor: "analysis_runtime_stub",
    agentName: "analysis-agent",
    completedAt: occurredAt,
    errorCode: null,
    errorMessage: null,
    eventId,
    eventType,
    nodeName: eventType,
    occurredAt,
    parentEventId: null,
    phase,
    refId: null,
    refType: null,
    runId,
    sequence,
    startedAt: occurredAt,
    status,
    summary,
    toolName: toolName ?? null
  };
}

function createToolCall({
  output,
  permission,
  runId,
  toolCallId,
  toolName
}: {
  output: Record<string, unknown> | null;
  permission: string;
  runId: string;
  toolCallId: string;
  toolName: string;
}): ToolCall {
  return {
    completedAt: "2026-06-05T11:16:00+08:00",
    errorMessage: null,
    errorType: null,
    input: { request: toolName },
    output,
    permission,
    riskLevel: "medium",
    runId,
    startedAt: "2026-06-05T11:14:00+08:00",
    status: "succeeded",
    toolCallId,
    toolName
  };
}

function createModelCall({
  cost,
  latencyMs,
  modelCallId,
  modelId,
  outputTokens,
  promptVersionId,
  provider,
  runId
}: {
  cost: number;
  latencyMs: number;
  modelCallId: string;
  modelId: string;
  outputTokens: number;
  promptVersionId: string;
  provider: string;
  runId: string;
}): ModelCall {
  return {
    completedAt: "2026-06-05T11:22:00+08:00",
    cost,
    errorMessage: null,
    errorType: null,
    inputTokens: 6120,
    latencyMs,
    modelCallId,
    modelId,
    outputTokens,
    promptVersionId,
    provider,
    runId,
    startedAt: "2026-06-05T11:20:00+08:00",
    status: "succeeded"
  };
}

function createSourceEvidence({
  runId,
  snippet,
  sourceEvidenceId,
  sourceId,
  sourceType,
  title
}: {
  runId: string;
  snippet: string;
  sourceEvidenceId: string;
  sourceId: string;
  sourceType: SourceEvidence["sourceType"];
  title: string;
}): SourceEvidence {
  return {
    confidence: 0.84,
    createdAt: "2026-06-05T11:18:00+08:00",
    metadata: {},
    runId,
    snippet,
    sourceEvidenceId,
    sourceId,
    sourceType,
    title
  };
}

function createReport({
  reportId,
  runId,
  summary,
  title,
  workspaceId
}: {
  reportId: string;
  runId: string;
  summary: string;
  title: string;
  workspaceId: string;
}): Report {
  return {
    createdAt: "2026-06-05T11:23:00+08:00",
    reportId,
    runId,
    sections: [
      {
        content: "先核对渠道确认周期，再复核库存节奏。",
        createdAt: "2026-06-05T11:23:00+08:00",
        reportId,
        reportSectionId: `${reportId}-section-1`,
        title: "下一步动作"
      }
    ],
    sourceEvidence: [],
    summary,
    title,
    workspaceId
  };
}

function createDecision({
  createdAt,
  decisionId,
  reportId,
  runId,
  status,
  title,
  workspaceId
}: {
  createdAt: string;
  decisionId: string;
  reportId: string;
  runId: string;
  status: Decision["status"];
  title: string;
  workspaceId: string;
}): Decision {
  return {
    createdAt,
    decisionId,
    reportId,
    runId,
    status,
    title,
    workspaceId
  };
}

function createMessageStream({
  delta,
  eventType,
  messageId,
  messageStreamId,
  runId,
  sequence,
  status
}: {
  delta: string;
  eventType: MessageStreamContract["eventType"];
  messageId: string;
  messageStreamId: string;
  runId: string;
  sequence: number;
  status: MessageStreamContract["status"];
}): MessageStreamContract {
  return {
    conversationId: "conversation-revenue-gap-q2",
    delta,
    errorCode: null,
    errorMessage: null,
    eventType,
    messageId,
    messageStreamId,
    occurredAt: `2026-06-05T11:${String(22 + sequence).padStart(2, "0")}:00+08:00`,
    runId,
    sequence,
    status
  };
}

const workspaceId = "workspace-northstar-retail-china";
const userId = "user-zoe";

const revenueConversationId = "conversation-revenue-gap-q2";
const revenueRunId = "analysis-q2-revenue-gap";
const revenueTurnId = "turn-revenue-gap-q2-1";
const revenueReportId = "report-revenue-gap-q2";
const revenueToolCallId = "tool-call-analysis-q2-revenue-gap-metrics";

const revenueConversation = createConversation({
  conversationId: revenueConversationId,
  currentRunId: revenueRunId,
  title: "收入增速异常",
  updatedAt: "2026-06-05T11:24:00+08:00",
  userId,
  workspaceId
});

const revenueRun = createRun({
  analysisTaskId: "analysis-task-revenue-gap-q2",
  completedAt: "2026-06-05T11:24:00+08:00",
  createdAt: "2026-06-05T11:08:00+08:00",
  phase: "delivery",
  runId: revenueRunId,
  startedAt: "2026-06-05T11:08:30+08:00",
  status: "completed",
  userId,
  workspaceId
});

const revenueMessages = [
  createMessage({
    analysisTaskId: "analysis-task-revenue-gap-q2",
    content:
      "当前从 Dashboard / Revenue 带上下文进入 Analysis，本阶段只固定 contracts-backed workspace 骨架。",
    conversationId: revenueConversationId,
    createdAt: "2026-06-05T11:08:00+08:00",
    messageId: "message-revenue-gap-q2-system",
    reportId: null,
    role: "system",
    runId: null,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-revenue-gap-q2-context"
  }),
  createMessage({
    analysisTaskId: "analysis-task-revenue-gap-q2",
    content: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    conversationId: revenueConversationId,
    createdAt: "2026-06-05T11:08:12+08:00",
    messageId: "message-revenue-gap-q2-user",
    reportId: null,
    role: "user",
    runId: revenueRunId,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: revenueTurnId
  }),
  createMessage({
    analysisTaskId: "analysis-task-revenue-gap-q2",
    content: "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，而不是整体价格体系失效。",
    conversationId: revenueConversationId,
    createdAt: "2026-06-05T11:22:00+08:00",
    messageId: "message-revenue-gap-q2-assistant",
    reportId: revenueReportId,
    role: "assistant",
    runId: revenueRunId,
    sourceEvidenceIds: [
      "source-evidence-channel-weekly-17",
      "source-evidence-inventory-note-east-04"
    ],
    status: "completed",
    toolCallIds: [revenueToolCallId],
    turnId: revenueTurnId
  })
];

const revenueRunEvents = [
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-user-input",
    eventType: "run.created",
    phase: "intake",
    runId: revenueRunId,
    sequence: 0,
    status: "succeeded",
    summary: "记录当前用户问题，并为后续运行绑定上下文。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-context-bound",
    eventType: "context.bound",
    phase: "context_binding",
    runId: revenueRunId,
    sequence: 1,
    status: "succeeded",
    summary: "绑定 Dashboard / Revenue 与时间窗口上下文。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-plan-created",
    eventType: "plan.created",
    phase: "planning",
    runId: revenueRunId,
    sequence: 2,
    status: "succeeded",
    summary: "生成问题拆解、指标比对与证据召回计划。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-permission-check",
    eventType: "policy.decision_recorded",
    phase: "governance",
    runId: revenueRunId,
    sequence: 3,
    status: "succeeded",
    summary: "确认当前上下文允许读取指标摘要与证据引用。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-tool-call-metrics",
    eventType: "tool_call.completed",
    phase: "tool_execution",
    runId: revenueRunId,
    sequence: 4,
    status: "succeeded",
    summary: "调用指标摘要工具，对比华东与其他区域的收入增速。",
    toolName: "metrics.summary.compare"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-evidence-retrieval",
    eventType: "evidence.retrieved",
    phase: "evidence_binding",
    runId: revenueRunId,
    sequence: 5,
    status: "succeeded",
    summary: "召回渠道周报与库存说明的证据引用。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-summary-generated",
    eventType: "synthesis.started",
    phase: "synthesis",
    runId: revenueRunId,
    sequence: 6,
    status: "succeeded",
    summary: "整合指标与证据，输出经营结论与下一步动作。"
  }),
  createRunEvent({
    eventId: "event-analysis-q2-revenue-gap-feedback-waiting",
    eventType: "run.completed",
    phase: "delivery",
    runId: revenueRunId,
    sequence: 7,
    status: "succeeded",
    summary: "当前运行完成，等待用户继续追问或进入报告入口。"
  })
];

const revenueToolCalls = [
  createToolCall({
    output: { conclusion: "华东渠道确认延迟明显。" },
    permission: "metrics.read",
    runId: revenueRunId,
    toolCallId: revenueToolCallId,
    toolName: "metrics.summary.compare"
  })
];

const revenueModelCalls = [
  createModelCall({
    cost: 0.86,
    latencyMs: 18200,
    modelCallId: "model-call-analysis-q2-revenue-gap-summary",
    modelId: "gpt-4.1-static",
    outputTokens: 6360,
    promptVersionId: "prompt-revenue-gap-v1",
    provider: "openai",
    runId: revenueRunId
  })
];

const revenueSourceEvidence = [
  createSourceEvidence({
    runId: revenueRunId,
    snippet: "华东渠道周报摘要显示确认延迟集中在重点渠道。",
    sourceEvidenceId: "source-evidence-channel-weekly-17",
    sourceId: "knowledge-document-channel-weekly-17",
    sourceType: "knowledge_document",
    title: "华东渠道周报"
  }),
  createSourceEvidence({
    runId: revenueRunId,
    snippet: "库存说明摘要支持促销库存与确认周期错位的判断。",
    sourceEvidenceId: "source-evidence-inventory-note-east-04",
    sourceId: "knowledge-document-inventory-east-04",
    sourceType: "knowledge_document",
    title: "华东库存说明"
  })
];

const revenueReports = [
  createReport({
    reportId: revenueReportId,
    runId: revenueRunId,
    summary: "形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作。",
    title: "收入异常分析摘要",
    workspaceId
  })
];

const revenueDecisions = [
  createDecision({
    createdAt: "2026-06-05T11:25:00+08:00",
    decisionId: "decision-revenue-gap-q2",
    reportId: revenueReportId,
    runId: revenueRunId,
    status: "proposed",
    title: "复核华东渠道确认周期与促销库存节奏",
    workspaceId
  })
];

const revenueMessageStream = [
  createMessageStream({
    delta: "",
    eventType: "stream.started",
    messageId: "message-revenue-gap-q2-assistant",
    messageStreamId: "message-stream-revenue-gap-q2-0",
    runId: revenueRunId,
    sequence: 0,
    status: "created"
  }),
  createMessageStream({
    delta: "收入增速下滑主要来自华东核心渠道确认延迟",
    eventType: "stream.delta",
    messageId: "message-revenue-gap-q2-assistant",
    messageStreamId: "message-stream-revenue-gap-q2-1",
    runId: revenueRunId,
    sequence: 1,
    status: "streaming"
  }),
  createMessageStream({
    delta: "与促销库存错配。",
    eventType: "stream.completed",
    messageId: "message-revenue-gap-q2-assistant",
    messageStreamId: "message-stream-revenue-gap-q2-2",
    runId: revenueRunId,
    sequence: 2,
    status: "completed"
  })
];

const marginConversationId = "conversation-margin-follow-up";
const marginRunId = "analysis-margin-follow-up";
const marginDecisions: Decision[] = [];

const marginConversation = createConversation({
  conversationId: marginConversationId,
  currentRunId: marginRunId,
  title: "毛利率波动分析",
  updatedAt: "2026-06-05T10:18:00+08:00",
  userId,
  workspaceId
});

const marginRun = createRun({
  analysisTaskId: "analysis-task-margin-follow-up",
  completedAt: null,
  createdAt: "2026-06-05T10:05:00+08:00",
  phase: "synthesis",
  runId: marginRunId,
  startedAt: "2026-06-05T10:05:30+08:00",
  status: "running",
  userId,
  workspaceId
});

const marginRunEvents = [
  createRunEvent({
    eventId: "event-analysis-margin-follow-up-user-input",
    eventType: "run.created",
    phase: "intake",
    runId: marginRunId,
    sequence: 0,
    status: "succeeded",
    summary: "记录毛利率波动问题。"
  }),
  createRunEvent({
    eventId: "event-analysis-margin-follow-up-context-bound",
    eventType: "context.bound",
    phase: "context_binding",
    runId: marginRunId,
    sequence: 1,
    status: "succeeded",
    summary: "绑定 Metrics / Margin 上下文。"
  }),
  createRunEvent({
    eventId: "event-analysis-margin-follow-up-tool-call",
    eventType: "tool_call.completed",
    phase: "tool_execution",
    runId: marginRunId,
    sequence: 2,
    status: "succeeded",
    summary: "完成毛利率拆分查询。",
    toolName: "metrics.margin.compare"
  }),
  createRunEvent({
    eventId: "event-analysis-margin-follow-up-summary-generated",
    eventType: "synthesis.started",
    phase: "synthesis",
    runId: marginRunId,
    sequence: 3,
    status: "running",
    summary: "正在整合不同品类与区域的毛利率差异。"
  })
];

const marginMessages = [
  createMessage({
    analysisTaskId: "analysis-task-margin-follow-up",
    content: "当前从 Metrics / Margin 带上下文进入 Analysis。",
    conversationId: marginConversationId,
    createdAt: "2026-06-05T10:05:00+08:00",
    messageId: "message-margin-follow-up-system",
    reportId: null,
    role: "system",
    runId: null,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-margin-follow-up-context"
  }),
  createMessage({
    analysisTaskId: "analysis-task-margin-follow-up",
    content: "继续分析毛利率波动背后的主要驱动因素。",
    conversationId: marginConversationId,
    createdAt: "2026-06-05T10:05:12+08:00",
    messageId: "message-margin-follow-up-user",
    reportId: null,
    role: "user",
    runId: marginRunId,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-margin-follow-up-1"
  }),
  createMessage({
    analysisTaskId: "analysis-task-margin-follow-up",
    content: "当前正在拆分品类与区域差异，初步判断促销结构变化对毛利率影响较大。",
    conversationId: marginConversationId,
    createdAt: "2026-06-05T10:18:00+08:00",
    messageId: "message-margin-follow-up-assistant",
    reportId: null,
    role: "assistant",
    runId: marginRunId,
    sourceEvidenceIds: ["source-evidence-margin-trend-east"],
    status: "streaming",
    toolCallIds: ["tool-call-analysis-margin-follow-up-metrics"],
    turnId: "turn-margin-follow-up-1"
  })
];

const marginToolCalls = [
  createToolCall({
    output: { conclusion: "促销结构变化明显。" },
    permission: "metrics.read",
    runId: marginRunId,
    toolCallId: "tool-call-analysis-margin-follow-up-metrics",
    toolName: "metrics.margin.compare"
  })
];

const marginModelCalls = [
  createModelCall({
    cost: 0.31,
    latencyMs: 9600,
    modelCallId: "model-call-analysis-margin-follow-up-summary",
    modelId: "gpt-4.1-static",
    outputTokens: 4280,
    promptVersionId: "prompt-margin-follow-up-v1",
    provider: "openai",
    runId: marginRunId
  })
];

const marginSourceEvidence = [
  createSourceEvidence({
    runId: marginRunId,
    snippet: "东区品类促销结构变化与毛利率波动同步出现。",
    sourceEvidenceId: "source-evidence-margin-trend-east",
    sourceId: "metric-margin-east",
    sourceType: "metric",
    title: "东区毛利率趋势"
  })
];

const marginMessageStream = [
  createMessageStream({
    delta: "",
    eventType: "stream.started",
    messageId: "message-margin-follow-up-assistant",
    messageStreamId: "message-stream-margin-follow-up-0",
    runId: marginRunId,
    sequence: 0,
    status: "created"
  }),
  createMessageStream({
    delta: "当前正在拆分品类与区域差异。",
    eventType: "stream.delta",
    messageId: "message-margin-follow-up-assistant",
    messageStreamId: "message-stream-margin-follow-up-1",
    runId: marginRunId,
    sequence: 1,
    status: "streaming"
  })
];

const stockoutConversationId = "conversation-stockout-risk";
const stockoutRunId = "analysis-stockout-risk";
const stockoutDecisions: Decision[] = [];

const stockoutConversation = createConversation({
  conversationId: stockoutConversationId,
  currentRunId: stockoutRunId,
  title: "库存异常定位",
  updatedAt: "2026-06-05T09:46:00+08:00",
  userId,
  workspaceId
});

const stockoutRun = createRun({
  analysisTaskId: "analysis-task-stockout-risk",
  completedAt: null,
  createdAt: "2026-06-05T09:36:00+08:00",
  phase: "evidence_binding",
  runId: stockoutRunId,
  startedAt: "2026-06-05T09:36:40+08:00",
  status: "waiting",
  userId,
  workspaceId
});

const stockoutMessages = [
  createMessage({
    analysisTaskId: "analysis-task-stockout-risk",
    content: "当前从 Metrics / Stockout 带上下文进入 Analysis。",
    conversationId: stockoutConversationId,
    createdAt: "2026-06-05T09:36:00+08:00",
    messageId: "message-stockout-risk-system",
    reportId: null,
    role: "system",
    runId: null,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-stockout-risk-context"
  }),
  createMessage({
    analysisTaskId: "analysis-task-stockout-risk",
    content: "解释北区缺货率异常与补货任务冲突的关系。",
    conversationId: stockoutConversationId,
    createdAt: "2026-06-05T09:36:12+08:00",
    messageId: "message-stockout-risk-user",
    reportId: null,
    role: "user",
    runId: stockoutRunId,
    sourceEvidenceIds: [],
    status: "completed",
    toolCallIds: [],
    turnId: "turn-stockout-risk-1"
  }),
  createMessage({
    analysisTaskId: "analysis-task-stockout-risk",
    content: "当前证据存在冲突，结论应保持审慎，优先保留治理和观测入口。",
    conversationId: stockoutConversationId,
    createdAt: "2026-06-05T09:46:00+08:00",
    messageId: "message-stockout-risk-assistant",
    reportId: null,
    role: "assistant",
    runId: stockoutRunId,
    sourceEvidenceIds: [
      "source-evidence-store-feedback-north-12h",
      "source-evidence-restock-job-north-12h"
    ],
    status: "failed",
    toolCallIds: ["tool-call-analysis-stockout-risk-metrics"],
    turnId: "turn-stockout-risk-1"
  })
];

const stockoutRunEvents = [
  createRunEvent({
    eventId: "event-analysis-stockout-risk-user-input",
    eventType: "run.created",
    phase: "intake",
    runId: stockoutRunId,
    sequence: 0,
    status: "succeeded",
    summary: "记录缺货率异常调查问题。"
  }),
  createRunEvent({
    eventId: "event-analysis-stockout-risk-context-bound",
    eventType: "context.bound",
    phase: "context_binding",
    runId: stockoutRunId,
    sequence: 1,
    status: "succeeded",
    summary: "绑定缺货率异常与补货任务上下文。"
  }),
  createRunEvent({
    eventId: "event-analysis-stockout-risk-summary-generated",
    eventType: "run.waiting",
    phase: "evidence_binding",
    runId: stockoutRunId,
    sequence: 2,
    status: "pending",
    summary: "证据冲突，当前运行等待进一步追问或治理动作。"
  })
];

const stockoutToolCalls = [
  createToolCall({
    output: null,
    permission: "metrics.read",
    runId: stockoutRunId,
    toolCallId: "tool-call-analysis-stockout-risk-metrics",
    toolName: "metrics.stockout.compare"
  })
];

const stockoutModelCalls = [
  createModelCall({
    cost: 0.18,
    latencyMs: 6400,
    modelCallId: "model-call-analysis-stockout-risk-summary",
    modelId: "gpt-4.1-static",
    outputTokens: 2960,
    promptVersionId: "prompt-stockout-risk-v1",
    provider: "openai",
    runId: stockoutRunId
  })
];

const stockoutSourceEvidence = [
  createSourceEvidence({
    runId: stockoutRunId,
    snippet: "门店反馈摘要说明北区缺货问题持续升高。",
    sourceEvidenceId: "source-evidence-store-feedback-north-12h",
    sourceId: "knowledge-document-store-feedback-north-12h",
    sourceType: "knowledge_document",
    title: "北区门店反馈"
  }),
  createSourceEvidence({
    runId: stockoutRunId,
    snippet: "补货任务摘要与门店反馈存在时序冲突，需保留治理入口。",
    sourceEvidenceId: "source-evidence-restock-job-north-12h",
    sourceId: "analysis-memory-restock-job-north-12h",
    sourceType: "analysis_memory",
    title: "补货任务摘要"
  })
];

export const analysisRuntimeContractSessionFixtures: AnalysisRuntimeContractSessionFixture[] = [
  {
    drafts: {
      followUp: "如果只观察最近 7 天，这个异常是否仍然明显？",
      input: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。"
    },
    input: {
      conversation: revenueConversation,
      currentRun: revenueRun,
      decisions: revenueDecisions,
      messageStream: revenueMessageStream,
      messages: revenueMessages,
      modelCalls: revenueModelCalls,
      reports: revenueReports,
      runEvents: revenueRunEvents,
      sourceEvidence: revenueSourceEvidence,
      toolCalls: revenueToolCalls
    },
    presentation: {
      sourceObject: "收入增速异常",
      sourceRoute: "Dashboard / Revenue",
      timeRange: "Last 30 days",
      workspaceName: "Northstar Retail China"
    }
  },
  {
    drafts: {
      followUp: "继续分析毛利率波动。",
      input: "继续分析毛利率波动背后的主要驱动因素。"
    },
    input: {
      conversation: marginConversation,
      currentRun: marginRun,
      decisions: marginDecisions,
      messageStream: marginMessageStream,
      messages: marginMessages,
      modelCalls: marginModelCalls,
      reports: [],
      runEvents: marginRunEvents,
      sourceEvidence: marginSourceEvidence,
      toolCalls: marginToolCalls
    },
    presentation: {
      sourceObject: "毛利率波动",
      sourceRoute: "Metrics / Margin",
      timeRange: "Current quarter",
      workspaceName: "Northstar Retail China"
    }
  },
  {
    drafts: {
      followUp: "门店反馈与补货任务为什么会出现冲突？",
      input: "解释北区缺货率异常与补货任务冲突的关系。"
    },
    input: {
      conversation: stockoutConversation,
      currentRun: stockoutRun,
      decisions: stockoutDecisions,
      messageStream: [],
      messages: stockoutMessages,
      modelCalls: stockoutModelCalls,
      reports: [],
      runEvents: stockoutRunEvents,
      sourceEvidence: stockoutSourceEvidence,
      toolCalls: stockoutToolCalls
    },
    presentation: {
      sourceObject: "缺货率异常",
      sourceRoute: "Metrics / Stockout",
      timeRange: "Last 12 hours",
      workspaceName: "Northstar Retail China"
    }
  }
];
