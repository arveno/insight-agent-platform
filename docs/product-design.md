# 产品能力设计事实源

本文档是 Insight Agent Platform 的产品能力设计事实源，用于定义产品主线、用户任务、能力边界、企业痛点、通用体验目标、功能成熟度、稳定 UI 结构与后续功能增强规则。

本文档不替代 `docs/architecture.md`、`docs/contracts.md`、`packages/contracts`、`docs/database.md` 或 `docs/ui-design.md`：

- `docs/architecture.md` 定义系统骨架、模块、目录职责、技术边界和依赖方向。
- `docs/contracts.md` 与 `packages/contracts` 定义业务对象、字段语义、状态、ID 和契约。
- `docs/database.md` 定义数据库结构、字段命名、migration 和数据库边界。
- `docs/ui-design.md` 定义 UI Composition、导航模型、Page Composition、Inspector 和 shared primitive 规则。
- `docs/product-design.md` 只定义产品能力、问题域、任务主线、功能边界和体验目标。

## 1. 目标与定位

Insight Agent Platform 是企业经营分析与决策 Agent 平台。产品目标是让企业用户能够围绕经营问题主动分析、从异常中追问、从结果中继续追问，并形成报告、反馈、评估和能力改进闭环。

本文档固定以下产品设计边界：

- 产品能力必须落入 `docs/architecture.md` 定义的 17 个一级模块。
- 产品能力必须能够回到 `docs/contracts.md` 和 `packages/contracts` 中的业务对象，或显式标记为待确认对象。
- 产品增强不能以 UI 方便为理由改变 architecture / contracts / database 事实源。
- 正式 UI 结构定稿后，导航结构、页面职责、主要入口和核心区域原则上不因后续功能增强反复推翻。
- 后续功能优化、企业痛点补充、通用体验增强，应优先落在既定页面结构和扩展槽位内。
- 如果新增能力会改变 IA、页面职责、导航结构或核心区域，必须先回到 product-design / architecture / ui-design 对应事实源审查。

## 2. 用户角色

| 用户角色          | 主要目标                                             | 关注能力                                           | 主要入口                              | 权限与风险                                                      |
| ----------------- | ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| 企业经营负责人    | 快速理解经营状态、异常原因和决策建议                 | Dashboard、Analysis、Reports、Decision             | Dashboard、Reports、Analysis          | 需要只读、证据、审计和可追溯决策依据                            |
| 业务分析师        | 主动提出经营问题、追问异常、验证证据                 | Analysis、Metrics、Data & Knowledge、Reports       | Analysis、Metrics、Data & Knowledge   | 不能绕过 contracts、指标口径或数据权限                          |
| 数据负责人        | 管理数据源、字段字典、质量、知识入库状态             | Data & Knowledge、Platform Operations、Metrics     | Data & Knowledge、Platform Operations | 不能手工改数据库结构或让 DB 字段泄漏到 UI                       |
| AI / 平台工程师   | 管理模型、Prompt、Tool、RAG 和运行观测               | Models & Tools、Observability、Platform Operations | Models & Tools、Observability         | 不能绕过 Model Gateway、Tool Registry 或引入 mock / real 双链路 |
| 治理 / 安全负责人 | 管理权限、SQL Guard、Tool Permission、审计和敏感字段 | Governance、Observability、Settings                | Governance                            | UI 只展示治理结果和入口，不做权限业务决策                       |
| 评估与质量负责人  | 管理反馈、Bad Case、Evaluation、回归质量             | Feedback、Evaluation、Reports                      | Evaluation、Feedback                  | Memory / Feedback / Evaluation 三域不得混用                     |
| 移动端轻操作用户  | 查看状态、追问、确认、反馈和轻量排障                 | Dashboard、Analysis、Reports、Platform Operations  | Mobile Browser 导航                   | 移动端不删除必要状态、证据、Trace 或审计入口                    |

### 2.1 Workspace / Tenant / IAM 产品规则

- `Tenant / Org` 是客户级隔离边界。
- `Workspace` 是业务空间隔离边界。
- `User` 通过 `WorkspaceMembership` 进入 `Workspace`。
- 同一 `User` 可以加入多个 `Workspace`，并在不同 `Workspace` 中拥有不同 `Role`。
- `Role / PermissionPolicy` 决定用户在当前 `Workspace` 中能查看哪些数据、使用哪些能力、触发哪些动作。
- Dashboard、Metrics、Analysis、Reports、Data & Knowledge、Observability、Platform Operations、Feedback、Evaluation 等业务对象默认只展示当前 `Workspace` 下的数据、对象和能力。
- 切换 `Workspace` 后可以保留 route，但必须重新加载 / 重建当前 `Workspace` 的 ViewModel，不得继续复用上一 `Workspace` 的 selected metric / conversation / run / report / evidence / job。
- 跨 `Workspace` 复用对象必须显式建模为 global resource 或 shared template；默认业务对象不得跨 `Workspace` 直接复用。

## 3. 核心产品主线

### 3.1 主动分析主线

主动分析用于支持用户不是从异常出发，而是主动提出经营问题。

固定主线：

```text
用户主动进入 Analysis
-> 进入新聊天草稿态 / 选择业务域 / 选择数据范围 / 选择知识上下文
-> 用户发送问题
-> create or reuse Conversation
-> create AnalysisTask with typed contextPack snapshot
-> create initial AnalysisRun
-> create User Message bound to conversationId / analysisTaskId / runId
-> update Conversation.currentRunId
-> 查看 Evidence / Trace / Report
-> 继续追问
```

产品规则：

- `Analysis` 必须保留主动分析输入入口，不能只作为 Dashboard 异常的承接页。
- `Analysis` 是 `Conversation-first` 页面；进入页面先落在新聊天草稿态，不立即创建 conversation，不立即创建 run，不立即运行 Agent。
- 主动分析问题必须能绑定 `workspaceId`、`userId`、`businessDomainId`、`analysisTaskId` 和后续 `runId` 链路。
- 用户发送后进入标准化单轨 submit transaction：create or reuse `Conversation` -> create `AnalysisTask` with typed `contextPack` snapshot -> create initial `AnalysisRun` -> create `User Message` bound to `conversationId / analysisTaskId / runId` -> update `Conversation.currentRunId`。
- 数据范围和知识上下文只能引用 Data / Knowledge / Metrics / RAG 已有能力，不在 Analysis 中重新定义数据源或知识库。
- Evidence、Trace、Report、Follow-up 追问是主动分析的核心产品闭环入口。

关联 contracts：

- AnalysisTask
- AnalysisRun
- RunEvent
- SourceEvidence
- Report
- ReportSection
- BusinessDomain
- DataSource / DataTable / DataField
- KnowledgeDocument / KnowledgeChunk
- Metric

### 3.2 异常追问主线

异常追问用于从系统已发现的异常、风险、质量问题或运行问题进入分析。

固定主线：

```text
Dashboard / Metrics / Data Quality / Platform Operations / 单 run Trace 发现异常
-> 生成带来源对象的 context pack
-> 带上下文进入 Analysis 新聊天草稿态
-> 用户发送追问
-> create or reuse Conversation
-> create AnalysisTask with typed contextPack snapshot
-> create initial AnalysisRun
-> create User Message bound to conversationId / analysisTaskId / runId
-> update Conversation.currentRunId
-> 生成 Report / Feedback / Evaluation 输入
```

