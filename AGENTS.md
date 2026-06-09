# AGENTS.md

本文件是 Codex / AI Agent / 人类开发者在本仓库执行任务时必须遵守的硬规则。

## 1. 项目定位

本项目是 `Insight Agent Platform`：企业经营分析与决策 Agent 平台。

目标是从第一天建立完整企业级 Agent 产品骨架，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策、CI、契约、部署和运维承载位。

## 2. 执行流程

- 需求必须先被拆成 Issue。
- Issue 是执行合同。
- Issue 必须基于需求、`AGENTS.md`、`docs/workflow.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts` 建立。
- Issue 建立后不能直接交给 Codex 执行。
- 必须先进行 Issue 合规审查。
- Issue 合规审查通过并明确允许 Codex 执行后，Codex 才能执行代码。
- Codex 执行前必须确认 Issue 已按 `docs/workflow.md` 完成合规审查。
- 未经审查通过的 Issue，不允许进入代码执行阶段。
- PR 是履约证明。
- PR 只按已审查通过的 Issue 和 `docs/workflow.md` 反查，不重新发明标准。
- CI 是自动守门。
- 用户最终决定是否 Merge。
- Codex 不得绕过 Issue 自由发挥。

每个任务必须基于：

- `AGENTS.md`
- `docs/workflow.md`
- `docs/architecture.md`
- `docs/contracts.md`
- `packages/contracts/*`

并在 Issue 中摘出本次任务相关规则。

涉及正式 Web UI、导航、页面职责、Inspector、页面流转的任务，可以额外反查 `docs/prototypes/product-experience.html` 作为产品体验原型参考，但不得把 HTML 原型当作正式事实源。

## 3. Issue 合规审查

Issue 建立后必须先完成合规审查，审查通过后才允许进入 Codex 代码执行阶段。

审查项至少包括：

- 目标是否清楚。
- 修改范围是否明确。
- 事实源是否完整，包括需求、`AGENTS.md`、`docs/workflow.md`、`docs/architecture.md`、`docs/contracts.md`、`packages/contracts`。
- 是否摘出了本次任务相关规则，而不是只写“遵守文档”。
- 禁止项是否明确。
- 验收标准是否可检查。
- 测试要求是否明确。
- 是否存在 Codex 自由发挥空间。
- 是否越过 `AGENTS` / `workflow` / `architecture` / `contracts` / `packages/contracts` 事实源。
- 是否引入 Mock / Real 双链路、无关依赖、无关重构或业务范围外实现。

审查结论必须明确写入 Issue。未通过审查的 Issue 必须退回补充，不能进入代码执行阶段。

## 4. 总体代码规则

- 采用 monorepo + modular monolith。
- 采用 Contracts-first。
- 保持单链路实现，不做 old / new、mock / real、legacy / current 双轨。
- 不新增无关依赖。
- 不做无关重构。
- 不写临时代码进入正式目录。
- 不把 demo-only 逻辑混入主链路。
- 不保留长期兼容字段兜底。

### Codex 代码生成硬规则

- Codex 只能在已审查通过的 Issue 范围内写代码。
- 涉及正式 UI 的实现可以反查 `docs/prototypes/product-experience.html` 作为产品体验原型参考，用于辅助理解用户逻辑、页面跳转、对象归属和入口关系。
- HTML 原型不得作为正式 React 组件结构、API、DB、contracts、ViewModel 或真实 Agent Run 的事实源。
- 原型内容只有在沉淀进正式文档后，才能进入正式 Issue 和代码实现。
- Codex 不允许为了“保险”新增双轨实现。
- Codex 不允许新增 `oldField || newField`、`mockData || realData`、`status === "done" || status === "success"` 这类兜底代码。
- 代码型 Issue 必须遵守 ID Contract P0 公共守门规则。
- Codex 不允许新增 `id || xxxId`、`oldId || newId`、`metadata.xxxId || xxxId` 这类 ID fallback / legacy id / 多字段兜底。
- Codex 不允许新增无关依赖。
- Codex 不允许无关重构。
- Codex 不允许为了炫技做过度抽象。
- Codex 不允许把一段清晰顺序逻辑拆成大量无意义小函数。
- 拆函数 / 拆模块只能用于隔离明确职责、减少真实重复、收敛复杂业务链路或让阅读路径更清楚。
- 后端不得绕过 Repository、Model Gateway、Tool Registry。
- 前端不得绕过 Contract -> ViewModel -> UI 链路。
- 代码必须优先清晰、直接、可审查。

