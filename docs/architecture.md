# Architecture

本文档是项目架构事实源，说明产品结构、技术栈、目录职责、前后端边界和依赖方向。

## 1. 产品定位

Insight Agent Platform 是企业经营分析与决策 Agent 平台，面向企业经营分析场景，覆盖数据、知识、指标、Multi-Agent、Memory、Feedback、Evaluation、Governance、Observability、Model Gateway、报告决策和平台运维。

V1 可以是最小实现，但一级模块、目录、数据模型、API 边界和 contracts 位置必须从第一天建立完整。

## 2. 技术栈

### Frontend

- React
- TypeScript
- Vite
- Ant Design v5
- Ant Design X
- ProComponents 按需
- TanStack Query
- Zustand
- ECharts / Ant Design Charts

### Backend

- Python
- FastAPI
- LangGraph
- LangChain
- LlamaIndex

### AI / Agent

- LangGraph：Agent Runtime
- LangChain：Model / Tool 能力层
- LlamaIndex：Knowledge / RAG
- Milvus：主向量库
- DeepEval / RAGAs：Evaluation
- LangSmith / Langfuse：Observability
- 自研 Model Gateway
- 自研 Tool Registry
- 自研 Governance / SQL Guard / Policy

### Infrastructure

- Docker
- CloudBase Run
- MySQL 8.x
- Redis
- SQL migration
- Queue / Scheduler 预留

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

`packages/contracts/schemas` 必须按业务域分层，不能长期平铺。contracts 的业务域分组必须和前端 `apps/web/src/features`、后端 `services/agent-runtime/app/domain` 保持一致，使核心对象字段有单一事实源和清晰归属。

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

## 5. 前端架构

前端采用 feature-based architecture。

```text
apps/web/src/
├─ app/                   # 路由、全局 Provider、布局和主题入口
│  ├─ router/             # 路由定义
│  ├─ providers/          # 全局 Provider
│  ├─ layout/             # 应用级布局
│  └─ theme/              # 应用级主题入口
├─ pages/                 # 页面级入口，只做页面编排
│  ├─ workspace/          # 企业空间、成员、角色、业务域页面入口
│  ├─ data-knowledge/     # 数据源、字段字典、业务知识、知识切片页面入口
│  ├─ metrics/            # 指标定义、公式、口径、阈值、血缘页面入口
│  ├─ dashboard/          # 经营总览、核心指标、异常和平台质量概览
│  ├─ analysis/           # 分析页面入口，对应 agent-analysis 业务模块
│  ├─ reports/            # 分析报告、报告段落、决策建议页面入口
│  ├─ memory/             # 用户、工作区、分析、决策记忆页面入口
│  ├─ feedback/           # 用户反馈、人工纠错、采纳 / 未采纳页面入口
│  ├─ evaluation/         # Bad Case、评估数据集、评估运行和评分页面入口
│  ├─ model-tools/        # 模型、Prompt、Tool、RAG 策略和路由页面入口
│  ├─ governance/         # 权限、SQL Guard、Tool Permission、审计页面入口
│  ├─ observability/      # Run Trace、Tool Trace、Model Trace、成本、延迟、错误率页面入口
│  ├─ settings/           # 系统设置、环境配置、默认策略
│  └─ platform-operations/ # Job、通知、数据质量、运维任务页面入口
├─ features/              # 按业务域组织的前端功能模块
│  ├─ workspace/          # 企业空间、成员、角色、业务域
│  ├─ data-knowledge/     # 数据源、字段字典、业务知识、知识切片
│  ├─ metrics/            # 指标定义、公式、口径、阈值、血缘
│  ├─ dashboard/          # 经营总览、核心指标、异常和平台质量概览
│  ├─ agent-analysis/     # Agent 分析工作区、分析任务、运行结果
│  ├─ memory/             # 用户、工作区、分析、决策记忆
│  ├─ feedback/           # 用户反馈、人工纠错、采纳 / 未采纳
│  ├─ evaluation/         # Bad Case、评估数据集、评估运行和评分
│  ├─ model-tools/        # 模型、Prompt、Tool、RAG 策略和路由
│  ├─ governance/         # 权限、SQL Guard、Tool Permission、审计
│  ├─ observability/      # Run Trace、Tool Trace、Model Trace、成本、延迟、错误率
│  ├─ reports/            # 分析报告、报告段落、决策建议
│  ├─ settings/           # 系统设置、环境配置、默认策略
│  └─ platform-operations/ # Job、通知、数据质量、运维任务
├─ shared/                # 跨业务域复用的 API、UI、布局、图表、hooks、stores、types、utils
│  ├─ api/                # 跨域 API 基础能力
│  ├─ ui/                 # 跨域 UI 组件
│  ├─ layout/             # 跨域布局能力
│  ├─ charts/             # 跨域图表能力
│  ├─ theme/              # 设计 token 和主题能力
│  ├─ hooks/              # 跨域 hooks
│  ├─ stores/             # 跨域状态承载位
│  ├─ types/              # 跨域类型
│  ├─ utils/              # 跨域工具函数
│  └─ constants/          # 跨域常量
└─ main.tsx               # 前端入口
```

每个 feature 内部推荐包含：

```text
api/
models/
mappers/
components/
pages/
hooks/
```

### 前端数据链路

```text
API Response
-> Contract Type
-> Feature Mapper
-> ViewModel
-> UI Component
```

UI 不得直接消费 raw API response。

### 前端职责边界

