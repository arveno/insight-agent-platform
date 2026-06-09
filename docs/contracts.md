# Contracts

本文档是业务对象、字段语义、ID、状态枚举、生命周期和前后端契约的事实源。

`docs/runtime-lifecycle.md` 负责解释 AnalysisRun 生命周期、运行状态流转、RunEvent 审计、ToolCall / ModelCall / SourceEvidence / Report / Feedback / Evaluation 的运行归属和实现约束。

`docs/contracts.md` 与 `packages/contracts` 仍然是字段、ID、对象名、状态枚举的唯一事实源。

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
Conversation
Message
MessageStream
ExecutionAttempt
ApprovalRequest
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

统一使用 camelCase contract 字段。

跨前后端共享链路、产品对象链路和 UI 可见业务链路必须使用统一 canonical business id。

同一个业务对象在 `contracts / API / backend / frontend service / mapper / ViewModel / UI / route / action / inspector` 中只能有一个 canonical id。

不得长期存在：

```text
id || xxxId
oldId || newId
metadata.xxxId || xxxId
```

已进入 `packages/contracts` 的 canonical ID 至少包括：

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
metricFormulaId
metricThresholdId
metricLineageId
analysisTaskId
runId
conversationId
messageId
turnId
messageStreamId
eventId
toolCallId
modelCallId
sourceEvidenceId
memoryItemId
feedbackId
badCaseId
datasetId
evaluationRunId
evaluationScoreId
reportId
reportSectionId
decisionId
actionSuggestionId
attemptId
approvalId
modelConfigId
routingPolicyId
promptVersionId
toolDefinitionId
ragStrategyId
jobId
notificationId
dataQualityCheckId
auditLogId
permissionPolicyId
riskRuleId
```

### Workspace / Tenant / IAM ID Boundary

已确定 canonical ID：

```text
workspaceId
userId
roleId
permissionPolicyId
```

候选 / 待审查 ID：

```text
tenantId
organizationId
workspaceMembershipId
```

边界规则：

- `tenantId / organizationId / workspaceMembershipId` 当前属于产品和架构审查范围；如进入 `API / mapper / ViewModel / Action / Inspector` 共享链路，必须先补齐 `docs/contracts.md` 与 `packages/contracts` schema。
- 所有核心业务对象默认必须归属 `workspaceId`。
- 如果未来某对象是全局资源，例如 `Model Provider`、`Tool Template`、`Prompt Template`，必须显式建模为 global resource，不得默认跨 `Workspace` 混用。
- 不得出现 `workspaceId || tenantId`、`organizationId || workspaceId`、`userId || memberId` 等兜底式混用。
- 在当前 schema 现状下，不得把 `tenantId`、`organizationId` 或 `workspaceMembershipId` 写入“已进入 packages/contracts 的 canonical ID 列表”。

当前已正式进入 contracts 的 Analysis conversation / message canonical ID：

```text
conversationId
messageId
turnId
messageStreamId
```

仍处于候选 / 待审查状态的产品对象 ID：

```text
findingId
```

这些对象如进入 `API / mapper / ViewModel / Action / Inspector` 共享链路，必须先补齐 `docs/contracts.md` 与 `packages/contracts`。

命名边界固定如下：

- `eventId`：当前 `RunEvent` 的 canonical id。
- `runEventId`：只有在未来引入独立于 `RunEvent` 的新对象并同步更新 `docs/contracts.md` 与 `packages/contracts` 后才允许使用。
- 在当前链路中，不允许把 `eventId` 和 `runEventId` 当作同义字段混用。

以下字段只允许作为本地表达，不得替代 canonical object id：

```text
key
targetId
pendingId
draftId
clientMessageId
localOnlyId
```

例如：

- `StaticSummaryItemViewModel.key` 可以作为 UI 列表 key。
- `StaticFeedbackEntranceViewModel.targetId / targetType` 可以作为 UI 本地表达。
- 以上字段都不得替代 `runId`、`reportId`、`sourceEvidenceId`、`metricId` 等 canonical object id。

当前已知风险：

- `docs/contracts.md` 的 canonical ID 列表需要持续补齐已进入 `packages/contracts` 的对象，例如 `modelConfigId`、`routingPolicyId`、`promptVersionId`、`toolDefinitionId`、`ragStrategyId`。
- `tenantId / organizationId / workspaceMembershipId` 当前仍是候选 ID，不能在共享链路中直接升格为 canonical ID。
- `product-experience.html` 已在原型中暴露出 `findingId`、`conversationId`、`messageId`、`turnId`、`messageStreamId`、`runId`、`reportId`、`sourceEvidenceId`、`metricId`、`modelConfigId` 等产品对象 ID。
- `conversationId / messageId / turnId / messageStreamId` 已正式进入 contracts；`findingId` 如后续进入共享链路，仍必须先完成 contracts 文档与 schema 审查。
- `product-experience.html` 中出现的 `findingId` 等候选对象 ID 不代表其已经成为正式 contract。
- 仍处于候选态的 ID 只有在进入正式链路前，才需要先更新 `docs/contracts.md` 与 `packages/contracts`。
- `eventId` 与 `runEventId` 的命名边界必须保持单义，避免在 Observability / Inspector / Action 链路中产生双轨。

禁止混用：

```text
id / run_id / agentRunId / runtimeId / traceId
```

除非它们确实代表不同业务对象。

## 4. 状态枚举

### AnalysisRunStatus

```text
created
validating
rejected
queued
running
waiting
cancelling
cancelled
failed
completed
expired
```

### AnalysisRunPhase

```text
intake
preflight
governance
context_binding
planning
approval
queueing
execution
tool_execution
evidence_binding
synthesis
verification
delivery
post_run
```

### AnalysisRunOutcome

```text
success
partial_success
policy_rejected
user_cancelled
timeout
system_failure
tool_failure
model_failure
verification_failure
```

### AnalysisRunWaitingFor

```text
approval
user_input
tool_callback
external_dependency
rate_limit
quota_reset
scheduled_resume
```

### ConversationStatus

```text
active
archived
closed
```

### MessageRole

```text
system
user
assistant
tool
```

### MessageStatus

```text
created
streaming
completed
failed
cancelled
```

### MessageStreamEventType

```text
stream.started
stream.delta
stream.completed
stream.failed
stream.cancelled
```

### MessageStreamStatus

```text
created
streaming
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
cancelled
```

### RunEventType

```text
run.created
run.validating
run.rejected
run.queued
run.started
run.waiting
run.cancel_requested
run.cancelling
run.cancelled
run.failed
run.completed
run.expired
validation.started
validation.passed
validation.rejected
policy.check_started
policy.decision_recorded
context.bound
plan.created
approval.requested
approval.granted
approval.denied
approval.expired
worker.lease_acquired
worker.heartbeat
worker.lease_released
execution_attempt.created
execution_attempt.lost
model_call.started
model_call.completed
model_call.failed
tool_call.requested
tool_call.policy_checked
tool_call.started
tool_call.completed
tool_call.failed
evidence.retrieved
evidence.bound
synthesis.started
verification.started
verification.passed
verification.failed
delivery.started
artifact.persisted
feedback.received
evaluation.started
evaluation.completed
error.recorded
```

### ExecutionAttemptStatus

```text
leased
running
lost
released
failed
completed
```

### ApprovalStatus

```text
requested
granted
denied
expired
cancelled
superseded
```

### DecisionStatus

```text
proposed
accepted
rejected
in_progress
completed
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

