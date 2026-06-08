import { createRightAssistSummary, defaultPermissionSummary, defaultReadonlyState, defaultStateCoverage, readyStatus, warningRisk } from "../../../app/fixtures/staticStateFixtures";
import type { StaticRiskViewModel, StaticSectionViewModel, StaticStatusViewModel } from "../../../app/models/staticViewModelTypes";
import type { AnalysisRunTraceViewModel, AnalysisViewModel } from "../models/analysisViewModel";

const successStatus: StaticStatusViewModel = {
  labelKey: "state.success.default.title",
  status: "success"
};

const loadingStatus: StaticStatusViewModel = {
  labelKey: "state.loading.default.title",
  status: "loading"
};

const warningStateStatus: StaticStatusViewModel = {
  labelKey: "state.warning.default.title",
  status: "warning"
};

const riskStateStatus: StaticStatusViewModel = {
  labelKey: "state.risk.default.title",
  status: "risk"
};

const lowRisk: StaticRiskViewModel = {
  level: "low",
  titleKey: "risk.low.title"
};

const mediumRisk: StaticRiskViewModel = {
  level: "medium",
  titleKey: "risk.medium.title"
};

const highRisk: StaticRiskViewModel = {
  level: "high",
  title: "高风险"
};

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
}) {
  return {
    sourceObject,
    sourceRoute,
    stripText: `来自 ${sourceRoute} · ${sourceObject} · ${timeRange}`,
    systemText: `当前从 ${sourceRoute} 带上下文进入 Analysis，本阶段只更新本地 UI State。`,
    timeRange,
    workspace
  };
}

function createRunTrace({
  costText,
  errorSummaryText,
  events,
  key,
  risk,
  runId,
  stageSummary,
  status,
  tokenUsageText,
  totalDurationText,
  updatedAtText
}: {
  costText: string;
  errorSummaryText: string;
  events: AnalysisRunTraceViewModel["events"];
  key: string;
  risk?: StaticRiskViewModel;
  runId: string;
  stageSummary: string;
  status: StaticStatusViewModel;
  tokenUsageText: string;
  totalDurationText: string;
  updatedAtText: string;
}) {
  return {
    costText,
    errorSummaryText,
    events,
    key,
    risk,
    runId,
    stageSummary,
    status,
    tokenUsageText,
    totalDurationText,
    updatedAtText
  };
}

const analysisSections: StaticSectionViewModel[] = [
  {
    descriptionKey: "page.analysis.section.conversation.description",
    key: "conversation",
    status: readyStatus,
    titleKey: "page.analysis.section.conversation.title"
  },
  {
    descriptionKey: "page.analysis.section.runtime.description",
    key: "runtime",
    status: readyStatus,
    titleKey: "page.analysis.section.runtime.title"
  },
  {
    descriptionKey: "page.analysis.section.evidence.description",
    key: "evidence",
    status: readyStatus,
    titleKey: "page.analysis.section.evidence.title"
  },
  {
    descriptionKey: "page.analysis.section.outcome.description",
    key: "outcome",
    status: readyStatus,
    titleKey: "page.analysis.section.outcome.title"
  }
];

