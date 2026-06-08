import type { SharedRiskViewModel, SharedStatusViewModel } from "../../../shared/utils/viewModelState";
import type {
  AnalysisContextPackViewModel,
  AnalysisMemoryContextViewModel,
  AnalysisReportPreviewViewModel,
  AnalysisResultSummaryViewModel,
  AnalysisSessionSummaryViewModel,
  AnalysisSessionViewModel,
  AnalysisSourceEvidenceViewModel,
  AnalysisToolDetailViewModel,
  AnalysisWorkspaceViewModel
} from "../models/analysisViewModel";
import type { AnalysisMessage } from "../models/analysisMessage";
import type { AnalysisRun, AnalysisRunEvent, AnalysisRunEventStatus, AnalysisRunStatus } from "../models/analysisRun";

const successStatus: SharedStatusViewModel = {
  labelKey: "state.success.default.title",
  status: "success"
};

const loadingStatus: SharedStatusViewModel = {
  labelKey: "state.loading.default.title",
  status: "loading"
};

const warningStatus: SharedStatusViewModel = {
  labelKey: "state.warning.default.title",
  status: "warning"
};

const riskStatus: SharedStatusViewModel = {
  labelKey: "state.risk.default.title",
  status: "risk"
};

const lowRisk: SharedRiskViewModel = {
  level: "low",
  titleKey: "risk.low.title"
};

const mediumRisk: SharedRiskViewModel = {
  level: "medium",
  titleKey: "risk.medium.title"
};

const highRisk: SharedRiskViewModel = {
  level: "high",
  title: "高风险"
};

const analysisModelOptions = [
  { key: "default", label: "Default" },
  { key: "reasoning", label: "Reasoning" },
  { key: "fast", label: "Fast" }
] as const;

function createContextPack({
  sourceObject,
  sourceRoute,
  timeRange,
  workspace
}: {
  sourceObject: string;
  sourceRoute: string;
  timeRange: string;
  workspace: string;
}): AnalysisContextPackViewModel {
  return {
    sourceObject,
    sourceRoute,
    stripText: `来自 ${sourceRoute} · ${sourceObject} · ${timeRange}`,
    systemText: `当前从 ${sourceRoute} 带上下文进入 Analysis，本阶段只更新本地 UI State。`,
    timeRange,
    workspace
  };
}

function createRun({
  costText,
  errorSummaryText,
  riskViewModel,
  runId,
  stageSummary,
  status,
  statusViewModel,
  tokenUsageText,
  totalDurationText,
  updatedAtText
}: {
  costText: string;
  errorSummaryText: string;
  riskViewModel?: SharedRiskViewModel;
  runId: string;
  stageSummary: string;
  status: AnalysisRunStatus;
  statusViewModel: SharedStatusViewModel;
  tokenUsageText: string;
  totalDurationText: string;
  updatedAtText: string;
}): AnalysisRun {
  return {
    costText,
    errorSummaryText,
    riskViewModel,
    runId,
    stageSummary,
    status,
    statusViewModel,
    tokenUsageText,
    totalDurationText,
    updatedAtText
  };
}

function createRunEvent({
  costText,
  detail,
  durationText,
  errorType,
  eventId,
  eventType,
  evidenceRefs,
  inputSummary,
  modelName,
  outputSummary,
  riskViewModel,
  runId,
  status,
  statusViewModel,
  summary,
  timestampText,
  title,
  tokenUsageText,
  toolName
}: {
  costText?: string;
  detail: string;
  durationText?: string;
  errorType?: string;
  eventId: string;
  eventType: AnalysisRunEvent["eventType"];
  evidenceRefs?: string[];
  inputSummary?: string;
  modelName?: string;
  outputSummary?: string;
  riskViewModel?: SharedRiskViewModel;
  runId: string;
  status: AnalysisRunEventStatus;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  timestampText: string;
  title: string;
  tokenUsageText?: string;
  toolName?: string;
}): AnalysisRunEvent {
  return {
    costText,
    detail,
    durationText,
    errorType,
    eventId,
    eventType,
    evidenceRefs,
    inputSummary,
    modelName,
    outputSummary,
    riskViewModel,
    runId,
    status,
    statusViewModel,
    summary,
    timestampText,
    title,
    tokenUsageText,
    toolName
  };
}

function createSessionSummary({
  contextLabel,
  riskViewModel,
  runLabel,
  sessionId,
  statusViewModel,
  summary,
  title,
  updatedAtText
}: {
  contextLabel: string;
  riskViewModel?: SharedRiskViewModel;
  runLabel: string;
  sessionId: string;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  title: string;
  updatedAtText: string;
}): AnalysisSessionSummaryViewModel {
  return {
    contextLabel,
    riskViewModel,
    runLabel,
    sessionId,
    statusViewModel,
    summary,
    title,
    updatedAtText
  };
}

function createResultSummary({
  actionSuggestions,
  conclusion,
  evidenceSummary,
  findingBullets,
  key,
  riskViewModel,
  statusViewModel,
  title
}: {
  actionSuggestions: string[];
  conclusion: string;
  evidenceSummary: string;
  findingBullets: string[];
  key: string;
  riskViewModel?: SharedRiskViewModel;
  statusViewModel: SharedStatusViewModel;
  title: string;
}): AnalysisResultSummaryViewModel {
  return {
    actionSuggestions,
    conclusion,
    evidenceSummary,
    findingBullets,
    key,
    riskViewModel,
    statusViewModel,
    title
  };
}