产品规则：

- Dashboard、Metrics、Data Quality、Platform Operations，以及当前由 Analysis Run Trace / Drawer 承接的单 run 详情，发现异常后都必须能把上下文带入 Analysis。
- Dashboard 必须支持 Dashboard-level / Finding-level / Metric-level context pack 进入 Analysis。
- 带上下文进入 Analysis 只进入新聊天草稿态，不立即创建 conversation，不立即创建 run，不立即运行 Agent。
- 异常上下文必须表达来源对象，例如 Metric、MetricThreshold、DataQualityCheck、RunEvent、ToolCall、ModelCall、Job。
- 用户发送后进入标准化单轨 submit transaction：create or reuse `Conversation` -> create `AnalysisTask` with typed `contextPack` snapshot -> create initial `AnalysisRun` -> create `User Message` bound to `conversationId / analysisTaskId / runId` -> update `Conversation.currentRunId`。
- 异常追问不是独立分析链路，仍然进入 AnalysisTask / AnalysisRun 主链路。
- 异常追问不能让 UI 直接解析 raw API response、DB row、Tool 原始输出、模型原始输出或 LangGraph raw state。

关联 contracts：

- Metric
- MetricThreshold
- DataQualityCheck
- RunEvent
- ToolCall
- ModelCall
- Job
- AnalysisTask
- AnalysisRun
- SourceEvidence
- Report
- Feedback
- EvaluationRun

### 3.3 结果追问主线

结果追问用于从已有结果、证据、Trace、工具调用、模型调用或后台任务继续发起上下文分析。

固定主线：

```text
Report / Source Evidence / Trace / ToolCall / ModelCall / Job
-> Open in Analysis with context
-> 进入带上下文的新聊天草稿态
-> 用户发送追问
-> create or reuse Conversation
-> create AnalysisTask with typed contextPack snapshot
-> create initial AnalysisRun
-> create User Message bound to conversationId / analysisTaskId / runId
-> update Conversation.currentRunId
-> 查看新 Evidence / Trace / Report
```

产品规则：

- `Open in Analysis with context` 是产品能力，不是某个页面临时发明的按钮。
- 上下文必须带明确业务 ID，例如 `reportId`、`sourceEvidenceId`、`runId`、`toolCallId`、`modelCallId`、`jobId`。
- 带上下文进入 Analysis 时，不立即创建 conversation 或 run；只有用户发送后才进入新的分析链路。
- `DraftContextPack` 是一次性前端草稿上下文；Dashboard / Metrics / Reports / Evidence / Run Trace 带上下文进入 Analysis 时，只进入新聊天草稿态。
- `DraftContextPack` 刷新页面后不需要恢复；刷新后回到普通新聊天草稿态。
- `DraftContextPack` 用于 context strip、Draft Context inspector 和 suggestedPrompt，不立即创建 `conversationId` 或 `runId`。
- 结果追问不能覆盖原始 run 或 report，只能产生新的 AnalysisTask / AnalysisRun 关联链路。
- 用户发送后进入标准化单轨 submit transaction：create or reuse `Conversation` -> create `AnalysisTask` with typed `contextPack` snapshot -> create initial `AnalysisRun` -> create `User Message` bound to `conversationId / analysisTaskId / runId` -> update `Conversation.currentRunId`。
- 旧请求不能覆盖新会话；多轮追问必须用明确的 run / request / message 识别边界。

关联 contracts：

- Report
- ReportSection
- SourceEvidence
- RunEvent
- ToolCall
- ModelCall
- Job
- AnalysisTask
- AnalysisRun

### 3.4 报告 / 反馈 / 评估闭环

报告、反馈和评估用于把一次分析结果转化为可审查、可纠错、可回归、可改进的产品闭环。

固定闭环：

```text
Analysis
-> Report
-> Feedback
-> Bad Case
-> Evaluation
-> 反哺 Prompt / Tool / RAG / Model Gateway / Governance
```

产品规则：

- Report 是正式结果承接，不等于模型原始输出。
- Feedback 是用户对本次结果的反馈，不等于 Memory，不等于 Evaluation。
- Bad Case 是 Feedback / Evaluation 后沉淀的问题样本。
- Evaluation 是系统对质量的评估，不等于用户反馈。
- 反哺 Prompt / Tool / RAG / Model Gateway / Governance 必须通过后续已审查 Issue 执行，不能由 UI 自动改变配置。

关联 contracts：

- AnalysisRun
- Report
- ReportSection
- SourceEvidence
- Feedback
- BadCase
- EvaluationDataset
- EvaluationRun
- EvaluationScore
- PromptVersion
- ToolDefinition
- RagStrategy
- ModelConfig
- RoutingPolicy
- PermissionPolicy
- RiskRule
- AuditLog

### 3.5 Dashboard / Analysis / Reports / Metrics / Observability 产品关系

- `Dashboard = Finding-first`：承接问题发现、摘要判断和带上下文进入 Analysis。
- `Analysis = Conversation-first`：承接新聊天草稿态、多轮追问、上下文分析和当前 run 详情。
- `Reports = Report-first`：承接正式结果沉淀、报告阅读、证据追溯和反馈入口。
- `Metrics = 当前 Workspace 的指标语义层`：当前阶段只读，承接指标目录、业务定义、口径、阈值、血缘、证据和异常上下文；页面结构固定为 LeftNav 二级指标列表 + 主区指标总览与当前指标详情，不做新增指标、编辑公式或编辑阈值。
- `Data & Knowledge = 当前 Workspace 的数据资产、知识资产、证据来源和数据可信状态页`：当前阶段只读；页面结构固定为 `LeftNav secondary list = 当前 Workspace 的 grouped asset list`、`MainContent = 当前选中资产的关系图和节点详情`、`Inspector = 全局摘要和辅助入口`。
- `Platform Operations = 当前 Workspace 的平台与数据链路健康页`：当前阶段只读，承接 Job、DataQualityCheck、Notification / Alert、Deployment / Smoke / Migration 摘要与风险入口，不做全局 SRE 运维后台或代码 / 数据库执行台。
- `Observability` 全局页需要真实 `RunEvent / ModelCall / ToolCall / cost / latency / error` 数据支撑，当前阶段后置；单 run 详情由 Analysis Run Trace / Drawer 承接。
- Reports 是正式结果沉淀，`Report` 不等于模型原始输出，不等于 `Run Trace`。

补充规则：