### 固定工具链规则

- Codex 不允许自行替换已固定工具链。
- 包管理固定使用 pnpm，不允许引入 npm / yarn 双轨。
- Python 环境 / 依赖管理固定使用 uv，不允许引入 pip requirements 双轨。
- 前端质量检查使用 ESLint，格式化使用 Prettier。
- ESLint 不接入 `eslint-plugin-prettier`，不把 Prettier 当 ESLint rule 跑。
- 前端类型检查使用 TypeScript / `tsc`。
- 前端单元测试和组件测试使用 Vitest / React Testing Library。
- 前端 E2E 和手机浏览器响应式验证使用 Playwright。
- 后端 lint / format 使用 Ruff。
- 后端类型检查使用 mypy。
- 后端测试使用 pytest。

## 5. 前后端字段一致

核心业务字段以 `packages/contracts` 为事实源。

固定规则：

- 一字段一语义。
- 一语义一字段。
- 同一链路尽量保持字段名一致。
- 跨前后端共享链路、产品对象链路和 UI 可见业务链路必须使用 canonical business id。
- 字段转换只允许出现在 DB repository、API schema、ViewModel mapper 三个明确边界。

`LeftNav`、`Inspector`、`Action`、`Route`、`ViewModel` 任务必须反查 canonical id，不得把本地 `key`、`pendingId`、`draftId`、`targetId` 升格为共享业务 ID。

禁止：

```ts
run.id || run.runId || run.analysisRunId;
status === "done" || status === "completed" || status === "success";
source.sources || source.evidences || source.references;
```

## 6. 数据链路

固定链路：

```text
External Raw Data
-> Domain Model
-> Contract Model
-> API Response
-> Frontend ViewModel
-> UI
```

禁止：

- UI 直接解析 raw API response。
- UI 直接使用 DB 字段。
- UI 直接使用模型原始输出。
- UI 直接使用 Tool 原始输出。
- UI 直接使用 LangGraph 原始 state。

## 7. 前端规则

