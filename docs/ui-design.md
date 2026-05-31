# UI Design

本文档是 Insight Agent Platform 的 UI 设计事实源，定义 UI 设计流程、页面结构、响应式规则、共享组件边界、页面蓝图和 UI PR 验收标准。

本文件只定义 UI 规则，不实现页面代码、不接 API、不接数据库、不实现真实业务功能。

## 1. 目标

`docs/ui-design.md` 用于约束后续所有 UI 设计与页面实现任务。

固定目标：

- 先建立 UI 事实源，再进入页面实现。
- 将 UI 标准落在既有 monorepo、modular monolith、contracts-first 架构内。
- 保持 React / TypeScript / Vite / Ant Design 体系，不引入第二套 UI 组件库。
- 固化 `Contract -> ViewModel -> UI` 链路，禁止 UI 直接消费 raw API response。
- 明确桌面端和手机浏览器的页面结构、状态处理和 PR 证据要求。

## 2. UI 设计流程

UI 开发流程固定为：

```text
先定 UI 事实源
-> 再定页面蓝图
-> 再做可运行静态 UI 骨架
-> 最后接业务数据和真实功能
```

执行规则：

- UI 事实源必须先于页面代码存在。
- 页面实现 Issue 必须引用本文件中的对应页面蓝图。
- 页面蓝图必须先说明页面目标、区域结构、数据来源、关联 contracts 和禁止项。
- 可运行静态 UI 骨架只能表达页面结构、组件层级、空态、加载态、错误态和权限态。
- 静态 UI 骨架不得形成 Mock / Real 双链路。
- 接业务数据和真实功能必须在后续已审查通过的 Issue 中执行。

## 3. 统一 UI 设计语言

统一 UI 设计语言固定如下：

```text
基础组件：Ant Design v5
AI 对话 / 输入 / 回复类场景：Ant Design X
复杂中后台表格 / 表单 / 详情：ProComponents 按需
图表：ECharts / Ant Design Charts
状态组件：shared/ui
布局组件：shared/layout
主题变量：shared/theme
```

使用边界：

- 页面、feature 组件和 shared 组件必须使用 Ant Design 体系。
- AI 输入、AI 回复、会话式分析和人机协同区域优先使用 Ant Design X。
- 复杂表格、筛选表单、详情布局可以按需使用 ProComponents。
- 经营指标、趋势、成本、延迟、评估结果等图表使用 ECharts / Ant Design Charts。
- 状态标签、风险等级、空态、错误态、加载态必须使用 `shared/ui`。
- 颜色、字号、间距、阴影、圆角等设计 token 必须走 `shared/theme`。

禁止：

- 不引入第二套 UI 组件库。
- 不每个页面自己写一套按钮、卡片或状态色。
- 不在组件里直接处理 raw API response。
- 不在 UI 里写业务规则。
- 不为了视觉效果加入复杂动效。

## 4. 全局 AppShell

全局 AppShell 是所有 Console 页面的统一外壳，承载导航、Header、工作区上下文和主内容区域。

桌面端结构：

```text
AppShell
├─ Sider：一级模块导航
├─ Header：workspace、环境、用户、通知、全局操作
├─ Content：当前页面主内容
└─ OptionalRightPanel：Run Trace / Source Evidence / Report Outline 等辅助面板
```

手机浏览器结构：

```text
AppShell
├─ TopBar：菜单按钮、当前页面标题、关键操作
├─ DrawerMenu：一级模块导航
├─ Content：单列主内容
└─ Drawer / Tabs：辅助面板
```

AppShell 规则：

- Sider 只承载固定一级模块入口，不新增 Issue 外模块。
- Header 只承载全局上下文，不写页面业务清洗。
- Content 由 `pages/*` 入口编排，页面入口不解析 raw API response。
- OptionalRightPanel 只能展示 ViewModel 和 UI State。
- Workspace / user / role 等上下文必须来自 contract 对应 ViewModel。

## 5. 桌面端布局规则

桌面端优先面向企业经营分析和运维 Console 高频使用场景。

固定规则：

- 左侧导航固定。
- 顶部 Header 固定承载全局上下文。
- 主内容区使用页面标题、筛选区、核心摘要区、主体区、辅助区的稳定结构。
- 需要追溯链路时使用右侧辅助面板，例如 Run Trace、Source Evidence、Report Outline。
- 表格和图表优先在主内容区，详情、审计、证据和 Trace 优先在右侧辅助区或 Drawer。
- 页面区域不得使用不稳定宽度导致布局跳动。
- 页面中业务字段名必须来自 ViewModel；核心字段名不得在 UI 中重命名。

推荐布局：

```text
Page
├─ PageHeader
├─ FilterBar / ActionBar
├─ SummaryBand
├─ MainRegion
└─ RightAssistRegion / Drawer
```

## 6. 手机浏览器适配规则

手机浏览器不是独立产品线，必须复用同一 Contract -> ViewModel -> UI 链路。

固定规则：

- 左侧导航折叠为 Drawer 或顶部菜单。
- 主内容区单列。
- 右侧辅助面板改为 Drawer 或 Tabs。
- 表格优先卡片化；字段多、列多且不可卡片化时允许横向滚动。
- 复杂操作拆成 Steps、Collapse 或分段表单。
- 页面主按钮固定在顶部操作区或底部操作栏，不悬浮遮挡内容。
- 状态、风险、空态、错误态继续使用 `shared/ui`。
- 手机布局不得新增单独 mock 数据链路。

## 7. 页面蓝图模板

后续每个页面实现 Issue 必须引用并补齐以下模板。