- `Metrics` 当前结构固定为：`LeftNav secondary list = 当前 Workspace 的 Metric list`，`MainContent = 指标总览 + 当前指标详情`，`Inspector = 当前阶段不强制启用`。
- `Metrics` 左侧二级列表只负责选择当前指标，只显示指标名；不显示当前值、趋势、证据数、按钮或大段描述。
- `Metrics` 的 `Open in Analysis with context` 只进入 Analysis 新聊天草稿态，不立即创建 conversation，不立即创建 run，不立即运行 Agent。
- `DraftContextPack` 是一次性前端草稿上下文；Dashboard / Metrics / Reports / Evidence / Run Trace 带上下文进入 Analysis 时，只进入新聊天草稿态。
- `DraftContextPack` 刷新页面后不需要恢复，回到普通新聊天草稿态。
- `DraftContextPack` 用于 context strip、Draft Context inspector 和 suggestedPrompt，不立即创建 `conversationId` 或 `runId`。
- `Data & Knowledge` 当前结构固定为：`LeftNav secondary list = grouped asset list`，其中 `数据资产 Data` 和 `知识文档 Docs` 只是页面内部二级列表分组，不是新的一级模块，不新增 `Data route / Knowledge route`，也不拆 `Data & Knowledge` 一级入口。
- `Data & Knowledge` 的 `MainContent` 固定为：`SelectedAssetHeader + AssetRelationshipGraph + SelectedNodeDetail`，不再以全局总览卡片堆叠作为主线。
- `Data & Knowledge` 的 `Inspector` 固定承接：`Workspace Overview`、`Readonly Boundary`、`Quality & Operations Summary`、`Actions`、`Technical Boundary`。
- `DataSource` 关系图语义固定为：`DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report`。
- `KnowledgeDocument` 关系图语义固定为：`KnowledgeDocument -> Chunk Group(ViewModel 展示派生) -> KnowledgeChunk -> SourceEvidence -> Run / Report`。
- `Chunk Group` 只是 ViewModel 展示派生，不是 contract 字段，不是正式业务对象，不新增 `packages/contracts` schema。
- `Data & Knowledge` 当前只读，不执行真实 ingestion、schema sync、indexing、vector search 或 `DataQualityCheck`。
- `Data & Knowledge` 的 `Open in Analysis with context` 只进入 Analysis 新聊天草稿态，不创建真实 conversation 或 run。
- Metric-level context 至少表达：`metricId`、`metricName`、`currentValue`、`timeRange`、`trend`、`threshold`、`riskLevel`、`formula`、`lineage`、`evidenceRefs`、`workspaceId`。
- `血缘 = 指标从哪些表、字段、任务或来源计算而来`；`证据 = 支撑指标异常判断或指标可信度的来源材料`。证据不等于 RAG，RAG 只是证据来源之一。
- `Platform Operations` 与 `Data & Knowledge`、`Dashboard`、`Analysis`、`Governance`、`Observability` 相关，但当前阶段只承接当前 `Workspace` 的只读平台健康总览，不承接全租户或全平台运维后台。

### 3.6 AI Platform Core Technology Boundary

产品层面的 AI 技术边界固定如下：

- 可以做轻量版本，但不能做玩具版本。
- 可以先只读展示，但必须按正规技术链路表达。
- 不能自造 Planner / Agent Runtime / RAG / Trace / Evaluation / Tool Calling 体系。
- 不能在页面、组件、mapper、service 或函数里散写模型调用、工具调用、向量检索、SQL 风控。
- `Model Gateway / Tool Registry` 是项目统一边界，不是替代 `LangChain / LangGraph / LlamaIndex` 的自研框架。
- `Model Gateway` 是“模型调用统一入口”的产品对象边界，不是底层模型框架。
- `Tool Registry` 是“工具定义和调用统一入口”的产品对象边界，不是底层工具调用框架。
- 底层运行仍由 `LangGraph / LangChain / LlamaIndex / Milvus` 等成熟框架承接。
- `SourceEvidence` 是 Analysis、Reports、Metrics、Data & Knowledge 等页面共享的标准化证据对象，不允许页面各自发明证据结构。

按页面固定承接关系：

- `Analysis`：承接 `Conversation / Chat`、当前 `runId` 的 `Run Trace` 和 `run event detail`；真实运行由 `LangGraph` 承接，模型调用走 `Model Gateway + LangChain`，工具调用走 `Tool Registry`，Evidence 必须落到 `SourceEvidence`。
- `Reports`：承接 `Report / ReportSection / Decision / ActionSuggestion / SourceEvidence` 的结构化结果，不承接模型原始 markdown；后续报告质量评估可接 `DeepEval / RAGAs / LangSmith Dataset`。
- `Metrics`：承接当前 Workspace 的指标语义、业务公式、阈值、血缘、证据和异常上下文；真实分析仍回到 Analysis / LangGraph run，Dashboard 只能消费 Metrics 语义。
- `Data & Knowledge`：承接 `DataSource / DataTable / DataField / KnowledgeDocument / KnowledgeChunk / SourceEvidence / DataQualityCheck`；`SourceEvidence` 是页面共享的标准化证据对象；`LlamaIndex` 承接解析、切片、索引、检索增强，`Milvus` 承接向量存储和相似度检索；页面只读展示 `DataSource -> DataTable -> DataField -> SourceEvidence -> Run / Report` 与 `KnowledgeDocument -> Chunk Group(ViewModel only) -> KnowledgeChunk -> SourceEvidence -> Run / Report`，不执行真实 ingestion、schema sync、indexing、vector search 或 `DataQualityCheck`。
- `Models & Tools`：承接 `ModelConfig / RoutingPolicy / PromptVersion / ToolDefinition / RagStrategy`；页面只展示 `Model Gateway / Tool Registry / Prompt / RAG` 策略等配置摘要和入口，不执行模型调用，不执行 Tool，不保存真实配置，不展示密钥；`Model Gateway` 是模型调用唯一入口，`Tool Registry` 是工具定义和工具调用唯一入口，`LangSmith / Langfuse` 是运行观测入口。
- `Governance`：承接 `PermissionPolicy / RiskRule / SQL Guard / Tool Permission / AuditLog / Sensitive Field Policy / Guardrail`，不把治理判断写进 UI。
- `Observability`：当前由 Analysis Run Trace / Drawer 承接单 run 详情，后续全局页承接 `RunEvent / ToolCall / ModelCall / cost / latency / errorType / fallbackReason / LangSmith / Langfuse trace mapping`。
- `Evaluation`：承接 `EvaluationDataset / EvaluationRun / EvaluationScore / BadCase`；`DeepEval` 承接 Agent / Report 质量评估，`RAGAs` 承接 RAG 检索质量评估。
- `Platform Operations`：承接当前 Workspace 的 `Job / DataQualityCheck / Notification / Deployment / Smoke / Migration` 只读摘要，用于解释 Dashboard / Analysis 可信度，不做执行后台。
- `Settings`：只承接默认策略入口和只读配置摘要；默认模型策略跳转 `Models & Tools`，默认 RAG 策略跳转 `Models & Tools / Data & Knowledge`，默认权限策略跳转 `Governance`。

后续代码门禁固定如下：

- 如果某个功能要进入真实模型调用，必须走 `Model Gateway`。
- 如果某个功能要进入真实工具调用，必须走 `Tool Registry`。
- 如果某个功能要进入真实 `Agent Runtime / Planner`，必须走 `LangGraph`。
- 如果某个功能要进入真实 `RAG / 向量检索`，必须走 `LlamaIndex + Milvus`。
- 如果某个功能要进入评估，必须优先对齐 `DeepEval / RAGAs / LangSmith Dataset`。

## 4. 产品能力地图

