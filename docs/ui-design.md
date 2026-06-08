# UI Composition / Navigation / Shared Primitive 事实源

本文档是 Insight Agent Platform 的正式 Web UI 事实源，定义 UI Composition、导航模型、InspectorSlot、Page Composition、shared primitive 和 Web / Mobile Browser 组合规则。

本文件不实现页面代码，不接 API，不接数据库，不实现真实 Agent Run，也不承载当前执行链路中的 Figma Wireframe / Visual Design / Dev Handoff 工作流。

本文档不替代其他事实源：

- `docs/product-design.md` 定义产品能力、对象关系、页面职责和后续功能门禁。
- `docs/architecture.md` 定义系统骨架、模块边界、目录职责和依赖方向。
- `docs/contracts.md` 与 `packages/contracts` 定义业务对象、字段语义、ID 和状态。
- `docs/ui-design.md` 只定义正式 Web UI 的组合层级、导航规则、Inspector 使用原则和 shared primitive 规则。

## 1. 目标

固定目标：

- 明确正式 Web UI 的组合层级、导航骨架、Inspector 使用原则和 shared primitive 规则。
- 保留 HTML 原型不是正式事实源的规则。
- 明确 `docs/ui-design.md` 不写产品能力总表，不写数据库边界，不写 contracts 语义，不写逐页业务说明书。
- 明确 `docs/ui-design.md` 不再承载当前仓库的 Figma Wireframe / Visual Design / Dev Handoff 流程；如未来存在外部设计稿或 Figma，只能作为补充材料，不得覆盖正式文档事实源。
- 保持当前 monorepo、modular monolith、contracts-first、React / TypeScript / Vite / Ant Design、FastAPI / LangGraph 架构不变。

## 2. UI 事实源层级

事实源层级固定如下：

```text
AGENTS.md / docs/workflow.md
= 执行边界、Issue / PR / 审查流程事实源

docs/architecture.md / docs/contracts.md / packages/contracts / docs/database.md
= 系统能力、产品对象、字段语义、ID、数据库结构事实源

docs/product-design.md
= 产品能力、页面职责、对象关系、模块边界事实源

docs/ui-design.md
= 正式 Web UI 的 Composition、导航骨架、InspectorSlot、Page Composition、shared primitive 规则事实源

docs/prototypes/product-experience.html
= 产品体验原型参考，用于辅助理解用户路径、页面关系、对象归属和入口流向
  不是正式事实源，只能辅助理解产品体验方向

GitHub Issue
= 执行边界事实源

PR
= 履约证明

Code
= 最终工程实现事实源
```

冲突处理：

- `docs/prototypes/product-experience.html` 不得被当作正式 React 组件结构、API、DB、contracts、ViewModel 或真实 Agent Run 的事实源。
- `docs/product-design.md` 决定页面为什么存在、承接哪些产品能力；`docs/ui-design.md` 决定这些页面如何组合、如何导航、如何复用 shared primitive。
- 如果未来存在外部设计稿或 Figma，必须在对应 Issue / PR 中记录链接和版本，但不得覆盖 `docs/product-design.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts` 或本文件。
- 如果文档、Issue、PR、Code 之间发生冲突，必须回到 Issue 审查。

## 3. UI Composition 与导航规则

### 产品体验原型参考承接

- `docs/prototypes/product-experience.html` 是产品体验原型 / 用户流程参考 / 可点击验证稿。
- 它用于辅助理解用户逻辑、页面跳转、对象归属、页面职责和入口关系。
- 它不定义正式 UI 结构。
- 它不定义 React 组件结构。
- 它不定义导航实现。
- 它不定义 Inspector 实现。
- 它不定义 contracts / API / DB / ViewModel。
- 它不定义真实 Agent Run。
- 原型中的内容只有在人工确认并沉淀进正式文档后，才能进入正式 Issue 和代码实现。

### 页面类型

