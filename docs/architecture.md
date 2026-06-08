# Architecture

本文档是项目架构事实源，说明产品结构、技术栈、目录职责、前后端边界和依赖方向。

## 1. 产品定位

Insight Agent Platform 是企业经营分析与决策 Agent 平台，面向企业经营分析场景，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策和平台运维。

V1 可以是最小实现，但一级模块、目录、数据模型、API 边界和 contracts 位置必须从第一天建立完整。

## 2. 技术栈

### Frontend

- React：前端 UI 框架，负责构建企业级 Web Console 页面。
- TypeScript：前端类型系统，约束组件、ViewModel、API response 和业务字段。
- Vite：前端开发与构建工具，负责本地开发服务和静态资源构建。
- Ant Design v5：企业级基础 UI 组件库，作为本项目统一 UI 设计语言。
- Ant Design X：AI 交互组件体系，后续用于分析输入、AI 回复、会话式交互等场景。
- ProComponents 按需：中后台表格、表单、详情页等复杂业务组件的增强能力。
- TanStack Query：服务端状态管理，负责 API 请求缓存、加载态、错误态和重新获取。
- Zustand：前端本地 UI 状态管理，负责页面局部状态、面板状态、筛选状态等。
- ECharts / Ant Design Charts：图表能力，负责指标趋势、经营看板、评估结果和成本趋势展示。
- AntV G6：项目级只读关系图展示底座，用于 `Data & Knowledge` 资产关系以及后续 `Metrics lineage`、`RunTrace / Step` 等关系展示；必须通过 `shared/graph` 封装使用，不替代普通图表能力。

### Backend

- Python：后端主语言，承载 FastAPI 服务、Agent Runtime 和 AI 工程链路。
- FastAPI：HTTP API 框架，负责接口路由、参数校验、依赖注入和响应输出。
- LangGraph：Agent Runtime 核心，负责任务状态机、Graph 编排、节点执行和长期运行链路。
- LangChain：模型调用、Tool Calling、结构化输出等 LLM 能力层。
- LlamaIndex：Knowledge / RAG 能力层，负责文档解析、索引、检索和知识增强。

### AI / Agent

- LangGraph：Agent Runtime，作为多 Agent 编排、状态流转、Human-in-the-loop 和可恢复执行的核心底座。
- LangChain：Model / Tool 能力层，承接模型调用、工具定义、结构化输出和 Provider 适配。
- LlamaIndex：Knowledge / RAG 能力层，承接业务文档、知识切片、索引和检索增强。
- Milvus：主向量库，负责知识库、RAG、Source Evidence 和后续 Memory 检索的向量存储。
- DeepEval / RAGAs：Evaluation 工具，分别用于 Agent / 报告质量评估和 RAG 检索质量评估。
- LangSmith / Langfuse：Observability 工具，用于 Trace、调试、评估记录和后续私有化观测预留。
- 自研 Model Gateway：模型调用统一入口，负责模型路由、Provider 选择、重试、fallback、token、成本、延迟、错误类型、权限和审计归口；不是自研 LLM 框架，也不能替代 LangChain。
- 自研 Tool Registry：工具定义和工具调用统一入口，负责 tool schema、权限、风险等级、handler 归口、trace 和审计归口；不是自研 Tool Calling 框架，也不能替代 LangChain / LangGraph。
- 自研 Governance / SQL Guard / Policy：企业安全治理层，负责权限、SQL 风险、工具风险、敏感字段和审计。

### AI Platform Core Technology Boundary

核心原则固定如下：

- 可以做轻量版本，但不能做玩具版本。
- 可以先只读展示，但必须按正规技术链路表达。
- 不能自造 Planner / Agent Runtime / RAG / Trace / Evaluation / Tool Calling 体系。
- 不能在页面、组件、mapper、service 或函数里散写模型调用、工具调用、向量检索、SQL 风控。
- `Model Gateway` 不是自研 LLM 框架。
- `Tool Registry` 不是自研 Tool Calling 框架。
- `Model Gateway / Tool Registry` 是项目统一边界，不是自研替代 `LangChain / LangGraph / LlamaIndex` 的框架。
- `Model Gateway / Tool Registry` 不能替代 `LangChain / LangGraph / LlamaIndex`。
- `Model Gateway / Tool Registry` 负责企业级路由、权限、审计、fallback、成本、错误类型和 handler 归口。
- 底层模型调用、Tool Calling、RAG、Agent Runtime 必须优先基于成熟框架承接。