| 能力域         | 核心用户任务                                                                                                | 承接模块                                                            | 主要页面或入口                                     | 关联 contracts / 待确认对象                                                                | 成熟度方向 |
| -------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------ | ---------- |
| 工作区与身份   | 切换 workspace、查看成员、角色、业务域                                                                      | Workspace / IAM                                                     | Workspace、Header workspace selector               | Workspace, User, Role, BusinessDomain, PermissionPolicy, WorkspaceMembership 待确认        | L1 -> L2   |
| 数据可信       | 查看数据源、字段、质量、schema sync、ingestion job，并判断数据链路是否影响结果可信度                        | Data Source & Ingestion, Platform Operations                        | Data & Knowledge、Platform Operations              | DataSource, DataTable, DataField, DataQualityCheck, Job, IngestionJob 待确认               | L1 -> L3   |
| 指标语义       | 查看指标定义、公式、阈值、血缘、证据和异常，只读理解当前 Workspace 指标语义，并带上下文进入 Analysis 草稿态 | Metric & Semantic Layer, Business Dashboard                         | Metrics、Dashboard                                 | Metric, MetricFormula, MetricThreshold, MetricLineage                                      | L1 -> L3   |
| 知识与 RAG     | 查看文档、切片、入库、索引、RAG 策略入口                                                                    | Knowledge & RAG, Model / Prompt / Tool / RAG Management, Evaluation | Data & Knowledge、Models & Tools、Evaluation       | KnowledgeDocument, KnowledgeChunk, RagStrategy, Job, retrieval quality 待确认              | L1 -> L3   |
| 主动分析       | 主动提问、选择上下文、发起 run、继续追问                                                                    | Agent Analysis, Multi-Agent Runtime                                 | Analysis                                           | AnalysisTask, AnalysisRun, RunEvent, SourceEvidence                                        | L2 -> L3   |
| 运行过程       | 查看 timeline、审批态、节点详情                                                                             | Multi-Agent Runtime, Observability & Monitoring                     | Analysis、Observability                            | AnalysisRun, RunEvent, ToolCall, ModelCall, PermissionPolicy                               | L1 -> L3   |
| 工具能力       | 查看 ToolDefinition、ToolCall、MCP Adapter、Tool Permission                                                 | Tool Registry / MCP Adapter, Governance & Security                  | Models & Tools、Observability、Governance          | ToolDefinition, ToolCall, PermissionPolicy, AuditLog, MCP Adapter 待确认                   | L1 -> L3   |
| 记忆能力       | 查看 Memory、关联对象、使用痕迹                                                                             | Memory Center, Agent Analysis                                       | Memory、Analysis                                   | MemoryItem, AnalysisRun, RunEvent, memoryReads / memoryWrites 待确认                       | L1 -> L3   |
| 反馈能力       | 提交反馈、查看纠错、沉淀 Bad Case                                                                           | Feedback Center, Report & Decision, Evaluation Center               | Reports、Feedback、Evaluation                      | Feedback, SourceEvidence, BadCase                                                          | L2 -> L3   |
| 评估能力       | 管理 dataset、run、score、Bad Case、rubric                                                                  | Evaluation Center                                                   | Evaluation                                         | EvaluationDataset, EvaluationRun, EvaluationScore, BadCase, Rubric / DatasetItem 待确认    | L1 -> L3   |
| 模型与策略     | 管理模型、路由、Prompt、RAG 策略                                                                            | Model / Prompt / Tool / RAG Management                              | Models & Tools                                     | ModelConfig, RoutingPolicy, PromptVersion, RagStrategy                                     | L1 -> L3   |
| 治理与安全     | 管理权限、风险、SQL Guard、审计、敏感字段                                                                   | Governance & Security                                               | Governance、Settings、Observability                | PermissionPolicy, RiskRule, AuditLog, ToolDefinition, SQL Guard 待确认                     | L1 -> L3   |
| 观测与成本     | 查看单 run Trace，并为后续全局成本、延迟、错误率观测预留事实源                                              | Observability & Monitoring                                          | Analysis Run Trace / Drawer、Observability（后置） | RunEvent, ToolCall, ModelCall, AuditLog, external trace mapping 待确认                     | L0 -> L3   |
| 报告与决策     | 阅读报告、证据、决策建议、发起反馈                                                                          | Report & Decision                                                   | Reports                                            | Report, ReportSection, SourceEvidence, Decision, ActionSuggestion, Feedback                | L2 -> L3   |
| 经营总览       | 查看经营指标、异常、平台质量摘要                                                                            | Business Dashboard                                                  | Dashboard                                          | Metric, MetricThreshold, SourceEvidence, DataQualityCheck, Job, Dashboard ViewModel 待确认 | L1 -> L3   |
| 设置与默认策略 | 查看系统默认设置、环境可见项、默认策略入口                                                                  | Admin / Settings                                                    | Settings                                           | Workspace, PermissionPolicy, RoutingPolicy, RagStrategy, Settings 聚合对象待确认           | L1 -> L2   |
| 平台运维       | 查看当前 Workspace 的 Job、通知、数据质量、部署、smoke、migration 摘要，判断平台与数据链路是否健康          | Platform Operations                                                 | Platform Operations                                | Job, Notification, DataQualityCheck, Deployment / SmokeTest / MigrationResult 待确认       | L1 -> L3   |

能力地图对应的正规技术承接关系固定如下：

- `Analysis / 主动分析 / 运行过程` 默认回到 `LangGraph + Model Gateway + LangChain + Tool Registry + SourceEvidence` 主链路。
- `Reports / 报告与决策` 默认回到 `Run result + Report schema + SourceEvidence + Evaluation` 链路，不消费模型原文。
- `Metrics / 经营总览` 默认回到指标语义层和 `SourceEvidence`，不在页面侧发明指标口径或执行真实计算。
- `Data & Knowledge / 知识与 RAG` 默认回到 `LlamaIndex + Milvus + SourceEvidence + DataQualityCheck` 资产链路，不在页面侧执行检索。
- `Models & Tools / Governance / Observability / Evaluation / Platform Operations / Settings` 默认只承接配置、治理、观测、评估、平台健康和默认策略入口，不把真实执行链路写进页面。

## 5. 功能成熟度分级

| 等级 | 名称     | 适用场景                                                                  | 产品要求                                                                  | 对 UI 结构的影响                                    |
| ---- | -------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------- |
| L0   | 入口预留 | 架构已确定，但对象、流程或权限仍待确认                                    | 只保留入口、说明、空态或风险标注                                          | 不应新增页面主结构，只能占用既定扩展槽位            |
| L1   | 只读可见 | 用户需要查看状态、列表、详情、摘要或审计事实                              | 展示 contracts / ViewModel 的只读信息，状态来自 contract 枚举或待确认标记 | 可使用主内容区、右侧辅助区、Drawer、Tabs            |
| L2   | 轻操作   | 用户可筛选、跳转、提交反馈、确认、发起追问或打开上下文                    | 操作必须有权限态、风险态、成功 / 失败反馈和审计入口                       | 不改变导航结构，优先使用既定操作区、Modal 或 Drawer |
| L3   | 完整闭环 | 能力形成端到端产品闭环，例如 Analysis -> Report -> Feedback -> Evaluation | 必须有任务起点、状态、结果、异常、反馈、证据和后续入口                    | 可以稳定沉淀为页面核心能力，但必须先完成 Issue 审查 |
| L4   | 智能优化 | 系统基于反馈、评估、成本、失败和治理结果自动优化策略                      | 必须可解释、可回滚、可审计，不得静默修改核心配置                          | 属于后续智能增强，不应推翻既有 UI 结构              |

