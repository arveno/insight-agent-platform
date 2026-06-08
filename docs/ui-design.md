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
- `Metrics` 的 LeftNav 二级列表承接当前 `Workspace` 的 Metric list，复用 shared list primitive；列表项只显示指标名，不展示当前值、趋势、证据数、按钮或大段描述。
- `Data & Knowledge` 的 LeftNav 二级列表承接当前 `Workspace` 的 grouped asset list，复用 grouped object list；分组固定为 `数据资产 Data` 和 `知识文档 Docs`。
- `Data & Knowledge` 的分组标题不可选，不代表 route，不代表新的业务对象；列表项只负责选择当前资产，不承载字段、证据、质量摘要或动作按钮。
- `Data & Knowledge` 一级入口需要和 `Analysis / Reports / Metrics` 等存在二级列表的入口保持一致的可进入提示。
- `app/shell` 只保留通用 App Shell 组件：`AppShell / AppShellLayout / HeaderBar / LeftNav / AppShellInspector`。
- `AnalysisSessionNav / AnalysisInspectorPanel / RunTraceDetailDrawer / ReportsListNav / ReportsInspectorPanel / DataKnowledgeListNav / MetricsListNav` 这类模块专属 nav / inspector / drawer / panel 必须放回对应 `modules/<domain>`。

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

Page Composition 是正式 Web 页面的默认编排层级。

默认页面编排固定为：

```text
AppShell
└─ Page
   └─ SectionStack
      └─ ContentSection
         └─ Ant Flex / Space / Row / Col
            └─ CardSurface / ContentCard / StatCard / 模块内业务组件
               └─ ActionButton / NavigationActionButton
```

规则：

- `SectionStack` 只负责页面 section 间距。
- `ContentSection` 只负责 section 语义、title、description、extra。
- 布局优先使用 Ant `Flex / Space / Row / Col / Layout`。
- `ActionButton` 只负责按钮视觉、variant、icon、loading、disabled、danger。
- `NavigationActionButton` 只负责 route-aware 行为组合，不负责 route 到 Page 的映射。
- `CardSurface` 只负责统一卡片壳；`ContentCard` 负责通用内容结构；`StatCard` 只负责通用数值摘要。
- 业务模块可以在 `modules/<domain>` 内组合业务组件，但不得把业务对象组件塞回 shared。

明确禁止：

- 恢复 `AppActionButton / AppActionGroup / ActionGroup / ActionBar`。
- 恢复 `AppBaseCard / AppCardGrid / MetricCardGrid / SummaryCardGrid`。
- 恢复 `AppPropertyList / SummaryTable`。
- 恢复 `AppSection / AppSectionStack / WebSection`。
- 恢复 `AppTabs / TabsPanel / StaticTabsPanel`。
- 页面私自重建 `Card / Tag / Action / Grid` 外壳。
- 万能 JSON 页面渲染器。
- 万能业务卡片。

### Section Primitive

- `SectionStack` 统一页面主内容的 section 垂直排列和间距。
- `ContentSection` 统一 section 标题区和内容区语义，不绑定卡片、表格、图表、列表或 Graph。
- section 内按钮排列直接使用 Ant `Flex / Space`，不要额外抽 `ActionGroup`。

### Card Primitive

- `CardSurface` 基于 Ant `Card` 做视觉壳薄封装。
- `ContentCard` 组合 `CardSurface`，承接通用标题、描述、extra、body、footer 结构。
- `StatCard` 只用于无业务语义的数值摘要，允许 `supportingMeta / contextMeta` 这类通用辅助信息 slot；不允许 `evidenceSummary`、`MetricDefinition`、业务 contract 或业务对象 props。
- `RiskBadge / StatusTag` 只负责状态表达，不承接业务逻辑。

### List Primitive