```text
页面名称：
路由：
所属模块：
页面目标：
桌面布局：
移动端布局：
顶部区域：
左侧区域：
主内容区：
右侧辅助区：
主要入口：
主要操作：
空态：
加载态：
错误态：
权限态：
数据来源：
关联 contracts：
必须使用的 shared/ui：
禁止项：
```

页面蓝图规则：

- `数据来源` 只能写 Contract Model、API Response、ViewModel 或 UI State 的来源，不得写 DB row 或模型原始输出直接进入 UI。
- `关联 contracts` 必须列出 `packages/contracts/schemas/*` 中的业务对象。
- `必须使用的 shared/ui` 必须列出状态、风险、空态、错误态或领域共享 UI 组件。
- `禁止项` 必须包含 raw API response、DB 字段、模型原始输出、Tool 原始输出和 LangGraph state 不得进入 UI。

## 8. 页面区域规范

页面区域固定职责：

- `PageHeader`：页面标题、业务域说明、主操作、返回入口。
- `FilterBar`：查询、筛选、排序、时间范围、状态筛选。
- `SummaryBand`：指标摘要、状态摘要、风险摘要、成本摘要。
- `MainRegion`：表格、图表、列表、表单、报告正文或分析工作区。
- `RightAssistRegion`：Trace、Source Evidence、Report Outline、审计详情、配置详情。
- `Drawer / Modal`：创建、编辑、确认、详情、风险操作。
- `FeedbackRegion`：用户反馈、人工纠错、采纳 / 未采纳操作。

职责边界：

- 页面只做编排。
- 业务清洗放在 `features/*/mappers`。
- 组件只消费 ViewModel 和 UI State。
- 权限结果由后端和 governance 链路提供，UI 只展示权限态和禁用态。

## 9. 模块入口规范

一级模块入口必须来自 `docs/architecture.md` 固定模块，不得自由新增孤立大模块。

Console 导航入口与页面聚合关系：

| 导航入口 | 覆盖模块 |
| --- | --- |
| Workspace | Workspace / IAM |
| Data & Knowledge | Data Source & Ingestion, Knowledge & RAG |
| Metrics | Metric & Semantic Layer |
| Dashboard | Business Dashboard |
| Analysis | Agent Analysis, Multi-Agent Runtime |
| Reports | Report & Decision |
| Memory | Memory Center |
| Feedback | Feedback Center |
| Evaluation | Evaluation Center |
| Models & Tools | Tool Registry / MCP Adapter, Model / Prompt / Tool / RAG Management |
| Governance | Governance & Security |
| Observability | Observability & Monitoring |
| Settings | Admin / Settings |
| Platform Operations | Platform Operations |

入口规则：

- 导航文案可以聚合多个架构模块，但不得创造新的业务域。
- 页面路由必须对应 `apps/web/src/pages/*` 的既有规划。
- feature 目录必须对应 `apps/web/src/features/*` 的业务域规划。
- shared 只能放真正跨域复用的 UI、layout、charts、theme、hooks、stores、types、utils、constants。

## 10. shared/ui 组件规范

`shared/ui` 承载跨业务域复用的状态、风险、空态、错误态、加载态和通用业务展示组件。

必须建立并复用的组件方向：

- `StatusTag`：展示 contract 状态枚举。
- `RiskBadge`：展示 `RiskLevel`。
- `MetricCard`：展示指标值、趋势和阈值。
- `TraceTimeline`：展示 RunEvent ViewModel。
- `ToolCallCard`：展示 ToolCall ViewModel。
- `ModelCallCard`：展示 ModelCall ViewModel。
- `SourceEvidenceList`：展示 SourceEvidence ViewModel。
- `MemoryUsagePanel`：展示 MemoryItem 使用情况。
- `EvaluationScoreCard`：展示 EvaluationScore / EvaluationRun ViewModel。
- `FeedbackPanel`：展示 Feedback ViewModel 和反馈操作入口。
- `ReportSection`：展示 ReportSection ViewModel。
- `DecisionCard`：展示 Decision / ActionSuggestion ViewModel。
- `EmptyState`：统一空态。
- `ErrorState`：统一错误态。
- `LoadingState`：统一加载态。

组件规则：

- shared 组件不得依赖 feature。
- shared 组件不得解析 raw API response。
- shared 组件不得访问数据库字段。
- shared 组件不得调用模型、Tool 或 LangGraph Runtime。
- shared 组件只消费明确的 ViewModel、枚举或 UI State。

## 11. 状态规范

状态必须来自 contracts，不允许自由字符串。

固定状态源：

- `AnalysisRunStatus`：`created`、`planning`、`running`、`waiting_approval`、`completed`、`failed`、`cancelled`。
- `RunEventStatus`：`pending`、`running`、`succeeded`、`failed`、`skipped`。
- `EvaluationStatus`：`queued`、`running`、`passed`、`failed`、`needs_review`。
- `RiskLevel`：`low`、`medium`、`high`、`critical`。
- `FeedbackType`：`useful`、`not_useful`、`incorrect`、`sql_error`、`source_insufficient`、`analysis_shallow`、`suggestion_unusable`、`format_preference`、`manual_correction`。

展示规则：

- 状态展示统一使用 `StatusTag`。
- 风险展示统一使用 `RiskBadge`。
- 状态文案和颜色映射在 shared 层集中定义。
- ViewModel 可以增加 `statusLabel`、`durationText`、`costText`、`riskText` 等展示派生字段。
- ViewModel 不得把 `runId` 改成 `id`，不得把 `status` 改成 `state` 或 `currentStatus`。

禁止：

```ts
run.id || run.runId || run.analysisRunId
status === "done" || status === "completed" || status === "success"
source.sources || source.evidences || source.references
```

## 12. 图表规范