Conversation / Message / MessageStream 的边界固定如下：

- `Message` / `MessageStream` 不拥有 `AnalysisRun` 生命周期。
- `Message` 可以引用 `runId`，但不得用 `message status` 替代 `run status`。
- `stream.completed` 不能替代 `run.completed`。

## 5. AnalysisRun 生命周期

```text
created
-> validating
    -> rejected
    -> queued
        -> running
            -> waiting
                -> queued
                -> expired
                -> cancelling
            -> cancelling
                -> cancelled
            -> failed
            -> completed
        -> expired
```

每次 AnalysisRun 自身必须记录的直接字段：

```text
runId
workspaceId
userId
analysisTaskId
status
phase
outcome
waitingFor
createdAt
validatingAt
queuedAt
startedAt
waitingSince
timeoutAt
cancelRequestedAt
cancellingAt
completedAt
failedAt
cancelledAt
expiredAt
rejectedAt
terminalReason
failureCode
retryable
retryOfRunId
originalRunId
```

以下对象不得作为 AnalysisRun 内嵌字段；它们必须通过 runId 或父对象链路关联查询：

```text
RunEvent
ToolCall
ModelCall
SourceEvidence
Report
Decision
Feedback
EvaluationRun
BadCase
ExecutionAttempt
ApprovalRequest
ReportSection -> Report.runId
EvaluationScore -> EvaluationRun.runId
ActionSuggestion -> Decision.runId / Decision.reportId
```