- `PropertyList` 承接 key-value / label-value 展示模式，优先基于 Ant `Descriptions / List / Typography`。
- `TitledList / AnnotatedList / SelectableList / GroupedSelectableList` 承接无业务语义的重复列表模式。
- 如果多个模块都展示相似对象列表，应先抽象为无业务 primitive，再由各模块把业务数据映射成通用 item props。
- 不抽 `SourceEvidenceList / ReportSection / TraceTimeline` 这类直接绑定业务对象的 shared 组件。

### Route Action Adapter

- `shared/ui` 不知道 route。
- route-aware action helper 放在 `shared/navigation`，只知道 route key，不知道具体 Page。
- `shared/navigation` 里的 `PageRouteProps` 只允许包含 `onNavigate`；任何 `dataKnowledgeState / metricsState / platformOperationsState / reportsState` 这类 app composition state slot 必须留在 `app/router` 或对应 module page props。
- `app/router` 只负责 route key 到 Page 的映射。
- helper 负责把 route key、variant、iconName、label、onNavigate 转成 `NavigationActionButton` 可消费的通用 action props。
- 后续入口跳转不得在页面中随意散写。
- `Open in Analysis with context` 等能力必须通过统一 navigation helper 承接上下文，不得页面临时拼按钮。
- 页面入口只表达导航、Analysis 新聊天草稿态入口或只读摘要入口，不等于真实执行。

### Page Archetype

默认页面必须使用 `SectionStack` + `ContentSection`，并在 section 内优先使用 Ant 布局 primitive。

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
- `Metrics` 左侧列表必须复用 shared selectable list primitive，只负责选择当前指标。
- `Metrics` 主区固定为 `指标总览 + selectedMetric detail`，详情区承接业务定义、当前摘要、公式、阈值 / 异常规则、字段血缘摘要、证据摘要和动作区。
- `Metrics` 第一版不强制启用 `InspectorSlot`；`Open in Analysis with context` 只进入 Analysis 新聊天草稿态，不立即创建 conversation 或 run。
- `Platform Operations` 属于 `Overview Page`，第一版默认使用 `SectionStack / ContentSection / Ant Layout / ContentCard / StatCard / StatusTag / RiskBadge / NavigationActionButton` 组合。
- `Platform Operations` 第一版固定承接当前 `Workspace` 的平台运维总览、Job 状态、数据质量检查、通知 / 告警摘要、Deployment / Smoke / Migration 状态和风险 / 详情入口。
- `Platform Operations` 第一版不强制启用 `InspectorSlot`，也不应被设计成全局 SRE / admin 运维后台 UI。

## 5. Shared Primitive Rules

shared 只保留无业务语义的公共能力，固定边界如下：

- `shared/theme`：tokens、typography、Ant Design theme config、theme types。
- `shared/icons`：通用图标和图标类型。
- `shared/i18n`：I18n provider、messages、translate helper、locale types。
- `shared/graph`：唯一允许封装 `@antv/g6` 的关系图底座。
- `shared/charts`：无业务语义图表 primitive。
- `shared/navigation`：`navigationTypes / createRouteAction / NavigationActionButton` 这类 route-key 级别导航能力。
- `shared/layout`：`ContentSection / SectionStack / PageHeader / PageScaffold / ResponsivePageShell / FilterBar / SidePanel / DrawerFrame` 等无业务语义页面结构 primitive。
- `shared/ui/actions`：`ActionButton`。
- `shared/ui/surfaces`：`CardSurface` 这类视觉壳。
- `shared/ui/cards`：`ContentCard / StatCard / EntryCard / DetailCard` 等无业务语义 card pattern。
- `shared/ui/lists`：`PropertyList / TitledList / AnnotatedList / SelectableList / GroupedSelectableList / EventTimeline` 等无业务语义 list pattern。
- `shared/ui/states`：`EmptyState / ErrorState / LoadingState / WarningState`。
- `shared/ui/status`：`StatusTag / RiskBadge`。
- `shared/view-model`：跨 app / modules 边界需要共享的静态 ViewModel 类型、fixtures 和真正无业务的通用 helper。
- `shared/test`：测试期 provider / helper。

### UI Component Comment Standard