图表用于表达经营指标、趋势、评估、成本、延迟和数据质量。

固定规则：

- 图表库使用 ECharts / Ant Design Charts。
- 图表输入必须是 ViewModel 或 chart-specific ViewModel。
- 图表不直接消费 API response、DB 字段、SQL 结果或模型原始输出。
- 指标口径必须引用 Metrics contracts 或对应 ViewModel 字段。
- 图表颜色必须走 `shared/theme` token。
- 图表空态使用 `EmptyState`，加载态使用 `LoadingState`，错误态使用 `ErrorState`。
- 风险、阈值、异常点必须使用 contract 枚举或 ViewModel 派生字段。

图表区域至少说明：

- 指标名称。
- 时间范围。
- 口径来源。
- 数据更新时间。
- Source Evidence 或 lineage 入口。

## 13. 表格规范

表格用于管理列表、审计、运行记录、工具调用、模型调用、评估数据集和运维任务。

固定规则：

- 基础表格使用 Ant Design Table。
- 复杂中后台表格可以按需使用 ProComponents。
- 列字段来自 ViewModel，核心业务字段名保持 contracts 语义。
- 状态列使用 `StatusTag`。
- 风险列使用 `RiskBadge`。
- 行操作不得直接触发未授权工具调用或模型调用。
- 表格空态、错误态、加载态必须使用 shared 状态组件。

手机浏览器：

- 优先转为卡片列表。
- 保留关键字段、状态和主操作。
- 次要字段放入展开区或详情 Drawer。
- 确需横向滚动时必须保证主字段和状态可见。

## 14. 表单规范

表单用于创建、编辑、筛选和配置。

固定规则：

- 表单使用 Ant Design Form。
- 复杂表单可以按需使用 ProComponents。
- 表单字段必须对应 Contract Model、ViewModel 或明确 UI State。
- 前端只做格式校验、必填校验、交互校验，不做后端业务规则替代。
- 权限、SQL Guard、Tool Permission 等结果由治理链路提供，UI 只展示禁用态、提示和审批入口。
- 表单提交不得绕过 API schema。

手机浏览器：

- 长表单拆成 Steps 或 Collapse。
- 危险操作放入确认 Modal / Drawer。
- 主操作固定在表单底部或页面顶部操作区。

## 15. 卡片规范

卡片用于摘要、指标、报告段落、决策建议、工具调用、模型调用、证据和评估结果。

固定规则：

- 卡片只承载一个明确对象或摘要。
- 卡片标题使用对象名称、报告段落标题、指标名称或工具 / 模型调用名称。
- 卡片内状态使用 `StatusTag`，风险使用 `RiskBadge`。
- 卡片不得直接解析 raw API response。
- 重复卡片列表必须具有稳定排序和空态。
- 卡片操作必须和权限态一致。

适用组件：

- `MetricCard`
- `ToolCallCard`
- `ModelCallCard`
- `EvaluationScoreCard`
- `DecisionCard`
- `ReportSection`

## 16. 抽屉 / 弹窗规范

Drawer 用于详情、辅助信息、Trace、Source Evidence、Report Outline 和编辑表单。

Modal 用于确认、短表单、风险提示和不可逆操作确认。

固定规则：

- Drawer 优先承载可滚动详情。
- Modal 优先承载需要用户立即确认的短流程。
- 危险操作必须展示风险等级、影响范围和权限态。
- Drawer / Modal 内仍然只消费 ViewModel 和 UI State。
- Drawer / Modal 不直接访问 raw API response、DB 字段、模型原始输出、Tool 原始输出或 LangGraph state。

## 17. 步骤条规范

Steps 用于多阶段任务、长表单、审批、运行生命周期和部署 / 运维流程。

固定规则：

- Analysis Run 生命周期必须按 contracts 状态表达。
- RunEvent 不等于 UI timeline item，必须先通过 mapper 转成 ViewModel。
- Evaluation、Platform Operations、Deployment 相关步骤必须展示当前状态、失败原因和下一步入口。
- 步骤条不得写死非 contract 状态。

适用场景：

- Analysis Run 过程。
- Dataset / Evaluation Run 创建流程。
- RAG strategy 配置流程。
- Platform Operations job 流程。
- 风险审批流程。

## 18. Trace 面板规范

Trace 面板用于 RunEvent、ToolCall、ModelCall、成本、延迟和错误追溯。

固定规则：

- Trace 面板展示 RunEvent ViewModel，不展示 LangGraph raw state。
- Tool 调用展示 ToolCall ViewModel，不展示 Tool 原始输出直出 UI。
- 模型调用展示 ModelCall ViewModel，不展示 provider 原始响应。
- 成本、token、latency 必须来自 Model Gateway 记录后的 Contract / ViewModel。
- 风险等级和权限信息必须来自 Tool Registry / governance 对应契约字段。

Trace 面板区域：

- Run summary。
- Event timeline。
- Tool calls。
- Model calls。
- Cost and latency。
- Error detail。
- Source Evidence 入口。

## 19. Report / Source Evidence 展示规范

Report 和 Source Evidence 是分析结论可追溯的核心 UI。

Report 展示规则：

- 报告正文使用 Report / ReportSection ViewModel。
- 决策建议使用 Decision / ActionSuggestion ViewModel。
- 报告段落必须能关联 Source Evidence。
- 报告中的状态、风险、置信度和引用入口必须使用 shared UI。
- 报告 UI 不直接展示模型原始输出。

Source Evidence 展示规则：

