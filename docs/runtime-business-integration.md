# Runtime Business Integration Guide

本文档是后续真实 AnalysisRun / AgentRun 业务接入手册。

它不是新的事实源。

正式事实源仍然是：

```text
docs/contracts.md
packages/contracts/schemas/**
packages/contracts/openapi/agent-runtime.openapi.yaml
docs/runtime-lifecycle.md
```

---

## 1. 目标

本手册回答后续实现者最常见的接入问题：

```text
API 怎么接
字段怎么映射
Conversation / Message / AnalysisRun 怎么串
MessageStream 怎么传
前端从哪里开始换成真实数据
后端真实实现应该落在哪个 owner module
```

---

## 2. 当前已冻结的骨架

当前仓库已经固定：

```text
Conversation = 交互主线
AnalysisRun = 运行主线
Message / MessageStream = 展示与流式传输主线
RunEvent = 审计事实主线
```

后端 owner 已冻结：

```text
services/agent-runtime/src/modules/analysis_runs
  = AnalysisRun / runId / Runtime Lifecycle 的唯一 owner

services/agent-runtime/src/modules/conversations/analysis_service.py
  = conversation-level orchestration / facade
  不拥有 AnalysisRun 生命周期
```

当前 route skeleton 已固定：

```text
services/agent-runtime/src/app/routes/conversations.py
services/agent-runtime/src/app/routes/analysis_runs.py
```

当前前端接线骨架已固定：

```text
Contract -> mapper -> ViewModel -> UI

apps/web/src/modules/analysis/mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel.ts
  -> AnalysisWorkspaceViewModel
```

---

## 3. 黄金链路

建议后续真实业务按下面顺序接入：

1. 创建 Conversation
2. 创建 AnalysisRun
3. 拉取 AnalysisRun
4. 拉取 RunEvent
5. 拉取 Messages
6. 订阅 MessageStream
7. 拉取 SourceEvidence / Report / Decision 相关对象
8. 前端通过 mapper 落到 AnalysisWorkspaceViewModel

对应当前最小 contract surface：

```text
POST /conversations
POST /analysis-runs
GET /analysis-runs/{runId}
GET /analysis-runs/{runId}/events
GET /conversations/{conversationId}/messages
GET /conversations/{conversationId}/messages/{messageId}/stream
GET /analysis-runs/{runId}/source-evidence
GET /analysis-runs/{runId}/reports
GET /analysis-runs/{runId}/conversation
```

说明：

```text
当前最小 route skeleton 没有单独 formalize POST /messages。
建议真实实现时把“用户输入写入 user Message”作为 POST /analysis-runs 的 server-side side effect，
避免在业务接入阶段再发明第二条写消息主线。
```

---

## 4. 后端如何落地

### 4.1 Conversation

`POST /conversations` 负责：

```text
创建 conversationId
绑定 workspaceId / userId / analysisTaskId
初始化 title / status / timestamps
```

不负责：

```text
启动真实 runtime
执行工具
执行模型调用
写入 fake success message
```

### 4.2 AnalysisRun

`POST /analysis-runs` 负责：

```text
创建 runId
绑定 conversationId
写入 AnalysisRun(created)
触发真实 runtime dispatch（后续实现阶段）
按需要写入本轮 user Message
```

### 4.3 Run-bound reads

以下查询都应从 `modules/analysis_runs` 落地：

```text
GET /analysis-runs/{runId}
GET /analysis-runs/{runId}/events
GET /analysis-runs/{runId}/tool-calls
GET /analysis-runs/{runId}/model-calls
GET /analysis-runs/{runId}/source-evidence
GET /analysis-runs/{runId}/reports
GET /analysis-runs/{runId}/execution-attempts
GET /analysis-runs/{runId}/approvals
GET /analysis-runs/{runId}/cancel
GET /analysis-runs/{runId}/retry
POST /analysis-runs/{runId}/approvals/{approvalId}/decision
```

`GET /analysis-runs/{runId}/conversation` 负责 run -> conversation join surface，但不改变 ownership：

```text
join surface 在 route / query 层表达
run lifecycle owner 仍然是 modules/analysis_runs
```

---

## 5. MessageStream 策略

已冻结：

```text
SSE 是 live MessageStream 的唯一实时传输方式。
HTTP JSON 只用于 replay / history / snapshot。
MessageStream 是流式输出 contract record。
RunEvent 是审计事件，不承载 token delta。
stream.completed 不等于 run.completed。
```

建议真实实现：

```text
Accept: text/event-stream
  -> live incremental assistant output

Accept: application/json
  -> read stored MessageStream records for replay/history
```

不要做：

```text
用 RunEvent 推 token delta
把 stream.completed 当成 run terminal
再发明 websocket / polling 作为第二实时主线
```

---

## 6. 前端如何接入真实数据

后续真实前端接入建议顺序：

1. 保持 `AnalysisWorkspace`、controller、inspector、message list 结构不变
2. 用真实 API 数据替换当前 contract fixture
3. 继续走 `mapAnalysisRuntimeContractsToWorkspaceViewModel`
4. 只在 mapper 边界做字段整理
5. UI 只消费 ViewModel，不直接消费 raw API response

当前 mapper 输入已经固定：

```text
Conversation
Message[]
AnalysisRun
RunEvent[]
ToolCall[]
ModelCall[]
SourceEvidence[]
Report[]
MessageStream[]
```

这意味着真实 API 接入时，最小替换面是：

```text
apps/web/src/api/**
apps/web/src/modules/analysis/mappers/**
```

而不是：

```text
AppShell
AnalysisWorkspace 结构
Inspector 结构
sessionId / clientMessageId 旧命名
```

---

## 7. 当前还没实现什么

本轮没有实现真实业务逻辑：

```text
真实 runtime lifecycle service
真实 worker / queue
真实 Model Gateway 调用
真实 Tool Registry 调用
真实 SSE 推流
真实 DB migration / persistence
真实前端 API 请求
```

当前 route stub 返回 `501 NOT_IMPLEMENTED` 是刻意设计：

```text
用于冻结路径、请求体、错误格式和 owner 边界
不是 fake success
不是 mock / real 双链路
```

---

## 8. 推荐实施顺序

建议后续业务实现按下面顺序推进：

1. 先实现 `POST /conversations` persistence
2. 再实现 `POST /analysis-runs` + run dispatch
3. 再实现 `GET /analysis-runs/{runId}` 与 `GET /analysis-runs/{runId}/events`
4. 再实现 `GET /conversations/{conversationId}/messages`
5. 再实现 `GET /conversations/{conversationId}/messages/{messageId}/stream` 的 SSE live path
6. 再补 SourceEvidence / Report / Approval / ExecutionAttempt 查询
7. 最后把前端 fixture 数据源替换成真实 API