- 注释解释组件契约，不解释显而易见实现。
- `shared/ui` 的 export 组件、export 函数、export 类型、props contract 和 item contract 必须有 JSDoc。
- JSDoc 必须说明 `Layer / Based on / Responsibilities / Forbidden responsibilities / Caller contract`。
- 调用方契约必须明确：module 先把业务数据映射成通用 props，`shared/ui` 只消费通用 props，不知道 `SourceEvidence / Report / RunTrace / ToolDefinition / MetricDefinition / DataSource / KnowledgeDocument` 等业务对象。
- 参数和字段只在含义不直观、影响行为、容易误用或属于公共 contract 时单独说明。
- `title / description / children / className / style / key / value` 这类含义足够直观的字段，不要写“标题 / 描述 / 子元素”这类废话注释。
- callback、slot、status、risk、variant、action 这类容易误用字段，必须在 props contract 或 item contract 中说明边界。
- 如果一个组件需要大量注释才能解释清楚，优先检查组件职责是否过重，而不是继续堆砌说明。
- 后续 PR 修改 `shared/ui` 公共 API 时，必须同步维护这些契约注释。

明确不允许进入 shared 的内容：

- `report / reports / evidence / trace / traces / feedback-panel` 这类业务目录。
- 任何依赖业务 ViewModel、业务 Contract 或业务对象词汇的组件。
- 模块专属 `nav / inspector / drawer / panel / section / card`。
- `App* / Common* / Shared* / Base* / Wrapper* / Generic* / Universal*` 这类无职责命名。

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
- Ant Design first。能用 Ant Design 的基础能力，就优先使用 Ant Design。
- Thin wrapper second。公共组件只做 Ant Design 薄封装和项目级语义封装，不重写 `Button / Card / Tabs / Table / Descriptions / List / Flex / Space / Row / Col / Layout`。
- Custom component last。只有 Ant Design 无法满足且复用价值明确时，才允许新增自定义组件。
- 不 mirror Ant Design。禁止创建 `AppButton / AppTabs / AppTable / AppCheckbox / AppRadio / AppDrawer` 这类只是改名的镜像组件。
- 不每个页面自建按钮、卡片、状态色或反馈样式。
- 不新增和具体内容组件强绑定的布局组件，例如 `MetricCardGrid / SummaryCardGrid / ReportCardGrid / ActionGroup / ActionBar`。
- Tabs 没有稳定项目级语义时，直接使用 Ant Design `Tabs`；不要保留 `AppTabs / TabsPanel / StaticTabsPanel`。
- 重复模式可以抽象，但必须抽成无业务 primitive；不能把业务对象组件直接抽进 shared。
- 业务组件不得跨 module 复用；多模块需要类似能力时，要么抽成 shared primitive，要么各自组合。
- 行为增强必须组合基础组件，不重画 UI；导航按钮通过 `NavigationActionButton` 组合 `ActionButton`。
- 排序、过滤、分组、权限显隐放在 `mapper / hook / controller`，不放在 UI 组件中。
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

所有内容卡片仍遵守统一 slot，但由通用 primitive 承接：

- `CardSurface` 负责视觉壳。
- `ContentCard` 负责 `title / description / extra / body / footer` 的通用结构。
- `StatCard` 负责通用数值摘要结构。
- Footer 按钮直接在使用处用 Ant `Flex / Space` 排列，不保留 `ActionGroup`。

### Tag 与 Action 位置规则

- Risk Tag / 风险标签固定在卡片 Header 右上角，表示当前卡片对象风险等级，最多 1 个。
- Status Tag / 状态标签仅在非 ready 状态展示，位置同 Header 右上角。
- ready 状态默认不展示。
- 页面级主操作放在 Hero / 页面头部右侧。
- Section 级模块入口放在 Section Header 右侧。
- 卡片内部动作统一放在 Footer Actions 左下横向排列。
- Inspector 内动作在分组内左对齐横向排列。

### Layout Rules