- SourceEvidence 字段来自 contracts：`sourceEvidenceId`、`runId`、`sourceType`、`sourceId`、`title`、`snippet`、`metadata`、`confidence`、`createdAt`。
- `sourceType` 可包括 `data_table`、`metric`、`knowledge_document`、`knowledge_chunk`、`sql_query`、`analysis_memory`、`decision_memory`。
- 证据列表使用 `SourceEvidenceList`。
- 证据详情使用 Drawer。
- 证据不得被重命名为 `sources`、`references` 或其他同义字段。

## 20. 各一级模块页面蓝图

### 20.1 全局 AppShell

| 字段 | 内容 |
| --- | --- |
| 页面名称 | 全局 AppShell |
| 路由 | 所有 Console 路由外壳 |
| 所属模块 | 全局布局 |
| 页面目标 | 提供统一导航、Header、工作区上下文和页面容器 |
| 桌面布局 | 固定 Sider + Header + Content + 可选右侧辅助面板 |
| 移动端布局 | TopBar + DrawerMenu + 单列 Content + Drawer / Tabs 辅助区 |
| 顶部区域 | Workspace 切换、环境标识、通知、用户入口、全局操作 |
| 左侧区域 | 固定一级模块导航 |
| 主内容区 | 当前页面入口渲染区域 |
| 右侧辅助区 | Run Trace、Source Evidence、Report Outline、审计详情 |
| 主要入口 | Workspace、Dashboard、Analysis、Reports、Data & Knowledge、Metrics、Memory、Feedback、Evaluation、Models & Tools、Governance、Observability、Platform Operations、Settings |
| 主要操作 | 切换 workspace、打开导航、打开全局通知、进入用户设置 |
| 空态 | `EmptyState` 展示无 workspace 或无权限入口 |
| 加载态 | `LoadingState` 展示 workspace / user / role 加载 |
| 错误态 | `ErrorState` 展示上下文加载失败 |
| 权限态 | 根据 Role / PermissionPolicy ViewModel 控制菜单可见和禁用 |
| 数据来源 | Workspace、User、Role、PermissionPolicy Contract -> ViewModel |
| 关联 contracts | Workspace、User、Role、PermissionPolicy、Notification |
| 必须使用的 shared/ui | EmptyState、ErrorState、LoadingState、StatusTag |
| 禁止项 | 不新增孤立一级模块；不在 AppShell 解析 raw API response；不使用 DB 字段；不接模型或 Tool 原始输出 |

### 20.2 Dashboard 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Dashboard 页面 |
| 路由 | `/dashboard` |
| 所属模块 | Business Dashboard |
| 页面目标 | 展示经营总览、核心指标、异常、数据质量和平台运行摘要 |
| 桌面布局 | PageHeader + FilterBar + SummaryBand + 图表网格 + 异常 / 证据右侧面板 |
| 移动端布局 | 单列 SummaryCard + 图表卡片 + 异常列表，证据进入 Drawer |
| 顶部区域 | 时间范围、业务域、刷新、导出入口 |
| 左侧区域 | AppShell 一级导航 |
| 主内容区 | MetricCard、趋势图、异常列表、数据质量摘要 |
| 右侧辅助区 | 指标血缘、Source Evidence、异常解释 |
| 主要入口 | AppShell Dashboard 导航 |
| 主要操作 | 切换时间范围、筛选业务域、查看指标详情、打开 Source Evidence |
| 空态 | 无指标或无业务域时使用 EmptyState |
| 加载态 | 指标和图表加载使用 LoadingState |
| 错误态 | 指标获取失败使用 ErrorState |
| 权限态 | 无经营数据权限时展示权限空态，不泄漏指标值 |
| 数据来源 | Metric、MetricThreshold、MetricLineage、DataQualityCheck Contract -> Dashboard ViewModel |
| 关联 contracts | Metric、MetricFormula、MetricThreshold、MetricLineage、DataQualityCheck、SourceEvidence |
| 必须使用的 shared/ui | MetricCard、StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState、SourceEvidenceList |
| 禁止项 | 不直接渲染 SQL 结果；不使用数据库字段；不写业务口径计算；不新增 Dashboard 外独立模块 |

### 20.3 Analysis 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Analysis 页面 |
| 路由 | `/analysis` |
| 所属模块 | Agent Analysis、Multi-Agent Runtime |
| 页面目标 | 承载分析任务创建、运行状态、Agent 过程、Trace 和结果预览 |
| 桌面布局 | PageHeader + 输入 / 任务区 + Run 列表或工作区 + 右侧 Trace 面板 |
| 移动端布局 | 输入区、运行摘要、结果 Tabs；Trace 使用 Drawer |
| 顶部区域 | 新建分析、业务域、运行状态筛选 |
| 左侧区域 | AppShell 一级导航，可选 Analysis Run 列表 |
| 主内容区 | 分析输入、AnalysisTask、AnalysisRun、运行结果预览 |
| 右侧辅助区 | TraceTimeline、ToolCallCard、ModelCallCard、SourceEvidenceList |
| 主要入口 | AppShell Analysis 导航、Dashboard 异常跳转 |
| 主要操作 | 创建分析任务、查看运行、取消运行、打开 Trace、打开报告 |
| 空态 | 无分析任务时使用 EmptyState |
| 加载态 | 创建任务、加载运行过程使用 LoadingState |
| 错误态 | 运行失败或加载失败使用 ErrorState |
| 权限态 | 无分析权限或工具权限不足时展示权限态和审批入口 |
| 数据来源 | AnalysisTask、AnalysisRun、RunEvent、ToolCall、ModelCall、SourceEvidence Contract -> ViewModel |
| 关联 contracts | AnalysisTask、AnalysisRun、RunEvent、ToolCall、ModelCall、SourceEvidence、RiskRule、PermissionPolicy |
| 必须使用的 shared/ui | StatusTag、RiskBadge、TraceTimeline、ToolCallCard、ModelCallCard、SourceEvidenceList、EmptyState、ErrorState、LoadingState |
| 禁止项 | UI 不读取 LangGraph raw state；Agent 不绕过 Tool Registry；模型调用不绕过 Model Gateway；不写 mockRun / realRun 双链路 |