固定技术边界：

- `LangGraph = Agent Runtime / Planner / Graph 编排 / 状态机 / Human-in-the-loop / 可恢复执行`
- `LangChain = 模型调用 / Tool Calling / 结构化输出 / Provider Adapter`
- `LlamaIndex = 文档解析 / 切片 / 索引 / 检索增强`
- `Milvus = 向量存储 / 相似度检索`
- `评估 -> DeepEval / RAGAs`
- `Trace / Observability / 调试 / 评估记录 -> LangSmith / Langfuse`
- `Model Gateway = 模型调用统一入口，负责模型路由、Provider 选择、重试、fallback、token、成本、延迟、错误类型、权限和审计归口`
- `Tool Registry = 工具定义和工具调用统一入口，负责 tool schema、权限、风险等级、handler 归口、trace 和审计归口`
- `Governance Policy / SQL Guard / Tool Permission = 权限、SQL 风险、工具风险、敏感字段和审计策略`
- `证据标准化 -> SourceEvidence`

页面与运行边界固定如下：

- 前端页面只承接标准化 `Contract -> ViewModel -> UI` 链路，不承接真实模型、工具、RAG、SQL Guard 或向量检索执行。
- 后端 `runtime / model_gateway / tools / governance / evaluation / observability` 才是 AI 平台能力的正式运行承接位。
- 如果未来某个页面需要把新对象、ID 或共享动作带入 `API / mapper / ViewModel / Action / Inspector` 链路，必须先补 `docs/contracts.md` 与 `packages/contracts` schema。

后续代码硬规则固定如下：

- 不得在页面、组件、mapper、service、Cloud Function 或任意业务函数中直接散写 provider 调用。
- 不得绕过 `Model Gateway` 调模型。
- 不得绕过 `Tool Registry` 调工具。
- 不得在 `Tool Registry` 外部散落 tool schema、handler、riskLevel 或 permission 判断。
- 不得自建与 `LangGraph` 并行的 Planner / Agent Runtime。
- 不得自建与 `LangChain` 并行的 Tool Calling / Provider Adapter。
- 不得自建与 `LlamaIndex + Milvus` 并行的 RAG / Vector Search 链路。

### Infrastructure

- Docker：后端服务容器化基础，保证 Agent Runtime 可构建、可部署、可回滚。
- CloudBase Run：当前后端主部署平台，承载 Docker 化后的 FastAPI / LangGraph Agent Runtime。
- MySQL 8.x：当前主数据库，负责持久化 Workspace、Analysis Run、Memory、Feedback、Evaluation、Report 等业务数据。
- Redis：缓存与队列基础设施预留，后续承载缓存、异步任务状态、限流和任务队列。
- SQL migration：数据库结构事实源，所有表结构变更必须通过仓库内 SQL migration 演进。
- Queue / Scheduler 预留：异步任务和定时任务承载位，后续用于 RAG ingestion、Evaluation、Report 生成、数据质量检查等后台任务。

### 工具链与质量门禁

- pnpm：前端和 monorepo 包管理唯一主线。
- ESLint：前端代码质量、潜在问题和规则检查。
- Prettier：纯格式化工具，通过 `eslint-config-prettier` 避免和 ESLint 格式规则冲突。
- TypeScript / `tsc`：前端类型检查入口。
- Vitest：前端单元测试入口。
- React Testing Library：前端组件测试入口。
- Playwright：E2E、手机浏览器响应式验证入口。
- uv：Python 环境 / 依赖管理唯一主线。
- Ruff：Python lint / format 入口。
- mypy：Python 类型检查入口。
- pytest：Python 测试和 contract test 入口。
- Contracts：JSON Schema 校验、OpenAPI 检查、TypeScript 类型生成和 Python DTO 承载方向，不建立自动生成双轨。
- Security：secret scan、依赖审计、Governance / SQL Guard / Tool Permission / Sensitive Field 承载方向。

## 3. Monorepo 结构