- 页面在 section 内直接使用 Ant `Flex / Space / Row / Col / Layout` 组织卡片、列表和图表。
- 如确实存在稳定复用模式，可以新增无业务语义的 layout primitive，但不能绑定具体内容类型。
- Section Header 右侧只放模块级入口。
- Section 内容默认左对齐、按数据顺序排列。
- 不允许因为项目数量不足而做右对齐或居中布局补偿。

### Shared Boundary

- 只有跨业务域复用才进入 `shared`。
- 单一 module 内部组件不得提前抽到 `shared`。
- `shared` 组件不得依赖 `modules` 或 `app`。
- `shared` 组件只消费 ViewModel、UI State 或 contract 枚举。
- `shared/view-model` 只允许静态 ViewModel 类型、fixtures 和真正无业务的通用 helper；不得演变为业务聚合层。
- `shared/test` 只允许测试期 provider / helper；不得放业务测试数据。
- `shared` 组件不得访问数据库字段、模型原始输出、Tool 原始输出、LangGraph raw state、raw provider response、raw vector、raw embedding 或 raw SQL result。
- `shared` 不新增 `index.ts / index.tsx` barrel export；import 必须显式到具体文件。
- 如果组件 props 中出现 `DataSource / Report / Evidence / Trace / Run / ToolDefinition / MetricDefinition` 等业务词，默认不应进入 `shared/ui`。

### Final UI Taxonomy

最终 UI 组件族谱固定如下：

1. `Foundation = Ant Design + shared/theme`
2. `Surface / Frame = 项目统一视觉壳`
3. `Shared Patterns = 无业务语义的稳定展示模式`
4. `Behavior Wrappers = 只增加行为的组合层`
5. `Module Components = 业务组件`
6. `Page Composition = 页面编排`

各层约束：

- `Foundation` 复用 Ant Design 基础能力，不重造 `Button / Card / Tabs / Table / Descriptions / List / Flex / Space / Row / Col / Layout / Drawer / Modal / Tag / Typography`。
- `Surface / Frame` 只负责统一边框、背景、圆角、padding、hover、selected、dark/light，不知道业务对象。
- `Shared Patterns` 只承接稳定重复出现的信息展示模式，props 必须保持通用。
- `Behavior Wrappers` 只增加行为，不重画视觉，不知道具体 Page 映射。
- `Module Components` 允许出现业务词、消费业务 ViewModel，但禁止被其他 module 直接 import。
- `Page Composition` 只组合 `sections / panels / components / shared primitives`，不写业务清洗和 raw 数据解析。

### Shared Structure Target

`apps/web/src/shared/` 的最终目标结构如下：

```text
shared/
├─ theme/
├─ ui/
│  ├─ actions/
│  ├─ surfaces/
│  ├─ cards/
│  ├─ lists/
│  ├─ states/
│  └─ status/
├─ layout/
│  ├─ sections/
│  ├─ containers/
│  └─ panels/
├─ navigation/
├─ graph/
├─ charts/
├─ i18n/
├─ icons/
├─ utils/
├─ test/
└─ view-model/
```

说明：

- `shared/ui/surfaces` 只允许 `*Surface`。
- `shared/ui/cards` 不允许 `*Surface`、业务前缀卡片或 `CardGrid`。
- `shared/ui/lists` 只允许无业务语义列表模式。
- `shared/navigation` 只允许 `navigationTypes / createRouteAction / NavigationActionButton`，且不得 import `app/router` 或 `modules/*`。
- `shared/product`、`legacy`、`temporary`、`transitional` 目录禁止出现。

### Current UI Component Taxonomy