### 20.4 Reports 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Reports 页面 |
| 路由 | `/reports` |
| 所属模块 | Report & Decision |
| 页面目标 | 管理分析报告、报告段落、Source Evidence、决策建议和采纳状态 |
| 桌面布局 | 报告列表 + 报告阅读区 + 右侧 Report Outline / Source Evidence |
| 移动端布局 | 报告列表与报告详情分屏跳转；Outline 和 Evidence 使用 Drawer / Tabs |
| 顶部区域 | 报告搜索、状态筛选、时间范围 |
| 左侧区域 | AppShell 一级导航，可选报告列表 |
| 主内容区 | ReportSection、DecisionCard、ActionSuggestion 列表 |
| 右侧辅助区 | Report Outline、SourceEvidenceList、Decision 详情 |
| 主要入口 | AppShell Reports 导航、Analysis 运行完成跳转 |
| 主要操作 | 查看报告、查看证据、记录决策、反馈报告 |
| 空态 | 无报告时使用 EmptyState |
| 加载态 | 报告加载使用 LoadingState |
| 错误态 | 报告加载失败使用 ErrorState |
| 权限态 | 无报告访问权限时隐藏报告内容并展示权限态 |
| 数据来源 | Report、ReportSection、Decision、ActionSuggestion、SourceEvidence Contract -> ViewModel |
| 关联 contracts | Report、ReportSection、Decision、ActionSuggestion、SourceEvidence、Feedback |
| 必须使用的 shared/ui | ReportSection、DecisionCard、SourceEvidenceList、FeedbackPanel、StatusTag、EmptyState、ErrorState、LoadingState |
| 禁止项 | 不直接展示模型原始输出；SourceEvidence 不重命名为 references；不在 UI 中生成业务决策 |

### 20.5 Data & Knowledge 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Data & Knowledge 页面 |
| 路由 | `/data-knowledge` |
| 所属模块 | Data Source & Ingestion、Knowledge & RAG |
| 页面目标 | 管理数据源、数据表、字段字典、知识文档和知识切片 |
| 桌面布局 | 左侧资源树 + 主表格 / 文档列表 + 右侧详情 / Source Evidence |
| 移动端布局 | 资源分类 Tabs + 卡片列表 + 详情 Drawer |
| 顶部区域 | 新增数据源、上传知识文档、搜索、状态筛选 |
| 左侧区域 | 数据源、数据表、知识库分类树 |
| 主内容区 | DataSource、DataTable、DataField、KnowledgeDocument、KnowledgeChunk 列表 |
| 右侧辅助区 | 字段详情、文档切片详情、数据质量、引用关系 |
| 主要入口 | AppShell Data & Knowledge 导航 |
| 主要操作 | 查看数据源、查看字段、查看文档、查看知识切片 |
| 空态 | 无数据源或知识文档时使用 EmptyState |
| 加载态 | 列表和详情加载使用 LoadingState |
| 错误态 | 数据源或文档加载失败使用 ErrorState |
| 权限态 | 无数据或知识访问权限时展示权限态 |
| 数据来源 | DataSource、DataTable、DataField、KnowledgeDocument、KnowledgeChunk Contract -> ViewModel |
| 关联 contracts | DataSource、DataTable、DataField、KnowledgeDocument、KnowledgeChunk、DataQualityCheck、SourceEvidence |
| 必须使用的 shared/ui | StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState、SourceEvidenceList |
| 禁止项 | UI 不接数据库字段；不直接执行 SQL；不做 RAG 真实检索；不把 Navicat 结构当事实源 |

### 20.6 Metrics 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Metrics 页面 |
| 路由 | `/metrics` |
| 所属模块 | Metric & Semantic Layer |
| 页面目标 | 管理指标定义、公式、阈值、口径和血缘 |
| 桌面布局 | 指标目录 + 指标表格 + 公式 / 阈值 / 血缘详情面板 |
| 移动端布局 | 指标卡片列表 + 指标详情 Tabs |
| 顶部区域 | 新建指标、业务域筛选、状态筛选、搜索 |
| 左侧区域 | 业务域、指标分类 |
| 主内容区 | Metric 表格、公式、阈值、血缘图 |
| 右侧辅助区 | MetricFormula、MetricThreshold、MetricLineage 详情 |
| 主要入口 | AppShell Metrics 导航、Dashboard 指标详情跳转 |
| 主要操作 | 查看指标、查看公式、查看阈值、查看血缘 |
| 空态 | 无指标时使用 EmptyState |
| 加载态 | 指标和血缘加载使用 LoadingState |
| 错误态 | 指标加载失败使用 ErrorState |
| 权限态 | 无指标管理权限时禁用编辑操作 |
| 数据来源 | Metric、MetricFormula、MetricThreshold、MetricLineage Contract -> ViewModel |
| 关联 contracts | Metric、MetricFormula、MetricThreshold、MetricLineage、BusinessDomain、DataField、DataTable |
| 必须使用的 shared/ui | MetricCard、StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | 不在 UI 中计算指标口径；不直接渲染数据库字段；不做多字段兜底 |

