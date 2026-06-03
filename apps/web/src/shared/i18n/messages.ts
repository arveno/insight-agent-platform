import type { AppLocale } from "./localeTypes";

export const messages = {
  "zh-CN": {
    "app.headerPlaceholder": "顶部 Header 占位",
    "app.mainDescription": "企业经营分析与决策 Agent 平台",
    "app.mainPlaceholder": "主内容区占位：后续功能必须在已审查通过的 Issue 范围内接入。",
    "app.productTitle": "Insight Agent Platform",
    appName: "Insight Agent",
    language: "语言",
    "nav.analysis": "分析",
    "nav.dashboard": "仪表盘",
    "nav.dataKnowledge": "数据与知识",
    "nav.evaluation": "评估",
    "nav.feedback": "反馈",
    "nav.governance": "治理",
    "nav.memory": "记忆",
    "nav.metrics": "指标",
    "nav.modelTools": "模型与工具",
    "nav.observability": "观测",
    "nav.platformOperations": "平台运维",
    "nav.reports": "报告",
    "nav.settings": "设置",
    settings: "设置",
    theme: "主题",
    "themeMode.dark": "深色",
    "themeMode.light": "浅色",
    userMenu: "用户入口"
  },
  "en-US": {
    "app.headerPlaceholder": "Header placeholder",
    "app.mainDescription": "Enterprise analysis and decision agent platform",
    "app.mainPlaceholder":
      "Main content placeholder: future features must be implemented within approved issue scope.",
    "app.productTitle": "Insight Agent Platform",
    appName: "Insight Agent",
    language: "Language",
    "nav.analysis": "Analysis",
    "nav.dashboard": "Dashboard",
    "nav.dataKnowledge": "Data & Knowledge",
    "nav.evaluation": "Evaluation",
    "nav.feedback": "Feedback",
    "nav.governance": "Governance",
    "nav.memory": "Memory",
    "nav.metrics": "Metrics",
    "nav.modelTools": "Models & Tools",
    "nav.observability": "Observability",
    "nav.platformOperations": "Platform Operations",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    settings: "Settings",
    theme: "Theme",
    "themeMode.dark": "Dark",
    "themeMode.light": "Light",
    userMenu: "User menu"
  }
} as const satisfies Record<AppLocale, Record<string, string>>;

export type I18nMessageKey = keyof (typeof messages)[AppLocale];