```text
insight-agent-platform/
├─ apps/                  # 前端应用
│  └─ web/                # React 前端 Console
├─ services/              # 后端服务
│  └─ agent-runtime/      # Python / FastAPI / LangGraph Agent Runtime
├─ packages/              # 跨端共享包，当前主要是 contracts
│  └─ contracts/          # JSON Schema / OpenAPI / generated types
├─ docs/                  # 项目事实源文档
├─ database/              # MySQL migration / seed / query / diagram 事实源
│  └─ mysql/              # MySQL 数据库事实源
├─ deploy/                # Docker / CloudBase Run 部署配置
├─ scripts/               # 自动化脚本承载位
├─ .github/               # Issue / PR / CI 模板和工作流
├─ AGENTS.md              # Codex / AI Agent / 人类开发者执行硬规则
├─ README.md              # 项目总览
├─ pnpm-workspace.yaml    # pnpm workspace 配置
└─ package.json           # monorepo 根 package 配置
```

只有 `services/agent-runtime/src/modules` 按业务垂直切片组织。`database/mysql`、`deploy/`、`scripts/` 按工程基础设施职责组织，不承接业务切片目录。

`packages/contracts/schemas` 必须按业务域分层，不能长期平铺。contracts 的业务域分组必须和前端 `apps/web/src/modules`、后端 `services/agent-runtime/src/modules` 保持一致，使核心对象字段有单一事实源和清晰归属。
其中 contracts 目录可以继续使用 kebab-case，Python runtime package 目录必须使用 snake_case。

```text
packages/contracts/schemas/
├─ workspace/             # Workspace、User、Role、BusinessDomain
├─ data-knowledge/        # DataSource、DataTable、DataField、KnowledgeDocument、KnowledgeChunk
├─ metrics/               # Metric、MetricFormula、MetricThreshold、MetricLineage
├─ analysis/              # AnalysisTask、AnalysisRun、RunEvent、ToolCall、ModelCall、SourceEvidence
├─ memory/                # MemoryItem
├─ feedback/              # Feedback
├─ evaluation/            # EvaluationRun、EvaluationDataset、EvaluationScore、BadCase
├─ model-tools/           # PromptVersion、ToolDefinition、RagStrategy、ModelConfig、RoutingPolicy
├─ governance/            # AuditLog、PermissionPolicy、RiskRule
├─ reports/               # Report、ReportSection、Decision、ActionSuggestion
└─ platform-operations/   # Job、Notification、DataQualityCheck
```

`docs/database.md` 是数据库结构、字段命名、表关系、migration 和 Navicat 使用边界事实源。

`database/mysql` 是 MySQL SQL 事实源，包含：

```text
database/mysql/           # MySQL 数据库事实源
├─ migrations/            # SQL migration，数据库结构事实源
├─ seeds/                 # 初始化数据和演示数据 SQL
├─ queries/               # 只读验证 SQL，用于 Navicat、smoke、排障
└─ diagrams/              # ERD 或 Navicat 导出图，仅辅助理解，不作为事实源
```

## 4. 产品一级模块

一级模块固定为：

1. Workspace / IAM
2. Data Source & Ingestion
3. Metric & Semantic Layer
4. Knowledge & RAG
5. Agent Analysis
6. Multi-Agent Runtime
7. Tool Registry / MCP Adapter
8. Memory Center
9. Feedback Center
10. Evaluation Center
11. Model / Prompt / Tool / RAG Management
12. Governance & Security
13. Observability & Monitoring
14. Report & Decision
15. Business Dashboard
16. Admin / Settings
17. Platform Operations

后续新能力必须落入这些模块之一，不允许随意新增孤立大模块。

### Platform Operations Boundary

- `Platform Operations` 默认是当前 `Workspace` 的平台支撑状态页面，承接当前 `Workspace` 下的 `Job`、`DataQualityCheck`、`Notification` 以及 `Deployment / Smoke / Migration` 摘要。
- 如未来需要跨 `Workspace`、跨租户或全平台运维能力，必须单独建模为 `admin / global operation`，不能默认混入当前 `Workspace` 的 Platform Operations 页面和对象链路。

### 产品体验对象层级

产品体验模型固定按以下对象层级组织：

```text
Tenant / Org
-> Workspace
-> Time Window / Finding
-> Conversation / Message
-> Run / RunEvent / ToolCall / ModelCall
-> Evidence / Source
-> Report / ReportSection / Decision / ActionSuggestion
-> Feedback / Evaluation
```