export const analysisStaticViewModel: AnalysisViewModel = {
  analysisState: defaultStateCoverage.ready,
  contextPanelNote:
    "当前 Analysis 只承接静态会话和静态 ViewModel。切换会话、提交问题、继续追问和反馈标记都只更新页面级 UI State，不触发真实 API、Agent、Tool、RAG 或 Trace 订阅。",
  gapNote:
    "Analysis 当前只落静态 UI、静态 ViewModel 和页面交互示意。未来会接入 Agent Run、Tool Calling、Trace 和 Evidence，但本次不实现真实运行链路。",
  implementationStatus: "gap",
  lastUpdatedAt: "2026-06-05T11:40:00+08:00",
  mainSections: analysisSections,
  metricCards: [],
  pageDescriptionKey: "page.analysis.description",
  pageKey: "analysis",
  pageTitleKey: "page.analysis.title",
  permissionSummary: defaultPermissionSummary,
  primaryAction: {
    intent: "navigation",
    key: "analysis-open-reports",
    labelKey: "action.analysisOpenReports.label",
    targetRoute: "reports"
  },
  readonlyState: defaultReadonlyState,
  rightAssistSummary: createRightAssistSummary(
    "analysis-right-assist",
    "page.analysis.rightAssist.title",
    "page.analysis.rightAssist.description"
  ),
  secondaryActions: [
    {
      intent: "navigation",
      key: "analysis-open-observability",
      labelKey: "action.analysisOpenObservability.label",
      targetRoute: "observability"
    }
  ],
  sessions: [
    {
      contextPack: createContextPack({
        sourceObject: "收入增速异常",
        sourceRoute: "Dashboard / Revenue",
        timeRange: "Last 30 days",
        workspace: "Northstar Retail China"
      }),
      followUpComposer: {
        contextHint: "继续追问会沿用当前静态会话上下文，但不会发起真实多轮请求。",
        helperText: "追问输入只做本地 UI 联动，不创建真实消息流或 streaming。",
        initialDraft: "如果只观察最近 7 天，这个异常是否仍然明显？",
        key: "follow-up-revenue-gap",
        placeholder: "继续追问当前结论，例如要求拆分渠道、库存或时间范围。",
        submitLabel: "继续追问",
        suggestions: [
          {
            key: "follow-up-split-channel",
            label: "拆分华东与华南渠道差异"
          },
          {
            key: "follow-up-split-window",
            label: "比较最近 7 天与最近 30 天"
          },
          {
            key: "follow-up-cfo-brief",
            label: "整理给经营周会的后续动作"
          }
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
          {
            key: "analysis-suggestion-revenue-gap",
            label: "为什么本季度收入增速低于阈值？"
          },
          {
            key: "analysis-suggestion-channel-stock",
            label: "请结合渠道与库存解释异常。"
          },
          {
            key: "analysis-suggestion-board-summary",
            label: "生成面向经营周会的结论摘要。"
          }
        ],
        title: "分析任务输入区"
      },
      key: "session-revenue-gap-q2",
      resultSummary: {
        actionSuggestions: [
          "先核对华东渠道确认周期与促销库存节奏。",
          "在 Metrics 中复查收入增速阈值和区域拆分口径。",
          "将当前结论沉淀为周经营报告入口，供后续追问复用。"
        ],
        conclusion:
          "收入增速下滑主要来自华东核心渠道确认延迟与促销库存错配，而不是整体价格体系失效。",
        evidenceSummary: "结论来自指标阈值、渠道周报和库存说明的静态聚合，不展示模型原始输出。",
        findingBullets: [
          "异常集中在华东渠道，并未在其他区域同步放大。",
          "库存与确认周期错位放大了周度收入波动。",
          "最近报告已沉淀部分背景，可直接作为后续分析和报告入口。"
        ],
        key: "result-revenue-gap",
        risk: mediumRisk,
        status: successStatus,
        title: "结果摘要"
      },
      runTrace: createRunTrace({
        costText: "¥0.86",
        errorSummaryText: "0 blocking / 1 warning",
        events: [
          {
            detail:
              "用户在 Analysis 会话里发起收入异常追问。当前阶段只记录标准化静态问题摘要，不创建真实消息流或真实 Agent Run。",
            durationText: "0.4s",
            eventId: "event-analysis-q2-revenue-gap-user-input",
            eventType: "user_input",
            inputSummary: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
            key: "run-trace-revenue-question",
            outputSummary: "静态记录问题摘要，并进入当前 run 的上下文绑定阶段。",
            status: successStatus,
            summary: "记录当前用户问题，并为后续 run trace 生成起点。",
            timestampText: "11:08",
            title: "1. 接收用户问题"
          },
          {
            detail:
              "将 Dashboard / Revenue、收入增速异常和 Last 30 days 静态上下文绑定到当前 run。这里只展示标准化后的上下文摘要，不拼接 raw route state。",
            durationText: "1.1s",
            eventId: "event-analysis-q2-revenue-gap-context-bound",
            eventType: "context_bound",
            inputSummary: "Dashboard / Revenue · 收入增速异常 · Last 30 days",
            key: "run-trace-revenue-context",
            outputSummary: "当前 run 已具备 Workspace、来源对象和时间窗口上下文。",
            risk: mediumRisk,
            status: successStatus,
            summary: "绑定当前 Workspace、来源页面和时间窗口，为后续计划生成提供上下文。",
            timestampText: "11:08",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            detail:
              "当前阶段根据问题、约束和上下文来源生成静态分析计划，只展示标准化计划摘要，不展示 LangGraph raw state。",
            durationText: "1.5s",
            eventId: "event-analysis-q2-revenue-gap-plan-created",
            eventType: "plan_created",
            inputSummary: "收入异常归因 + 渠道/库存拆解 + 经营周会建议",
            key: "run-trace-revenue-plan",
            outputSummary: "形成指标比对、证据召回和摘要生成三段式静态计划。",
            status: successStatus,
            summary: "识别问题与约束，生成当前 run 的静态分析计划。",
            timestampText: "11:09",
            title: "3. 生成分析计划"
          },
          {
            detail:
              "当前只做静态权限摘要检查，确认 Metrics、Evidence 和 Reports 入口可用，但不执行真实 Tool Calling 或治理动作。",
            durationText: "0.8s",
            eventId: "event-analysis-q2-revenue-gap-permission-check",
            eventType: "permission_check",
            inputSummary: "核对 Metrics / Evidence / Reports 静态入口权限",
            key: "run-trace-revenue-permission",
            outputSummary: "当前 run 可继续使用静态指标摘要与证据说明能力。",
            risk: lowRisk,
            status: successStatus,
            summary: "检查当前 run 可用的静态工具入口和权限说明。",
            timestampText: "11:10",
            title: "4. 检查工具权限"
          },
          {
            costText: "¥0.22",
            detail:
              "以静态 ViewModel 展示收入增速阈值摘要和区域对比结果，不读取真实 Metrics API，也不展示底层原始指标返回。",
            durationText: "4.1s",
            eventId: "event-analysis-q2-revenue-gap-tool-call-metrics",
            eventType: "tool_call",
            inputSummary: "比较华东与其他区域的收入增速阈值、确认周期和库存节奏。",
            key: "run-trace-revenue-metrics",
            outputSummary: "华东渠道确认延迟明显，其他区域未同步放大，当前异常集中在单一区域。",
            status: successStatus,
            summary: "调用静态指标摘要工具，对比区域收入增速与阈值差异。",
            timestampText: "11:10",
            tokenUsageText: "3,420",
            toolName: "metrics.summary.compare",
            title: "5. 调用指标摘要工具"
          },
          {
            detail:
              "召回渠道周报与库存说明的静态证据摘要，Evidence 只保留标准化来源引用，不展示原始文档片段或 raw retrieval payload。",
            durationText: "5.8s",
            eventId: "event-analysis-q2-revenue-gap-evidence-retrieval",
            eventType: "evidence_retrieval",
            evidenceRefs: ["evidence/channel-weekly-17", "evidence/inventory-note-east-04"],
            inputSummary: "召回华东渠道周报和库存说明，验证异常是否由价格体系失效引起。",
            key: "run-trace-revenue-evidence",
            outputSummary: "渠道周报与库存说明均支持“确认延迟 + 库存错配”的静态归因方向。",
            risk: mediumRisk,
            status: successStatus,
            summary: "补充渠道周报与库存说明的静态证据引用。",
            timestampText: "11:18",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            costText: "¥0.41",
            detail:
              "基于指标摘要和证据引用生成收入异常结论、关键发现和下一步建议。这里只展示标准化结论摘要，不暴露模型原始输出。",
            durationText: "3.2s",
            eventId: "event-analysis-q2-revenue-gap-summary-generated",
            eventType: "summary_generated",
            inputSummary: "整合指标摘要、证据引用和经营周会导向的表达要求。",
            key: "run-trace-revenue-summary",
            modelName: "gpt-4.1-static",
            outputSummary: "形成“确认延迟 + 库存错配”主结论，并给出渠道和库存复核动作。",
            risk: mediumRisk,
            status: successStatus,
            summary: "生成当前 run 的结论、关键发现和下一步建议。",
            timestampText: "11:22",
            tokenUsageText: "7,960",
            title: "7. 生成分析摘要"
          },
          {
            detail:
              "当前会话停留在本地追问、反馈标记和报告入口占位阶段，不触发真实 Agent 续跑、真实反馈写入或真实报告生成。",
            durationText: "1.3s",
            eventId: "event-analysis-q2-revenue-gap-feedback-waiting",
            eventType: "feedback_waiting",
            inputSummary: "等待用户继续追问、反馈或进入报告入口。",
            key: "run-trace-revenue-follow-up",
            outputSummary: "保持当前 conversation 和 run，不刷新页面，不改变 URL。",
            status: successStatus,
            summary: "等待用户进一步追问、反馈或报告动作。",
            timestampText: "11:24",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-revenue-gap",
        risk: mediumRisk,
        runId: "analysis-q2-revenue-gap",
        stageSummary: "已完成问题拆解、指标比对、证据归并和建议动作整理。",
        status: successStatus,
        tokenUsageText: "12,480",
        totalDurationText: "18.2s",
        updatedAtText: "更新于 11:24"
      }),
      session: {
        contextLabel: "Dashboard / Revenue",
        key: "session-summary-revenue-gap",
        risk: mediumRisk,
        runLabel: "Run: analysis-q2-revenue-gap",
        status: successStatus,
        summary: "围绕 Dashboard 收入异常做渠道和时间窗口追问。",
        title: "Q2 收入异常追问",
        updatedAtText: "刚刚更新"
      }
    },
    {
      contextPack: createContextPack({
        sourceObject: "毛利率复盘",
        sourceRoute: "Reports / Margin",
        timeRange: "This quarter",
        workspace: "Northstar Retail China"
      }),
      followUpComposer: {
        contextHint: "沿用当前会话上下文继续补充追问，不做真实多轮请求。",
        helperText: "继续追问只更新静态摘要和本地提示。",
        initialDraft: "把折扣投放和商品结构拆开看，哪个影响更大？",
        key: "follow-up-margin",
        placeholder: "补充追问当前会话，例如要求拆分促销与商品结构影响。",
        submitLabel: "继续追问",
        suggestions: [
          {
            key: "follow-up-margin-discount",
            label: "拆开促销折扣和商品结构"
          },
          {
            key: "follow-up-margin-region",
            label: "补看华南区域差异"
          }
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
          {
            key: "analysis-margin-promo",
            label: "促销是否是毛利率波动主因？"
          },
          {
            key: "analysis-margin-region",
            label: "比较不同区域毛利率变化。"
          }
        ],
        title: "分析任务输入区"
      },
      key: "session-margin-follow-up",
      resultSummary: {
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
        risk: mediumRisk,
        status: warningStateStatus,
        title: "阶段性结果摘要"
      },
      runTrace: createRunTrace({
        costText: "¥0.61",
        errorSummaryText: "0 blocking / 1 warning",
        events: [
          {
            detail:
              "用户从 Reports / Margin 上下文进入 Analysis，发起毛利率波动复盘。当前阶段只记录标准化问题摘要，不读取真实报告对象。",
            durationText: "0.5s",
            eventId: "event-analysis-margin-follow-up-user-input",
            eventType: "user_input",
            inputSummary: "复盘本季度毛利率波动，重点解释促销投放和商品结构变化。",
            key: "run-trace-margin-question",
            outputSummary: "当前 run 已记录毛利率复盘问题，并进入上下文绑定。",
            status: successStatus,
            summary: "记录从 Reports 结论继续追问的当前问题。",
            timestampText: "10:15",
            title: "1. 接收用户问题"
          },
          {
            detail:
              "当前 run 绑定 Reports / Margin、毛利率复盘和 This quarter 静态上下文，保留来源对象、时间窗口和 Workspace 信息。",
            durationText: "0.9s",
            eventId: "event-analysis-margin-follow-up-context-bound",
            eventType: "context_bound",
            inputSummary: "Reports / Margin · 毛利率复盘 · This quarter",
            key: "run-trace-margin-context",
            outputSummary: "已带着报告复盘背景进入当前会话。",
            status: successStatus,
            summary: "绑定 Reports 上下文和本季度时间窗口。",
            timestampText: "10:15",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            detail:
              "解析上一轮报告结论，准备拆分促销投放与商品结构影响。当前只展示标准化计划说明，不展示真实规划 state。",
            durationText: "1.4s",
            eventId: "event-analysis-margin-follow-up-plan-created",
            eventType: "plan_created",
            inputSummary: "聚焦促销折扣、商品结构和华南区域差异。",
            key: "run-trace-margin-plan",
            outputSummary: "形成促销折扣与商品结构拆解计划，并保留区域继续追问入口。",
            status: successStatus,
            summary: "根据上一轮报告结论生成新的拆解计划。",
            timestampText: "10:16",
            title: "3. 生成分析计划"
          },
          {
            detail:
              "当前只做静态权限和上下文范围检查，确认可使用指标摘要和证据说明入口，但不执行真实权限校验。",
            durationText: "0.7s",
            eventId: "event-analysis-margin-follow-up-permission-check",
            eventType: "permission_check",
            inputSummary: "核对 Margin 复盘上下文可访问的静态工具入口。",
            key: "run-trace-margin-permission",
            outputSummary: "当前 run 允许继续查看静态指标对比和证据说明。",
            risk: lowRisk,
            status: successStatus,
            summary: "检查当前追问上下文可用的静态工具入口。",
            timestampText: "10:17",
            title: "4. 检查工具权限"
          },
          {
            costText: "¥0.17",
            detail:
              "当前处于静态进行中阶段，只展示促销折扣和商品结构对比意图，不读取真实 Metrics API，也不展示底层对比原始结果。",
            durationText: "2.8s",
            eventId: "event-analysis-margin-follow-up-tool-call-metrics",
            eventType: "tool_call",
            inputSummary: "对比促销折扣强度、商品结构变化和区域毛利率波动。",
            key: "run-trace-margin-metrics",
            outputSummary: "当前只返回阶段性对比意图，尚未收敛为最终归因。",
            status: loadingStatus,
            summary: "调用静态指标摘要工具，准备拆分促销与商品结构影响。",
            timestampText: "10:18",
            tokenUsageText: "2,840",
            toolName: "metrics.margin.compare",
            title: "5. 调用指标摘要工具"
          },
          {
            detail:
              "引用毛利率复盘和商品结构指标的静态证据摘要。Evidence 仍停留在标准化说明层，不展示 raw retrieval 结果。",
            durationText: "1.9s",
            eventId: "event-analysis-margin-follow-up-evidence-retrieval",
            eventType: "evidence_retrieval",
            evidenceRefs: ["evidence/margin-report-q2", "evidence/product-mix-q2"],
            inputSummary: "召回毛利率复盘和商品结构相关证据。",
            key: "run-trace-margin-evidence",
            outputSummary: "当前证据支持继续拆分促销与商品结构，但不足以得出最终结论。",
            risk: mediumRisk,
            status: loadingStatus,
            summary: "补充毛利率复盘和商品结构证据引用。",
            timestampText: "10:19",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            costText: "¥0.29",
            detail:
              "输出阶段性判断，但结论尚未收敛。这里只展示标准化后的阶段性摘要，不暴露模型原始推理或原始输出。",
            durationText: "1.2s",
            eventId: "event-analysis-margin-follow-up-summary-generated",
            eventType: "summary_generated",
            inputSummary: "整合当前指标对比与证据说明，输出阶段性毛利率归因判断。",
            key: "run-trace-margin-summary",
            modelName: "gpt-4.1-static",
            outputSummary: "阶段性判断倾向于促销档期重叠，但仍需补充区域与时间窗口拆解。",
            risk: mediumRisk,
            status: warningStateStatus,
            summary: "生成阶段性摘要，并明确当前结论仍未收敛。",
            timestampText: "10:20",
            tokenUsageText: "4,180",
            title: "7. 生成分析摘要"
          },
          {
            detail:
              "等待进一步追问或反馈。本地提交只更新当前 Analysis UI State，不会创建真实多轮分析、streaming 或轮询。",
            durationText: "0.6s",
            eventId: "event-analysis-margin-follow-up-feedback-waiting",
            eventType: "feedback_waiting",
            inputSummary: "等待用户继续拆分促销折扣、商品结构或区域差异。",
            key: "run-trace-margin-follow-up",
            outputSummary: "保留当前 conversation 和 run，不离开 Analysis 页面。",
            risk: mediumRisk,
            status: loadingStatus,
            summary: "等待继续追问，保持当前 run 处于阶段性进行中。",
            timestampText: "10:20",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-margin-follow-up",
        risk: mediumRisk,
        runId: "analysis-margin-follow-up",
        stageSummary: "已承接上一轮报告结论，正在拆分促销和商品结构的影响。",
        status: loadingStatus,
        tokenUsageText: "8,920",
        totalDurationText: "9.4s",
        updatedAtText: "更新于 10:20"
      }),
      session: {
        contextLabel: "Reports / Margin",
        key: "session-summary-margin",
        risk: mediumRisk,
        runLabel: "Run: analysis-margin-follow-up",
        status: loadingStatus,
        summary: "从 Reports 结论继续追问毛利率波动归因。",
        title: "毛利率波动复盘",
        updatedAtText: "2 分钟前"
      }
    },
    {
      contextPack: createContextPack({
        sourceObject: "缺货率异常",
        sourceRoute: "Metrics / Stockout",
        timeRange: "Last 12 hours",
        workspace: "Northstar Retail China"
      }),
      followUpComposer: {
        contextHint: "继续追问只调整静态文本，不做真实告警或任务分派。",
        helperText: "适合继续限定门店范围或补货时段。",
        initialDraft: "门店反馈与补货任务为什么会出现冲突？",
        key: "follow-up-stockout",
        placeholder: "继续追问当前异常，例如限定门店、补货节奏或任务窗口。",
        submitLabel: "继续追问",
        suggestions: [
          {
            key: "follow-up-stockout-store",
            label: "限定北区重点门店"
          },
          {
            key: "follow-up-stockout-job",
            label: "核对补货任务节奏"
          }
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
          {
            key: "analysis-stockout-store",
            label: "哪些门店最受影响？"
          },
          {
            key: "analysis-stockout-job",
            label: "补货任务是否存在延迟？"
          }
        ],
        title: "分析任务输入区"
      },
      key: "session-stockout-risk",
      resultSummary: {
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
        risk: highRisk,
        status: riskStateStatus,
        title: "风险结果摘要"
      },
      runTrace: createRunTrace({
        costText: "¥0.39",
        errorSummaryText: "1 blocking / 2 warnings",
        events: [
          {
            detail:
              "用户围绕北区缺货率异常与补货任务冲突发起追问。当前阶段只记录标准化后的问题摘要，不创建真实告警或真实 Agent Run。",
            durationText: "0.6s",
            eventId: "event-analysis-stockout-risk-user-input",
            eventType: "user_input",
            inputSummary: "解释北区缺货率异常与补货任务冲突的关系。",
            key: "run-trace-stockout-question",
            outputSummary: "当前 run 已记录风险调查问题，并进入上下文绑定阶段。",
            status: warningStateStatus,
            summary: "记录库存异常调查问题，并标记当前 run 为风险调查入口。",
            timestampText: "09:42",
            title: "1. 接收用户问题"
          },
          {
            detail:
              "绑定 Metrics / Stockout、缺货率异常和 Last 12 hours 静态上下文。当前只展示标准化上下文摘要，不把局部 key 升格为共享业务 ID。",
            durationText: "0.9s",
            eventId: "event-analysis-stockout-risk-context-bound",
            eventType: "context_bound",
            inputSummary: "Metrics / Stockout · 缺货率异常 · Last 12 hours",
            key: "run-trace-stockout-context",
            outputSummary: "当前 run 已定位到指标异常入口和最近 12 小时时间窗口。",
            risk: highRisk,
            status: warningStateStatus,
            summary: "绑定指标异常上下文，并标记当前 run 的风险级别较高。",
            timestampText: "09:42",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            detail:
              "已识别异常入口，但由于门店反馈与补货任务摘要冲突，当前计划停留在风险提示阶段，不继续扩展为确定性归因计划。",
            durationText: "1.0s",
            eventId: "event-analysis-stockout-risk-plan-created",
            eventType: "plan_created",
            errorType: "conflicting_evidence",
            inputSummary: "围绕门店反馈、补货任务和时间线冲突做异常调查。",
            key: "run-trace-stockout-plan",
            outputSummary: "当前只保留风险提示、追问入口和治理/观测承接位。",
            risk: highRisk,
            status: riskStateStatus,
            summary: "生成风险调查计划，但因证据冲突停留在审慎阶段。",
            timestampText: "09:42",
            title: "3. 生成分析计划"
          },
          {
            detail:
              "当前只做静态权限检查，不触发真实工具调用、治理动作或 SQL Guard。风险仍然保留在当前 run 的标准化摘要里。",
            durationText: "0.7s",
            eventId: "event-analysis-stockout-risk-permission-check",
            eventType: "permission_check",
            inputSummary: "核对异常调查可用的静态治理与观测入口。",
            key: "run-trace-stockout-permission",
            outputSummary: "保留 Observability 和 Bad Case 候选入口，但不执行真实动作。",
            risk: highRisk,
            status: warningStateStatus,
            summary: "检查风险调查可用的静态治理与观测入口。",
            timestampText: "09:44",
            title: "4. 检查工具权限"
          },
          {
            costText: "¥0.11",
            detail:
              "静态展示指标异常入口和补货任务对比，不读取真实 Metrics API，也不展示底层任务原始字段。",
            durationText: "1.6s",
            eventId: "event-analysis-stockout-risk-tool-call-metrics",
            eventType: "tool_call",
            inputSummary: "对比缺货率异常、补货任务节奏与门店反馈时间线。",
            key: "run-trace-stockout-metrics",
            outputSummary: "当前对比结果提示异常存在，但不足以支撑确定性归因。",
            risk: highRisk,
            status: warningStateStatus,
            summary: "调用静态指标摘要工具，对比缺货异常与补货任务节奏。",
            timestampText: "09:45",
            tokenUsageText: "1,960",
            toolName: "metrics.stockout.compare",
            title: "5. 调用指标摘要工具"
          },
          {
            detail:
              "门店反馈与补货任务摘要存在冲突，Evidence 仅保留风险说明和标准化引用，不展示原始文档或原始检索内容。",
            durationText: "1.0s",
            eventId: "event-analysis-stockout-risk-evidence-retrieval",
            eventType: "evidence_retrieval",
            errorType: "conflicting_evidence",
            evidenceRefs: ["evidence/store-feedback-north-12h", "evidence/restock-job-north-12h"],
            inputSummary: "召回门店反馈与补货任务摘要，核对两者是否一致。",
            key: "run-trace-stockout-evidence",
            outputSummary: "证据仍然冲突，当前只保留调查和治理入口。",
            risk: highRisk,
            status: warningStateStatus,
            summary: "召回相互冲突的证据引用，并维持风险提示。",
            timestampText: "09:46",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            costText: "¥0.28",
            detail:
              "当前只输出审慎结论和下一步建议，不输出确定性归因。这里只展示标准化风险摘要，不暴露模型原始输出。",
            durationText: "0.7s",
            eventId: "event-analysis-stockout-risk-summary-generated",
            eventType: "summary_generated",
            errorType: "conflicting_evidence",
            inputSummary: "整合异常指标、补货任务和门店反馈冲突信息。",
            key: "run-trace-stockout-summary",
            modelName: "gpt-4.1-static",
            outputSummary: "建议优先保留治理和观测入口，延后做确定性结论。",
            risk: highRisk,
            status: riskStateStatus,
            summary: "生成审慎结论和下一步调查建议，不输出确定性归因。",
            timestampText: "09:46",
            tokenUsageText: "4,180",
            title: "7. 生成分析摘要"
          },
          {
            detail:
              "等待进一步追问、问题标记或 Bad Case 候选确认，不触发真实告警、真实报告沉淀或真实平台动作。",
            durationText: "0.3s",
            eventId: "event-analysis-stockout-risk-feedback-waiting",
            eventType: "feedback_waiting",
            inputSummary: "等待用户继续缩小门店范围，或确认是否升级为 Bad Case 候选。",
            key: "run-trace-stockout-follow-up",
            outputSummary: "当前 conversation 与 run 保持不变，仍停留在 Analysis 页面。",
            risk: highRisk,
            status: warningStateStatus,
            summary: "等待进一步追问、问题标记或 Bad Case 候选确认。",
            timestampText: "09:46",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-stockout-risk",
        risk: highRisk,
        runId: "analysis-stockout-risk",
        stageSummary: "Evidence 存在冲突，当前只展示风险提示和下一步追问入口。",
        status: warningStateStatus,
        tokenUsageText: "6,140",
        totalDurationText: "6.8s",
        updatedAtText: "更新于 09:46"
      }),
      session: {
        contextLabel: "Metrics / Stockout",
        key: "session-summary-stockout",
        risk: highRisk,
        runLabel: "Run: analysis-stockout-risk",
        status: warningStateStatus,
        summary: "围绕缺货率异常保留观测和治理入口，不自动升级为真实告警。",
        title: "库存异常定位",
        updatedAtText: "15 分钟前"
      }
    }
  ],
  stateCoverage: defaultStateCoverage,
  summaryCards: [
    {
      description: "Analysis 当前是静态产品化 UI，覆盖输入、会话、运行过程、Evidence、Trace、结果、追问和反馈入口。",
      key: "analysis-summary-card",
      label: "Conversation-first",
      risk: warningRisk,
      status: readyStatus,
      value: "Static UI Ready"
    }
  ]
};