function createMessages({
  contextPack,
  resultSummary,
  runId,
  sessionId,
  sourceEvidenceIds,
  toolDetails,
  userPrompt
}: {
  contextPack: AnalysisContextPackViewModel;
  resultSummary: AnalysisResultSummaryViewModel;
  runId: string;
  sessionId: string;
  sourceEvidenceIds: string[];
  toolDetails: AnalysisToolDetailViewModel[];
  userPrompt: string;
}): AnalysisMessage[] {
  return [
    {
      content: contextPack.systemText,
      createdAt: "2026-06-05T11:08:00+08:00",
      messageId: `message-${sessionId}-system`,
      metaText: contextPack.stripText,
      role: "system",
      sessionId,
      status: "completed"
    },
    {
      content: userPrompt,
      createdAt: "2026-06-05T11:08:12+08:00",
      messageId: `message-${sessionId}-user`,
      role: "user",
      runId,
      sessionId,
      status: "completed"
    },
    {
      content: resultSummary.conclusion,
      createdAt: "2026-06-05T11:22:00+08:00",
      footerText: "完整执行过程见右侧 Run Trace。",
      messageId: `message-${sessionId}-assistant`,
      role: "assistant",
      runId,
      sessionId,
      sourceRefs: sourceEvidenceIds,
      status:
        resultSummary.statusViewModel.status === "loading"
          ? "streaming"
          : resultSummary.statusViewModel.status === "risk"
            ? "failed"
            : "completed",
      supportingItems: resultSummary.findingBullets.slice(0, 2),
      supportingTitle: "关键发现",
      toolRefs: toolDetails.map((toolDetail) => toolDetail.toolCallId)
    }
  ];
}

function createToolDetail({
  runId,
  statusViewModel,
  summary,
  toolCallId,
  toolName
}: {
  runId: string;
  statusViewModel: SharedStatusViewModel;
  summary: string;
  toolCallId: string;
  toolName: string;
}): AnalysisToolDetailViewModel {
  return {
    runId,
    statusViewModel,
    summary,
    toolCallId,
    toolName
  };
}

function createSourceEvidence({
  runId,
  sourceEvidenceId,
  sourceType,
  summary,
  title
}: {
  runId: string;
  sourceEvidenceId: string;
  sourceType: AnalysisSourceEvidenceViewModel["sourceType"];
  summary: string;
  title: string;
}): AnalysisSourceEvidenceViewModel {
  return {
    runId,
    sourceEvidenceId,
    sourceType,
    summary,
    title
  };
}

function createReportPreview({
  reportId,
  runId,
  summary,
  title
}: {
  reportId: string;
  runId: string;
  summary: string;
  title: string;
}): AnalysisReportPreviewViewModel {
  return {
    reportId,
    runId,
    summary,
    title
  };
}

function createMemoryContext({
  memoryItemId,
  summary,
  title
}: {
  memoryItemId: string;
  summary: string;
  title: string;
}): AnalysisMemoryContextViewModel {
  return {
    memoryItemId,
    summary,
    title
  };
}

const revenueContextPack = createContextPack({
  sourceObject: "收入增速异常",
  sourceRoute: "Dashboard / Revenue",
  timeRange: "Last 30 days",
  workspace: "Northstar Retail China"
});

const revenueRun = createRun({
  costText: "¥0.86",
  errorSummaryText: "0 blocking / 1 warning",
  riskViewModel: mediumRisk,
  runId: "analysis-q2-revenue-gap",
  stageSummary: "已完成问题拆解、指标比对、证据归并和建议动作整理。",
  status: "completed",
  statusViewModel: successStatus,
  tokenUsageText: "12,480",
  totalDurationText: "18.2s",
  updatedAtText: "更新于 11:24"
});