对象职责固定如下：

- `Tenant / Org`：客户级隔离边界，不作为日常业务页面的默认主对象。
- `Workspace`：Tenant / Org 内的业务空间上下文，承载业务域、权限、时间窗口和当前页面作用域。
- `Finding`：问题、异常或机会点，是 Dashboard 的核心观察对象。
- `Conversation`：围绕某个问题展开的分析过程。
- `Message / Turn`：Conversation 内的多轮对话和交互单元。
- `Run`：后台执行记录，承载状态、成本、事件、工具调用和模型调用。
- `Trace`：Run 的执行详情视图，不等同于单独业务对象。
- `Evidence / Source`：结论依据、来源和追溯入口。
- `Report`：分析结果沉淀，承载报告段落、建议和决策上下文。
- `Feedback / Evaluation`：结果质量闭环，不与 Memory 混用。

### Workspace / Tenant / IAM Boundary

- `Tenant / Org`：客户级隔离边界。
- `Workspace`：业务空间边界。
- `User`：账号。
- `WorkspaceMembership`：用户在某个 `Workspace` 的成员关系。
- `Role`：用户在某个 `Workspace` 内的角色。
- `PermissionPolicy`：角色 / 用户 / 资源动作的权限策略。
- `Resource`：`Metric`、`Dashboard`、`Conversation`、`Run`、`Report`、`Evidence`、`Job` 等业务对象。

架构规则：

- 一个 `Tenant` 可以有多个 `Workspace`。
- 一个 `Workspace` 可以有多个 `User`。
- 一个 `User` 可以加入多个 `Workspace`。
- 一个 `User` 在不同 `Workspace` 中可以拥有不同 `Role`。
- 所有核心业务对象默认归属 `workspaceId`。
- 跨 `Workspace` 访问默认禁止。
- 跨 `Workspace` 共享必须显式建模为 global resource / shared template。
- 后端 API 必须基于 `userId + workspaceId + action + resourceId` 做权限判断。
- 前端只展示权限态和只读 / 禁用状态，不作为权限事实源。

## 5. 前端架构

前端采用最终收敛后的 `app / api / modules / shared` 结构。

```text
apps/web/src/
├─ app/                   # 前端运行时装配层
│  ├─ providers/          # React 根 Provider、Theme/I18n/Ant Design Config
│  ├─ router/             # 路由表、route-aware action helper、页面导航类型
│  └─ shell/              # AppShell、页面 scaffold、通用应用外壳容器
├─ api/                   # 前端 API 边界
│  ├─ client/             # HTTP client / transport 承载位
│  └─ adapters/           # API 响应适配承载位
├─ modules/               # 按业务垂直切片组织的前端模块
│  ├─ workspace/
│  ├─ dashboard/
│  ├─ analysis/
│  ├─ data-knowledge/
│  ├─ metrics/
│  ├─ reports/
│  ├─ platform-operations/
│  ├─ model-tools/
│  ├─ governance/
│  ├─ settings/
│  ├─ evaluation/
│  ├─ feedback/
│  ├─ memory/
│  └─ observability/
├─ shared/                # 无业务语义的跨模块 primitive
│  ├─ ui/                 # Ant Design 薄封装与通用 UI primitive
│  ├─ layout/             # 无业务语义页面结构 primitive
│  ├─ theme/              # 设计 token 和主题能力
│  ├─ graph/              # 项目级关系图展示底座，只接收标准化 RelationshipGraphViewModel
│  ├─ charts/             # 通用图表 primitive
│  ├─ i18n/               # 国际化 provider 与翻译辅助
│  ├─ icons/              # 图标 primitive
│  └─ utils/              # 无业务语义的前端工具函数
└─ main.tsx               # 前端入口
```

### 前端数据链路

```text
API Response
-> Contract Type
-> Module Mapper
-> ViewModel
-> UI Component
```

UI 不得直接消费 raw API response。

`docs/prototypes/product-experience.html` 仅作为产品体验原型参考，用于辅助理解用户逻辑、页面跳转、对象归属和入口关系。

### 产品体验页面职责

