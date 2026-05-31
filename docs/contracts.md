# Contracts

本文档是业务对象、字段语义、ID、状态枚举、生命周期和前后端契约的事实源。

## 1. 总原则

- Contracts-first。
- 核心对象必须进入 `packages/contracts`。
- 前后端核心字段保持一致。
- 一字段一语义，一语义一字段。
- 字段转换只允许出现在 DB repository、API schema、ViewModel mapper 三个边界。
- UI 不直接消费 raw API response。
- API response 必须符合 OpenAPI / JSON Schema。

## 2. 核心对象

核心对象包括：

```text
Workspace
User
Role
BusinessDomain
DataSource
DataTable
DataField
KnowledgeDocument
KnowledgeChunk
Metric
MetricFormula
MetricThreshold
MetricLineage
AnalysisTask
AnalysisRun
RunEvent
ToolCall
ModelCall
SourceEvidence
MemoryItem
Feedback
BadCase
EvaluationDataset
EvaluationRun
EvaluationScore
PromptVersion
ToolDefinition
RagStrategy
ModelConfig
RoutingPolicy
Report
ReportSection
Decision
ActionSuggestion
AuditLog
PermissionPolicy
RiskRule
Job
Notification
DataQualityCheck
```

## 3. ID 规则

统一使用 camelCase contract 字段：

```text
workspaceId
userId
roleId
businessDomainId
dataSourceId
tableId
fieldId
knowledgeDocumentId
knowledgeChunkId
metricId
analysisTaskId
runId
eventId
toolCallId
modelCallId
sourceEvidenceId
memoryItemId
feedbackId
badCaseId
evaluationRunId
reportId
decisionId
auditLogId
```

禁止混用：

```text
id / run_id / agentRunId / runtimeId / traceId
```

除非它们确实代表不同业务对象。

## 4. 状态枚举

### AnalysisRunStatus

```text
created
planning
running
waiting_approval
completed
failed
cancelled
```

### RunEventStatus

```text
pending
running
succeeded
failed
skipped
```

### EvaluationStatus

```text
queued
running
passed
failed
needs_review
```

### RiskLevel

```text
low
medium
high
critical
```

### FeedbackType

```text
useful
not_useful
incorrect
sql_error
source_insufficient
analysis_shallow
suggestion_unusable
format_preference
manual_correction
```

状态枚举必须来自 contracts，不允许手写自由字符串。

## 5. AnalysisRun 生命周期

```text
created
-> planning
-> running
-> waiting_approval 可选
-> completed / failed / cancelled
```

每次 AnalysisRun 必须记录：

```text
runId
workspaceId
userId
analysisTaskId
status
startedAt
completedAt
events
toolCalls
modelCalls
memoryReads
memoryWrites
sourceEvidence
evaluationResult
reportId
error
```

## 6. RunEvent

RunEvent 表示 Agent Runtime 产生的标准事件。

基础字段：

```text
eventId
runId
eventType
status
nodeName
agentName
toolName
inputSummary
outputSummary
errorType
errorMessage
startedAt
completedAt
```

RunEvent 不等于 UI timeline item。UI 必须通过 mapper 转成 ViewModel。

## 7. ToolCall

ToolCall 必须记录：

```text
toolCallId
runId
toolName
input
output
status
riskLevel
permission
errorType
startedAt
completedAt
```

Agent 不能绕过 Tool Registry 调工具。

## 8. ModelCall

ModelCall 必须记录：

```text
modelCallId
runId
provider
modelId
promptVersionId
inputTokens
outputTokens
cost
latencyMs
status
errorType
startedAt
completedAt
```

模型调用必须走 Model Gateway。

## 9. SourceEvidence

SourceEvidence 用于报告、结论和 RAG 引用追溯。

基础字段：

```text
sourceEvidenceId
runId
sourceType
sourceId
title
snippet
metadata
confidence
createdAt
```

sourceType 可包括：

```text
data_table
metric
knowledge_document
knowledge_chunk
sql_query
analysis_memory
decision_memory
```

## 10. Memory

MemoryItem 表示系统长期记住的信息。