const revenueRunEvents: AnalysisRunEvent[] = [
  createRunEvent({
    detail:
      "用户在 Analysis 会话里发起收入异常追问。当前阶段只记录标准化静态问题摘要，不创建真实消息流或真实 Agent Run。",
    durationText: "0.4s",
    eventId: "event-analysis-q2-revenue-gap-user-input",
    eventType: "user_input",
    inputSummary: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    outputSummary: "静态记录问题摘要，并进入当前 run 的上下文绑定阶段。",
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "记录当前用户问题，并为后续 run trace 生成起点。",
    timestampText: "11:08",
    title: "1. 接收用户问题"
  }),
  createRunEvent({
    detail:
      "将 Dashboard / Revenue、收入增速异常和 Last 30 days 静态上下文绑定到当前 run。这里只展示标准化后的上下文摘要，不拼接 raw route state。",
    durationText: "1.1s",
    eventId: "event-analysis-q2-revenue-gap-context-bound",
    eventType: "context_bound",
    inputSummary: "Dashboard / Revenue · 收入增速异常 · Last 30 days",
    outputSummary: "当前 run 已具备 Workspace、来源对象和时间窗口上下文。",
    riskViewModel: mediumRisk,
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "绑定当前 Workspace、来源页面和时间窗口，为后续计划生成提供上下文。",
    timestampText: "11:08",
    title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
  }),
  createRunEvent({
    detail:
      "当前阶段根据问题、约束和上下文来源生成静态分析计划，只展示标准化计划摘要，不展示 LangGraph raw state。",
    durationText: "1.5s",
    eventId: "event-analysis-q2-revenue-gap-plan-created",
    eventType: "plan_created",
    inputSummary: "收入异常归因 + 渠道/库存拆解 + 经营周会建议",
    outputSummary: "形成指标比对、证据召回和摘要生成三段式静态计划。",
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "识别问题与约束，生成当前 run 的静态分析计划。",
    timestampText: "11:09",
    title: "3. 生成分析计划"
  }),
  createRunEvent({
    detail:
      "当前只做静态权限摘要检查，确认 Metrics、Evidence 和 Reports 入口可用，但不执行真实 Tool Calling 或治理动作。",
    durationText: "0.8s",
    eventId: "event-analysis-q2-revenue-gap-permission-check",
    eventType: "permission_check",
    inputSummary: "核对 Metrics / Evidence / Reports 静态入口权限",
    outputSummary: "当前 run 可继续使用静态指标摘要与证据说明能力。",
    riskViewModel: lowRisk,
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "检查当前 run 可用的静态工具入口和权限说明。",
    timestampText: "11:10",
    title: "4. 检查工具权限"
  }),
  createRunEvent({
    costText: "¥0.22",
    detail:
      "以静态 ViewModel 展示收入增速阈值摘要和区域对比结果，不读取真实 Metrics API，也不展示底层原始指标返回。",
    durationText: "4.1s",
    eventId: "event-analysis-q2-revenue-gap-tool-call-metrics",
    eventType: "tool_call",
    inputSummary: "比较华东与其他区域的收入增速阈值、确认周期和库存节奏。",
    outputSummary: "华东渠道确认延迟明显，其他区域未同步放大，当前异常集中在单一区域。",
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "调用静态指标摘要工具，对比区域收入增速与阈值差异。",
    timestampText: "11:10",
    title: "5. 调用指标摘要工具",
    tokenUsageText: "3,420",
    toolName: "metrics.summary.compare"
  }),
  createRunEvent({
    detail:
      "召回渠道周报与库存说明的静态证据摘要，Evidence 只保留标准化来源引用，不展示原始文档片段或 raw retrieval payload。",
    durationText: "5.8s",
    eventId: "event-analysis-q2-revenue-gap-evidence-retrieval",
    eventType: "evidence_retrieval",
    evidenceRefs: ["evidence/channel-weekly-17", "evidence/inventory-note-east-04"],
    inputSummary: "召回华东渠道周报和库存说明，验证异常是否由价格体系失效引起。",
    outputSummary: "渠道周报与库存说明均支持“确认延迟 + 库存错配”的静态归因方向。",
    riskViewModel: mediumRisk,
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "补充渠道周报与库存说明的静态证据引用。",
    timestampText: "11:18",
    title: "6. 召回 Evidence / RAG 来源"
  }),
  createRunEvent({
    costText: "¥0.41",
    detail:
      "基于指标摘要和证据引用生成收入异常结论、关键发现和下一步建议。这里只展示标准化结论摘要，不暴露模型原始输出。",
    durationText: "3.2s",
    eventId: "event-analysis-q2-revenue-gap-summary-generated",
    eventType: "summary_generated",
    inputSummary: "整合指标摘要、证据引用和经营周会导向的表达要求。",
    modelName: "gpt-4.1-static",
    outputSummary: "形成“确认延迟 + 库存错配”主结论，并给出渠道和库存复核动作。",
    riskViewModel: mediumRisk,
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "生成当前 run 的结论、关键发现和下一步建议。",
    timestampText: "11:22",
    title: "7. 生成分析摘要",
    tokenUsageText: "7,960"
  }),
  createRunEvent({
    detail:
      "当前会话停留在本地追问、反馈标记和报告入口占位阶段，不触发真实 Agent 续跑、真实反馈写入或真实报告生成。",
    durationText: "1.3s",
    eventId: "event-analysis-q2-revenue-gap-feedback-waiting",
    eventType: "feedback_waiting",
    inputSummary: "等待用户继续追问、反馈或进入报告入口。",
    outputSummary: "保持当前 conversation 和 run，不刷新页面，不改变 URL。",
    runId: revenueRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "等待用户进一步追问、反馈或报告动作。",
    timestampText: "11:24",
    title: "8. 等待用户追问 / 反馈"
  })
];

const revenueToolDetails = [
  createToolDetail({
    runId: revenueRun.runId,
    statusViewModel: successStatus,
    summary: "对比华东渠道收入增速、确认周期和库存节奏的静态指标摘要。",
    toolCallId: "tool-call-analysis-q2-revenue-gap-metrics",
    toolName: "metrics.summary.compare"
  })
];

const revenueSourceEvidence = [
  createSourceEvidence({
    runId: revenueRun.runId,
    sourceEvidenceId: "source-evidence-channel-weekly-17",
    sourceType: "knowledge_document",
    summary: "华东渠道周报摘要显示确认延迟集中在重点渠道。",
    title: "华东渠道周报"
  }),
  createSourceEvidence({
    runId: revenueRun.runId,
    sourceEvidenceId: "source-evidence-inventory-note-east-04",
    sourceType: "knowledge_document",
    summary: "库存说明摘要支持促销库存与确认周期错位的判断。",
    title: "华东库存说明"
  })
];

const revenueResultSummary = createResultSummary({
  actionSuggestions: [
    "先核对华东渠道确认周期与促销库存节奏。",
    "在 Metrics 中复查收入增速阈值和区域拆分口径。",
    "将当前结论沉淀为周经营报告入口，供后续追问复用。"
  ],
  conclusion: "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，而不是整体价格体系失效。",
  evidenceSummary: "结论来自指标阈值、渠道周报和库存说明的静态聚合，不展示模型原始输出。",
  findingBullets: [
    "异常集中在华东渠道，并未在其他区域同步放大。",
    "库存与确认周期错位放大了周度收入波动。",
    "最近报告已沉淀部分背景，可直接作为后续分析和报告入口。"
  ],
  key: "result-revenue-gap",
  riskViewModel: mediumRisk,
  statusViewModel: successStatus,
  title: "结果摘要"
});