- 前端采用 React / TypeScript / Vite / Ant Design 体系。
- 不允许引入第二套 UI 组件库。
- Ant Design first。能直接使用 Ant Design 的基础能力，就优先使用 Ant Design。
- Thin wrapper second。公共组件只做 Ant Design 薄封装和项目级语义封装，不重写 `Button / Card / Tabs / Table / Descriptions / List / Flex / Space / Row / Col / Layout`。
- Custom component last。只有 Ant Design 无法满足且长期复用价值明确时，才允许新增自定义组件。
- 不 mirror Ant Design。禁止创建 `AppButton / AppTabs / AppTable / AppCheckbox / AppRadio / AppDrawer` 这类只是改名的 Ant Design 镜像组件。
- 公共组件不是为了少写 JSX 而存在，只有增加稳定职责时才允许抽象。
- 最终 UI 组件层级固定为 `Foundation -> Surface / Frame -> Shared Patterns -> Behavior Wrappers -> Module Components -> Page Composition`。
- `Foundation = Ant Design + shared/theme`。
- `Surface / Frame` 只放统一视觉壳，例如 `CardSurface / SidePanel / DrawerFrame`，不接业务对象。
- `Shared Patterns` 只放无业务语义的稳定展示模式，例如 `ContentCard / StatCard / PropertyList / TitledList / EventTimeline / ContentSection / PageIntro`。
- `Behavior Wrappers` 只增加行为，不重画视觉，例如 `NavigationActionButton` 组合 `ActionButton`。
- `Module Components` 只属于 `modules/<domain>`，可以出现业务词、消费业务 ViewModel，但不能被其他 module 直接 import。
- `Page Composition` 只负责页面编排，不写业务清洗，不解析 raw 数据。
- 页面只做编排，不写业务清洗。
- 组件只消费 ViewModel 和 UI State。
- API response 必须先通过 mapper 转成 ViewModel。
- `app/shell` 只允许放通用应用外壳：`AppShell / AppShellLayout / HeaderBar / LeftNav` 及其自身 models / fixtures。
- 业务模块自己的 `nav / inspector / drawer / panel / section / components` 必须放在 `modules/<domain>`，不得继续混入 `app/shell`。
- `AppShell` 区域层固定为 `leftNav / header / mainContent / rightAssistPanel`；`HeaderBar` 是全局 workspace header，模块不得接管。
- 模块如需覆盖 `leftNav / mainContent / rightAssistPanel`，必须通过 module-owned `use<Domain>ShellSlots` 暴露；`AppShell` 只消费 slots，不直接 import 模块低层 `ListNav / InspectorPanel / controller`。
- `AppShell` 不直接调用 module shell hooks；active route shell hook 必须通过 `RouteShellOutlet` 这类子组件按需挂载。
- `AppShell` 不持有 module controller 生命周期。
- `rightAssistPanel` 默认 `null`；只有模块显式提供 inspector 才显示，不允许默认 `AppShellInspector` fallback 回流。
- `LeftNav` 只展示 root navigation，不硬编码哪些 route 有二级模块导航。
- `shared/navigation` 只允许 route-key 级别的公共导航能力，例如 `createRouteAction / NavigationActionButton / navigationTypes`，不得 import `app/router` 或 `modules/*`。
- `shared/navigation` 中的 `PageRouteProps` 只允许包含 `onNavigate`；任何 `dataKnowledgeState / metricsState / platformOperationsState / reportsState` 这类 page composition state slot 都必须留在 `app/router` 或对应 module page props。
- 有 shell slots 的页面需要拆分为自管理 `Page` 和受控 `PageContent`；shell hook 只能渲染 `PageContent`，不得再保留 optional controller prop + fallback controller 双轨。
- `shared/layout` 只允许无业务语义布局 / 页面结构 primitive，例如 `ContentSlotLayout / ContentSection / SectionStack / PageIntro / ResponsivePageShell / FilterBar / SidePanel / DrawerFrame`。
- `PageScaffold` 已删除；页面外壳统一使用 `ResponsivePageShell`，不保留自动 header 链路。
- 标准模块页面冻结结构固定为 `ResponsivePageShell -> ModuleSections -> SectionStack -> PageIntro(optional) -> ContentSection`；`Analysis` 是唯一明确例外，保持对话式工作区结构。
- `Analysis` 的 canonical 结构固定为 `AnalysisWorkspace -> AnalysisSessionNav / AnalysisConversationPane / AnalysisInspectorPanel`；不得强行套入 `PageIntro / ContentSection` 主链路。
- `AnalysisPage` 只负责状态接入和 workspace 入口；`AppShell` 不得直接拼 `AnalysisSessionNav / MessageList / Composer / Inspector / Drawer` 等低层业务组件，只能消费 module 暴露的 workspace 入口或 slots adapter。
- `Analysis` 状态必须由 workspace controller 集中承接；`sessions / selectedSessionId / messages / currentRun / runEvents / selectedRunEventId / activeInspectorPanel / composerState` 不得在 `AppShell`、`AnalysisInspectorPanel` 或多个组件内多处维护。
- `AnalysisMessageList` 只展示 conversation；`RunTrace / ToolDetail / SourceEvidence / ReportPreview / MemoryContext` 必须保留独立落点，不得继续塞回 assistant message。
- `ResponsivePageShell` 只负责 page padding 和 children 承载；不得再新增 `filters / rightAside / header / viewModel / actions / hideHeader / hideHeaderActions`。
- 页面 padding 只能由 `ResponsivePageShell` 承接；`SectionStack` 只负责页面内容大块纵向节奏，不得承接 page padding、header 或页面壳 slot。
- `PageIntro` 是 `shared/layout/containers` 的唯一标准页面顶部介绍区容器，只接通用 ReactNode 和 layout props，不接业务对象，不做 route 映射，不依赖 `app / modules`。
- `PageIntro` 只负责页面顶部介绍区、左侧标题说明和右侧 `extra` 操作区；children slot 的 `plain / cards / stack` 布局统一通过 `ContentSlotLayout` 承接；如果页面没有顶部标题介绍区，就不要硬造 `PageIntro`。
- `PageIntro` 与 `ContentSection` 的边界固定：`PageIntro` 只用于页面第一个顶部介绍区，`ContentSection` 只用于页面后续普通内容分区，不承接 Hero 语义。
- 除 `Analysis` 这类特殊页面外，标准模块页面顶部标题 / intro / hero / page header 应统一使用 `PageIntro`；替换完成后不保留旧 `PageHeader` / intro / hero-like 结构。
- `PageIntro` 只能在 `ModuleSections` 或 `DashboardHero` 内显式组织，不得回流到 `Page.tsx`、`app`、`shared/ui`、`shared/navigation` 或其它 module components。
- `Page.tsx` 只负责 controller / state 接入和 `ResponsivePageShell -> ModuleSections` 组合，不负责页面标题、header 或 `PageIntro` 生成；非 `Analysis` 页面不得在 `Page.tsx` 中直接组织 `PageIntro / SectionStack / ContentSection`。
- `ContentSection` 的 header 右侧 slot 固定使用 `extra`，不得再引入 `titleSuffix` 或其它标题后缀别名。
- `ContentSection` 只负责统一普通内容区的 section header、`extra` 和 children slot；`contentLayout="plain" | "cards" | "stack"` 的具体布局统一通过 `ContentSlotLayout` 承接。
- `ContentSlotLayout` 只负责 `plain / cards / stack` children slot 布局；不得承接 section header、page intro、业务对象、route、权限或排序过滤分组。
- `contentLayout="plain"` 只保留 section header 和 section 语义，children 原样渲染；图表、表格或已自带明确布局的区域优先使用 plain。
- `contentLayout="cards"` 由 `ContentSlotLayout` 使用受控 Ant `Row / Col` 排列 children，列宽通过 `colProps` 声明；禁止再扩展 `columns / grid / wrap / minItemWidth` 之类自定义布局 API。
- `contentLayout="stack"` 由 `ContentSlotLayout` 使用受控 Ant `Space` 做纵向排列。
- 普通内容区如果是卡片组，优先使用 `ContentSection contentLayout="cards"`；如果只是多个纵向大块，优先使用 `ContentSection contentLayout="stack"`。
- `SectionStack` 只负责页面区域的纵向节奏，不要求子节点必须是 `ContentSection`；Hero 或其它不需要 section header 的自定义区域可以直接放在 `SectionStack` 中。
- 需要 section header 的卡片区应优先通过 `ContentSection contentLayout="cards"` 承接，不要在业务页面重复手写 `Row / Col / gutter`。
- module `sections/**` 不得再手写 section 级 `Flex wrap / cardItemStyle / flex: "1 1 xxxpx"` 卡片排列；footer actions、卡片内部布局和复杂表格 / 图表 / Tabs / timeline 区域除外。
- `colProps` 必须使用 Ant Col 响应式语义：手机浏览器默认 `xs={24}` 单列，中屏常用 `md={12}` 双列，大屏三卡区使用 `xl={8}`。
- `ContentSection` 卡片区间距必须来自 `shared/theme` token，禁止在页面或 shared/layout 中硬编码 `gutter={[16, 16]}`。
- 如果某个区域不需要 section header，就不要使用 `ContentSection`，直接放到 `SectionStack` 或模块自定义区域里。
- 状态标签、风险等级、空态、错误态必须使用 `shared/ui`。
- `shared/ui/surfaces` 只放 `*Surface` 视觉壳，当前 canonical 文件为 `CardSurface`。
- `shared/ui/cards` 只放无业务语义 card pattern，例如 `ContentCard / StatCard / EntryCard / DetailCard`；不得放 `*Surface`、业务前缀卡片或 `CardGrid`。
- Hero facts / summary 小卡片优先使用 `StatCard`；普通内容入口卡优先使用 `ContentCard`；不要用 `CardSurface` 手写小卡片壳。
- 普通业务卡片不得绕开 `ContentCard / StatCard / CardSurface` 直接从 Ant `Card` 重画外壳；`Reports` 模块同样必须遵守 shared card pattern。
- `shared/ui/lists` 只放无业务语义 list pattern，例如 `PropertyList / TitledList / AnnotatedList / SelectableList / GroupedSelectableList / EventTimeline`；不得放 `SourceEvidenceList / ReportFindingList / ToolDefinitionList / RunTraceList / MetricDefinitionList`。
- `shared/ui` 只允许无业务语义 UI primitive 或 Ant Design 薄封装；不允许放 `report / evidence / trace / feedback panel` 等业务组件。
- `shared/ui` 的 export 组件、export 函数、export type / interface、props contract 和 item contract 必须有 JSDoc。
- `shared/ui` 公共 API 注释必须说明 `layer / based on / responsibilities / forbidden responsibilities / caller contract`。
- `shared/ui` 注释只解释组件契约和易误用边界，不逐行解释显而易见实现；`title / description / children / className / style` 这类直观字段禁止写废话注释。
- callback、slot、status、risk、variant、action 这类容易误用的字段必须在 props contract 或 item contract 中说明用途边界。
- 如果一个 `shared/ui` 组件需要大量注释才能说清楚，优先回头检查组件职责是否过重，而不是继续堆砌注释。
- 修改 `shared/ui` 公共 API 时，必须同步维护契约注释；缺失注释应由结构守门直接拦截。
- 不新增 `MetricCardGrid / SummaryCardGrid / ReportCardGrid / CardGrid / SectionGrid / ActionGroup / ActionBar` 这类和具体内容或按钮集合强绑定的布局组件。
- `Dashboard`、`Metrics`、`Platform Operations` 这类 overview page 的标准结构固定为 `SectionStack -> Hero(optional) -> ContentSection(contentLayout=\"cards\") -> Cards`。
- `DashboardHero` 这类模块 Hero 必须基于 `PageIntro` 组合；facts 使用 `StatCard`，页面操作区由 module 本地组件组合后通过 `PageIntro extra` 传入，不要提前抽 shared `PageHeroActions`。
- 业务模块如需特殊卡片，只允许在 module 内轻封 `ContentCard / StatCard`；禁止为了单个 section 额外造 `Panel / Grid / Wrapper / ActionGroup / HeaderActionGroup / SectionActionGroup` 中间层。
- module 业务卡片可以存在，但必须组合 `ContentCard / StatCard / PropertyList` 这类 shared pattern；不得重新实现 shared card 的壳、标题区、footer、padding 或 border。
- 业务 mapper 默认只负责 ViewModel 整理，不应预先生成 JSX、`NavigationAction` 或共享卡片 slot；Dashboard 普通卡片优先在业务组件内部组合 `ContentCard`、`meta` 和 footer actions。
- 同一 module 内的简单卡片列表，不要为了统一渲染再创建中间 `CardItem / DTO`；业务卡片应直接接收业务 item，并在组件内部完成展示字段、meta 和 actions 组合。
- 同一业务卡片私有使用的文案映射或显示 helper，应内聚在该组件文件内部；没有跨组件复用或明确 ViewModel 边界时，不额外创建独立 mapper。
- 同一 module 内的组件 props 应优先表达真实依赖；不要为了复用少量字段创建包含无关字段的父 props 类型。
- 如果组件只需要 `onNavigate`，应使用局部窄类型承接导航能力，不要从包含 `viewModel` 的大 props 类型里 `Pick` 字段。
- 布局优先使用 Ant `Flex / Space / Row / Col / Layout`，不要为了少写 JSX 新造布局轮子。
- 行为增强必须组合基础组件，不重新实现视觉；导航按钮通过 `NavigationActionButton` 组合 `ActionButton` 承接。
- `ActionButton` 只负责按钮视觉、variant、icon、loading、disabled、danger；不负责排序、布局、导航、权限或业务判断。
- 多个按钮横向排列直接使用 Ant `Flex / Space`，不新增 `ActionGroup / RouteActionGroup / PageActionGroup`。
- `createRouteAction` 只负责构造 route-aware action 数据，不排序、不做权限判断、不渲染 UI。
- 排序、过滤、分组、权限显隐放在 `mapper / hook / controller`，不放在 UI primitive 内。
- 命名按功能职责，不按 `App / Common / Shared / Base / Wrapper / Generic / Universal` 命名；`app/App.tsx`、`app/shell/AppShell.tsx`、`app/providers/AppProviders.tsx` 这类装配层例外。
- 新组件默认放 `modules/<domain>/components`；只有名称无业务词、props 无业务对象、无 `app/modules` 依赖、不是 Ant 镜像、且存在稳定展示或行为模式时，才允许晋升到 `shared`。
- `shared/view-model` 只放跨边界共享的静态 ViewModel 类型、fixtures 和真正无业务的通用 helper；不得承接 `evidence / trace / report / tool / metric / data source` 级别的业务 mapping。
- `shared/test` 只放测试期 provider / helper，不得放业务测试数据。
- `shared` 不得依赖 `app` 或 `modules`；`modules` 不得依赖 `app`；`modules` 之间不得直接 import 其他 module 的业务组件。
- 多模块重复模式可以抽 shared，但必须抽成无业务 primitive，不能把业务对象组件直接放进 shared。
- 不新增 `pages / features / pages/_shared` 回流目录。
- 不新增 `index.ts / index.tsx` barrel export；import 必须显式到具体文件；不保留隐式出口。
- 禁止 `WebSection / SummaryTable / SummaryCardGrid / MetricCardGrid / ActionGroup / AppCardGrid / AppBaseCard / AppActionButton / AppActionGroup / AppTabs / StaticTabsPanel` 回流。
- 禁止 `shared/product`、`legacy`、`temporary`、`transitional` 目录回流。
- 治理收口类 Issue 不允许保留 `P1 / P2 / watch items`。已识别问题必须在当前治理阶段修复，或明确证明它不是问题；只有没有已知未修复架构问题时，才允许建议关闭治理 Issue。
- 设计 token 必须走 `shared/theme`。