成熟度规则：

- V1 可以先做到 L0 / L1 / L2。
- 核心主线必须逐步走向 L3。
- L4 属于后续智能优化，不应推翻既有 UI 结构。
- 功能增强 Issue 必须写清目标成熟度等级。
- 从 L0 / L1 升级到 L2 / L3 时，如果会改变 IA、页面职责、导航结构或核心区域，必须先回到 product-design / architecture / ui-design 审查。

## 6. 企业痛点目录

| 企业痛点       | 痛点是什么                                                                                                                                                         | 承接模块                                                                                                    | 页面或入口                                                                 | 关联 contracts / 待确认对象                                                                                                                  | 后续增强落点                                                                                                 | 是否会影响 UI 结构                              |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| 数据可信       | 用户需要知道分析基于哪些数据、字段、质量检查和证据，不能只看到结论，也要能区分问题来自业务本身还是数据链路。                                                       | Data Source & Ingestion, Metric & Semantic Layer, Knowledge & RAG, Report & Decision, Platform Operations   | Data & Knowledge、Metrics、Platform Operations、Reports、Analysis Evidence | DataSource, DataTable, DataField, Metric, KnowledgeDocument, KnowledgeChunk, SourceEvidence, DataQualityCheck                                | Evidence 入口、SourceEvidenceList、Data Quality 摘要、Platform Operations 健康摘要、字段 / chunk 详情 Drawer | 不应影响导航；可增强 Evidence 与详情槽位        |
| 异常发现       | 用户需要从经营指标、数据质量、运行状态和平台运维中发现异常，并判断异常来自经营信号还是平台支撑状态。                                                               | Business Dashboard, Metric & Semantic Layer, Platform Operations, Observability & Monitoring                | Dashboard、Metrics、Platform Operations、Observability                     | MetricThreshold, RiskRule, DataQualityCheck, Job, RunEvent, ToolCall, ModelCall                                                              | Dashboard 异常区、Metrics 阈值区、Platform Operations 运维总览 / 风险入口、Observability charts              | 不应新增一级模块；可增强异常卡片和跳转入口      |
| 主动追问       | 用户不能只被动等待异常，要能主动提出经营问题并继续追问。                                                                                                           | Agent Analysis, Multi-Agent Runtime, Report & Decision                                                      | Analysis、Reports、Source Evidence、Trace                                  | AnalysisTask, AnalysisRun, RunEvent, SourceEvidence, Report                                                                                  | Analysis 主动输入区、Follow-up 追问入口、Open in Analysis with context                                       | Analysis 核心槽位必须稳定保留；后续增强不应移除 |
| 报告可信       | 报告必须可追溯、可审查、可反馈，不能等同于模型原始输出。                                                                                                           | Report & Decision, Agent Analysis, Knowledge & RAG, Metric & Semantic Layer                                 | Reports、Analysis、Source Evidence Drawer                                  | Report, ReportSection, SourceEvidence, Metric, KnowledgeChunk                                                                                | Report 阅读区、Evidence 右侧辅助区、Feedback 入口                                                            | 不改变 Reports 页面职责；增强证据和反馈槽位     |
| 证据追溯       | 用户需要从结论追溯到数据表、指标、知识文档、SQL 查询、Memory 或决策记忆。                                                                                          | Report & Decision, Data Source & Ingestion, Knowledge & RAG, Memory Center                                  | Reports、Analysis、Data & Knowledge、Memory                                | SourceEvidence, DataTable, Metric, KnowledgeDocument, KnowledgeChunk, MemoryItem                                                             | SourceEvidenceList、Evidence Drawer、Open in Analysis with context                                           | 不改变页面结构；增强右侧辅助区和 Drawer         |
| 权限与审计     | 企业需要知道谁做了什么、是否有权限、哪些工具或数据访问被拒绝或审批。                                                                                               | Governance & Security, Workspace / IAM, Tool Registry / MCP Adapter, Observability & Monitoring             | Governance、Workspace、Models & Tools、Observability                       | Role, User, PermissionPolicy, AuditLog, ToolDefinition, ToolCall, ModelCall                                                                  | Governance 策略 Tabs、Audit Log、Tool Permission 区、只读 / 禁用态                                           | 不新增权限页面；Governance 是主承接             |
| 敏感字段       | Prompt、环境配置、工具入参输出、模型调用、审计日志可能包含敏感内容。                                                                                               | Governance & Security, Admin / Settings, Observability & Monitoring, Model / Prompt / Tool / RAG Management | Governance、Settings、Observability、Models & Tools                        | PermissionPolicy, AuditLog, PromptVersion, ModelCall, ToolCall, Settings 聚合对象待确认                                                      | 脱敏标注、权限态、只读摘要、审计详情 Drawer                                                                  | 不应影响 IA；必须在相关槽位标注脱敏和权限       |
| 长任务状态     | Analysis Run、ingestion、indexing、evaluation、report、deployment、migration 都可能长时间运行，用户需要在当前 Workspace 内看清哪些后台支撑状态可能影响结果可信度。 | Multi-Agent Runtime, Platform Operations, Evaluation Center, Knowledge & RAG                                | Analysis、Platform Operations、Evaluation、Data & Knowledge                | AnalysisRun, RunEvent, Job, EvaluationRun, DataQualityCheck                                                                                  | Run 状态区、Platform Operations 总览 / Job 状态 / 数据质量摘要、Evaluation status、index status              | 不改变主结构；需要统一状态区和跳转              |
| 模型成本与延迟 | 企业需要知道模型调用成本、token、延迟、错误和 fallback 情况。                                                                                                      | Observability & Monitoring, Model / Prompt / Tool / RAG Management                                          | Observability、Models & Tools                                              | ModelCall, ModelConfig, RoutingPolicy, RunEvent, quota / fallback 待确认                                                                     | Observability charts、Model Gateway runtime 区、配置页跳转                                                   | 配置页不承接运行图表；运行观测归 Observability  |
| 失败恢复       | 分析、工具、模型、RAG、evaluation、job 失败后需要定位、重试或转人工，并判断问题是否来自数据链路或平台支撑状态。                                                    | Agent Analysis, Observability & Monitoring, Platform Operations, Governance & Security                      | Analysis、Observability、Platform Operations、Governance                   | AnalysisRun, RunEvent, ToolCall, ModelCall, Job, AuditLog                                                                                    | ErrorState、Trace、Audit、Platform Operations 风险详情入口、Job detail                                       | 不新增失败页面；增强错误态和详情 Drawer         |
| 反馈与评估闭环 | 用户反馈必须沉淀为 Bad Case 和 Evaluation，反哺 Prompt / Tool / RAG / Model Gateway / Governance。                                                                 | Feedback Center, Evaluation Center, Report & Decision, Model / Prompt / Tool / RAG Management               | Reports、Feedback、Evaluation、Models & Tools、Governance                  | Feedback, BadCase, EvaluationDataset, EvaluationRun, EvaluationScore, PromptVersion, ToolDefinition, RagStrategy, ModelConfig, RoutingPolicy | FeedbackPanel、BadCase 管理、Evaluation Run、改进入口                                                        | 不改变主链路；反哺配置必须另开 Issue            |
| 移动端轻操作   | 手机浏览器需要查看、追问、确认、反馈和轻排障，不能承载所有复杂配置。                                                                                               | 全部前端页面，重点是 Analysis, Dashboard, Reports, Platform Operations                                      | Mobile Browser 导航、Drawer、Tabs、卡片列表                                | 与对应页面 contracts 一致                                                                                                                    | 单列、卡片化、Drawer、轻操作、只读策略                                                                       | 不建立移动端独立链路；不删除必要状态和证据      |