const revenueSession: AnalysisSessionViewModel = {
  contextPack: revenueContextPack,
  currentRun: revenueRun,
  followUpComposer: {
    contextHint: "继续追问会沿用当前静态会话上下文，但不会发起真实多轮请求。",
    helperText: "追问输入只做本地 UI 联动，不创建真实消息流或 streaming。",
    initialDraft: "如果只观察最近 7 天，这个异常是否仍然明显？",
    key: "follow-up-revenue-gap",
    placeholder: "继续追问当前结论，例如要求拆分渠道、库存或时间范围。",
    submitLabel: "继续追问",
    suggestions: [
      { key: "follow-up-split-channel", label: "拆分华东与华南渠道差异" },
      { key: "follow-up-split-window", label: "比较最近 7 天与最近 30 天" },
      { key: "follow-up-cfo-brief", label: "整理给经营周会的后续动作" }
    ],
    title: "后续追问"
  },
  inputComposer: {
    contextHint: "Conversation-first: 用户主动发起分析，未来可带着 Dashboard、Metrics 和 Reports 上下文进入。",
    helperText: "本次只展示静态问题输入区，不创建真实 Agent Run。",
    initialDraft: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
    key: "analysis-input-revenue-gap",
    placeholder: "描述要分析的问题、约束和希望得到的结果。",
    submitLabel: "发起分析",
    suggestions: [
      { key: "analysis-suggestion-revenue-gap", label: "为什么本季度收入增速低于阈值？" },
      { key: "analysis-suggestion-channel-stock", label: "请结合渠道与库存解释异常。" },
      { key: "analysis-suggestion-board-summary", label: "生成面向经营周会的结论摘要。" }
    ],
    title: "分析任务输入区"
  },
  memoryContext: createMemoryContext({
    memoryItemId: "memory-revenue-gap-weekly-review",
    summary: "保留经营周会语境和渠道拆解口径，供后续追问延续。",
    title: "经营周会背景记忆"
  }),
  messages: createMessages({
    contextPack: revenueContextPack,
    resultSummary: revenueResultSummary,
    runId: revenueRun.runId,
    sessionId: "session-revenue-gap-q2",
    sourceEvidenceIds: revenueSourceEvidence.map((sourceEvidence) => sourceEvidence.sourceEvidenceId),
    toolDetails: revenueToolDetails,
    userPrompt: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。"
  }),
  reportPreview: createReportPreview({
    reportId: "report-weekly-operating-review",
    runId: revenueRun.runId,
    summary: "可将当前静态结论沉淀为经营周会报告补充段落。",
    title: "经营周会报告预览"
  }),
  resultSummary: revenueResultSummary,
  runEvents: revenueRunEvents,
  sessionId: "session-revenue-gap-q2",
  sessionSummary: createSessionSummary({
    contextLabel: "Dashboard / Revenue",
    riskViewModel: mediumRisk,
    runLabel: `Run: ${revenueRun.runId}`,
    sessionId: "session-revenue-gap-q2",
    statusViewModel: successStatus,
    summary: "围绕 Dashboard 收入异常做渠道和时间窗口追问。",
    title: "Q2 收入异常追问",
    updatedAtText: "刚刚更新"
  }),
  sourceEvidence: revenueSourceEvidence,
  toolDetails: revenueToolDetails
};

const marginContextPack = createContextPack({
  sourceObject: "毛利率复盘",
  sourceRoute: "Reports / Margin",
  timeRange: "This quarter",
  workspace: "Northstar Retail China"
});

const marginRun = createRun({
  costText: "¥0.61",
  errorSummaryText: "0 blocking / 1 warning",
  riskViewModel: mediumRisk,
  runId: "analysis-margin-follow-up",
  stageSummary: "已承接上一轮报告结论，正在拆分促销和商品结构的影响。",
  status: "running",
  statusViewModel: loadingStatus,
  tokenUsageText: "8,920",
  totalDurationText: "9.4s",
  updatedAtText: "更新于 10:20"
});

