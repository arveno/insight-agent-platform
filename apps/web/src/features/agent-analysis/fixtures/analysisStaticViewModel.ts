import {
  createRightAssistSummary,
  defaultPermissionSummary,
  defaultReadonlyState,
  defaultStateCoverage,
  readyStatus,
  warningRisk
} from "../../../app/fixtures";
import type {
  StaticRiskViewModel,
  StaticSectionViewModel,
  StaticStatusViewModel
} from "../../../app/models";
import type { AnalysisRunTraceViewModel, AnalysisViewModel } from "../models";

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
  events,
  key,
  risk,
  runId,
  stageSummary,
  status,
  updatedAtText
}: {
  events: AnalysisRunTraceViewModel["events"];
  key: string;
  risk?: StaticRiskViewModel;
  runId: string;
  stageSummary: string;
  status: StaticStatusViewModel;
  updatedAtText: string;
}) {
  return {
    events,
    key,
    risk,
    runId,
    stageSummary,
    status,
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
        events: [
          {
            description: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。",
            key: "run-trace-revenue-question",
            status: successStatus,
            timestampText: "11:08",
            title: "1. 接收用户问题"
          },
          {
            description: "绑定 Dashboard / Revenue、收入增速异常和 Last 30 days 静态上下文。",
            key: "run-trace-revenue-context",
            risk: mediumRisk,
            status: successStatus,
            timestampText: "11:08",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            description: "识别问题、约束和当前上下文来源，生成静态分析计划。",
            key: "run-trace-revenue-plan",
            status: successStatus,
            timestampText: "11:09",
            title: "3. 生成分析计划"
          },
          {
            description: "静态检查工具权限和可用入口，不执行真实 Tool Calling。",
            key: "run-trace-revenue-permission",
            risk: lowRisk,
            status: successStatus,
            timestampText: "11:10",
            title: "4. 检查工具权限"
          },
          {
            description: "静态展示指标阈值摘要和区域对比结果，不读取真实 Metrics API。",
            key: "run-trace-revenue-metrics",
            status: successStatus,
            timestampText: "11:10",
            title: "5. 调用指标摘要工具"
          },
          {
            description: "召回渠道周报与库存说明，Evidence 只作为静态来源说明出现。",
            key: "run-trace-revenue-evidence",
            risk: mediumRisk,
            status: successStatus,
            timestampText: "11:18",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            description: "生成收入异常结论、关键发现和下一步建议，完整过程见当前 Run Trace。",
            key: "run-trace-revenue-summary",
            risk: mediumRisk,
            status: successStatus,
            timestampText: "11:22",
            title: "7. 生成分析摘要"
          },
          {
            description: "当前支持本地追问、反馈标记和报告入口占位，不触发真实 Agent 或报告生成。",
            key: "run-trace-revenue-follow-up",
            status: successStatus,
            timestampText: "11:24",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-revenue-gap",
        risk: mediumRisk,
        runId: "analysis-q2-revenue-gap",
        stageSummary: "已完成问题拆解、指标比对、证据归并和建议动作整理。",
        status: successStatus,
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
        events: [
          {
            description: "复盘本季度毛利率波动，重点解释促销投放和商品结构变化。",
            key: "run-trace-margin-question",
            status: successStatus,
            timestampText: "10:15",
            title: "1. 接收用户问题"
          },
          {
            description: "绑定 Reports / Margin、毛利率复盘和 This quarter 静态上下文。",
            key: "run-trace-margin-context",
            status: successStatus,
            timestampText: "10:15",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            description: "解析上一轮报告结论，准备拆分促销和商品结构影响。",
            key: "run-trace-margin-plan",
            status: successStatus,
            timestampText: "10:16",
            title: "3. 生成分析计划"
          },
          {
            description: "静态检查工具权限和上下文范围，不执行真实权限校验。",
            key: "run-trace-margin-permission",
            risk: lowRisk,
            status: successStatus,
            timestampText: "10:17",
            title: "4. 检查工具权限"
          },
          {
            description: "当前处于静态进行中阶段，只展示促销与商品结构对比意图。",
            key: "run-trace-margin-metrics",
            status: loadingStatus,
            timestampText: "10:18",
            title: "5. 调用指标摘要工具"
          },
          {
            description: "引用毛利率复盘和商品结构指标，Evidence 仍停留在静态说明层。",
            key: "run-trace-margin-evidence",
            risk: mediumRisk,
            status: loadingStatus,
            timestampText: "10:19",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            description: "输出阶段性判断，但结论尚未收敛，完整过程仍在当前 Run Trace。",
            key: "run-trace-margin-summary",
            risk: mediumRisk,
            status: warningStateStatus,
            timestampText: "10:20",
            title: "7. 生成分析摘要"
          },
          {
            description: "等待进一步追问或反馈，本地提交不会创建真实多轮分析。",
            key: "run-trace-margin-follow-up",
            risk: mediumRisk,
            status: loadingStatus,
            timestampText: "10:20",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-margin-follow-up",
        risk: mediumRisk,
        runId: "analysis-margin-follow-up",
        stageSummary: "已承接上一轮报告结论，正在拆分促销和商品结构的影响。",
        status: loadingStatus,
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
        events: [
          {
            description: "解释北区缺货率异常与补货任务冲突的关系。",
            key: "run-trace-stockout-question",
            status: warningStateStatus,
            timestampText: "09:42",
            title: "1. 接收用户问题"
          },
          {
            description: "绑定 Metrics / Stockout、缺货率异常和 Last 12 hours 静态上下文。",
            key: "run-trace-stockout-context",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:42",
            title: "2. 绑定 Dashboard / Metrics / Reports 上下文"
          },
          {
            description: "已识别异常入口，但证据冲突导致当前计划停留在风险提示阶段。",
            key: "run-trace-stockout-plan",
            risk: highRisk,
            status: riskStateStatus,
            timestampText: "09:42",
            title: "3. 生成分析计划"
          },
          {
            description: "当前只做静态权限检查，不触发真实工具或治理动作。",
            key: "run-trace-stockout-permission",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:44",
            title: "4. 检查工具权限"
          },
          {
            description: "静态展示指标异常入口和补货任务对比，不读取真实 Metrics API。",
            key: "run-trace-stockout-metrics",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:45",
            title: "5. 调用指标摘要工具"
          },
          {
            description: "门店反馈与补货任务摘要存在冲突，Evidence 仅保留风险说明。",
            key: "run-trace-stockout-evidence",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:46",
            title: "6. 召回 Evidence / RAG 来源"
          },
          {
            description: "当前只输出审慎结论和下一步建议，不输出确定性归因。",
            key: "run-trace-stockout-summary",
            risk: highRisk,
            status: riskStateStatus,
            timestampText: "09:46",
            title: "7. 生成分析摘要"
          },
          {
            description: "等待进一步追问、问题标记或 Bad Case 候选确认，不触发真实告警或报告沉淀。",
            key: "run-trace-stockout-follow-up",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:46",
            title: "8. 等待用户追问 / 反馈"
          }
        ],
        key: "run-trace-stockout-risk",
        risk: highRisk,
        runId: "analysis-stockout-risk",
        stageSummary: "Evidence 存在冲突，当前只展示风险提示和下一步追问入口。",
        status: warningStateStatus,
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