### 20.7 Memory 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Memory 页面 |
| 路由 | `/memory` |
| 所属模块 | Memory Center |
| 页面目标 | 展示用户、工作区、分析和决策长期记忆及其使用情况 |
| 桌面布局 | Memory 类型筛选 + 列表 + 右侧使用记录 / 关联对象 |
| 移动端布局 | 类型 Tabs + Memory 卡片 + 详情 Drawer |
| 顶部区域 | memoryType 筛选、搜索、时间范围 |
| 左侧区域 | Memory 类型和业务域筛选 |
| 主内容区 | MemoryItem 列表与摘要 |
| 右侧辅助区 | MemoryUsagePanel、关联 AnalysisRun / Decision |
| 主要入口 | AppShell Memory 导航、Analysis Trace 中 Memory 入口 |
| 主要操作 | 查看记忆、查看关联运行、查看关联决策 |
| 空态 | 无 MemoryItem 时使用 EmptyState |
| 加载态 | Memory 列表加载使用 LoadingState |
| 错误态 | Memory 加载失败使用 ErrorState |
| 权限态 | 无记忆访问权限时隐藏内容 |
| 数据来源 | MemoryItem Contract -> ViewModel |
| 关联 contracts | MemoryItem、AnalysisRun、Decision、Workspace、User |
| 必须使用的 shared/ui | MemoryUsagePanel、StatusTag、EmptyState、ErrorState、LoadingState |
| 禁止项 | Memory 不等于 Feedback 或 Evaluation；UI 不写记忆策略；不直接展示模型原始记忆片段 |

### 20.8 Feedback 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Feedback 页面 |
| 路由 | `/feedback` |
| 所属模块 | Feedback Center |
| 页面目标 | 管理用户对分析结果、报告和建议的反馈与人工纠错 |
| 桌面布局 | Feedback 列表 + 反馈详情 + 右侧关联报告 / Bad Case 入口 |
| 移动端布局 | Feedback 卡片列表 + 详情 Drawer |
| 顶部区域 | feedbackType 筛选、状态筛选、搜索 |
| 左侧区域 | 反馈类型、业务域、时间范围 |
| 主内容区 | Feedback 列表、纠错内容、关联对象摘要 |
| 右侧辅助区 | 关联 Report、Source Evidence、BadCase |
| 主要入口 | AppShell Feedback 导航、Reports / Analysis 反馈入口 |
| 主要操作 | 查看反馈、查看纠错、打开关联报告、进入 Bad Case |
| 空态 | 无反馈时使用 EmptyState |
| 加载态 | Feedback 加载使用 LoadingState |
| 错误态 | Feedback 加载失败使用 ErrorState |
| 权限态 | 无反馈处理权限时禁用处理操作 |
| 数据来源 | Feedback Contract -> ViewModel |
| 关联 contracts | Feedback、Report、SourceEvidence、ActionSuggestion、BadCase |
| 必须使用的 shared/ui | FeedbackPanel、StatusTag、EmptyState、ErrorState、LoadingState、SourceEvidenceList |
| 禁止项 | Feedback 不等于 Memory 或 Evaluation；不在 UI 中判定评估结果；不写 mock feedback 链路 |

### 20.9 Evaluation 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Evaluation 页面 |
| 路由 | `/evaluation` |
| 所属模块 | Evaluation Center |
| 页面目标 | 管理评估数据集、评估运行、评分和 Bad Case |
| 桌面布局 | Dataset / Run Tabs + 评估表格 + 右侧评分和 Bad Case 详情 |
| 移动端布局 | Tabs + 评估卡片 + 详情 Drawer |
| 顶部区域 | 新建评估、状态筛选、数据集筛选、时间范围 |
| 左侧区域 | EvaluationDataset 列表或筛选 |
| 主内容区 | EvaluationRun、EvaluationScore、BadCase 表格和图表 |
| 右侧辅助区 | 评分详情、失败原因、关联 AnalysisRun / Feedback |
| 主要入口 | AppShell Evaluation 导航、Feedback Bad Case 入口 |
| 主要操作 | 查看评估运行、查看评分、查看 Bad Case、查看关联运行 |
| 空态 | 无评估数据集或运行时使用 EmptyState |
| 加载态 | 评估数据加载使用 LoadingState |
| 错误态 | 评估加载失败使用 ErrorState |
| 权限态 | 无评估权限时禁用创建和查看详情 |
| 数据来源 | EvaluationDataset、EvaluationRun、EvaluationScore、BadCase Contract -> ViewModel |
| 关联 contracts | EvaluationDataset、EvaluationRun、EvaluationScore、BadCase、AnalysisRun、Feedback |
| 必须使用的 shared/ui | EvaluationScoreCard、StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | Evaluation 不等于 Feedback 或 Memory；不在 UI 中运行 DeepEval / RAGAs；不写业务范围外评估逻辑 |

### 20.10 Models & Tools 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Models & Tools 页面 |
| 路由 | `/model-tools` |
| 所属模块 | Tool Registry / MCP Adapter、Model / Prompt / Tool / RAG Management |
| 页面目标 | 管理模型配置、路由策略、Prompt、Tool 定义和 RAG 策略 |
| 桌面布局 | Tabs + 配置表格 + 右侧 schema / 风险 / 权限详情 |
| 移动端布局 | 配置类型 Tabs + 卡片列表 + 详情 Drawer |
| 顶部区域 | 配置类型切换、搜索、状态筛选 |
| 左侧区域 | Model、Prompt、Tool、RAG 分类 |
| 主内容区 | ModelConfig、RoutingPolicy、PromptVersion、ToolDefinition、RagStrategy 列表 |
| 右侧辅助区 | Tool schema、permission、riskLevel、routing detail |
| 主要入口 | AppShell Models & Tools 导航 |
| 主要操作 | 查看配置、查看 Tool schema、查看风险等级、查看路由策略 |
| 空态 | 无配置时使用 EmptyState |
| 加载态 | 配置加载使用 LoadingState |
| 错误态 | 配置加载失败使用 ErrorState |
| 权限态 | 无模型或工具管理权限时禁用编辑和危险操作 |
| 数据来源 | ModelConfig、RoutingPolicy、PromptVersion、ToolDefinition、RagStrategy Contract -> ViewModel |
| 关联 contracts | ModelConfig、RoutingPolicy、PromptVersion、ToolDefinition、RagStrategy、RiskRule、PermissionPolicy |
| 必须使用的 shared/ui | StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | 模型调用不得绕过 Model Gateway；工具调用不得绕过 Tool Registry；不新增 provider 双轨；不在 UI 中执行 Tool |