## 7. 通用体验问题目录

| 体验问题                                                      | 体验目标                                                                | 适用场景                                   | 承接模块或页面                                           | 是否跨功能通用能力 | 后续实现 Issue 需要验证什么                                                                           |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| 多轮分析会话                                                  | 用户能围绕同一问题持续追问，并区分不同 run / report / evidence 上下文。 | 主动分析、异常追问、结果追问               | Agent Analysis, Reports, Observability / Analysis        | 是                 | 会话与 run 关系、context ID、旧 run 不覆盖新 run                                                      |
| 流式输出                                                      | 用户能看到分析过程和结果逐步出现，但 UI 不直接展示模型原始输出。        | Analysis Run、Report 生成、Trace           | Agent Analysis, Multi-Agent Runtime                      | 是                 | streaming 状态、RunEvent 映射、错误中断、最终 Report 边界                                             |
| 默认滚动到底部                                                | 新消息、RunEvent 或流式结果默认进入最新位置。                           | Analysis 会话、Trace、Report 生成          | Analysis, Observability                                  | 是                 | 新内容追加时滚动行为和可访问性                                                                        |
| 用户手动滚动时不抢焦点                                        | 用户查看历史内容时，新事件不能强行打断阅读。                            | 长会话、Trace、长 Report                   | Analysis, Observability, Reports                         | 是                 | 手动滚动检测、暂停自动滚动、状态提示                                                                  |
| 回到底部入口                                                  | 用户离开底部后能一键回到最新内容。                                      | Analysis 会话、Trace、日志式列表           | Analysis, Observability, Platform Operations             | 是                 | 回到底部按钮、未读计数、键盘和移动端可用性                                                            |
| 长会话分段加载或虚拟列表                                      | 长会话和长 Trace 不应拖慢页面或丢失上下文。                             | 多轮分析、Run Timeline、Audit Log、Job Log | Analysis, Observability, Governance, Platform Operations | 是                 | 分段加载、虚拟列表、状态保持、上下文定位                                                              |
| loading / streaming / error / retry 状态                      | 用户清楚当前是加载、生成、失败还是可重试状态。                          | Analysis、Report、Trace、Job、Evaluation   | 全部长任务页面                                           | 是                 | LoadingState、ErrorState、retry 权限、失败原因、状态枚举来源                                          |
| 旧请求不能覆盖新会话                                          | 快速切换问题或 run 时，旧请求结果不能污染当前视图。                     | Analysis、Reports、Trace、Evaluation       | Analysis, Reports, Observability, Evaluation             | 是                 | request 边界、runId 绑定、取消 / 忽略旧响应策略                                                       |
| conversationId / messageId / messageStreamId / 请求边界防串话 | 每个会话、消息、流式输出、run、trace 必须有明确识别边界。               | 多轮追问、Trace、ToolCall、ModelCall       | Analysis, Observability                                  | 是                 | `conversationId`、`messageId`、`messageStreamId`、`runId`、`toolCallId`、`modelCallId` 与请求边界策略 |
| 移动端追问和轻操作                                            | 手机浏览器能追问、查看证据、确认、反馈和轻排障。                        | Mobile Browser                             | Analysis, Dashboard, Reports, Platform Operations        | 是                 | 单列、Drawer、卡片化、轻操作权限、复杂操作降级                                                        |

这里的“请求边界”只表示前端或交互层的临时请求上下文，不是 canonical contract ID。

正式运行主线仍然是 `AnalysisRun / runId`，正式会话主线仍然是 `Conversation / conversationId`。

## 8. 稳定 UI 结构与扩展槽位

后续功能增强优先落在既有页面结构和扩展槽位内。除非经过 product-design / architecture / ui-design 对应事实源审查，不应因单个功能增强推翻导航结构、页面职责、主要入口或核心区域。

| 页面                  | 稳定槽位                                                                                                                                                                 | 可承接增强                                                                          | 不承接内容                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Analysis              | 新聊天草稿态；主动分析输入区；上下文选择区；Run 列表 / 会话列表；Run 状态区；结果预览区；Evidence 入口；Trace 入口；Report 入口；Follow-up 追问入口；右侧辅助区 / Drawer | 主动分析、异常追问、结果追问、审批态、流式状态、重试、Open in Analysis with context | 深度 Trace 主页面、正式报告阅读、Evaluation 管理、模型配置                                                                        |
| Dashboard             | 经营指标摘要；异常与风险摘要；平台质量摘要；Evidence / Analysis 跳转入口                                                                                                 | 异常发现、异常追问、平台质量摘要、经营风险提示                                      | 指标定义、真实分析执行、评估引擎                                                                                                  |
| Reports               | Report 列表；Report 阅读区；ReportSection；SourceEvidence 入口；Decision / ActionSuggestion；Feedback 入口                                                               | 报告可信、证据追溯、结果追问、反馈提交                                              | 模型原始输出、反馈主列表、Evaluation 管理                                                                                         |
| Data & Knowledge      | 数据源 Tabs；知识 Tabs；字段 / chunk 详情；质量摘要；ingestion / index 入口                                                                                              | 数据可信、知识入库、schema sync、检索质量入口                                       | Job 主执行页、RAG 策略配置主页面                                                                                                  |
| Metrics               | LeftNav 二级指标列表；指标总览；当前指标详情；只读公式 / 阈值 / 血缘 / 证据摘要；Analysis 草稿态上下文入口                                                               | 指标语义、异常发现、指标证据、带上下文进入 Analysis 草稿态                          | 新增指标、编辑指标、编辑公式、编辑阈值、指标计算实现、真实查询数据库、真实异常规则引擎、直接创建 conversation / run、数据清洗实现 |
| Models & Tools        | ModelConfig Tab；RoutingPolicy Tab；PromptVersion Tab；ToolDefinition Tab；RagStrategy Tab；配置详情 Drawer                                                              | 模型 / Prompt / Tool / RAG 管理、Tool Permission 入口、runtime 观测跳转             | 模型密钥展示、运行监控主图表、Tool 执行                                                                                           |
| Observability（后置） | Analysis Run Trace / Drawer；后续全局成本 / 延迟 / 错误率视图；外部 trace 映射入口                                                                                       | 单 run 详情承接、后续全局观测、失败定位、Model Gateway runtime / quota / fallback   | 配置管理、业务报告阅读、原始 provider 响应                                                                                        |
| Governance            | PermissionPolicy；RiskRule；SQL Guard；Tool Permission；Audit Log；敏感字段规则提示                                                                                      | 权限、审计、SQL Guard、工具风险、敏感字段                                           | Tool 定义维护、模型路由配置、业务权限决策实现                                                                                     |
| Evaluation            | Dataset；EvaluationRun；Score；BadCase；Rubric / rule；Dataset item 详情                                                                                                 | 评估、Bad Case、反馈闭环、检索质量入口                                              | 模型调用执行、RAG 执行、Feedback 主列表                                                                                           |
| Memory                | Memory 列表；Memory 类型筛选；关联对象详情；Memory 使用痕迹入口；Analysis / Trace 跳转入口                                                                               | MemoryItem 查看、关联 run / decision、Memory 使用痕迹、上下文追问入口               | Feedback 主列表、Evaluation 执行、Memory 写入决策                                                                                 |
| Feedback              | Feedback 列表；反馈类型筛选；人工纠错详情；BadCase 跳转                                                                                                                  | 用户反馈、纠错、闭环入口                                                            | Memory 写入决策、Evaluation 执行                                                                                                  |
| Platform Operations   | 只读 Overview Page；平台运维总览；Job 状态；DataQualityCheck；Notification / Alert 摘要；Deployment / smoke / migration 状态；风险入口 / 详情入口                        | 长任务状态、失败恢复、数据质量、部署健康、Dashboard / Analysis 可信度支撑           | 执行真实 Job、重跑任务、执行数据质量检查、执行部署 / migration / smoke、手工改数据库、代码发布、全租户运维后台                    |
| Settings              | 设置分组；浏览器可见环境配置；默认策略入口；风险提示                                                                                                                     | 默认策略入口、只读配置摘要、Settings 聚合对象                                       | 密钥展示、权限决策、模型路由执行                                                                                                  |
| Workspace             | Workspace 总览；成员；角色；业务域；Header workspace selector                                                                                                            | workspace 上下文、成员管理、成员关系查看、角色查看、业务域管理                      | 审计主列表、权限业务决策                                                                                                          |