const marginRunEvents: AnalysisRunEvent[] = [
  createRunEvent({
    detail:
      "用户从 Reports / Margin 上下文进入 Analysis，发起毛利率波动复盘。当前阶段只记录标准化问题摘要，不读取真实报告对象。",
    durationText: "0.5s",
    eventId: "event-analysis-margin-follow-up-user-input",
    eventType: "user_input",
    inputSummary: "复盘本季度毛利率波动，重点解释促销投放和商品结构变化。",
    outputSummary: "当前 run 已记录毛利率复盘问题，并进入上下文绑定。",
    runId: marginRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "记录从 Reports 结论继续追问的当前问题。",
    timestampText: "10:15",
    title: "1. 接收用户问题"
  }),
  createRunEvent({
    detail:
      "当前 run 绑定 Reports / Margin、毛利率复盘和 This quarter 静态上下文，保留来源对象、时间窗口和 Workspace 信息。",
    durationText: "0.9s",
    eventId: "event-analysis-margin-follow-up-context-bound",
    eventType: "context_bound",
    inputSummary: "Reports / Margin · 毛利率复盘 · This quarter",
    outputSummary: "已带着报告复盘背景进入当前会话。",
    runId: marginRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "绑定 Reports 上下文和本季度时间窗口。",
    timestampText: "10:15",
    title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
  }),
  createRunEvent({
    detail:
      "解析上一轮报告结论，准备拆分促销投放与商品结构影响。当前只展示标准化计划说明，不展示真实规划 state。",
    durationText: "1.4s",
    eventId: "event-analysis-margin-follow-up-plan-created",
    eventType: "plan_created",
    inputSummary: "聚焦促销折扣、商品结构和华南区域差异。",
    outputSummary: "形成促销折扣与商品结构拆解计划，并保留区域继续追问入口。",
    runId: marginRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "根据上一轮报告结论生成新的拆解计划。",
    timestampText: "10:16",
    title: "3. 生成分析计划"
  }),
  createRunEvent({
    detail:
      "当前只做静态权限和上下文范围检查，确认可使用指标摘要和证据说明入口，但不执行真实权限校验。",
    durationText: "0.7s",
    eventId: "event-analysis-margin-follow-up-permission-check",
    eventType: "permission_check",
    inputSummary: "核对 Margin 复盘上下文可访问的静态工具入口。",
    outputSummary: "当前 run 允许继续查看静态指标对比和证据说明。",
    riskViewModel: lowRisk,
    runId: marginRun.runId,
    status: "succeeded",
    statusViewModel: successStatus,
    summary: "检查当前追问上下文可用的静态工具入口。",
    timestampText: "10:17",
    title: "4. 检查工具权限"
  }),
  createRunEvent({
    costText: "¥0.17",
    detail:
      "当前处于静态进行中阶段，只展示促销折扣和商品结构对比意图，不读取真实 Metrics API，也不展示底层对比原始结果。",
    durationText: "2.8s",
    eventId: "event-analysis-margin-follow-up-tool-call-metrics",
    eventType: "tool_call",
    inputSummary: "对比促销折扣强度、商品结构变化和区域毛利率波动。",
    outputSummary: "当前只返回阶段性对比意图，尚未收敛为最终归因。",
    runId: marginRun.runId,
    status: "running",
    statusViewModel: loadingStatus,
    summary: "调用静态指标摘要工具，准备拆分促销与商品结构影响。",
    timestampText: "10:18",
    title: "5. 调用指标摘要工具",
    tokenUsageText: "2,840",
    toolName: "metrics.margin.compare"
  }),
  createRunEvent({
    detail:
      "引用毛利率复盘和商品结构指标的静态证据摘要。Evidence 仍停留在标准化说明层，不展示 raw retrieval 结果。",
    durationText: "1.9s",
    eventId: "event-analysis-margin-follow-up-evidence-retrieval",
    eventType: "evidence_retrieval",
    evidenceRefs: ["evidence/margin-report-q2", "evidence/product-mix-q2"],
    inputSummary: "召回毛利率复盘和商品结构相关证据。",
    outputSummary: "当前证据支持继续拆分促销与商品结构，但不足以得出最终结论。",
    riskViewModel: mediumRisk,
    runId: marginRun.runId,
    status: "running",
    statusViewModel: loadingStatus,
    summary: "补充毛利率复盘和商品结构证据引用。",
    timestampText: "10:19",
    title: "6. 召回 Evidence / RAG 来源"
  }),
  createRunEvent({
    costText: "¥0.29",
    detail:
      "输出阶段性判断，但结论尚未收敛。这里只展示标准化后的阶段性摘要，不暴露模型原始推理或原始输出。",
    durationText: "1.2s",
    eventId: "event-analysis-margin-follow-up-summary-generated",
    eventType: "summary_generated",
    inputSummary: "整合当前指标对比与证据说明，输出阶段性毛利率归因判断。",
    modelName: "gpt-4.1-static",
    outputSummary: "阶段性判断倾向于促销档期重叠，但仍需补充区域与时间窗口拆解。",
    riskViewModel: mediumRisk,
    runId: marginRun.runId,
    status: "running",
    statusViewModel: warningStatus,
    summary: "生成阶段性摘要，并明确当前结论仍未收敛。",
    timestampText: "10:20",
    title: "7. 生成分析摘要",
    tokenUsageText: "4,180"
  }),
  createRunEvent({
    detail:
      "等待进一步追问或反馈。本地提交只更新当前 Analysis UI State，不会创建真实多轮分析、streaming 或轮询。",
    durationText: "0.6s",
    eventId: "event-analysis-margin-follow-up-feedback-waiting",
    eventType: "feedback_waiting",
    inputSummary: "等待用户继续拆分促销折扣、商品结构或区域差异。",
    outputSummary: "保留当前 conversation 和 run，不离开 Analysis 页面。",
    riskViewModel: mediumRisk,
    runId: marginRun.runId,
    status: "pending",
    statusViewModel: loadingStatus,
    summary: "等待继续追问，保持当前 run 处于阶段性进行中。",
    timestampText: "10:20",
    title: "8. 等待用户追问 / 反馈"
  })
];

const marginToolDetails = [
  createToolDetail({
    runId: marginRun.runId,
    statusViewModel: loadingStatus,
    summary: "静态拆分促销折扣、商品结构和区域差异的毛利率指标对比。",
    toolCallId: "tool-call-analysis-margin-follow-up-metrics",
    toolName: "metrics.margin.compare"
  })
];