### 20.11 Governance 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Governance 页面 |
| 路由 | `/governance` |
| 所属模块 | Governance & Security |
| 页面目标 | 管理权限策略、风险规则、SQL Guard、Tool Permission 和审计日志 |
| 桌面布局 | Governance Tabs + 策略 / 规则 / 审计表格 + 右侧详情 |
| 移动端布局 | Tabs + 卡片列表 + 审计详情 Drawer |
| 顶部区域 | 策略类型、风险等级、时间范围、搜索 |
| 左侧区域 | Permission、Risk、Audit 分类 |
| 主内容区 | PermissionPolicy、RiskRule、AuditLog 列表 |
| 右侧辅助区 | 策略详情、风险命中、审计关联对象 |
| 主要入口 | AppShell Governance 导航、危险操作提示跳转 |
| 主要操作 | 查看策略、查看风险规则、查看审计详情 |
| 空态 | 无策略或审计日志时使用 EmptyState |
| 加载态 | Governance 数据加载使用 LoadingState |
| 错误态 | Governance 数据加载失败使用 ErrorState |
| 权限态 | 无安全管理权限时隐藏敏感字段和禁用操作 |
| 数据来源 | PermissionPolicy、RiskRule、AuditLog Contract -> ViewModel |
| 关联 contracts | PermissionPolicy、RiskRule、AuditLog、ToolCall、ModelCall、Report、Decision |
| 必须使用的 shared/ui | StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | UI 不执行权限判断的业务决策；不绕过 SQL Guard；不泄漏敏感字段；不直接访问数据库连接 |

### 20.12 Observability 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Observability 页面 |
| 路由 | `/observability` |
| 所属模块 | Observability & Monitoring |
| 页面目标 | 展示 Run Trace、Tool Trace、Model Trace、成本、延迟和错误率 |
| 桌面布局 | Trace 搜索 / 筛选 + 指标摘要 + Trace 表格 + 右侧详情 |
| 移动端布局 | 摘要卡片 + Trace 卡片列表 + 详情 Drawer |
| 顶部区域 | 时间范围、runId 搜索、状态筛选、错误类型筛选 |
| 左侧区域 | Trace 类型、业务域筛选 |
| 主内容区 | RunEvent、ToolCall、ModelCall、成本和延迟图表 |
| 右侧辅助区 | TraceTimeline、ToolCallCard、ModelCallCard、错误详情 |
| 主要入口 | AppShell Observability 导航、Analysis Trace 跳转 |
| 主要操作 | 搜索 runId、查看 Trace、查看成本、查看错误详情 |
| 空态 | 无 Trace 数据时使用 EmptyState |
| 加载态 | Trace 加载使用 LoadingState |
| 错误态 | Trace 加载失败使用 ErrorState |
| 权限态 | 无观测权限时隐藏 prompt、input、output 等敏感摘要 |
| 数据来源 | RunEvent、ToolCall、ModelCall Contract -> Observability ViewModel |
| 关联 contracts | RunEvent、ToolCall、ModelCall、AnalysisRun、AuditLog |
| 必须使用的 shared/ui | TraceTimeline、ToolCallCard、ModelCallCard、StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | 不直接展示 provider 原始响应；不直接展示 Tool 原始输出；不展示 LangGraph raw state；不把 traceId 当 runId 兜底 |

### 20.13 Platform Operations 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Platform Operations 页面 |
| 路由 | `/platform-operations` |
| 所属模块 | Platform Operations |
| 页面目标 | 管理 Job、通知、数据质量检查和运维任务状态 |
| 桌面布局 | 运维摘要 + Job / Notification / DataQuality Tabs + 详情面板 |
| 移动端布局 | 摘要卡片 + Tabs + 运维任务卡片 |
| 顶部区域 | 状态筛选、任务类型筛选、时间范围 |
| 左侧区域 | Job、Notification、DataQuality 分类 |
| 主内容区 | Job、Notification、DataQualityCheck 列表和状态图表 |
| 右侧辅助区 | Job 详情、失败原因、关联对象 |
| 主要入口 | AppShell Platform Operations 导航 |
| 主要操作 | 查看任务、查看通知、查看数据质量详情 |
| 空态 | 无任务或通知时使用 EmptyState |
| 加载态 | 运维数据加载使用 LoadingState |
| 错误态 | 运维数据加载失败使用 ErrorState |
| 权限态 | 无运维权限时禁用任务操作 |
| 数据来源 | Job、Notification、DataQualityCheck Contract -> ViewModel |
| 关联 contracts | Job、Notification、DataQualityCheck、DataSource、DataTable、Metric |
| 必须使用的 shared/ui | StatusTag、RiskBadge、MetricCard、EmptyState、ErrorState、LoadingState |
| 禁止项 | 不触发未审查部署；不执行 migration；不执行未审查 SQL；不建立第二套部署链路 |

