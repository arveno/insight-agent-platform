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
WorkspaceMembership
AuthSession
CurrentWorkspaceContext
LoginRequest
LoginResponse
MeResponse
WorkspaceListItem
WorkspaceListResponse
SelectWorkspaceRequest
SelectWorkspaceResponse
LogoutResponse
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
membershipId
authSessionId
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
membershipId
authSessionId
permissionPolicyId
```

候选 / 待审查 ID：

```text
tenantId
organizationId
```

边界规则：

- `tenantId / organizationId` 当前属于产品和架构审查范围；如进入 `API / mapper / ViewModel / Action / Inspector` 共享链路，必须先补齐 `docs/contracts.md` 与 `packages/contracts` schema。
- 所有核心业务对象默认必须归属 `workspaceId`。
- 如果未来某对象是全局资源，例如 `Model Provider`、`Tool Template`、`Prompt Template`，必须显式建模为 global resource，不得默认跨 `Workspace` 混用。
- 不得出现 `workspaceId || tenantId`、`organizationId || workspaceId`、`userId || memberId` 等兜底式混用。
- 在当前 schema 现状下，不得把 `tenantId` 或 `organizationId` 写入“已进入 packages/contracts 的 canonical ID 列表”。

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

### SourceRef / Inspector Tree Boundary

`SourceRef` 是 canonical business source identity。

`InspectorTreeNode` 是 subject-scoped Inspector tree 内的一次节点出现。

`owner` 表示当前节点出现归属给谁。

`role` 表示该节点为什么出现在当前树里。

`Context` 只是 Analysis Inspector 的一个 root，不等于整个 Inspector。

Frontend 可以组合 Inspector UI routes、tree path keys 和本地选择态，但不得发明新的 business ID。

如果 UI 暴露来源 ref，它的业务身份必须回到现有 contract ID：

```text
report ref -> reportId
metric ref -> metricId
evidence ref -> sourceEvidenceId
run ref -> runId
data table ref -> tableId
knowledge document ref -> knowledgeDocumentId
tool call ref -> toolCallId
model call ref -> modelCallId
job ref -> jobId
```

补充说明：

- `DataTable` 当前 machine-checkable contract 的 canonical ID 是 `tableId`；不得在前端或文档共享链路里自造 `dataTableId` 别名。
- 只有在 `packages/contracts` 正式变更并同步更新本文件后，才允许把上述映射切换到新的 canonical 字段名。

以下值只允许作为内部 UI key，本身不得展示给用户，也不得作为业务跳转或事实追溯依据：

```text
source-1
context-item-001
fake-report-id
origin-ref-x
```

建议结构方向固定如下：

```ts
type InspectorOwnerRef =
  | { type: "conversation"; conversationId: string }
  | { type: "analysisTask"; analysisTaskId: string }
  | { type: "analysisRun"; runId: string }
  | { type: "report"; reportId: string }
  | { type: "sourceEvidence"; sourceEvidenceId: string };

type InspectorNodeRole =
  | "inputContext"
  | "runtimeReferencedSource"
  | "runOutput"
  | "reportSection"
  | "evidenceItem"
  | "traceEvent"
  | "toolCall"
  | "modelCall"
  | "decision"
  | "directory";

type InspectorTreeNode = {
  nodeId: string;
  kind: string;
  role: InspectorNodeRole;
  owner: InspectorOwnerRef;

  title: string;
  summary?: string;
  description?: string;
  value?: string;
  chips?: string[];

  timeRange?: {
    key: string;
    label: string;
  };

  capturedAt?: string;
  asOfAt?: string;

  sourceRef?: SourceRef;
  children?: InspectorTreeNode[];

  disabledReason?: string;
};
```

同一 `sourceRef` 的出现规则固定如下：

- 同一个 `sourceRef` 可以出现在不同 tree 或不同 root 中。
- 同一个 `sourceRef` 不代表相同 `owner`。
- 同一个 `sourceRef` 不代表相同 `role`。
- 同一个 `sourceRef` 不得做全局去重。
- 后续 detail UI 可以展示 same-source relationship，但不能改变 tree ownership。

示例：

```text
AnalysisTask.contextPack.root:
- reportId=report-weekly-business
- owner=analysisTaskId
- role=inputContext