- `Workspace`：最上层容器和当前空间上下文，不是普通业务菜单项。
- `Dashboard`：`Finding-first`，承接问题发现、摘要判断和进入 Analysis / Reports / Evidence 的入口。
- `Analysis`：`Conversation-first`，承接多轮分析、消息流和当前会话上下文；用户发送后才创建 `run`，底层由 `LangGraph` 承接 `Agent Runtime / Planner / Graph`，模型调用走 `Model Gateway + LangChain`，工具调用走 `Tool Registry`，Evidence 落到 `SourceEvidence`，Inspector 承接当前 `runId` 的 `Run Trace`，Drawer 承接当前 `run event detail`。
- `Reports`：`Report-first`，承接报告列表、报告阅读、报告段落和决策沉淀；正式报告必须来自 `LangGraph run result + SourceEvidence + Report schema` 的结构化资产，而不是模型 markdown 原文。
- `Observability`：`Run / Trace detail`，全局页后置；当前由 Analysis Run Trace / Drawer 承接单 run 详情，后续承接 `RunEvent / ToolCall / ModelCall / cost / latency / error / fallbackReason` 和 `LangSmith / Langfuse trace mapping`。
- `Data & Knowledge`：数据、知识和证据资产层；`DataSource / DataTable / DataField` 表达结构化数据资产，`KnowledgeDocument / KnowledgeChunk` 表达知识资产，`SourceEvidence` 承接可引用证据对象；页面使用只读关系图表达 `DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report` 与 `KnowledgeDocument -> Chunk Group(ViewModel only) -> KnowledgeChunk -> SourceEvidence -> Run / Report`；`LlamaIndex` 承接解析 / 切片 / 索引 / 检索增强，`Milvus` 承接向量存储与相似度检索，但页面不执行真实 indexing、vector search 或 raw 数据展示。
- `Metrics`：指标、阈值、口径、血缘和异常规则层，当前阶段只读；页面承接指标定义、业务公式、阈值、血缘、证据和异常上下文，真实分析仍由 Analysis / LangGraph run 承接，Dashboard 只能消费 Metrics 语义。
- `Models & Tools`：模型、Prompt、Tool、RAG 策略等平台能力配置层；`ModelConfig / RoutingPolicy / PromptVersion / ToolDefinition / RagStrategy` 是核心对象，页面只承接配置摘要与跳转，模型调用唯一入口是 `Model Gateway`，工具定义与调用唯一入口是 `Tool Registry`。
- `Governance`：治理与安全页面；承接 `PermissionPolicy / RiskRule / SQL Guard / Tool Permission / AuditLog / Sensitive Field Policy / Guardrail`，不把权限决策、SQL 风控和审计写进 UI。
- `Evaluation`：质量评估页面；承接 `EvaluationDataset / EvaluationRun / EvaluationScore / BadCase`，由 `DeepEval / RAGAs` 和后续 `LangSmith Dataset / Eval` 方向承接质量评估，不与 Feedback 混用。
- `Platform Operations`：当前 Workspace 的平台与数据链路健康页；只读展示 `Job / DataQualityCheck / Notification / Deployment / Smoke / Migration` 摘要，用于解释 Dashboard / Analysis 可信度，不是全局 SRE 运维后台。
- `Settings`：当前 Workspace 的默认策略入口和只读配置摘要；默认模型策略跳转 `Models & Tools`，默认 RAG 策略跳转 `Models & Tools / Data & Knowledge`，默认权限策略跳转 `Governance`，不承接密钥展示和真实系统配置写入。
- `Feedback / Memory`：反馈和长期记忆页面；仍需通过 `SourceEvidence / Report / Evaluation` 链路回到正式对象，不引入页面侧自造执行框架。

正式对象层级和页面职责以 `docs/architecture.md` 为准，而不是以 HTML 原型中的页面结构为准。

### 前端职责边界