### 20.14 Settings 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Settings 页面 |
| 路由 | `/settings` |
| 所属模块 | Admin / Settings |
| 页面目标 | 管理系统设置、环境配置入口、默认策略和工作区级偏好 |
| 桌面布局 | 设置分类列表 + 设置详情表单 + 右侧说明 / 审计入口 |
| 移动端布局 | 设置分类卡片 + 表单单列 + 审计 Drawer |
| 顶部区域 | 设置分类、保存状态、审计入口 |
| 左侧区域 | Workspace、IAM、默认策略、环境配置分类 |
| 主内容区 | 设置表单、偏好配置、默认策略摘要 |
| 右侧辅助区 | AuditLog、PermissionPolicy 关联信息 |
| 主要入口 | AppShell Settings 导航 |
| 主要操作 | 查看设置、保存设置、查看审计 |
| 空态 | 无可配置项时使用 EmptyState |
| 加载态 | 设置加载使用 LoadingState |
| 错误态 | 设置加载失败使用 ErrorState |
| 权限态 | 无管理权限时表单只读或隐藏 |
| 数据来源 | Workspace、Role、PermissionPolicy、RoutingPolicy、RagStrategy Contract -> ViewModel |
| 关联 contracts | Workspace、Role、PermissionPolicy、RoutingPolicy、RagStrategy、AuditLog |
| 必须使用的 shared/ui | StatusTag、RiskBadge、EmptyState、ErrorState、LoadingState |
| 禁止项 | 前端不暴露模型密钥、数据库连接串或向量库密钥；不散落读取环境变量；不改部署主线 |

### 20.15 Workspace 页面

| 字段 | 内容 |
| --- | --- |
| 页面名称 | Workspace 页面 |
| 路由 | `/workspace` |
| 所属模块 | Workspace / IAM |
| 页面目标 | 管理企业空间、成员、角色和业务域 |
| 桌面布局 | Workspace 信息 + 成员 / 角色 / 业务域 Tabs + 右侧详情 |
| 移动端布局 | Workspace 摘要 + Tabs + 成员 / 角色卡片 |
| 顶部区域 | Workspace 切换、成员邀请、角色管理入口 |
| 左侧区域 | Workspace 列表或业务域筛选 |
| 主内容区 | Workspace、User、Role、BusinessDomain 列表和详情 |
| 右侧辅助区 | 成员详情、角色权限、业务域详情 |
| 主要入口 | AppShell Workspace 入口、Header workspace 切换 |
| 主要操作 | 查看 workspace、查看成员、查看角色、查看业务域 |
| 空态 | 无 workspace 或无成员时使用 EmptyState |
| 加载态 | Workspace 上下文加载使用 LoadingState |
| 错误态 | Workspace 加载失败使用 ErrorState |
| 权限态 | 无 IAM 权限时禁用成员和角色操作 |
| 数据来源 | Workspace、User、Role、BusinessDomain Contract -> ViewModel |
| 关联 contracts | Workspace、User、Role、BusinessDomain、PermissionPolicy |
| 必须使用的 shared/ui | StatusTag、EmptyState、ErrorState、LoadingState |
| 禁止项 | 不在 UI 中做权限业务决策；不泄漏权限外成员信息；不重命名 workspaceId、userId、roleId、businessDomainId |

## 21. UI 实现验收标准

后续 UI 实现 PR 必须满足：

1. 引用本文件和对应页面蓝图。
2. 符合 `Contract -> ViewModel -> UI` 链路。
3. 页面只做编排，不写业务清洗。
4. 组件只消费 ViewModel 和 UI State。
5. API response 必须先通过 mapper 转成 ViewModel。
6. UI 不直接消费 raw API response。
7. UI 不直接使用数据库字段。
8. UI 不直接使用模型原始输出、Tool 原始输出或 LangGraph raw state。
9. 状态标签、风险等级、空态、错误态、加载态使用 `shared/ui`。
10. 设计 token 走 `shared/theme`。
11. 使用 Ant Design 体系，不引入第二套 UI 组件库。
12. 支持桌面端和手机浏览器。
13. 没有 Mock / Real 双链路。
14. 没有无关依赖、无关重构或业务范围外实现。
15. 没有改变当前最终工程骨架。

## 22. UI PR 证据要求

后续 UI PR 必须说明：

```text
关联 Issue：
实现内容：
修改范围：
是否引用 docs/ui-design.md：
是否符合页面蓝图：
是否使用 Ant Design 体系：
是否使用 shared/ui 状态组件：
是否支持桌面端和手机浏览器：
是否符合 Contract -> ViewModel -> UI：
是否存在 raw API response 进入 UI：
是否存在业务逻辑塞进组件：
是否新增第二套 UI 库：
是否改变最终目录结构：
已运行的命令或检查：
风险和未完成事项：
```

UI PR 证据建议包含：

```text
前端页面截图
手机浏览器截图或响应式说明
pnpm --filter @insight-agent/web typecheck
pnpm --filter @insight-agent/web lint
pnpm --filter @insight-agent/web build
```

如果任务是纯文档事实源任务，可以只提供：

```text
git diff -- docs/ui-design.md
```

并说明未运行前端构建、后端测试或数据库 migration 的原因。

## 23. 禁止项

本 UI 事实源固定禁止：

```text
不写业务功能
不接 API
不接数据库
不实现真实 Agent Run
不做模型调用
不做 RAG
不做 Evaluation
不新增第二套 UI 组件库
不扩多个 UI 文档
不写 mock / real 双链路
不写 mockRun / realRun
不在 UI 文档中引入与现有架构冲突的目录结构
不让 Codex 自由新增一级模块
不把 UI 事实源写成教程或泛泛说明
不借本任务调整当前最终工程骨架
```