| Component                 | Layer              | Location                                           | Based on                               | Allowed responsibilities                                | Forbidden responsibilities                                     | Can be used by                                       | Cannot depend on        |
| ------------------------- | ------------------ | -------------------------------------------------- | -------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| `ActionButton`            | Behavior Primitive | `shared/ui/actions/ActionButton.tsx`               | Ant `Button`                           | variant、icon、loading、disabled、danger                | 排序、布局、导航、权限、业务判断                               | `app`、`modules`、`shared/navigation`                | `app`、`modules`        |
| `actionTypes`             | UI Support         | `shared/ui/actions/actionTypes.ts`                 | TypeScript types                       | action primitive 类型                                   | route 映射、业务对象                                           | `shared/ui/actions`、`shared/navigation`、`modules`  | `app`、`modules`        |
| `CardSurface`             | Surface / Frame    | `shared/ui/surfaces/CardSurface.tsx`               | Ant `Card`                             | 视觉壳、边框、圆角、padding、hover                      | 业务 props、route、数据映射                                    | `shared/ui/cards`、`modules`                         | `app`、`modules`        |
| `ContentCard`             | Shared Pattern     | `shared/ui/cards/ContentCard.tsx`                  | `CardSurface`                          | title、description、meta、footer、children              | 业务对象解析、布局绑定                                         | `app`、`modules`                                     | `app`、`modules`        |
| `StatCard`                | Shared Pattern     | `shared/ui/cards/StatCard.tsx`                     | `ContentCard`                          | title、value、status、risk、trend、meta、supportingMeta | `MetricDefinition`、`evidenceSummary`、业务 contract、数据计算 | `app`、`modules`                                     | `app`、`modules`        |
| `PropertyList`            | Shared Pattern     | `shared/ui/lists/PropertyList.tsx`                 | Ant `Descriptions / List / Typography` | label-value 展示                                        | 业务对象解析                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `TitledList`              | Shared Pattern     | `shared/ui/lists/TitledList.tsx`                   | Ant `List / Space / Typography`        | title + summary list                                    | 业务对象解析、排序                                             | `app`、`modules`                                     | `app`、`modules`        |
| `AnnotatedList`           | Shared Pattern     | `shared/ui/lists/AnnotatedList.tsx`                | Ant `List / Typography`                | 注释型列表展示                                          | 业务映射、权限判断                                             | `app`、`modules`                                     | `app`、`modules`        |
| `SelectableList`          | Shared Pattern     | `shared/ui/lists/SelectableList.tsx`               | Ant `List / Button / Space`            | 通用可选列表                                            | 业务 route、跨模块逻辑                                         | `app`、`modules`                                     | `app`、`modules`        |
| `SelectableListItem`      | Shared Pattern     | `shared/ui/lists/SelectableListItem.tsx`           | Ant `Button / Space / Typography`      | 单个可选列表项壳                                        | 业务对象解析                                                   | `SelectableList`、`GroupedSelectableList`、`modules` | `app`、`modules`        |
| `GroupedSelectableList`   | Shared Pattern     | `shared/ui/lists/GroupedSelectableList.tsx`        | `SelectableListItem` + Ant `Space`     | 分组可选列表                                            | route 映射、业务分组规则                                       | `app`、`modules`                                     | `app`、`modules`        |
| `EventTimeline`           | Shared Pattern     | `shared/ui/lists/EventTimeline.tsx`                | Ant `Timeline / List / Typography`     | 通用事件时间线                                          | `RunTrace` 业务对象解析                                        | `modules`                                            | `app`、`modules`        |
| `EmptyState`              | Shared Pattern     | `shared/ui/states/EmptyState.tsx`                  | Ant `Empty / Typography`               | 空态展示                                                | 业务取数                                                       | `app`、`modules`                                     | `app`、`modules`        |
| `ErrorState`              | Shared Pattern     | `shared/ui/states/ErrorState.tsx`                  | Ant `Alert / Result / Typography`      | 错误态展示                                              | 错误恢复业务逻辑                                               | `app`、`modules`                                     | `app`、`modules`        |
| `LoadingState`            | Shared Pattern     | `shared/ui/states/LoadingState.tsx`                | Ant `Skeleton / Spin / Typography`     | 加载态展示                                              | 业务轮询逻辑                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `WarningState`            | Shared Pattern     | `shared/ui/states/WarningState.tsx`                | Ant `Alert / Result / Typography`      | 风险或告警空态展示                                      | 业务规则判断                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `StatusTag`               | Shared Pattern     | `shared/ui/status/StatusTag.tsx`                   | Ant `Tag`                              | 状态映射展示                                            | 业务状态兜底                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `RiskBadge`               | Shared Pattern     | `shared/ui/status/RiskBadge.tsx`                   | Ant `Tag / Badge`                      | 风险等级展示                                            | 风险规则计算                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `ContentSection`          | Shared Pattern     | `shared/layout/sections/ContentSection.tsx`        | Ant `Space / Typography / Flex`        | section title、description、extra、children             | card layout、业务对象                                          | `app`、`modules`                                     | `app`、`modules`        |
| `SectionStack`            | Layout             | `shared/layout/sections/SectionStack.tsx`          | Ant `Flex / Space`                     | section 垂直节奏                                        | 复杂布局系统、业务布局                                         | `app`、`modules`                                     | `app`、`modules`        |
| `sectionTypes`            | Layout Support     | `shared/layout/sections/sectionTypes.ts`           | TypeScript types                       | section primitive 类型                                  | 业务对象                                                       | `shared/layout`、`modules`                           | `app`、`modules`        |
| `getStaticSectionProps`   | Layout Support     | `shared/layout/sections/getStaticSectionProps.tsx` | static section vm + i18n               | 静态 section props 映射                                 | 业务取数                                                       | `modules`                                            | `app`、`modules`        |
| `PageHeader`              | Layout / Container | `shared/layout/containers/PageHeader.tsx`          | Ant `Typography / Space / Flex`        | 页面头部结构                                            | 业务数据获取                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `PageScaffold`            | Layout / Container | `shared/layout/containers/PageScaffold.tsx`        | Ant `Layout / Space`                   | 页面主骨架                                              | route 映射、业务对象                                           | `app`、`modules`                                     | `app`、`modules`        |
| `ResponsivePageShell`     | Layout / Container | `shared/layout/containers/ResponsivePageShell.tsx` | Ant `Layout / Grid / Flex`             | 响应式页面壳                                            | 业务组件拼装                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `FilterBar`               | Layout / Container | `shared/layout/containers/FilterBar.tsx`           | Ant `Card / Space / Flex`              | 过滤区容器与统一壳                                      | 排序、筛选业务规则                                             | `modules`                                            | `app`、`modules`        |
| `SidePanel`               | Surface / Frame    | `shared/layout/panels/SidePanel.tsx`               | Ant `Card / Layout / Space`            | 侧栏面板壳                                              | 业务对象解析                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `DrawerFrame`             | Surface / Frame    | `shared/layout/panels/DrawerFrame.tsx`             | Ant `Drawer`                           | Drawer 壳、统一边距与 header 区域                       | 业务对象解析、route 映射                                       | `app`、`modules`                                     | `app`、`modules`        |
| `NavigationActionButton`  | Behavior Wrapper   | `shared/navigation/NavigationActionButton.tsx`     | `ActionButton`                         | route-aware button 行为包装                             | 自己实现按钮视觉、Page 映射                                    | `app`、`modules`                                     | `app`、`modules`        |
| `createRouteAction`       | Behavior Support   | `shared/navigation/createRouteAction.ts`           | route key + i18n + action types        | 构造 route-aware action 数据                            | 排序、权限判断、UI 渲染                                        | `app`、`modules`                                     | `app/router`、`modules` |
| `navigationTypes`         | Behavior Support   | `shared/navigation/navigationTypes.ts`             | TypeScript types                       | route key、`PageRouteProps`、导航 action 类型           | Page composition state、Page 映射                              | `app`、`modules`、`shared/navigation`                | `app/router`、`modules` |
| `RelationshipGraphCanvas` | Shared Pattern     | `shared/graph/RelationshipGraphCanvas.tsx`         | `@antv/g6`                             | 只读关系图展示、选中、fit view、zoom、pan               | 业务图谱逻辑、raw G6 泄漏                                      | `modules`                                            | `app`、`modules`        |
| `relationshipGraphTheme`  | Graph Support      | `shared/graph/relationshipGraphTheme.ts`           | theme tokens                           | 图谱视觉配置                                            | 业务映射                                                       | `shared/graph`                                       | `app`、`modules`        |
| `graph models`            | Graph Support      | `shared/graph/models.ts`                           | TypeScript types                       | 关系图 ViewModel 类型                                   | 业务模块逻辑                                                   | `shared/graph`、`modules`                            | `app`、`modules`        |
| `StaticChart`             | Shared Pattern     | `shared/charts/StaticChart.tsx`                    | `ChartCard`                            | 静态图表展示                                            | 业务对象解析                                                   | `modules`                                            | `app`、`modules`        |
| `ChartCard`               | Shared Pattern     | `shared/charts/ChartCard.tsx`                      | `CardSurface` + chart wrapper          | 图表内容卡片模式                                        | 业务对象解析、重新实现 card shell                              | `modules`                                            | `app`、`modules`        |
| `chartTypes`              | Chart Support      | `shared/charts/chartTypes.ts`                      | TypeScript types                       | 图表 primitive 类型                                     | 业务映射                                                       | `shared/charts`、`modules`                           | `app`、`modules`        |
| `I18nProvider`            | Foundation Support | `shared/i18n/I18nProvider.tsx`                     | React context                          | i18n provider、translate hook                           | 业务模块逻辑                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `messages`                | Foundation Support | `shared/i18n/messages.ts`                          | message catalog                        | i18n key 事实源                                         | 业务数据计算                                                   | `shared/i18n`、`modules`                             | `app`、`modules`        |
| `translateKey`            | Foundation Support | `shared/i18n/translateKey.ts`                      | i18n helper                            | 统一 key 翻译                                           | 业务逻辑                                                       | `app`、`shared`、`modules`                           | `app`、`modules`        |
| `localeTypes`             | Foundation Support | `shared/i18n/localeTypes.ts`                       | TypeScript types                       | locale 类型                                             | Page 映射                                                      | `shared/i18n`、`app`                                 | `app`、`modules`        |
| `AppIcon`                 | Foundation Support | `shared/icons/AppIcon.tsx`                         | icon registry                          | 项目图标入口                                            | 业务对象解析                                                   | `app`、`modules`                                     | `app`、`modules`        |
| `iconTypes`               | Foundation Support | `shared/icons/iconTypes.ts`                        | TypeScript types                       | icon name 类型                                          | 业务逻辑                                                       | `shared/icons`、`modules`                            | `app`、`modules`        |
| `TestProviders`           | Test Support       | `shared/test/TestProviders.tsx`                    | provider composition                   | 测试期 provider 装配                                    | 运行时业务逻辑                                                 | tests                                                | `app`、`modules`        |
| `staticViewModelTypes`    | Shared Support     | `shared/view-model/staticViewModelTypes.ts`        | TypeScript types                       | 静态 ViewModel 类型事实源                               | 业务聚合逻辑                                                   | `app`、`modules`、`shared`                           | `app`、`modules`        |
| `staticStateFixtures`     | Shared Support     | `shared/view-model/staticStateFixtures.ts`         | static view-model types                | 静态状态 fixtures                                       | 运行时业务逻辑                                                 | `modules`、tests                                     | `app`、`modules`        |
| `viewModelState`          | Shared Support     | `shared/utils/viewModelState.ts`                   | static state vm + i18n                 | risk/status 映射                                        | 业务权限和排序                                                 | `shared`、`modules`                                  | `app`、`modules`        |