AnalysisRun.runtimeReferencedSources:
- reportId=report-weekly-business
- owner=runId
- role=runtimeReferencedSource

AnalysisRun.reports:
- reportId=report-weekly-business
- owner=runId
- role=runOutput
```

当前已知风险：

- `docs/contracts.md` 的 canonical ID 列表需要持续补齐已进入 `packages/contracts` 的对象，例如 `modelConfigId`、`routingPolicyId`、`promptVersionId`、`toolDefinitionId`、`ragStrategyId`。
- `tenantId / organizationId` 当前仍是候选 ID，不能在共享链路中直接升格为 canonical ID。
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
worker.failed
worker.lost
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

- `Conversation` 是 user-facing chat thread / interaction container。
- `AnalysisTask` 是同一 `Conversation` 内一次正式提交的分析请求，也是 typed input snapshot。
- `AnalysisRun` 是一个 `AnalysisTask` 的 execution attempt。
- `Message` / `MessageStream` 不拥有 `AnalysisRun` 生命周期。
- `Message` 在同一 `Conversation` 内表达 turn record；在 `#201` phase 中，每次 composer submit 产生的持久化消息必须绑定 `analysisTaskId`。
- `Message` 可以引用 `runId`，但不得用 `message status` 替代 `run status`。
- `stream.completed` 不能替代 `run.completed`。

## 5. AnalysisTask 输入任务

`AnalysisTask` 是用户在 Analysis 草稿态真正发送问题后形成的正式输入任务对象。

发送前可以存在前端草稿态 context candidate；非空 submit 后必须固化为 tree-shaped `AnalysisTaskContextPack`。旧 flat `sourceType / sourceId / sourceTitle / summary / chips / suggestedPrompt` shape 不再是正式方向，也不得保留兼容路径。

如草稿态 tree node 的 owner 已表达 `analysisTask` 语义但尚未拿到 canonical `analysisTaskId`，submit transaction 必须在持久化 `AnalysisTask.contextPack` 时补齐正式 `analysisTaskId`。

固定规则：

```text
Open in Analysis with context
-> 进入草稿态
-> 只绑定 context pack
-> 不立即创建 conversationId
-> 不立即创建 runId
-> user sends question
-> create or reuse Conversation
-> create AnalysisTask with typed contextPack snapshot
-> create initial AnalysisRun
-> create User Message bound to conversationId / analysisTaskId / runId
-> update Conversation.currentRunId
```

固定关系：

```text
Conversation 1 -> N AnalysisTask
AnalysisTask 1 -> N AnalysisRun
retry -> new AnalysisRun under same AnalysisTask
follow-up -> new AnalysisTask under same Conversation
```

当前 `AnalysisTask` 的正式最小字段为：

```text
analysisTaskId
conversationId
workspaceId
userId
businessDomainId
question
contextPack
createdAt
updatedAt
```

`contextPack` 字段必须显式出现：blank draft submit 时传 `null`，context draft submit 时传 typed object，不得退回无类型 metadata 或省略字段。

`AnalysisTask.contextPack` 是用户发送时形成的 typed input snapshot，不能被后续 conversation 变化反向覆盖。

同一 submit transaction 内分配 `Conversation / AnalysisTask / AnalysisRun / User Message` canonical IDs；最终持久化的 user message 必须绑定 `conversationId / analysisTaskId / runId`，`Conversation.currentRunId` 必须更新为 initial `runId`。

如后续追问改变上下文，应形成新的 `AnalysisTask / AnalysisRun` 边界。

