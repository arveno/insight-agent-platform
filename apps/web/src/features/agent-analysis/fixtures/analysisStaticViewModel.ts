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
import type { AnalysisViewModel } from "../models";

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
      contextItems: [
        {
          key: "context-workspace",
          label: "当前 Workspace",
          meta: "Global Context",
          status: readyStatus,
          value: "Northstar Retail China"
        },
        {
          description: "从 Dashboard 的收入异常摘要进入 Analysis。",
          key: "context-entry",
          label: "进入来源",
          meta: "Route Context",
          risk: mediumRisk,
          status: readyStatus,
          value: "Dashboard / 收入增速异常"
        },
        {
          description: "当前只展示静态上下文对象摘要，不注入真实业务 ID。",
          key: "context-object",
          label: "上下文对象",
          meta: "Context Summary",
          status: readyStatus,
          value: "季度收入 / 华东渠道 / 最近周报"
        },
        {
          description: "时间范围只作为静态上下文提示，不触发真实查询。",
          key: "context-window",
          label: "观察窗口",
          meta: "Static Range",
          status: readyStatus,
          value: "Last 30 days"
        }
      ],
      evidenceItems: [
        {
          confidenceText: "高可信度",
          key: "evidence-metric-threshold",
          relatedContext: "关联指标: 收入增速阈值 / 区域对比",
          risk: lowRisk,
          sourceTypeLabel: "Metrics / Threshold",
          summary: "收入增速在华东渠道连续三周低于阈值，异常并非全区域同步发生。",
          title: "指标阈值与区域波动摘要"
        },
        {
          confidenceText: "中可信度",
          key: "evidence-rag-weekly-report",
          relatedContext: "关联材料: 渠道周报 / 库存说明",
          risk: mediumRisk,
          sourceTypeLabel: "RAG / Weekly Report",
          summary: "渠道周报显示促销货品周转延迟，影响收入确认节奏和销售反馈口径。",
          title: "渠道周报与库存说明"
        },
        {
          confidenceText: "高可信度",
          key: "evidence-report-entry",
          relatedContext: "关联入口: Reports / 经营周报",
          risk: lowRisk,
          sourceTypeLabel: "Report / Summary",
          summary: "最近经营周报已经沉淀过区域结构变化，可作为后续追问和报告生成入口。",
          title: "最近报告引用入口"
        }
      ],
      feedback: {
        helperText: "静态入口只记录本地选择，不写入 Feedback、Bad Case 或 Evaluation。",
        options: [
          {
            label: "采纳",
            value: "accepted"
          },
          {
            label: "驳回",
            value: "rejected"
          },
          {
            label: "标记问题",
            value: "issue"
          },
          {
            label: "Bad Case",
            value: "bad_case"
          }
        ],
        submitLabel: "提交标记",
        targetTitle: "针对「华东渠道收入增速异常」静态结论摘要",
        title: "Feedback / Bad Case 入口"
      },
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
      planSteps: [
        {
          description: "识别问题、约束和上下文来源，只展示未来 Runtime 如何进入页面。",
          key: "plan-revenue-step-1",
          meta: "Plan",
          status: successStatus,
          timestampText: "11:08",
          title: "Step 1 · 识别分析问题与上下文"
        },
        {
          description: "静态展示指标摘要和阈值对比结果，不读取真实 Metrics API。",
          key: "plan-revenue-tool-1",
          meta: "Tool Calling",
          status: successStatus,
          timestampText: "11:10",
          title: "Tool Call · 指标阈值摘要"
        },
        {
          description: "对比区域、渠道和时间窗口，形成异常归因草稿。",
          key: "plan-revenue-step-2",
          meta: "Step",
          risk: mediumRisk,
          status: readyStatus,
          timestampText: "11:14",
          title: "Step 2 · 区域与渠道波动对比"
        },
        {
          description: "静态召回周报和库存说明，承接未来 RAG Evidence 入口。",
          key: "plan-revenue-tool-2",
          meta: "Tool Calling",
          status: successStatus,
          timestampText: "11:18",
          title: "Tool Call · 召回周报与库存说明"
        },
        {
          description: "归并关键发现、建议动作和 Trace 摘要入口。",
          key: "plan-revenue-step-3",
          meta: "Result",
          status: successStatus,
          timestampText: "11:22",
          title: "Step 3 · 汇总结论与建议动作"
        }
      ],
      reportEntry: {
        actionLabel: "沉淀到报告",
        description: "将当前结论、建议动作和证据摘要沉淀为报告入口。",
        evidenceSummary: "静态入口只跳转到 Reports，不会生成真实报告。",
        key: "report-entry-revenue-gap",
        targetRoute: "reports",
        title: "报告生成入口"
      },
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
      runOverview: {
        key: "run-overview-revenue-gap",
        ownerLabel: "Owner: Revenue Ops / Strategy",
        phaseLabel: "当前阶段: 结论整理完成",
        risk: mediumRisk,
        stageSummary: "已完成问题拆解、指标比对、证据归并和建议动作整理。",
        status: successStatus,
        title: "Agent Run 状态展示",
        toolSummary: "静态展示 Plan 3 步、Tool Calling 2 次、Evidence 3 条。",
        updatedAtText: "更新于 11:24"
      },
      session: {
        contextLabel: "Dashboard / Revenue",
        key: "session-summary-revenue-gap",
        risk: mediumRisk,
        runLabel: "Run: analysis-q2-revenue-gap",
        status: successStatus,
        summary: "围绕 Dashboard 收入异常做渠道和时间窗口追问。",
        title: "Q2 收入异常追问",
        updatedAtText: "刚刚更新"
      },
      traceSummary: {
        actionLabel: "查看观测详情",
        description: "静态展示 Trace 摘要、事件数量和进入 Observability 的入口，不查询真实 Trace。",
        eventCountText: "8 个静态事件",
        items: [
          {
            description: "创建分析计划并绑定当前静态上下文。",
            key: "trace-revenue-plan-created",
            status: successStatus,
            timestampText: "11:08",
            title: "Plan Created"
          },
          {
            description: "校验 Tool 权限和 Evidence 入口，未执行真实工具。",
            key: "trace-revenue-tool-check",
            risk: lowRisk,
            status: successStatus,
            timestampText: "11:10",
            title: "Tool Permission Checked"
          },
          {
            description: "输出结论摘要并保留报告生成入口。",
            key: "trace-revenue-result",
            status: successStatus,
            timestampText: "11:22",
            title: "Result Summary Ready"
          }
        ],
        key: "trace-summary-revenue-gap",
        risk: lowRisk,
        status: successStatus,
        targetRoute: "observability",
        title: "Run Trace 摘要入口",
        updatedAtText: "更新于 11:24"
      }
    },
    {
      contextItems: [
        {
          key: "context-workspace-margin",
          label: "当前 Workspace",
          meta: "Global Context",
          status: readyStatus,
          value: "Northstar Retail China"
        },
        {
          description: "来自 Reports 的毛利率波动结论补充追问。",
          key: "context-entry-margin",
          label: "进入来源",
          meta: "Route Context",
          status: readyStatus,
          value: "Reports / 毛利率复盘"
        },
        {
          description: "当前会话聚焦促销、折扣和区域差异，不引入真实业务对象 ID。",
          key: "context-object-margin",
          label: "上下文对象",
          meta: "Context Summary",
          status: readyStatus,
          value: "毛利率 / 促销档期 / 华南区域"
        },
        {
          description: "静态观察窗口仅用于会话说明。",
          key: "context-window-margin",
          label: "观察窗口",
          meta: "Static Range",
          status: readyStatus,
          value: "This quarter"
        }
      ],
      evidenceItems: [
        {
          confidenceText: "中可信度",
          key: "evidence-margin-report",
          relatedContext: "关联材料: 毛利率复盘 / 折扣计划",
          risk: mediumRisk,
          sourceTypeLabel: "Report / Review",
          summary: "复盘报告显示折扣投放节奏和促销档期存在重叠，影响毛利率波动判断。",
          title: "毛利率复盘报告"
        },
        {
          confidenceText: "中可信度",
          key: "evidence-margin-threshold",
          relatedContext: "关联指标: 折扣率 / 商品结构",
          risk: lowRisk,
          sourceTypeLabel: "Metrics / Mix",
          summary: "商品结构变化可能是主要变量，但仍需结合区域拆分解释。",
          title: "商品结构与折扣指标"
        }
      ],
      feedback: {
        helperText: "静态反馈只用于展示选项和页面状态，不触发 Evaluation。",
        options: [
          {
            label: "采纳",
            value: "accepted"
          },
          {
            label: "驳回",
            value: "rejected"
          },
          {
            label: "标记问题",
            value: "issue"
          }
        ],
        submitLabel: "提交反馈",
        targetTitle: "针对「毛利率波动复盘」阶段性结论",
        title: "Feedback / 采纳入口"
      },
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
      planSteps: [
        {
          description: "已解析上一轮报告结论，准备拆分折扣和商品结构因素。",
          key: "plan-margin-step-1",
          meta: "Plan",
          status: successStatus,
          timestampText: "10:16",
          title: "Step 1 · 拆解上一轮结论"
        },
        {
          description: "当前处于静态进行中展示，不触发真实 Tool Calling。",
          key: "plan-margin-tool-1",
          meta: "Tool Calling",
          status: loadingStatus,
          timestampText: "10:18",
          title: "Tool Call · 促销与商品结构对比"
        },
        {
          description: "等待进一步追问，结果摘要仍是阶段性草稿。",
          key: "plan-margin-step-2",
          meta: "Step",
          risk: mediumRisk,
          status: loadingStatus,
          timestampText: "10:20",
          title: "Step 2 · 形成阶段性判断"
        }
      ],
      reportEntry: {
        actionLabel: "带结论回到报告",
        description: "把当前阶段性判断带回 Reports 作为补充材料入口。",
        evidenceSummary: "静态入口只跳转，不生成真实报告版本。",
        key: "report-entry-margin",
        targetRoute: "reports",
        title: "报告补充入口"
      },
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
      runOverview: {
        key: "run-overview-margin",
        ownerLabel: "Owner: Finance / Pricing",
        phaseLabel: "当前阶段: 追问进行中",
        risk: mediumRisk,
        stageSummary: "已承接上一轮报告结论，正在拆分促销和商品结构的影响。",
        status: loadingStatus,
        title: "Agent Run 状态展示",
        toolSummary: "静态展示 Plan 2 步、Tool Calling 1 次、Evidence 2 条。",
        updatedAtText: "更新于 10:20"
      },
      session: {
        contextLabel: "Reports / Margin",
        key: "session-summary-margin",
        risk: mediumRisk,
        runLabel: "Run: analysis-margin-follow-up",
        status: loadingStatus,
        summary: "从 Reports 结论继续追问毛利率波动归因。",
        title: "毛利率波动复盘",
        updatedAtText: "2 分钟前"
      },
      traceSummary: {
        actionLabel: "查看观测详情",
        description: "展示进行中的静态 Trace 摘要和后续观测入口，不轮询真实事件。",
        eventCountText: "5 个静态事件",
        items: [
          {
            description: "上一轮报告结论已进入当前静态会话。",
            key: "trace-margin-context",
            status: successStatus,
            timestampText: "10:15",
            title: "Context Loaded"
          },
          {
            description: "过程列表停留在静态进行中阶段。",
            key: "trace-margin-progress",
            status: loadingStatus,
            timestampText: "10:19",
            title: "Run In Progress"
          }
        ],
        key: "trace-summary-margin",
        risk: lowRisk,
        status: loadingStatus,
        targetRoute: "observability",
        title: "Run Trace 摘要入口",
        updatedAtText: "更新于 10:20"
      }
    },
    {
      contextItems: [
        {
          key: "context-workspace-stockout",
          label: "当前 Workspace",
          meta: "Global Context",
          status: readyStatus,
          value: "Northstar Retail China"
        },
        {
          description: "来自 Metrics 的北区库存缺货异常入口。",
          key: "context-entry-stockout",
          label: "进入来源",
          meta: "Route Context",
          risk: highRisk,
          status: readyStatus,
          value: "Metrics / 缺货率异常"
        },
        {
          description: "当前会话聚焦缺货率、补货节奏和门店反馈。",
          key: "context-object-stockout",
          label: "上下文对象",
          meta: "Context Summary",
          status: readyStatus,
          value: "北区缺货率 / 补货任务 / 门店反馈"
        }
      ],
      evidenceItems: [
        {
          confidenceText: "中可信度",
          key: "evidence-stockout-feedback",
          relatedContext: "关联材料: 门店反馈 / 补货任务",
          risk: highRisk,
          sourceTypeLabel: "Operations / Feedback",
          summary: "门店反馈与补货任务摘要存在冲突，说明当前结论可信度不足。",
          title: "门店反馈与补货任务冲突"
        }
      ],
      feedback: {
        helperText: "适合标记为问题样例或后续 Bad Case 候选。",
        options: [
          {
            label: "标记问题",
            value: "issue"
          },
          {
            label: "Bad Case",
            value: "bad_case"
          }
        ],
        submitLabel: "提交标记",
        targetTitle: "针对「北区缺货率异常」静态追问",
        title: "问题标记入口"
      },
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
      planSteps: [
        {
          description: "已识别异常入口，但证据冲突导致当前会话停留在风险提示阶段。",
          key: "plan-stockout-step-1",
          meta: "Plan",
          risk: highRisk,
          status: riskStateStatus,
          timestampText: "09:42",
          title: "Step 1 · 异常入口识别"
        },
        {
          description: "Evidence 摘要之间存在冲突，因此不输出强结论。",
          key: "plan-stockout-step-2",
          meta: "Evidence",
          risk: highRisk,
          status: warningStateStatus,
          timestampText: "09:46",
          title: "Step 2 · 证据冲突待确认"
        }
      ],
      reportEntry: {
        actionLabel: "保留报告入口",
        description: "当前更适合作为异常跟踪入口，而不是直接沉淀正式报告。",
        evidenceSummary: "静态入口只保留后续沉淀可能性。",
        key: "report-entry-stockout",
        targetRoute: "reports",
        title: "报告入口占位"
      },
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
      runOverview: {
        key: "run-overview-stockout",
        ownerLabel: "Owner: Supply Chain / Store Ops",
        phaseLabel: "当前阶段: 风险待确认",
        risk: highRisk,
        stageSummary: "Evidence 存在冲突，当前只展示风险提示和下一步追问入口。",
        status: warningStateStatus,
        title: "Agent Run 状态展示",
        toolSummary: "静态展示 Plan 2 步、Evidence 1 条、Trace 2 个事件。",
        updatedAtText: "更新于 09:46"
      },
      session: {
        contextLabel: "Metrics / Stockout",
        key: "session-summary-stockout",
        risk: highRisk,
        runLabel: "Run: analysis-stockout-risk",
        status: warningStateStatus,
        summary: "围绕缺货率异常保留观测和治理入口，不自动升级为真实告警。",
        title: "北区缺货率异常",
        updatedAtText: "15 分钟前"
      },
      traceSummary: {
        actionLabel: "查看观测详情",
        description: "只保留风险 Trace 摘要入口，用于表达未来观测联动方向。",
        eventCountText: "2 个静态事件",
        items: [
          {
            description: "识别到异常来源和冲突证据。",
            key: "trace-stockout-risk",
            risk: highRisk,
            status: warningStateStatus,
            timestampText: "09:42",
            title: "Risk Detected"
          },
          {
            description: "保留后续 Observability 跟踪入口。",
            key: "trace-stockout-observe",
            status: readyStatus,
            timestampText: "09:46",
            title: "Observability Entry Reserved"
          }
        ],
        key: "trace-summary-stockout",
        risk: highRisk,
        status: warningStateStatus,
        targetRoute: "observability",
        title: "Run Trace 摘要入口",
        updatedAtText: "更新于 09:46"
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