### Promotion Rule

新组件默认放 `modules/<domain>/components`。

只有满足以下全部条件，才允许进入 `shared`：

1. 名字没有业务词。
2. props 不包含业务对象。
3. 不依赖 `modules`。
4. 不依赖 `app`。
5. 不知道具体 Page。
6. 不是 Ant Design 原样 mirror。
7. 有稳定展示模式或行为模式。
8. 不同业务模块可以先通过 mapper 转成通用 props 再复用。
9. 能清楚归类到 `Surface / Pattern / Behavior / Layout / Utility` 之一。

重复不等于抽象。只有“重复 + 稳定语义 + 能去业务化”才允许进入 `shared`。

### Action / Navigation Contract

- `ActionButton` 是 Ant `Button` 的项目薄封装。
- `ActionButton` 只负责按钮视觉、variant、icon、loading、disabled、danger。
- `ActionButton` 不负责排序、布局、导航、权限或业务判断。
- 多个按钮排列直接使用 Ant `Flex / Space`，不新增 `ActionGroup / RouteActionGroup / PageActionGroup`。
- `NavigationActionButton` 是 `ActionButton + route-aware behavior`，只增加行为，不重画视觉。
- `NavigationActionButton` 不知道 route key 对应哪个 Page，不得 import `app/router` 或 `modules/*`。
- `createRouteAction` 只负责构造 route-aware action 数据，不排序、不做权限判断、不渲染 UI。
- 排序 / 过滤 / 分组 / 权限显隐放在 `mapper / hook / controller`，不放 UI primitive。