const marginSourceEvidence = [
  createSourceEvidence({
    runId: marginRun.runId,
    sourceEvidenceId: "source-evidence-margin-report-q2",
    sourceType: "knowledge_document",
    summary: "毛利率复盘摘要提供当前季度异常背景。",
    title: "毛利率复盘报告"
  }),
  createSourceEvidence({
    runId: marginRun.runId,
    sourceEvidenceId: "source-evidence-product-mix-q2",
    sourceType: "metric",
    summary: "商品结构指标摘要提示需要继续拆分促销和结构影响。",
    title: "商品结构指标"
  })
];

const marginResultSummary = createResultSummary({
  actionSuggestions: [
    "继续拆分促销折扣与商品结构影响。",
    "回到 Reports 对齐上一轮复盘口径。",
    "将下一步追问限定在华南区域。"
  ],
  conclusion: "当前阶段判断倾向于促销档期重叠导致毛利率波动，但结论尚未收敛。",
  evidenceSummary: "阶段性结论只由静态会话说明构成，不代表真实分析产出。",
  findingBullets: [
    "促销与商品结构因素仍存在耦合。",
    "需要进一步拆分区域和时间窗口。",
    "当前更适合作为追问入口，而不是最终结论。"
  ],
  key: "result-margin",
  riskViewModel: mediumRisk,
  statusViewModel: warningStatus,
  title: "阶段性结果摘要"
});

const marginSession: AnalysisSessionViewModel = {
  contextPack: marginContextPack,
  currentRun: marginRun,
  followUpComposer: {
    contextHint: "沿用当前会话上下文继续补充追问，不做真实多轮请求。",
    helperText: "继续追问只更新静态摘要和本地提示。",
    initialDraft: "把折扣投放和商品结构拆开看，哪个影响更大？",
    key: "follow-up-margin",
    placeholder: "补充追问当前会话，例如要求拆分促销与商品结构影响。",
    submitLabel: "继续追问",
    suggestions: [
      { key: "follow-up-margin-discount", label: "拆开促销折扣和商品结构" },
      { key: "follow-up-margin-region", label: "补看华南区域差异" }
    ],
    title: "后续追问"
  },
  inputComposer: {
    contextHint: "支持带着报告结论进入 Analysis，但本次不接真实报告对象。",
    helperText: "静态输入只演示会话化分析入口。",
    initialDraft: "复盘本季度毛利率波动，重点解释促销投放和商品结构变化。",
    key: "analysis-input-margin",
    placeholder: "描述要继续分析的毛利率问题。",
    submitLabel: "发起分析",
    suggestions: [
      { key: "analysis-margin-promo", label: "促销是否是毛利率波动主因？" },
      { key: "analysis-margin-region", label: "比较不同区域毛利率变化。" }
    ],
    title: "分析任务输入区"
  },
  memoryContext: createMemoryContext({
    memoryItemId: "memory-margin-review-context",
    summary: "保留报告复盘口径，方便继续限定促销与商品结构问题。",
    title: "报告复盘口径记忆"
  }),
  messages: createMessages({
    contextPack: marginContextPack,
    resultSummary: marginResultSummary,
    runId: marginRun.runId,
    sessionId: "session-margin-follow-up",
    sourceEvidenceIds: marginSourceEvidence.map((sourceEvidence) => sourceEvidence.sourceEvidenceId),
    toolDetails: marginToolDetails,
    userPrompt: "复盘本季度毛利率波动，重点解释促销投放和商品结构变化。"
  }),
  reportPreview: createReportPreview({
    reportId: "report-margin-follow-up-preview",
    runId: marginRun.runId,
    summary: "当前阶段性结论可回写为报告补充，但暂不建议定稿。",
    title: "毛利率补充报告预览"
  }),
  resultSummary: marginResultSummary,
  runEvents: marginRunEvents,
  sessionId: "session-margin-follow-up",
  sessionSummary: createSessionSummary({
    contextLabel: "Reports / Margin",
    riskViewModel: mediumRisk,
    runLabel: `Run: ${marginRun.runId}`,
    sessionId: "session-margin-follow-up",
    statusViewModel: loadingStatus,
    summary: "从 Reports 结论继续追问毛利率波动归因。",
    title: "毛利率波动复盘",
    updatedAtText: "2 分钟前"
  }),
  sourceEvidence: marginSourceEvidence,
  toolDetails: marginToolDetails
};

const stockoutContextPack = createContextPack({
  sourceObject: "缺货率异常",
  sourceRoute: "Metrics / Stockout",
  timeRange: "Last 12 hours",
  workspace: "Northstar Retail China"
});

const stockoutRun = createRun({
  costText: "¥0.39",
  errorSummaryText: "1 blocking / 2 warnings",
  riskViewModel: highRisk,
  runId: "analysis-stockout-risk",
  stageSummary: "Evidence 存在冲突，当前只展示风险提示和下一步追问入口。",
  status: "waiting_approval",
  statusViewModel: warningStatus,
  tokenUsageText: "6,140",
  totalDurationText: "6.8s",
  updatedAtText: "更新于 09:46"
});

