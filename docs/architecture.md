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
- PostgreSQL 或 CloudBase MySQL
- Redis
- Alembic
- Queue / Scheduler 预留

## 3. Monorepo 结构

```text
insight-agent-platform/
├─ apps/
│  └─ web/
├─ services/
│  └─ agent-runtime/
├─ packages/
│  └─ contracts/
├─ docs/
├─ deploy/
├─ scripts/
├─ .github/
├─ AGENTS.md
├─ README.md
├─ pnpm-workspace.yaml
└─ package.json
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
├─ app/
│  ├─ router/
│  ├─ providers/
│  ├─ layout/
│  └─ theme/
├─ pages/
│  ├─ workspace/
│  ├─ data-knowledge/
│  ├─ metrics/
│  ├─ dashboard/
│  ├─ analysis/
│  ├─ reports/
│  ├─ memory/
│  ├─ feedback/
│  ├─ evaluation/
│  ├─ model-tools/
│  ├─ governance/
│  ├─ observability/
│  ├─ settings/
│  └─ platform-operations/
├─ features/
│  ├─ workspace/
│  ├─ data-knowledge/
│  ├─ metrics/
│  ├─ dashboard/
│  ├─ agent-analysis/
│  ├─ memory/
│  ├─ feedback/
│  ├─ evaluation/
│  ├─ model-tools/
│  ├─ governance/
│  ├─ observability/
│  ├─ reports/
│  ├─ settings/
│  └─ platform-operations/
├─ shared/
│  ├─ api/
│  ├─ ui/
│  ├─ layout/
│  ├─ charts/
│  ├─ theme/
│  ├─ hooks/
│  ├─ stores/
│  ├─ types/
│  ├─ utils/
│  └─ constants/
└─ main.tsx
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
├─ api/
├─ core/
├─ domain/
├─ application/
├─ runtime/
├─ agents/
├─ tools/
├─ model_gateway/
├─ memory/
├─ evaluation/
├─ governance/
├─ observability/
├─ infrastructure/
├─ schemas/
└─ main.py
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

- smoke
- load
- failure-simulation

## 11. Mock 策略

产品没有 Mock 模式。

允许 seed data、fixtures、fake providers、local dev adapters。

禁止 mock / real 双链路。