## 8. 后端规则

后端采用 Python / FastAPI / LangGraph。

固定分层：

- `api`：请求、鉴权、参数校验、响应。
- `application`：业务用例编排。
- `domain`：业务对象和业务规则。
- `runtime`：LangGraph 执行。
- `agents`：Agent 职责实现。
- `tools`：受控工具注册与执行。
- `model_gateway`：统一模型调用。
- `memory`：Memory 读写策略。
- `evaluation`：评估、Bad Case、数据集。
- `governance`：权限、SQL Guard、Tool Permission、审计。
- `observability`：Trace、Metrics、Cost、日志。
- `infrastructure`：DB、向量库、缓存、队列、外部依赖。
- `schemas`：API DTO。

禁止：

- Agent Runtime 写进前端。
- Agent 绕过 Tool Registry 调工具。
- 模型调用绕过 Model Gateway。
- 业务代码直接访问数据库连接。
- 模型直接执行 SQL。
- 后端同样遵守“框架优先、薄适配、业务垂直切片、shared 只放无业务基础能力”的思想：
  - FastAPI router / dependency / response model 优先，不自造 route 框架。
  - Pydantic 校验优先，不自造 validation 框架。
  - LangChain / LangGraph / LlamaIndex / Milvus 优先，不自造并行运行时框架。
  - `modules/*` 承接业务闭环，`infrastructure/*` 承接技术适配，`shared/*` 只放 errors / validation / utils / types。