const stockoutRunEvents: AnalysisRunEvent[] = [
  createRunEvent({
    detail:
      "用户围绕北区缺货率异常与补货任务冲突发起追问。当前阶段只记录标准化后的问题摘要，不创建真实告警或真实 Agent Run。",
    durationText: "0.6s",
    eventId: "event-analysis-stockout-risk-user-input",
    eventType: "user_input",
    inputSummary: "解释北区缺货率异常与补货任务冲突的关系。",
    outputSummary: "当前 run 已记录风险调查问题，并进入上下文绑定阶段。",
    runId: stockoutRun.runId,
    status: "succeeded",
    statusViewModel: warningStatus,
    summary: "记录库存异常调查问题，并标记当前 run 为风险调查入口。",
    timestampText: "09:42",
    title: "1. 接收用户问题"
  }),
  createRunEvent({
    detail:
      "绑定 Metrics / Stockout、缺货率异常和 Last 12 hours 静态上下文。当前只展示标准化上下文摘要，不把局部 key 升格为共享业务 ID。",
    durationText: "0.9s",
    eventId: "event-analysis-stockout-risk-context-bound",
    eventType: "context_bound",
    inputSummary: "Metrics / Stockout · 缺货率异常 · Last 12 hours",
    outputSummary: "当前 run 已定位到指标异常入口和最近 12 小时时间窗口。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "succeeded",
    statusViewModel: warningStatus,
    summary: "绑定指标异常上下文，并标记当前 run 的风险级别较高。",
    timestampText: "09:42",
    title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
  }),
  createRunEvent({
    detail:
      "已识别异常入口，但由于门店反馈与补货任务摘要冲突，当前计划停留在风险提示阶段，不继续扩展为确定性归因计划。",
    durationText: "1.0s",
    errorType: "conflicting_evidence",
    eventId: "event-analysis-stockout-risk-plan-created",
    eventType: "plan_created",
    inputSummary: "围绕门店反馈、补货任务和时间线冲突做异常调查。",
    outputSummary: "当前只保留风险提示、追问入口和治理/观测承接位。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "failed",
    statusViewModel: riskStatus,
    summary: "生成风险调查计划，但因证据冲突停留在审慎阶段。",
    timestampText: "09:42",
    title: "3. 生成分析计划"
  }),
  createRunEvent({
    detail:
      "当前只做静态权限检查，不触发真实工具调用、治理动作或 SQL Guard。风险仍然保留在当前 run 的标准化摘要里。",
    durationText: "0.7s",
    eventId: "event-analysis-stockout-risk-permission-check",
    eventType: "permission_check",
    inputSummary: "核对异常调查可用的静态治理与观测入口。",
    outputSummary: "保留 Observability 和 Bad Case 候选入口，但不执行真实动作。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "succeeded",
    statusViewModel: warningStatus,
    summary: "检查风险调查可用的静态治理与观测入口。",
    timestampText: "09:44",
    title: "4. 检查工具权限"
  }),
  createRunEvent({
    costText: "¥0.11",
    detail:
      "静态展示指标异常入口和补货任务对比，不读取真实 Metrics API，也不展示底层任务原始字段。",
    durationText: "1.6s",
    eventId: "event-analysis-stockout-risk-tool-call-metrics",
    eventType: "tool_call",
    inputSummary: "对比缺货率异常、补货任务节奏与门店反馈时间线。",
    outputSummary: "当前对比结果提示异常存在，但不足以支撑确定性归因。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "succeeded",
    statusViewModel: warningStatus,
    summary: "调用静态指标摘要工具，对比缺货异常与补货任务节奏。",
    timestampText: "09:45",
    title: "5. 调用指标摘要工具",
    tokenUsageText: "1,960",
    toolName: "metrics.stockout.compare"
  }),
  createRunEvent({
    detail:
      "门店反馈与补货任务摘要存在冲突，Evidence 仅保留风险说明和标准化引用，不展示原始文档或原始检索内容。",
    durationText: "1.0s",
    errorType: "conflicting_evidence",
    eventId: "event-analysis-stockout-risk-evidence-retrieval",
    eventType: "evidence_retrieval",
    evidenceRefs: ["evidence/store-feedback-north-12h", "evidence/restock-job-north-12h"],
    inputSummary: "召回门店反馈与补货任务摘要，核对两者是否一致。",
    outputSummary: "证据仍然冲突，当前只保留调查和治理入口。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "failed",
    statusViewModel: warningStatus,
    summary: "召回相互冲突的证据引用，并维持风险提示。",
    timestampText: "09:46",
    title: "6. 召回 Evidence / RAG 来源"
  }),
  createRunEvent({
    costText: "¥0.28",
    detail:
      "当前只输出审慎结论和下一步建议，不输出确定性归因。这里只展示标准化风险摘要，不暴露模型原始输出。",
    durationText: "0.7s",
    errorType: "conflicting_evidence",
    eventId: "event-analysis-stockout-risk-summary-generated",
    eventType: "summary_generated",
    inputSummary: "整合异常指标、补货任务和门店反馈冲突信息。",
    modelName: "gpt-4.1-static",
    outputSummary: "建议优先保留治理和观测入口，延后做确定性结论。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "failed",
    statusViewModel: riskStatus,
    summary: "生成审慎结论和下一步调查建议，不输出确定性归因。",
    timestampText: "09:46",
    title: "7. 生成分析摘要",
    tokenUsageText: "4,180"
  }),
  createRunEvent({
    detail:
      "等待进一步追问、问题标记或 Bad Case 候选确认，不触发真实告警、真实报告沉淀或真实平台动作。",
    durationText: "0.3s",
    eventId: "event-analysis-stockout-risk-feedback-waiting",
    eventType: "feedback_waiting",
    inputSummary: "等待用户继续缩小门店范围，或确认是否升级为 Bad Case 候选。",
    outputSummary: "当前 conversation 与 run 保持不变，仍停留在 Analysis 页面。",
    riskViewModel: highRisk,
    runId: stockoutRun.runId,
    status: "pending",
    statusViewModel: warningStatus,
    summary: "等待进一步追问、问题标记或 Bad Case 候选确认。",
    timestampText: "09:46",
    title: "8. 等待用户追问 / 反馈"
  })
];