- `Workspace`：最上层容器和当前空间上下文，不作为普通业务菜单项。
- `Dashboard = Finding-first`：先承接问题发现，再进入 Analysis、Reports、Evidence、Metrics。
- `Analysis = Conversation-first`：先承接新聊天草稿态、多轮追问、当前分析上下文和 run 详情。
- `Reports = Report-first`：先承接报告列表、阅读和报告段落。
- `Metrics = 当前 Workspace 的指标语义层`：先承接指标、阈值、口径、血缘、证据和异常上下文；当前阶段只读，采用 LeftNav 二级对象列表 + 主区指标总览与当前指标详情。
- `Platform Operations = 当前 Workspace 的平台与数据链路健康页`：先承接 Job、DataQualityCheck、Notification / Alert、Deployment / Smoke / Migration 摘要；第一版只读，不做全局运维后台。
- `Observability = Run / Trace detail`：全局页后置；当前由 Analysis Run Trace / Drawer 承接单 run 详情，后续再扩展全局观测页。
- `Data & Knowledge`：数据、知识和证据资产页。
- `Models & Tools`：模型、Prompt、Tool、RAG 策略等平台配置页。
- `Governance / Feedback / Evaluation / Memory / Platform Operations / Settings`：支撑、治理、质量和平台能力页。

### LeftNav / 导航模型

- `Workspace` 是顶部上下文，不是普通菜单项。
- 全局导航只承载当前 `Workspace` 下的主工作区和能力分组。
- `Analysis`、`Reports`、`Metrics`、`Data & Knowledge` 可以进入模块内导航或二级对象列表。
- 模块内导航覆盖 LeftNav 区域，并提供返回主导航能力。
- 详情型页面不应默认作为主业务一级入口。
- 切换 `Workspace` 时，导航可以保留 route，但模块内导航、Inspector 和选中对象必须回到当前 `Workspace` 作用域，不得继续复用上一 `Workspace` 的对象状态。
- `Metrics` 的 LeftNav 二级列表承接当前 `Workspace` 的 Metric list，复用 `ObjectListNav / ShellNavListItem`；列表项只显示指标名，不展示当前值、趋势、证据数、按钮或大段描述。
- `Data & Knowledge` 的 LeftNav 二级列表承接当前 `Workspace` 的 grouped asset list，复用 grouped object list；分组固定为 `数据资产 Data` 和 `知识文档 Docs`。
- `Data & Knowledge` 的分组标题不可选，不代表 route，不代表新的业务对象；列表项只负责选择当前资产，不承载字段、证据、质量摘要或动作按钮。
- `Data & Knowledge` 一级入口需要和 `Analysis / Reports / Metrics` 等存在二级列表的入口保持一致的可进入提示。

建议结构：

- 全局导航：`Workspace 当前空间`、`Dashboard`、`Analysis`、`Reports`、`Metrics`、`Data & Knowledge`、`Models & Tools`、`Governance`、`Memory`、`Observability`、`Feedback`、`Evaluation`、`Platform Operations`、`Settings`。
- 模块内导航：`Analysis = 会话列表 / 新建会话 / 搜索会话`；`Reports = 报告列表 / 报告筛选`；`Metrics = 当前 Workspace 指标列表 / 搜索指标`；`Data & Knowledge = 当前 Workspace grouped asset list / 搜索资产`。
- 详情型入口：`Analysis = Run / Trace detail`；`Data & Knowledge = Evidence / Source detail`；`Metrics = Metric detail`；`Feedback / Evaluation = 质量闭环入口`。

### InspectorSlot

- Inspector 不是每页默认右侧说明栏。
- Inspector 是统一的可插拔上下文插槽。
- 页面可以选择是否启用 Inspector。
- 页面通过当前选中对象提供 `inspectorContext`。
- Inspector 根据 `subjectType` 插入能力卡片。

默认策略：

- `Dashboard` 默认不启用 Inspector。
- `Analysis` 需要 Inspector，用于当前草稿上下文、run、evidence、report、feedback 上下文。
- `Reports` 可选启用 Inspector，用于报告段落、证据、反馈和来源上下文。
- `Data & Knowledge` 使用轻量 Inspector，固定承接 `Workspace Overview`、`Readonly Boundary`、`Quality & Operations Summary`、`Actions`、`Technical Boundary`。
- `Metrics / Models & Tools / Governance / Platform Operations` 第一版默认不强制启用 Inspector。