`MemoryItem` 和 `AuditLog` 当前不是 direct run-bound。

如需表达某次 run 产生的 memory 写入或 run 审计记录，必须先补 `MemoryWrite`、`RunAuditRecord` 等正式 contract。

生命周期规则固定如下：

- `waiting_approval` 已被正式模型替换为 `status=waiting + waitingFor=approval`。
- 终态固定为 `rejected / cancelled / failed / completed / expired`，终态不可复活。
- 用户 retry 必须创建新的 `AnalysisRun`，并通过 `retryOfRunId / originalRunId` 记录链路。
- 系统恢复必须在同一个 `AnalysisRun` 下创建新的 `ExecutionAttempt`，不得复活旧 terminal status。

## 6. RunEvent

RunEvent 表示 Agent Runtime 产生的标准事件。

基础字段：

```text
eventId
runId
eventType
status
phase
sequence
actor
occurredAt
summary
parentEventId
refType
refId
nodeName
agentName
toolName
errorCode
errorMessage
startedAt
completedAt
```

RunEvent 不等于 UI timeline item。UI 必须通过 mapper 转成 ViewModel。

## 7. ExecutionAttempt

ExecutionAttempt 表示同一个 AnalysisRun 在 worker lease、恢复和重试过程中的执行尝试。

必须绑定：

```text
attemptId
runId
attemptNumber
workerId
leaseId
status
leaseAcquiredAt
leaseExpiresAt
heartbeatAt
releasedAt
failureCode
failureMessage
```

## 8. ApprovalRequest

ApprovalRequest 表示运行中高风险计划、动作或工具调用的审批请求。

必须绑定：

```text
approvalId
runId
planId
planVersion
toolCallId
requestedAction
riskLevel
status
requestedAt
expiresAt
decidedAt
decidedBy
decisionReason
```

## 9. ToolCall

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

## 10. ModelCall

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

## 11. SourceEvidence

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

## 12. Memory

MemoryItem 表示系统长期记住的信息。

memoryType：

```text
user
workspace
analysis
decision
```

Memory 不等于 Feedback，不等于 Evaluation。

## 13. Feedback

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

## 14. Evaluation

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

## 15. BadCase

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

## 16. Report & Decision

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

## 17. ViewModel / Mapper 规则

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

## 18. packages/contracts

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

## 19. Schema 分组规则

`packages/contracts/schemas` 必须按业务域分组，长期标准是和前端 `apps/web/src/modules`、后端 `services/agent-runtime/src/modules` 保持一致。
这里的 contracts domain 目录可以保留 kebab-case；后端 Python runtime package 目录必须使用 snake_case。

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
- `analysis`：AnalysisTask、AnalysisRun、Conversation、Message、MessageStream、RunEvent、ToolCall、ModelCall、SourceEvidence、ExecutionAttempt、ApprovalRequest。
- `memory`：MemoryItem。
- `feedback`：Feedback。
- `evaluation`：EvaluationRun、EvaluationDataset、EvaluationScore、BadCase。
- `model-tools`：PromptVersion、ToolDefinition、RagStrategy、ModelConfig、RoutingPolicy。
- `governance`：AuditLog、PermissionPolicy、RiskRule。
- `reports`：Report、ReportSection、Decision、ActionSuggestion。
- `platform-operations`：Job、Notification、DataQualityCheck。