### List Contract

- 不抽 `SourceEvidenceList / ReportFindingList / ToolDefinitionList / RunTraceList / MetricDefinitionList`。
- 应抽 `PropertyList / TitledList / AnnotatedList / SelectableList / GroupedSelectableList / EventTimeline` 这类无业务 primitive。
- shared list item props 必须是通用字段。
- module 负责把业务对象映射成 shared list item props。
- 如果无法去业务化，组件留在 module，不跨 module 复用。

### Card Contract

- `CardSurface`
  - Layer: `Surface / Frame`
  - Allowed: visual surface、border、background、radius、padding、hover、selected、dark/light
  - Forbidden: business props、route、title logic、data mapping、layout binding
- `ContentCard`
  - Layer: `Shared Pattern`
  - Allowed: title、description、meta、children、footer
  - Forbidden: business object props
- `StatCard`
  - Layer: `Shared Pattern`
  - Allowed: title、value、delta / trend、status、description、meta、supportingMeta / contextMeta
  - Forbidden: `MetricDefinition / MetricsViewModel / evidenceSummary / business contract`
- `ChartCard`
  - Layer: `Shared Pattern`
  - Allowed: title、subtitle、actions、state、legend、children
  - Forbidden: 直接依赖 Ant `Card`、重新实现平行 card shell、业务对象解析