## 9. Tool Registry 规则

所有工具必须注册，并包含：

- name
- description
- input schema
- output schema
- permission
- risk level
- timeout
- handler
- error type
- trace event type

## 10. Model Gateway 规则

所有模型调用必须统一走 Model Gateway。

Model Gateway 负责：

- provider adapter
- routing
- retry
- fallback
- cost
- token usage
- latency
- trace
- error mapping

## 11. Memory / Feedback / Evaluation 分域

- Memory：系统长期记住的信息。
- Feedback：用户对本次结果的反馈。
- Evaluation：系统对结果质量的评估。

三者不得混用。

## 12. Mock 策略

产品没有 Mock 模式。

允许：

- seed demo workspace
- test fixtures
- fake provider for tests
- local dev adapter
- contract test data

禁止：

- Mock / Real 模式切换。
- mockRun / realRun 双链路。
- 组件中判断 mock 数据。

## 13. 测试和 CI

每个任务必须给出对应测试或验证证据。

CI 至少覆盖：

- Issue / PR 模板检查
- lint
- typecheck
- unit test
- contract test
- backend test
- frontend build
- smoke test

## 14. PR 规则

PR 必须说明：

- 对应 Issue。
- 实现内容。
- 修改范围。
- 规则遵守情况。
- 契约是否变更。
- 测试结果。
- 风险和未完成事项。

PR 不重新发明标准，只按 Issue 反查。
PR 审查必须按 `docs/workflow.md` 和已审查通过的 Issue 反查。