建议能力卡片类型：

- `RunSummary`
- `TraceSummary`
- `Evidence`
- `Source`
- `Report`
- `Feedback`
- `Metric`
- `ModelTool`

## 4. Page Composition Rules

Page Composition 是正式 Web 页面默认组合层级。

默认页面编排必须使用 `AppSectionStack / AppSection / AppCardGrid / AppBaseCard / AppActionGroup / AppActionButton` 单轨。

特殊页面可以不用 `AppCardGrid` 作为主结构，但仍必须复用底层 `Card / Action / Tag / InspectorSlot` 规则。

明确禁止：

- 恢复 `AppContentCard`。
- 形成 `AppContentCard / AppBaseCard` 双轨。
- 页面私自重建 `Card / Tag / Action / Grid` 外壳。
- 万能 JSON 页面渲染器。
- 万能业务卡片。

### 默认页面层级

```text
AppShell
└─ Page
   └─ AppSectionStack
      └─ AppSection
         └─ AppCardGrid
            └─ AppBaseCard / MetricCard / 基于 AppBaseCard 的页面私有业务卡片
               └─ AppActionGroup
                  └─ AppActionButton
```

### AppSectionStack

- 统一页面内部 section 垂直排列。
- 统一页面主内容 padding / section spacing。
- 不读取 ViewModel，不写业务文案，不绑定路由，不接 API，不做视觉风格化。

### AppSection

- 统一 Section eyebrow / title。
- 统一 Section Header 右侧模块入口。
- 统一 Section content 的 `AppCardGrid`。
- 接收 `columns` 和 section action。
- 不读取 ViewModel，不写业务文案，不绑定路由，不接 API，不做视觉风格化。

### AppCardGrid / Card / Tag / Action

- `AppCardGrid` 只负责 section 内卡片列数、gutter、左对齐和响应式断点。
- `AppBaseCard` 是唯一内容卡片外壳底座，`MetricCard` 必须基于 `AppBaseCard`。
- `RiskBadge` / `StatusTag` 只负责状态与风险标签表达。
- `AppActionGroup` / `AppActionButton` 只负责动作排序和按钮层级。

### Route Action Adapter

- `shared/ui` 不知道 route。
- route-aware action helper 放在 `app/router`。
- helper 负责把 route、variant、iconName、label、onNavigate 转成 `AppActionGroupItem`。
- 后续入口跳转不得在页面中随意散写。
- `Open in Analysis with context` 等能力必须通过统一 action helper 承接上下文，不得页面临时拼按钮。
- 页面入口只表达导航、Analysis 新聊天草稿态入口或只读摘要入口，不等于真实执行。

### Page Archetype

默认页面必须使用 `AppSectionStack` + `AppSection` + `AppCardGrid`。

特殊页面必须落入明确 Page Archetype：

- Overview Page：`Dashboard / Metrics / Platform Operations`
- Management Page：`Data & Knowledge / Models & Tools / Governance / Settings`
- Conversation Workspace：`Analysis`
- Reader Page：`Reports`
- Timeline / Detail Page：`Analysis Run Trace / Drawer`，后续扩展到 `Observability`

Analysis 会话能力承载在 Analysis 页面，不新增 Conversation 一级页面。

### AI Platform Presentation Boundary