- 业务卡片必须放 `modules/<domain>/components`，可以组合 `ContentCard / StatCard / PropertyList`，但不得回流到 `shared/ui`。

### Section / Layout Contract

- `ContentSection`
  - Layer: `Layout / Section Pattern`
  - Allowed: title、description、extra、children
  - Forbidden: card layout、action sorting、business object
- `SectionStack`
  - Layer: `Layout`
  - Allowed: section vertical rhythm
  - Forbidden: complex layout system、business layout
- `PageHeader / PageScaffold / ResponsivePageShell / FilterBar`
  - Layer: `Layout / Container`
  - Allowed: page-level structure
  - Forbidden: business data、route-to-page mapping
- 布局优先使用 Ant `Flex / Space / Row / Col / Layout`。
- 不新增和内容绑定的 layout。
- 无法说明稳定职责的 layout，不进入 `shared`。

### Review Checklist

后续 PR 审核必须至少检查：

- 是否新增了 `app/shell` 业务组件。
- 是否新增了 `shared/ui` 业务组件或业务目录。
- `shared/ui` 的 export 组件、export 函数、export 类型、props contract 和 item contract 是否补齐并维护了契约 JSDoc。
- 是否新增了 `shared/layout` 业务命名文件。
- 是否绕开 Ant Design 自造基础组件。
- 是否新增了和具体内容组件强绑定的 layout。
- 是否新增了 `index.ts / index.tsx`。
- 是否让 `shared` 依赖 `app` 或 `modules`。
- 如果本轮属于治理收口，是否仍保留 `P1 / P2 / watch items`；治理收口阶段必须修掉已识别问题，或明确证明它不是问题。
- 是否把业务 ViewModel / Contract 泄漏到 `shared/ui`。

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