稳定槽位对应的技术承接边界固定如下：

- `Analysis` 的稳定槽位只承接 `Conversation / Run Trace / RunEvent detail / SourceEvidence / Report 入口`，不承接页面侧直接执行模型、工具、SQL 或 RAG。
- `Reports` 的稳定槽位只承接结构化 `Report` 资产和 `SourceEvidence` 追溯，不承接模型原始输出或不可追溯报告。
- `Metrics` 的稳定槽位只承接指标语义、血缘、阈值、证据和 Analysis 草稿态上下文，不承接真实指标计算或数据库查询。
- `Data & Knowledge` 的稳定槽位只承接数据资产、知识资产、索引状态、检索质量入口和 `SourceEvidence`，不承接前端侧向量检索或 raw Milvus 输出。
- `Models & Tools` 的稳定槽位只承接 `Model Gateway / Tool Registry / LangChain / LangGraph / LangSmith / Langfuse` 的配置入口和观测跳转，不承接真实执行和密钥展示。
- `Governance` 的稳定槽位只承接治理结果、权限态、风险态和审计入口，不承接前端侧 SQL Guard、Tool Permission 写入或敏感字段原文。
- `Observability` 的稳定槽位只承接标准化 `RunEvent / ToolCall / ModelCall` 和成本 / 延迟 / 错误视图，不承接 raw provider response、LangGraph raw state 或 Tool raw output。
- `Evaluation` 的稳定槽位只承接 `DeepEval / RAGAs / LangSmith Dataset` 方向的评估对象和结果，不承接 UI 自动改 Prompt / Tool / RAG / Model Gateway 配置。
- `Platform Operations` 的稳定槽位只承接当前 Workspace 的只读平台健康摘要，不承接真实 Job / deployment / migration / smoke 执行。
- `Settings` 的稳定槽位只承接默认策略跳转和只读配置摘要，不承接真实模型路由修改、权限发布或密钥保存。

## 9. 模块功能边界

以下模块功能边界不仅定义产品职责，也定义后续必须回到后端 / contracts / `packages/contracts` 审查的技术承接位。