- UI 只展示标准化 `Contract / 聚合对象 -> ViewModel -> Page Composition` 结果，不展示底层 runtime 的 raw 输出。
- `Conversation Workspace = Analysis`：主区承接 `Conversation / Chat`，Inspector 承接当前 `runId` 的 `Run Trace`，Drawer 承接当前 `run event detail`；页面不得展示 `LangGraph raw state`、`Tool raw output`、`raw provider response`。
- `Reader Page = Reports`：只展示结构化 `Report / ReportSection / Decision / ActionSuggestion / SourceEvidence`，不得把模型 markdown 原文直接当正式报告资产。
- `Overview Page = Metrics / Platform Operations`：只展示当前 Workspace 的只读语义摘要、平台健康摘要和 Analysis 草稿态入口；入口只表示导航或草稿态，不创建真实 conversation、run、Job 或部署执行。
- `Management Page = Data & Knowledge / Models & Tools / Governance / Settings`：承接资产、配置、治理和默认策略入口，但不自造执行链路，也不把 Management Page 写成孤岛。
- `Data & Knowledge` 页面采用 `grouped asset navigation + relationship graph + Inspector` 结构；主区核心是当前 selected asset 的 relationship graph，不再以全局总览卡片堆叠作为核心结构。
- `Data & Knowledge` 页面只展示 `DataSource / DataTable / DataField / KnowledgeDocument / KnowledgeChunk / SourceEvidence / DataQualityCheck` 的标准化 ViewModel；`MainContent` 固定为 `SelectedAssetHeader + AssetRelationshipGraph + SelectedNodeDetail`，`Inspector` 承接 `Workspace Overview / Quality / Actions / Readonly Boundary / Technical Boundary`，不直接展示 `raw vector / raw embedding / raw score / raw SQL result / raw API response`。
- `Data & Knowledge` 的 `DataSource` 主线固定为 `DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report`；`KnowledgeDocument` 主线固定为 `KnowledgeDocument -> Chunk Group(ViewModel only) -> KnowledgeChunk -> SourceEvidence -> Run / Report`。
- `Models & Tools` 页面只展示 `ModelConfig / RoutingPolicy / PromptVersion / ToolDefinition / RagStrategy` 及其跳转入口，不直接调用模型或 Tool，不展示密钥，不绕过 `Model Gateway / Tool Registry`。
- UI 只能展示 `Model Gateway / Tool Registry / Governance Policy` 的标准化 ViewModel，不展示 `provider raw response`、`tool raw output`、`handler payload`、`permission raw policy`、`LangGraph raw state`、`raw vector` 或 `raw embedding`。
- UI 上的“调用 / 运行 / 检索 / 评估 / 发布”入口，在当前静态阶段只能表示导航、只读预览或草稿态入口，不代表真实执行。
- `Governance` 页面只展示 `PermissionPolicy / RiskRule / SQL Guard / Tool Permission / AuditLog / Sensitive Field` 的治理结果，不在 UI 中做权限业务决策或直接写审计。
- `Timeline / Detail Page = Analysis Run Trace / Drawer`，后续全局 `Observability` 继续承接标准化 `RunEvent / ToolCall / ModelCall / cost / latency / errorType / fallbackReason / external trace mapping`。
- `Evaluation` 页面承接 `EvaluationDataset / EvaluationRun / EvaluationScore / BadCase` 的标准化结果，保留 `DeepEval / RAGAs / LangSmith Dataset` 对接方向，不把用户 Feedback 直接当 Evaluation。
- `Settings` 页面只展示当前 Workspace 的默认策略入口和只读配置摘要，默认模型策略跳转 `Models & Tools`，默认 RAG 策略跳转 `Models & Tools / Data & Knowledge`，默认权限策略跳转 `Governance`。

### Metrics / Platform Operations Composition

- `Metrics` 属于 `Overview Page`，但允许在 LeftNav 区域使用二级对象列表承接当前 `Workspace` 的指标目录。
- `Metrics` 左侧列表必须复用 `ObjectListNav / ShellNavListItem`，只负责选择当前指标。
- `Metrics` 主区固定为 `指标总览 + selectedMetric detail`，详情区承接业务定义、当前摘要、公式、阈值 / 异常规则、字段血缘摘要、证据摘要和动作区。
- `Metrics` 第一版不强制启用 `InspectorSlot`；`Open in Analysis with context` 只进入 Analysis 新聊天草稿态，不立即创建 conversation 或 run。
- `Platform Operations` 属于 `Overview Page`，第一版默认使用 `AppSectionStack / AppSection / AppCardGrid / AppBaseCard / StatusTag / RiskBadge / AppActionGroup` 单轨组合。
- `Platform Operations` 第一版固定承接当前 `Workspace` 的平台运维总览、Job 状态、数据质量检查、通知 / 告警摘要、Deployment / Smoke / Migration 状态和风险 / 详情入口。
- `Platform Operations` 第一版不强制启用 `InspectorSlot`，也不应被设计成全局 SRE / admin 运维后台 UI。