- `pages` 只做页面编排，不做数据清洗。
- `features/*/api` 只做请求封装。
- `features/*/mappers` 只做 Contract -> ViewModel 转换和展示派生。
- `features/*/models` 定义 ViewModel 和展示模型。
- `features/*/components` 只展示 ViewModel，不解析 raw API response。
- `shared` 只放真正跨模块复用内容。
- 状态标签、风险等级、空态、错误态必须使用 shared UI。
- UI 必须使用 Ant Design 体系，不引入第二套 UI 组件库。

## 6. UI 语言

统一使用 Ant Design 体系。

- 基础组件：Ant Design v5
- AI 交互：Ant Design X
- 中后台增强：ProComponents 按需
- 图表：ECharts / Ant Design Charts

必须建立统一：

- Design Tokens
- StatusTag
- RiskBadge
- MetricCard
- TraceTimeline
- ToolCallCard
- ModelCallCard
- SourceEvidenceList
- MemoryUsagePanel
- EvaluationScoreCard
- FeedbackPanel
- ReportSection
- DecisionCard
- EmptyState
- ErrorState
- LoadingState

## 7. 后端架构

后端采用 Python / FastAPI + domain-oriented modular architecture。

```text
services/agent-runtime/app/
├─ api/                   # HTTP 路由、鉴权、参数校验、响应出口
├─ core/                  # 配置、日志、错误、安全、常量
├─ domain/                # 业务对象和业务规则
├─ application/           # 业务用例编排，不直接查库、不直接调模型
├─ runtime/               # LangGraph graph、state、nodes、edges、checkpoints
├─ agents/                # 各类 Agent 职责实现
├─ tools/                 # Tool Registry 和工具适配
├─ model_gateway/         # 模型调用唯一入口、provider、routing、cost、errors
├─ memory/                # Memory 读写策略
├─ evaluation/            # Evaluator、Dataset、Bad Case、Regression
├─ governance/            # Policy、SQL Guard、Tool Permission、Data Access、Audit
├─ observability/         # Trace、Metrics、Logging、Cost
├─ infrastructure/        # DB、Repository、Vector Store、Cache、Queue、Scheduler、Secrets 等外部依赖
├─ schemas/               # API DTO，不等同于 domain model
└─ main.py                # FastAPI 应用入口
```

`domain` 业务域按产品模块分组：

```text
services/agent-runtime/app/domain/
├─ workspace/             # 企业空间基础对象
├─ iam/                   # 用户、角色、权限、成员关系
├─ data_knowledge/        # 数据源、表、字段、知识文档
├─ metrics/               # 指标体系、公式、阈值、血缘
├─ analysis/              # 分析任务、运行、事件、工具调用、模型调用
├─ memory/                # 长期记忆对象
├─ feedback/              # 用户反馈对象
├─ evaluation/            # 评估、Bad Case、评分对象
├─ model_tools/           # 模型、Prompt、Tool、RAG 策略对象
├─ governance/            # 策略、风险、权限、审计对象
├─ observability/         # 运行轨迹、指标、成本对象
├─ reports/               # 报告、报告段落、决策建议
├─ dashboard/             # 经营总览聚合对象
└─ platform_operations/   # Job、通知、数据质量等运维对象
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

- `api`：请求、鉴权、参数校验、响应。
- `core`：配置、日志、错误、安全、常量。
- `domain`：业务对象和业务规则。
- `application`：业务用例编排。
- `runtime`：LangGraph graph、state、nodes、edges、checkpoints。
- `agents`：不同 Agent 职责实现。
- `tools`：Tool Registry、SQL Tool、Metric Tool、RAG Tool、Memory Tool、Report Tool、MCP Adapter。
- `model_gateway`：模型供应商、模型路由、成本、失败重试、fallback。
- `memory`：User / Workspace / Analysis / Decision Memory。
- `evaluation`：Evaluators、Datasets、Bad Cases、Regression。
- `governance`：Policy、SQL Guard、Tool Permission、Data Access、Audit。
- `observability`：Trace、Metrics、Logging、Cost。
- `infrastructure`：DB、Repository、Vector Store、Cache、Queue、Scheduler、Object Storage、Secrets、External Clients。
- `schemas`：API DTO。

### 后端职责边界

- `api` 不写业务逻辑。
- `application` 只编排业务用例。
- `domain` 承载业务对象和业务规则。
- `infrastructure/repositories` 是唯一数据库访问入口。
- `model_gateway` 是唯一模型调用入口。
- `tools` / `Tool Registry` 是唯一工具调用入口。
- `governance` 是权限、SQL Guard、Tool Permission、Audit 的统一入口。
- 后端 service 不允许直接访问数据库连接。
- 后端 service 不允许直接调用模型 provider。
- Agent 不允许直接查库、直接调模型、直接调用外部 API。

## 8. 依赖方向

后端依赖方向：

```text
api -> application -> domain
application -> runtime / tools / infrastructure
runtime -> agents / tools / memory / evaluation / governance / observability
domain 不依赖 api / infrastructure
```

前端依赖方向：

```text
page -> feature -> shared
shared 不依赖 feature
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

以下基础设施模块必须从第一天保留在 `services/agent-runtime/app/infrastructure/`：

- cache
- queue
- scheduler
- migrations
- seed
- secrets
- quota
- data_lifecycle
- backup
- restore
- notifications
- data_quality

以下跨域能力已有明确承载位置，不放入 `infrastructure`：

- audit：`services/agent-runtime/app/governance/audit.py`
- cost：`services/agent-runtime/app/observability/cost.py`

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