memoryType：

```text
user
workspace
analysis
decision
```

Memory 不等于 Feedback，不等于 Evaluation。

## 11. Feedback

Feedback 表示用户对本次结果的反馈。

必须绑定：

```text
feedbackId
workspaceId
userId
runId
reportId
feedbackType
comment
correction
createdAt
```

## 12. Evaluation

EvaluationRun 表示一次评估任务。

必须支持：

```text
evaluationRunId
workspaceId
runId
datasetId
status
score
failureReason
createdAt
completedAt
```

Evaluation 可以来自 DeepEval、RAGAs、LangSmith Dataset 或自建 evaluator。

## 13. BadCase

BadCase 必须绑定：

```text
badCaseId
workspaceId
runId
feedbackId
evaluationRunId
failureType
failureReason
expectedBehavior
relatedRule
relatedContract
createdAt
```

## 14. Report & Decision

Report 记录 Agent 生成的正式分析报告。

Report 必须包含：

```text
reportId
runId
workspaceId
title
summary
sections
sourceEvidence
createdAt
```

Decision 用于记录建议是否被采纳以及后续效果。

## 15. ViewModel / Mapper 规则

- 从 Contract Model 到 Frontend ViewModel，核心业务字段名必须保持一致。
- ViewModel 只能增加展示派生字段，不允许重命名核心业务字段。
- 允许增加 `statusLabel`、`durationText`、`costText`、`riskText` 等展示字段。
- 不允许把 `runId` 改成 `id`。
- 不允许把 `status` 改成 `state` 或 `currentStatus`。
- 不允许把 `createdAt` 改成 `time`。

Mapper 只允许做：

- Contract -> ViewModel。
- 展示派生字段生成。
- 时间 / 金额 / 状态文案格式化。

Mapper 不允许做：

- 业务决策。
- 权限判断。
- 多字段兜底。
- `oldField || newField`。
- 修改核心字段语义。
- 清洗未标准化 raw 数据。

```ts
// 允许
type AnalysisRunViewModel = {
  runId: string;
  workspaceId: string;
  status: AnalysisRunStatus;
  statusLabel: string;
  durationText: string;
};

// 禁止
type AnalysisRunViewModel = {
  id: string;
  currentStatus: string;
  time: string;
};
```

## 16. packages/contracts

`packages/contracts` 必须包含：

```text
schemas/
openapi/
generated/
```

字段变更必须同步：

- `docs/contracts.md`
- JSON Schema
- OpenAPI
- generated types
- contract tests

## 17. Schema 分组规则

`packages/contracts/schemas` 必须按业务域分组，长期标准是和前端 `apps/web/src/features`、后端 `services/agent-runtime/app/domain` 保持一致。

禁止把核心 schema 长期平铺在 `packages/contracts/schemas/*.schema.json` 下。新增核心对象时，必须先确认所属业务域，再放入对应分组目录。

固定分组如下：

```text
packages/contracts/schemas/
├─ workspace/
├─ data-knowledge/
├─ metrics/
├─ analysis/
├─ memory/
├─ feedback/
├─ evaluation/
├─ model-tools/
├─ governance/
├─ reports/
└─ platform-operations/
```

当前核心对象分组：

- `workspace`：Workspace、User、Role、BusinessDomain。
- `data-knowledge`：DataSource、DataTable、DataField、KnowledgeDocument、KnowledgeChunk。
- `metrics`：Metric、MetricFormula、MetricThreshold、MetricLineage。
- `analysis`：AnalysisTask、AnalysisRun、RunEvent、ToolCall、ModelCall、SourceEvidence。
- `memory`：MemoryItem。
- `feedback`：Feedback。
- `evaluation`：EvaluationRun、EvaluationDataset、EvaluationScore、BadCase。
- `model-tools`：PromptVersion、ToolDefinition、RagStrategy、ModelConfig、RoutingPolicy。
- `governance`：AuditLog、PermissionPolicy、RiskRule。
- `reports`：Report、ReportSection、Decision、ActionSuggestion。
- `platform-operations`：Job、Notification、DataQualityCheck。