- `app/providers` 只负责运行时 Provider 装配，不承接业务状态。
- `app/router` 只负责 route key 到 Page 的映射和路由表装配，不承接 shared action primitive。
- `app/shell` 只负责 `AppShell / AppShellLayout / HeaderBar / LeftNav / AppShellInspector` 等通用应用外壳；业务模块自己的 `nav / inspector / drawer / panel` 必须回到 `modules/<domain>`。
- `api/client` 只承接 transport；`api/adapters` 只承接 API Response -> Frontend adapter 边界。
- `modules/*` 是唯一业务落点；页面入口、hooks、fixtures、mappers、models、components 都应收口在对应模块内。
- `shared/navigation` 只放 route-key 级别的公共导航能力，例如 `createRouteAction / NavigationActionButton / navigationTypes`；不得 import `app/router` 或 `modules/*`。
- `shared/layout` 只放无业务语义的页面结构 primitive，例如 `ContentSection / SectionStack / PageHeader / PageScaffold / ResponsivePageShell / SidePanel / DrawerFrame`；不得放 `Analysis* / Reports* / Metrics* / DataKnowledge*` 等业务布局文件。
- `shared/ui` 只放无业务语义 UI primitive 或 Ant Design 薄封装，例如 `ActionButton / CardSurface / ContentCard / StatCard / PropertyList / TitledList / AnnotatedList / SelectableList / GroupedSelectableList / EmptyState / ErrorState / LoadingState / WarningState / StatusTag / RiskBadge`；不得放 `evidence / report / trace / feedback panel` 等业务对象组件。
- `shared/view-model` 只放跨模块共用的静态 ViewModel 支撑类型和 fixture 辅助，不承接业务组件。
- `shared/test` 只放测试期共用 provider / helper，不承接运行时代码。
- `shared` 不得依赖 `app` 或 `modules`；`modules` 可以依赖 `shared` 与 `api`，但不得依赖 `app`。
- `shared/graph` 是唯一 `@antv/g6` 使用入口，负责创建、更新、销毁只读关系图实例。
- `modules/data-knowledge` 只组合 `RelationshipGraphCanvas`，不直接创建 G6 graph。
- 业务页面和 module 不得直接 import `@antv/g6`，也不得把 G6 instance 暴露到业务链路。
- 前端页面、组件、mapper 和页面 service 不得直接执行模型、工具、SQL、RAG、向量检索或 SQL Guard。
- 前端页面不得展示 raw provider response、raw Tool output、LangGraph raw state、raw vector、raw embedding 或 raw SQL result。
- 不新增 `pages / features / pages/_shared` 回流目录，不新增 `index.ts / index.tsx` barrel export。
- 状态标签、风险等级、空态、错误态必须使用 shared UI。
- UI 必须使用 Ant Design 体系，不引入第二套 UI 组件库。

## 6. UI 语言

统一使用 Ant Design 体系，并遵守以下长期规则：

- Ant Design first。能直接使用 Ant Design 的基础能力，就优先使用 Ant Design。
- Thin wrapper second。项目公共组件只做 Ant Design 薄封装和项目级语义封装，不重写 Ant 已经提供的 `Button / Card / Tabs / Table / Descriptions / List / Flex / Space / Row / Col / Layout`。
- Custom component last。只有 Ant Design 无法满足且长期复用价值明确时，才允许新增自定义组件。
- 不 mirror Ant Design。禁止创建 `AppButton / AppTabs / AppTable / AppCheckbox / AppRadio / AppDrawer` 这类只是改名的 Ant Design 镜像组件。
- Layout 不绑定具体内容组件。不新增 `MetricCardGrid / SummaryCardGrid / ReportCardGrid / ActionGroup / ActionBar` 这类和内容类型或按钮集合强绑定的布局组件；布局优先使用 Ant `Flex / Space / Row / Col / Layout`，如需薄封装也必须保持无业务语义。
- 行为增强组合基础组件，不重新实现视觉。导航按钮通过 `NavigationActionButton` 组合 `ActionButton` 承接。
- 排序、过滤、分组、权限显隐放在 `mapper / hook / controller`，不放在 UI primitive 内。
- 命名按功能职责，不按 `App / Common / Shared / Base / Wrapper / Generic / Universal` 命名；装配层 `AppShell / AppProviders / App.tsx` 例外。
- shared primitive 只保留 `ActionButton / CardSurface / ContentCard / StatCard / PropertyList / TitledList / AnnotatedList / SelectableList / GroupedSelectableList / EmptyState / ErrorState / LoadingState / WarningState / StatusTag / RiskBadge / NavigationActionButton` 这类无业务语义能力。
- `AppActionButton / AppActionGroup / AppBaseCard / AppCardGrid / AppPropertyList / AppSection / AppSectionStack / AppTabs / StaticTabsPanel / WebSection / SummaryTable / SummaryCardGrid / MetricCardGrid` 属于禁止回流旧名。
- `TraceTimeline / SourceEvidenceList / ReportSection / DecisionCard / FeedbackPanel` 等业务对象展示组件必须留在 canonical module，而不是回流到 `shared/ui`。