## 5. Shared Primitive Rules

shared primitive 固定包括：

- `AppSectionStack`
- `AppSection`
- `AppCardGrid`
- `AppBaseCard`
- `MetricCard`
- `AppActionGroup`
- `AppActionButton`
- `RiskBadge`
- `StatusTag`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- `InspectorSlot`
- `RelationshipGraphCanvas`

统一 UI 设计语言固定如下：

```text
基础组件：Ant Design v5
AI 对话 / 输入 / 回复类场景：Ant Design X
复杂中后台表格 / 表单 / 详情：ProComponents 按需
图表：ECharts / Ant Design Charts
关系图：`shared/graph` 封装的 `RelationshipGraphCanvas`，底层使用 `@antv/g6`
状态组件：shared/ui
主题变量：shared/theme
```

规则：

- 不引入第二套 UI 组件库。
- 不每个页面自建按钮、卡片、状态色或反馈样式。
- 状态标签、风险等级、空态、错误态、加载态必须通过 `shared/ui` 收敛。
- 颜色、字号、间距、圆角、阴影等必须能映射到 `shared/theme` token。
- `@antv/g6` 是项目级只读关系图展示底座，不是业务页面直接使用的图谱库。
- 只有 `apps/web/src/shared/graph/**` 可以直接 import `@antv/g6`；业务页面和 module 只能传入标准化 `RelationshipGraphViewModel`。
- `shared/graph` 只承接只读关系图展示、节点点击、选中态、fit view、zoom、pan 等查看能力，不承接可编辑 workflow、创建边、删除节点或写回业务数据。
- `Data & Knowledge`、后续 `RunTrace`、`Metrics lineage` 等图谱场景必须复用 `shared/graph`，不得各自散写 G6。
- 页面组件不得直接消费 raw API response。
- 页面组件不得直接使用数据库字段、模型原始输出、Tool 原始输出或 LangGraph raw state。

明确禁止：

- 业务页面直接 import `@antv/g6`。
- 在 `Data & Knowledge` 页面内创建业务私有 G6 canvas。
- 新增 `DataKnowledgeGraphCanvas / RunTraceGraphCanvas / MetricsLineageGraphCanvas` 这类直接包 G6 的业务图组件。
- 把关系图做成可编辑 Workflow Builder。
- 把 G6 instance 泄漏到业务页面。

### Card Slot 结构

所有内容卡片遵守统一 slot：

```text
Card
├─ Header
│  ├─ Eyebrow / 类型说明
│  ├─ Title
│  └─ Tag Slot，右上角
│
├─ Main
│  ├─ Value / Summary / Main Content
│  └─ Description
│
├─ Meta
│  ├─ 趋势
│  ├─ 证据数
│  ├─ 来源
│  └─ 可信度
│
└─ Footer Actions
   └─ AppActionGroup，左下横向排列
```

公共组件承接：

- `AppBaseCard` 只负责 `eyebrow`、`title`、`tagSlot`、`children`、`description`、`meta`、`footerActions` slot 布局。
- `MetricCard` 是基于 `AppBaseCard` 的指标专用卡片，必须支持 header tag slot 和 footer actions；趋势、证据数、来源等进入 meta 区。
- `AppActionButton` 负责单个按钮 variant 到 Ant Design Button props 的映射。
- `AppActionGroup` 负责多个按钮的横向排列和 variant 自动排序。

### Tag 与 Action 位置规则

- Risk Tag / 风险标签固定在卡片 Header 右上角，表示当前卡片对象风险等级，最多 1 个。
- Status Tag / 状态标签仅在非 ready 状态展示，位置同 Header 右上角。
- ready 状态默认不展示。
- 页面级主操作放在 Hero / 页面头部右侧。
- Section 级模块入口放在 Section Header 右侧。
- 卡片内部动作统一放在 Footer Actions 左下横向排列。
- Inspector 内动作在分组内左对齐横向排列。