`AnalysisRun` 不拥有 context，只引用 / 消费 `AnalysisTask` 输入。

`Conversation` 不拥有 singular `analysisTaskId` 字段；会话中的当前问题与 follow-up 边界必须通过 `AnalysisTask / AnalysisRun / Message` 链路表达。

`Message` 的正式边界固定如下：

```text
conversationId
analysisTaskId
turnId
runId
```

其中：

- `analysisTaskId`：消息所属正式分析请求；当前 `#201` phase 的持久化 submit turn message 必须绑定正式 `analysisTaskId`。
- `runId`：消息关联的执行实例；当前 `#201` phase 的持久化 submit turn user message 必须绑定 initial `runId`。schema-level nullable 只保留给后续 message-only turn 扩展，不代表当前 submit flow 可以省略 `runId`。
- `message-only chat turns`：当前不在 `#201` 范围内实现；如后续扩展，允许 `analysisTaskId = null`，但必须先补齐 contracts 与产品规则。

当前 `AnalysisTask.contextPack` 的正式形态固定如下：

```text
blank draft submit -> null
context draft submit -> AnalysisTaskContextPack
```

`AnalysisTask.contextPack` 的归属固定如下：

- `AnalysisTask.contextPack` 属于 `AnalysisTask`。
- `Conversation` 不拥有 `contextPack`。
- `AnalysisRun` 不拥有 `contextPack`。
- `AnalysisRun` 只消费 `AnalysisTask.contextPack`。

非空 `AnalysisTask.contextPack` 的方向固定如下：

```ts
type AnalysisTaskContextPack = {
  version: 1;
  suggestedPrompt: string;
  traceability: "none" | "summary_only" | "partial_refs" | "direct_refs";
  capturedAt: string;
  root: InspectorTreeNode;
};
```

补充规则：

- 这替代旧的 flat `sourceType / sourceId / sourceTitle / summary / chips / suggestedPrompt` 方向。
- 不保留旧 flat shape 的兼容路径。
- `businessDomainId` 仍引用既有 `BusinessDomain` contract 的 canonical id。
- `contextPack = null` 表示用户从 blank draft 直接发送，没有一次性来源上下文。
- `question` 是用户正式发送的问题文本，不得被 `suggestedPrompt`、tree summary 或任意草稿态 context 替代。

`contextPack` 只允许存储以下轻量目录快照：

```text
directory structure
node title
lightweight summary
value / chips
timeRange
capturedAt / asOfAt
canonical sourceRef
children
disabledReason
traceability
suggestedPrompt
```

`contextPack` 不得存储以下完整载荷：

```text
full Report content
full Report sections
full Evidence payload
full Metric definition
full DataTable data
full KnowledgeDocument content
full RunEvent payload
full ToolCall raw output
full ModelCall raw output
```

生命周期与不可变规则固定如下：

- `AnalysisTask.contextPack` 是 immutable input snapshot。
- `AnalysisRun` 是 execution instance。
- `RunEvent` 是 append-only。
- completed / published `Report` 不得原地更新。
- `SourceEvidence` 不得原地更新。
- `Metric` definition 可以做版本化。
- `Metric` observation / snapshot 必须绑定 time range，不得被 latest value 原地覆盖。
- `KnowledgeDocument` / `DataTable` schema 如有变化，应通过 version / asOf 表达。
- raw data 不进入 `contextPack`。

为支持刷新后或 conversation re-entry 后恢复 Inspector，read surface 最低必须提供：

```text
conversationId
currentRunId or selected message runId
analysisTaskId
AnalysisTask.contextPack.root
run outputs for selected runId
```

该 read surface 未来可以由 aggregate read API 或 task/run 分离读取实现，但读取语义不能缺失。

禁止：

```text
metadata.contextPack
inputJson
randomContextJson
oldContextPack || newContextPack
question || suggestedPrompt
businessDomainId || metadata.businessDomainId
```

## 6. AnalysisRun 生命周期

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