## 7. 后端架构

后端采用 Python / FastAPI + vertical-slice modular architecture。

```text
services/agent-runtime/src/
├─ app/                           # 启动、配置、路由注册、中间件
│  └─ middlewares/
├─ modules/                       # 按业务垂直切片组织的服务代码
│  ├─ workspace/
│  ├─ conversations/
│  ├─ agent_runs/
│  ├─ data_knowledge/
│  ├─ model_tools/
│  ├─ governance/
│  ├─ metrics/
│  ├─ reports/
│  └─ platform_operations/
├─ infrastructure/                # 技术底座，不承接业务切片
│  ├─ database/
│  ├─ auth/
│  ├─ model_gateway/
│  ├─ tool_registry/
│  ├─ rag/
│  └─ observability/
└─ shared/                        # 无业务语义的错误、校验、工具和类型
   ├─ errors/
   ├─ validation/
   ├─ utils/
   └─ types/
```

测试目录固定放在服务根目录，避免混入 runtime package code：

```text
services/agent-runtime/tests/
├─ unit/
├─ contract/
├─ integration/
├─ smoke/
└─ failure_simulation/
```

### 后端目录职责

- `app`：FastAPI 应用入口、配置、路由注册、中间件。
- `modules`：按业务垂直切片承接用例编排和领域占位，不再建立全局 `application / domain / memory / evaluation` 横向大目录；运行时包目录使用 snake_case。
- `infrastructure`：数据库、认证、模型网关、工具注册、RAG、观测等技术底座；运行时包目录使用 snake_case。
- `shared`：无业务语义的错误、校验、工具和类型。

### 后端职责边界

- `app` 不写业务逻辑，只负责启动、配置和 HTTP 边界。
- `modules/*` 承接业务切片，不通过全局横向目录拆散链路。
- `infrastructure/database` 是唯一数据库访问入口承载位。
- `infrastructure/model_gateway` 是唯一模型调用入口。
- `infrastructure/tool_registry` 是唯一工具调用入口。
- `modules/governance` 是权限、SQL Guard、Tool Permission、Audit 的统一业务承接位。
- 后端 service 不允许直接访问数据库连接。
- 后端 service 不允许直接调用模型 provider。
- Agent 不允许直接查库、直接调模型、直接调用外部 API。

## 8. 依赖方向

后端依赖方向：

```text
app -> modules
modules -> infrastructure / shared
infrastructure -> shared
shared 不依赖 modules
```

前端依赖方向：

```text
app -> modules -> shared
shared 不依赖 modules
component 不直接依赖 raw API response
```

## 9. Agent Runtime

Agent Runtime 必须采用：

```text
State + Node + Edge + Tool + Event
```

核心 Agent：

- Orchestrator Agent
- Data Analyst Agent
- Knowledge Agent
- Memory Agent
- Report Agent
- Evaluation Agent
- Governance Agent

## 10. 基础设施与运维承载位

以下基础设施模块必须从第一天保留在 `services/agent-runtime/src/infrastructure/`：

- database
- auth
- model_gateway
- tool_registry
- rag
- observability

以下跨域能力已有明确承载位置，不放入 `infrastructure`：

- audit：`services/agent-runtime/src/modules/governance/audit.py`
- cost：`services/agent-runtime/src/infrastructure/observability/cost.py`

以下运维脚本承载位必须从第一天保留在 `scripts/`：

```text
scripts/
├─ verify/                # 全局质量检查入口
├─ build/                 # 前端和后端构建入口
├─ package/               # 发布产物打包入口
├─ deploy/                # 部署执行入口
├─ rollback/              # 回滚入口
├─ migration/             # 数据库 migration / seed 执行入口
├─ contracts/             # contracts / schema / OpenAPI 检查入口
├─ smoke/                 # 部署后最小链路验证
├─ load/                  # 压测和性能验证
├─ failure-simulation/    # 失败场景模拟
└─ security/              # 安全检查入口
```

## 11. Mock 策略

产品没有 Mock 模式。

允许 seed data、fixtures、fake providers、local dev adapters。

禁止 mock / real 双链路。