| 模块                                   | 模块解决什么问题                                              | 承接哪些能力                                                                                                               | 不承接哪些能力                                                                                             | 未来增强应落在哪里                                                                      | 是否会影响 UI 结构                                               |
| -------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Workspace / IAM                        | tenant / org、workspace、成员关系、角色、权限和上下文边界     | Workspace 切换、成员、角色、业务域、workspace scoped permission context                                                    | 权限业务决策、审计主列表                                                                                   | Workspace 页面、Header workspace selector、Governance 跳转                              | 通常不影响；新增 IAM 主能力需审查                                |
| Data Source & Ingestion                | 数据源、数据表、字段、连接配置和 ingestion 上下文             | 数据源状态、字段字典、连接配置、schema sync 入口                                                                           | Job 主执行、数据库 migration、手工改库                                                                     | Data & Knowledge 主区、Platform Operations Job 跳转                                     | 不应影响导航；新增数据接入类型优先用既定 Tabs / Drawer           |
| Metric & Semantic Layer                | 当前 Workspace 的指标语义层、公式、阈值、血缘、证据和口径透明 | 二级指标列表、指标总览、当前指标详情、阈值 / 血缘 / 证据摘要、带上下文进入 Analysis 草稿态、只读指标语义                   | Dashboard 主聚合、指标计算实现、数据清洗、在当前阶段直接编辑指标或公式 / 阈值、直接创建 conversation / run | Metrics 页面、Dashboard 指标卡、Analysis 草稿态 context pack、Data & Knowledge 血缘跳转 | 通常不影响；复杂血缘需在 UI Composition 中标注                   |
| Knowledge & RAG                        | 知识文档、知识切片、入库、索引和 RAG 上下文                   | KnowledgeDocument、KnowledgeChunk、索引状态、检索质量入口                                                                  | RAG 策略主配置、RAG 执行实现                                                                               | Data & Knowledge、Models & Tools、Evaluation                                            | 不应新增导航；检索质量需跨 Evaluation                            |
| Agent Analysis                         | 用户问题、AnalysisTask、AnalysisRun 和追问主线                | 主动分析、异常追问、结果追问、run 状态、结果预览                                                                           | 正式报告阅读、深度 Trace 主页面、Evaluation 管理                                                           | Analysis 页面核心槽位                                                                   | 是核心结构，变更需审查                                           |
| Multi-Agent Runtime                    | Agent 运行过程、节点、事件和审批态                            | Run timeline、Human-in-the-loop、节点详情                                                                                  | LangGraph raw state 展示、前端执行 Runtime                                                                 | Analysis 轻量 timeline、Observability full trace                                        | 通常不影响导航；审批对象新增需审查                               |
| Tool Registry / MCP Adapter            | 工具定义、工具调用、MCP Adapter 和工具权限入口                | ToolDefinition、ToolCall、MCP 入口、Tool Permission 入口                                                                   | UI 直接执行 Tool、工具 handler 实现                                                                        | Models & Tools、Observability、Governance                                               | 不应新增一级模块；MCP 独立 schema 待确认                         |
| Memory Center                          | 长期记忆对象、关联对象和使用痕迹                              | MemoryItem、memoryType、关联 run / decision、Memory 使用痕迹                                                               | Feedback、Evaluation、Bad Case                                                                             | Memory 页面、Analysis / Trace 入口                                                      | 通常不影响；memoryReads / memoryWrites 待确认                    |
| Feedback Center                        | 用户反馈、人工纠错和 Bad Case 入口                            | Feedback、FeedbackType、correction、comment                                                                                | Evaluation 执行、Memory 写入决策                                                                           | Feedback 页面、Reports 反馈入口、Evaluation 跳转                                        | 不影响导航；新反馈类型需 contract 审查                           |
| Evaluation Center                      | 质量评估、数据集、评分、Bad Case 和回归输入                   | EvaluationDataset、EvaluationRun、EvaluationScore、BadCase、rubric / dataset item 风险                                     | 用户反馈主列表、模型调用执行                                                                               | Evaluation 页面                                                                         | Rubric / DatasetItem 若成主对象需审查                            |
| Model / Prompt / Tool / RAG Management | 模型、路由、Prompt、Tool、RAG 策略配置                        | ModelConfig、RoutingPolicy、PromptVersion、ToolDefinition、RagStrategy                                                     | Model Gateway 运行观测、密钥展示、Tool 执行                                                                | Models & Tools、Observability 跳转                                                      | 不应改变导航；复杂配置扩展在 Tabs 内                             |
| Governance & Security                  | 权限、SQL Guard、Tool Permission、风险和审计                  | PermissionPolicy、RiskRule、AuditLog、SQL Guard、Tool Permission、敏感字段提示                                             | Tool 定义维护、模型路由配置、权限业务决策实现                                                              | Governance、Settings、Observability                                                     | SQL Guard / Tool Permission 必须在 Governance 明确承接           |
| Observability & Monitoring             | 单 run Trace、成本、延迟、错误率和外部 trace 映射             | 当前由 Analysis Run Trace / Drawer 承接单 run 详情，后续扩展为全局 Observability                                           | 配置管理、业务报告阅读                                                                                     | Analysis Trace / Drawer、Observability（后置）                                          | 不影响导航；聚合 ViewModel 待确认                                |
| Report & Decision                      | 报告、证据、决策和行动建议                                    | Report、ReportSection、SourceEvidence、Decision、ActionSuggestion、Feedback 入口                                           | 模型原始输出、Feedback 主列表、Evaluation 管理                                                             | Reports 页面                                                                            | 通常不影响；新报告结构需 contract 审查                           |
| Business Dashboard                     | 经营总览、异常风险和平台质量摘要                              | MetricCard、异常摘要、平台质量摘要、Analysis 跳转                                                                          | 指标定义、真实分析执行、评估引擎                                                                           | Dashboard、Analysis 跳转、Platform Operations 跳转                                      | Dashboard 聚合 ViewModel 待确认，不应推翻指标 contracts          |
| Admin / Settings                       | 系统默认设置、可见环境配置和默认策略入口                      | Workspace 设置、默认 Permission / Routing / RAG 策略入口、只读配置摘要                                                     | 密钥展示、权限决策、模型路由执行                                                                           | Settings 页面、Governance / Models & Tools 跳转                                         | Settings 聚合对象待确认，通常不影响导航                          |
| Platform Operations                    | 当前 Workspace 的平台与数据链路健康判断                       | 只读总览、Job、Notification、DataQualityCheck、deployment / smoke / migration 摘要、风险入口、带上下文进入 Analysis 草稿态 | 全局 SRE 运维后台、全租户管理后台、业务执行逻辑、手工改库、代码部署执行                                    | Platform Operations 页面、Dashboard 平台质量摘要、Analysis 草稿态 context pack          | 不影响导航；如未来新增 global / admin 运维能力需单独建模并先审查 |

## 10. 功能增强规则

后续功能增强必须遵守以下规则：

1. 先判断功能属于哪条产品主线：主动分析、异常追问、结果追问、报告 / 反馈 / 评估闭环，或平台治理 / 运维支撑。
2. 再判断功能落入哪个固定一级模块，不允许自由新增一级模块。
3. 再判断功能成熟度目标是 L0、L1、L2、L3 还是 L4。
4. 再判断是否已有稳定页面槽位可以承接。
5. 如果可以落入既定页面槽位，后续 Issue 应优先复用既有页面结构。
6. 如果会改变 IA、页面职责、导航结构或核心区域，必须先更新 product-design / architecture / ui-design 对应事实源并重新审查。
7. 如果会新增或改变核心业务对象、字段、状态或 ID，必须先进入 contracts / packages/contracts 事实源审查。
8. 如果涉及数据库结构，必须先进入 database / migration 审查。
9. 如未来涉及外部设计稿或 Figma，必须在对应 Issue 或 PR 中单独记录链接、Page、Frame、设计阶段、版本或更新时间，且不得覆盖正式文档事实源。
10. Issue 只能作为执行边界，不能替代产品能力事实源。

## 11. 不做什么

本文档明确不做以下事情：

- 不写 UI 线稿。
- 不写高保真视觉规则。
- 不写数据库字段细节。
- 不写代码实现方案。
- 不新增第二套架构。
- 不改变 `docs/architecture.md` 的一级模块。
- 不改变 `docs/contracts.md` / `packages/contracts` 的字段语义。
- 不和 `docs/ui-design.md` 职责重叠。
- 不把 `docs/product-design.md` 写成页面说明书。
- 不把 Issue 作为产品设计源头。
- 不把 Figma 或任何外部设计稿作为可以推翻产品能力事实源的依据。
- 不允许 mock / real 双链路、old / new 双轨或兼容字段兜底成为产品能力设计的一部分。

## 12. Issue 引用规则

后续功能类 Issue 不能凭空设计功能，必须引用 `docs/product-design.md`。

每个功能 Issue 至少摘出：

```text
产品主线
相关能力
企业痛点
通用体验目标
功能成熟度等级
模块边界
是否影响 UI 结构
```

功能 Issue 还必须说明：

- 是否影响 `docs/architecture.md` 的一级模块、目录职责或依赖方向。
- 是否影响 `docs/contracts.md` 或 `packages/contracts` 的业务对象、字段语义、状态或 ID。
- 是否影响 `docs/ui-design.md` 的 UI Composition、导航规则、Inspector 规则或 shared primitive 规则。
- 是否改变既定页面稳定槽位。
- 如未来涉及外部设计稿或 Figma，是否需要在 Issue / PR 中记录文件、Page、Frame、版本或更新时间。
- 是否涉及业务代码、数据库、后端 runtime、Model Gateway、Tool Registry、Evaluation 或 RAG。

如果某个功能增强会改变 IA、页面职责、导航结构或核心区域，必须先回到 product-design / architecture / ui-design 事实源审查。

如果某个功能增强只是在既定槽位内从 L0 / L1 升级到 L2，且不改变 contracts、architecture 或 ui-design，可以在对应已审查 Issue 内执行。

如果某个功能增强要进入 L3 / L4，必须明确闭环证据、状态、权限、审计、测试要求和 PR 证据，不能用口头约束替代仓库事实源。