const stockoutToolDetails = [
  createToolDetail({
    runId: stockoutRun.runId,
    statusViewModel: warningStatus,
    summary: "静态对比缺货率异常、补货任务节奏和门店反馈时间线。",
    toolCallId: "tool-call-analysis-stockout-risk-metrics",
    toolName: "metrics.stockout.compare"
  })
];

const stockoutSourceEvidence = [
  createSourceEvidence({
    runId: stockoutRun.runId,
    sourceEvidenceId: "source-evidence-store-feedback-north-12h",
    sourceType: "knowledge_document",
    summary: "门店反馈摘要说明北区缺货问题持续升高。",
    title: "北区门店反馈"
  }),
  createSourceEvidence({
    runId: stockoutRun.runId,
    sourceEvidenceId: "source-evidence-restock-job-north-12h",
    sourceType: "analysis_memory",
    summary: "补货任务摘要与门店反馈存在时序冲突，需保留治理入口。",
    title: "补货任务摘要"
  })
];

const stockoutResultSummary = createResultSummary({
  actionSuggestions: [
    "先核对补货任务与门店反馈时间线。",
    "在 Observability 中保留后续 Trace 追踪入口。",
    "必要时将该会话标记为 Bad Case 候选。"
  ],
  conclusion: "当前证据存在冲突，结论应保持审慎，优先保留治理和观测入口。",
  evidenceSummary: "结果摘要只表达风险和下一步动作，不输出确定性归因。",
  findingBullets: [
    "门店反馈与补货任务摘要之间存在不一致。",
    "当前更适合作为异常调查入口，而不是闭环结论。",
    "后续需要治理和观测链路辅助定位。"
  ],
  key: "result-stockout",
  riskViewModel: highRisk,
  statusViewModel: riskStatus,
  title: "风险结果摘要"
});

const stockoutSession: AnalysisSessionViewModel = {
  contextPack: stockoutContextPack,
  currentRun: stockoutRun,
  followUpComposer: {
    contextHint: "继续追问只调整静态文本，不做真实告警或任务分派。",
    helperText: "适合继续限定门店范围或补货时段。",
    initialDraft: "门店反馈与补货任务为什么会出现冲突？",
    key: "follow-up-stockout",
    placeholder: "继续追问当前异常，例如限定门店、补货节奏或任务窗口。",
    submitLabel: "继续追问",
    suggestions: [
      { key: "follow-up-stockout-store", label: "限定北区重点门店" },
      { key: "follow-up-stockout-job", label: "核对补货任务节奏" }
    ],
    title: "后续追问"
  },
  inputComposer: {
    contextHint: "支持带着指标异常进入 Analysis，但不会自动运行 Agent。",
    helperText: "静态问题输入仅承接异常背景，不发真实请求。",
    initialDraft: "解释北区缺货率异常与补货任务冲突的关系。",
    key: "analysis-input-stockout",
    placeholder: "描述要进一步确认的异常问题。",
    submitLabel: "发起分析",
    suggestions: [
      { key: "analysis-stockout-store", label: "哪些门店最受影响？" },
      { key: "analysis-stockout-job", label: "补货任务是否存在延迟？" }
    ],
    title: "分析任务输入区"
  },
  memoryContext: createMemoryContext({
    memoryItemId: "memory-stockout-investigation",
    summary: "保留异常调查边界和冲突证据说明，避免过早给出确定性归因。",
    title: "异常调查约束记忆"
  }),
  messages: createMessages({
    contextPack: stockoutContextPack,
    resultSummary: stockoutResultSummary,
    runId: stockoutRun.runId,
    sessionId: "session-stockout-risk",
    sourceEvidenceIds: stockoutSourceEvidence.map(
      (sourceEvidence) => sourceEvidence.sourceEvidenceId
    ),
    toolDetails: stockoutToolDetails,
    userPrompt: "解释北区缺货率异常与补货任务冲突的关系。"
  }).map((message) =>
    message.role === "assistant"
      ? {
          ...message,
          sourceRefs: stockoutSourceEvidence.map((sourceEvidence) => sourceEvidence.sourceEvidenceId),
          status: "failed"
        }
      : message
  ),
  resultSummary: stockoutResultSummary,
  runEvents: stockoutRunEvents,
  sessionId: "session-stockout-risk",
  sessionSummary: createSessionSummary({
    contextLabel: "Metrics / Stockout",
    riskViewModel: highRisk,
    runLabel: `Run: ${stockoutRun.runId}`,
    sessionId: "session-stockout-risk",
    statusViewModel: warningStatus,
    summary: "围绕缺货率异常保留观测和治理入口，不自动升级为真实告警。",
    title: "库存异常定位",
    updatedAtText: "15 分钟前"
  }),
  sourceEvidence: stockoutSourceEvidence,
  toolDetails: stockoutToolDetails
};

export const analysisStaticViewModel: AnalysisWorkspaceViewModel = {
  contextPanelNote:
    "当前 Analysis 只承接静态会话和静态 ViewModel。切换会话、提交问题、继续追问和反馈标记都只更新页面级 UI State，不触发真实 API、Agent、Tool、RAG 或 Trace 订阅。",
  modelOptions: analysisModelOptions,
  sessions: [revenueSession, marginSession, stockoutSession]
};