### Section Card Grid Rules

- 页面通过 `columns` 声明布局语义，不长期手写 `Row` / `Col` 摆放卡片。
- `AppCardGrid` 不读取 ViewModel，不绑定路由，不写业务文案，不做视觉风格化，不新增 token，不引入新依赖。

Columns 规则：

| columns | 桌面 | 中屏   | 小屏 | 用途                       |
| ------- | ---- | ------ | ---- | -------------------------- |
| `1`     | 1 列 | 1 列   | 1 列 | 平台质量、整行摘要、长内容 |
| `2`     | 2 列 | 1-2 列 | 1 列 | 指标、风险、报告 / 证据    |
| `3`     | 3 列 | 2 列   | 1 列 | 状态卡、能力入口           |
| `4`     | 4 列 | 2 列   | 1 列 | Hero facts / 小摘要卡      |

对齐规则：

- Section Header 右侧只放模块级入口。
- Section 内容卡片默认左对齐，按数据顺序排列。
- 不允许卡片因为数量不足而右对齐或居中。
- 单对象摘要使用 `columns={1}` 占满整行。
- 列表型 section 即使只有一个数据项，也默认从左开始排列。

### Shared Boundary

- 只有跨业务域复用才进入 `shared`。
- 单一 module 内部组件不得提前抽到 `shared`。
- `shared` 组件不得依赖 module。
- `shared` 组件只消费 ViewModel、UI State 或 contract 枚举。
- `shared` 组件不得访问数据库字段、模型原始输出、Tool 原始输出、LangGraph raw state、raw provider response、raw vector、raw embedding 或 raw SQL result。

### Interaction States

- 业务状态必须来自 contracts 枚举。
- `StatusTag / RiskBadge` 只承接业务状态和风险等级表达。
- 不允许 `done / success / completed` 多字段兜底。
- loading 使用 `LoadingState`。
- empty 使用 `EmptyState`。
- error 使用 `ErrorState`。
- success / warning / info / error 属于 UI 操作反馈，不等于业务状态。
- 权限态来自 `Role / PermissionPolicy / Governance` 结果；UI 只展示禁用态、只读态、权限空态或审批入口，不做权限业务决策。

## 6. Web / Mobile Browser 适配规则

Web 与 Mobile Browser 是同一产品链路的不同布局，不允许形成双实现主线。

Web 规则：

- 左侧导航和顶部 Header 由 AppShell 承载。
- 主内容区承载页面核心任务。
- InspectorSlot 可承载 Trace、Source Evidence、Report Outline、审计详情和配置详情。
- 表格、图表、报告和详情必须有清晰区域边界。
- 高风险操作必须有明确确认、权限态和审计入口。

Mobile Browser 规则：

- 左侧导航折叠为 Drawer 或顶部菜单。
- 主内容区单列优先。
- InspectorSlot 改为 Drawer、Tabs 或详情页。
- 表格优先卡片化；确需表格时允许横向滚动，但必须保留主字段和状态。
- 复杂任务拆分为 Steps、Tabs、Collapse 或分段表单。

禁止：

- 不允许 Web 有承接而 Mobile Browser 无承接方式。
- 不允许为 Mobile Browser 建立 mock / real 双链路。
- 不允许因为移动端空间不足而删除必要状态、权限或证据入口。

## 7. 禁止项

固定禁止：

```text
不写业务功能
不接 API
不接数据库
不实现真实 Agent Run
不做模型调用
不做 RAG
不做 Evaluation
不新增第二套 UI 组件库
不新增多个 UI 文档
不写 mock / real 双链路
不借本任务调整当前最终工程骨架
不让外部设计稿或 Figma 成为可以推翻 architecture / contracts / product-design 的事实源
不让 Codex 自由新增页面、模块或组件体系
不把 docs/ui-design.md 写成所有页面细节大百科
```
