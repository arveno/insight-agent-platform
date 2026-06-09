# Runtime Lifecycle

## 0. 文档定位

本文档定义 Insight Agent Platform 的运行时生命周期规则。

本文档不重新定义 contract 字段、ID、对象名或状态枚举。

正式事实源为：

```text
docs/contracts.md
packages/contracts/schemas/**
packages/contracts/openapi/**
packages/contracts/generated/**
```

本文档只负责解释：

```text
AnalysisRun 如何作为运行主线
运行时对象如何围绕 runId 归属
运行状态如何流转
运行事件如何审计
前端如何展示运行过程
后端如何实现运行编排
当前 contracts 与目标生命周期之间还有哪些 Contract Gap
```

阅读边界固定如下：

```text
当前正式事实
运行时规则
目标模型 / Contract Gap
```

如果本文提到的对象、字段、状态或枚举尚未进入 contracts，则只能作为 `目标模型 / Contract Gap`，不得进入 API / DB / ViewModel / OpenAPI / generated / UI 实现链路。

---

## 1. 命名边界

| 类型 | 当前正式事实 | 目标模型 | Contract Gap |
| --- | --- | --- | --- |
| 运行主对象 | 当前正式对象名是 `AnalysisRun` | 产品语义上可称为 Agent Run，表示一次 Agent 分析运行 | 不得在实现中另起 `AgentRun` 对象名，除非 contracts 正式改名 |
| 主归属 ID | 当前正式 ID 是 `runId` | 所有运行过程、证据、产物、反馈、评估都围绕 `runId` 归属 | 不得引入 `agentRunId / runtimeId / traceId` 替代 `runId` |
| 运行状态 | 当前正式枚举是 `AnalysisRunStatus` | 后续可补强为企业级状态机 | 不得私自新增 `AgentRunStatus` 双轨 |
| 运行事件 ID | 当前正式 ID 是 `eventId` | `RunEvent` 用于运行审计事件 | 不得把 `eventId` 和 `runEventId` 当同义字段混用 |

硬规则：

```text
当前实现必须使用 AnalysisRun / runId / AnalysisRunStatus。
Agent Run 只是运行时语义名，不是当前 contract 对象名。
```

---

## 2. 当前正式事实

### 2.1 当前正式核心对象

当前 contracts 已经确认的运行相关对象包括：

```text
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

### 2.2 当前正式 canonical ID

当前 contracts 已确认、且可能被运行链路直接使用或间接引用的 canonical ID 包括：

```text
analysisTaskId
runId
eventId
toolCallId
modelCallId
sourceEvidenceId
memoryItemId
feedbackId
badCaseId
datasetId
evaluationRunId
reportId
reportSectionId
decisionId
actionSuggestionId
auditLogId
permissionPolicyId
riskRuleId
```

### 2.3 当前正式 AnalysisRunStatus

当前正式 `AnalysisRunStatus` 为：

```text
created
planning
running
waiting_approval
completed
failed
cancelled
```

### 2.4 当前正式 RunEventStatus

当前正式 `RunEventStatus` 为：

```text
pending
running
succeeded
failed
skipped
```

### 2.5 当前已确认的 runId 归属关系

当前 contracts 已经确认以下对象必须绑定 `runId`：

```text
RunEvent
ToolCall
ModelCall
SourceEvidence
Feedback
EvaluationRun
Report
```

---

## 3. 当前 contracts 不足

当前 contracts 已有运行主对象和部分运行过程对象，但还不足以承载完整企业级 Agent Runtime。

### 3.1 状态不足

当前 `AnalysisRunStatus` 无法表达：

```text
入场校验
治理拒绝
排队等待
普通 waiting
取消中
等待超时
部分成功
交付前校验
系统恢复
worker lease
```

### 3.2 字段不足

当前 `AnalysisRun` 目标上可能需要，但 contracts 尚未正式确认的字段包括：

```text
phase
outcome
waitingFor
timeoutAt
retryOfRunId
originalRunId
rootTraceId
contextSnapshotId
permissionSnapshotId
toolScopeSnapshotId
retrievalScopeId
```

这些字段在进入实现前必须先完成 contracts 补强。

### 3.3 对象不足

当前 contracts 尚未正式确认，但目标生命周期可能需要的对象包括：

```text
ExecutionAttempt
ApprovalRequest
Message
MessageStream
PostRunJob
VerificationResult
ContextSnapshot
PermissionSnapshot
ToolScopeSnapshot
RetrievalScope
CostRecord
ErrorRecord
```

这些对象只能作为 `Contract Gap`，不能被实现层私自创建。

### 3.4 Schema 强约束不足

当前部分 schema 仍偏宽松，例如数组项、状态字段、metadata、输入输出结构等还没有完整强约束。

目标上需要逐步补强：

```text
required 字段
enum
array item schema
object schema
additionalProperties 边界
引用关系
状态机字段
错误字段
时间字段
```

### 3.5 OpenAPI / generated 不足

当前 OpenAPI 和 generated types 尚不足以承接完整运行时主链路。

目标上需要补强：

```text
最小 runtime API
TypeScript generated types
Python generated types
contract check
schema / OpenAPI / generated drift check
```

---

## 4. 运行主线

`AnalysisRun / runId` 是平台运行时主线。

但“围绕 runId 归属”必须区分三类：当前直接绑定、当前经父对象间接归属、目标模型 / Contract Gap。

### 4.1 当前直接 run-bound 对象

以下对象当前已经在 contracts 中直接绑定 `runId`，可以作为运行主线的一阶对象：

```text
AnalysisRun
RunEvent
ToolCall
ModelCall
SourceEvidence
Feedback
EvaluationRun
Report
```

规则：

```text
这些对象可以直接通过 runId 查询、聚合、展示和审计。
实现层不得再为它们创建其他运行归属 ID。
```

### 4.2 当前经父对象间接归属的对象

以下对象当前不应私自补 `runId`，只能通过父对象链路间接归属到运行：

```text
ReportSection
  -> reportId
  -> Report.runId

EvaluationScore
  -> evaluationRunId
  -> EvaluationRun.runId

ActionSuggestion
  -> decisionId
  -> Decision.runId / Decision.reportId
```

规则：

```text
间接归属对象不得为了查询方便私自添加 runId。
如果确实需要直接 run-bound，必须先更新 docs/contracts.md、schema、OpenAPI、generated types。
```

### 4.3 当前不是 run-bound 的对象

以下对象当前不属于直接 run-bound，不得为了满足生命周期文档私自添加 `runId`：

```text
MemoryItem
AuditLog
```

说明：

```text
MemoryItem 表示长期记忆，不等于某一次运行的直接过程对象。
AuditLog 表示治理审计日志，不等于某一次运行的直接事件对象。
```

如果后续需要表达“某次运行产生的 memory 写入”或“某次运行产生的审计记录”，应优先设计新的 contract 或明确关系，例如：

```text
MemoryWrite
RunAuditRecord
CostRecord
ErrorRecord
```

这些当前都属于目标模型 / Contract Gap。

### 4.4 目标模型 / Contract Gap

目标企业级运行时可能需要以下对象直接或间接围绕 `runId` 建模：

```text
ExecutionAttempt
ApprovalRequest
Message / MessageStream
PostRunJob
VerificationResult
ContextSnapshot
PermissionSnapshot
ToolScopeSnapshot
RetrievalScope
MemoryWrite
CostRecord
ErrorRecord
RunAuditRecord
```

但这些对象尚未全部进入当前 contracts。

规则：

```text
上述对象在进入实现前，必须先完成 contracts 补强。
生命周期文档只能把它们列为目标模型 / Contract Gap，不能让实现层直接采用。
```

---

## 5. 页面与运行主线的关系

页面结构已经完成基础搭建，后续不应继续重做页面结构，而应把运行时对象插入对应模块。

| 页面 / 模块 | 与 AnalysisRun 的关系 |
| --- | --- |
| `Analysis` | 运行入口和工作区，发起、继续、查看一次分析运行 |
| `Observability` | 展示 RunEvent、ModelCall、ToolCall、成本、延迟、错误、trace |
| `Reports` | 展示 Report、ReportSection、Decision、ActionSuggestion |
| `Data Knowledge` | 展示 SourceEvidence 背后的数据、知识、lineage、对象上下文 |
| `Metrics` | 展示运行使用的业务指标上下文，Metric 可被 run 引用，但不是 run 产物 |
| `Memory` | 展示运行后的长期记忆沉淀 |
| `Feedback` | 展示用户对运行结果的反馈，必须绑定 runId |
| `Evaluation` | 展示运行质量评估和坏例复盘 |
| `Governance` | 配置和展示运行前 / 运行中的权限、风险、策略、审批、审计 |
| `Model Tools` | 配置运行能力来源，包括模型、工具、Prompt、RAG 策略 |
| `Platform Operations` | 支撑调度、通知、数据质量和运维状态 |
| `Workspace / Settings` | 支撑工作区、用户、偏好和平台配置边界 |

硬规则：

```text
页面只能展示、触发或配置运行时对象。
页面不得发明自己的运行状态机。
页面不得绕过 contracts 解释 raw model/tool output。
```

---

## 6. 目标生命周期模型 / Contract Gap

以下内容是目标生命周期模型，不是当前 contracts 已落地事实。

在 `docs/contracts.md`、`packages/contracts/schemas/**`、OpenAPI、generated types 同步完成前，不得进入 API / DB / ViewModel / UI 实现链路。

### 6.1 目标 status

目标状态建议：

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

| 状态 | 说明 | 当前是否正式进入 contracts |
| --- | --- | --- |
| `created` | 运行已创建 | 是 |
| `validating` | 正在入场校验 / 治理校验 | 否，Contract Gap |
| `rejected` | 入场前被拒绝 | 否，Contract Gap |
| `queued` | 等待 worker / 并发槽位 / 模型资源 | 否，Contract Gap |
| `running` | 正在执行 | 是 |
| `waiting` | 暂停等待外部动作 | 否，Contract Gap |
| `cancelling` | 收到取消请求，正在收尾 | 否，Contract Gap |
| `cancelled` | 已取消 | 是 |
| `failed` | 执行失败 | 是 |
| `completed` | 正常完成 | 是 |
| `expired` | 等待或调度超时 | 否，Contract Gap |

当前正式 `waiting_approval` 是较粗的等待审批状态。目标模型中建议将其演进为：

```text
status = waiting
waitingFor = approval
```

该演进必须经过 contracts 更新，不能直接在实现中替换。

### 6.2 目标 phase

目标阶段建议：

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

当前 contracts 尚未正式提供 `phase` 字段。

因此：

```text
phase 属于 Contract Gap。
实现层不得私自添加 phase 字段。
```

### 6.3 目标 outcome

目标 outcome 建议：

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

当前 contracts 尚未正式提供 `outcome` 字段。

因此：

```text
outcome 属于 Contract Gap。
不得新增 completed_with_warnings 这类 status。
```

目标表达方式：

```text
status = completed
outcome = partial_success
```

### 6.4 目标 waitingFor

目标 waitingFor 建议：

```text
approval
user_input
tool_callback
external_dependency
rate_limit
quota_reset
scheduled_resume
```

当前 contracts 尚未正式提供 `waitingFor` 字段。

因此：

```text
waitingFor 属于 Contract Gap。
当前实现不得私自引入。
```

---

## 7. 目标业务阶段流

以下为目标模型，不是当前正式状态机。

```text
intake
  -> preflight
  -> governance
  -> context_binding
  -> planning
  -> approval?
  -> queueing
  -> execution
      -> tool_execution?
      -> evidence_binding?
      -> execution
  -> synthesis
  -> verification
  -> delivery
  -> post_run
```

目标主状态流：

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
      -> waiting
          -> queued
          -> expired
          -> cancelling
```

目标硬规则：

```text
governance 前不得 tool call
context_binding 前不得执行模型/工具
planning 前不得审批高风险动作
verification 前不得 completed
delivery 前不得持久化最终 artifact
```

以上规则需要在 contracts 补强后进入实现。

---

## 8. 目标阶段规则

### 8.1 Intake

当前事实：

```text
AnalysisRun 有 runId、workspaceId、userId、analysisTaskId。
```

目标模型：

```text
创建 runId
绑定 workspaceId
绑定 userId / requester
绑定 sessionId 或 analysisTaskId
记录 input snapshot
记录 idempotency key
创建 root trace id
```

Contract Gap：

```text
inputSnapshotId
idempotencyKey
rootTraceId
sessionId
```

### 8.2 Preflight

目标模型：

```text
校验 payload schema
校验 required fields
校验 workspace
校验 user membership
校验 idempotency key
校验 rate limit
校验 concurrency limit
```

Contract Gap：

```text
validating status
rejected status
reject reason
validation event type
```

### 8.3 Governance

目标模型：

```text
校验权限
校验 workspace policy
校验数据访问范围
校验模型可用范围
校验工具可用范围
校验成本预算
校验 quota
校验风险等级
校验敏感数据策略
校验外部写入策略
```

Contract Gap：

```text
policy decision object
ApprovalRequest
risk policy result
permission snapshot
```

### 8.4 Context Binding

目标模型：

```text
固定 workspace snapshot
固定 permission snapshot
固定 tool scope snapshot
固定 model scope snapshot
固定 memory scope
固定 retrieval scope
固定 cost budget
```

Contract Gap：

```text
contextSnapshotId
permissionSnapshotId
toolScopeSnapshotId
retrievalScopeId
```

### 8.5 Planning

当前事实：

```text
AnalysisRunStatus 当前有 planning。
```

目标模型：

```text
生成 planId
生成 planVersion
生成 plannedSteps
判断 expectedOutputType
估算 estimatedCost
判断 riskLevel
判断 approvalRequirements
判断 toolRequirements
判断 retrievalRequirements
判断 reportRequirements
```

Contract Gap：

```text
planId
planVersion
plannedSteps
approvalRequirements
```

### 8.6 Approval

当前事实：

```text
AnalysisRunStatus 当前有 waiting_approval。
```

目标模型：

```text
ApprovalRequest 是独立对象。
approval 不应只是 run status。
approval 应绑定 runId、planId 或 toolCallId。
approval 只批准明确动作，不批准整个 run 的所有后续行为。
plan 变化后旧 approval 必须 superseded。
```

Contract Gap：

```text
ApprovalRequest
approvalId
ApprovalStatus
waiting status
waitingFor = approval
timeoutAt
```

### 8.7 Queueing / ExecutionAttempt

目标模型：

```text
进入队列
等待 worker
获取 worker lease
创建 ExecutionAttempt
记录 leaseExpiresAt
记录 heartbeat
worker crash 后同 run 创建新 ExecutionAttempt
```

Contract Gap：

```text
queued status
ExecutionAttempt
attemptId
leaseId
workerId
leaseExpiresAt
heartbeatAt
```

### 8.8 Execution

当前事实：

```text
ToolCall、ModelCall、SourceEvidence 已有 runId。
```

目标模型：

```text
execution 是循环
ModelCall failed 不一定导致 run failed
ToolCall failed 不一定导致 run failed
SourceEvidence retrieval failed 不一定导致 run failed
只有 recovery policy 判断不可恢复，run 才 failed
```

Contract Gap：

```text
recovery policy
event type enum
tool/model/evidence failure policy
```

### 8.9 Synthesis

目标模型：

```text
生成 assistant answer draft
生成 report draft
生成 decision
生成 action suggestion
生成 evidence summary
```

Contract Gap：

```text
draft artifact object
artifact status
answer draft object
```

### 8.10 Verification

目标模型：

```text
completed 之前必须 verification.passed
校验 output schema
校验证据引用
校验 source access
校验权限仍有效
校验敏感信息
校验风险标签
校验报告章节完整
```

Contract Gap：

```text
VerificationResult
verification event type
verification_failure outcome
```

### 8.11 Delivery

目标模型：

```text
创建 final assistant message
持久化 report / artifact / decision / action suggestion
持久化 source evidence refs
关闭 stream
释放 worker lease
结算 cost
写 run.completed event
```

Contract Gap：

```text
Message / MessageStream
Artifact
CostRecord
delivery event type
```

### 8.12 Post-run

目标模型：

```text
feedback
evaluation
bad case capture
memory write
cost aggregation
audit archive
observability aggregation
```

Contract Gap：

```text
PostRunJob
MemoryWrite
CostRecord
AuditArchive event
```

---

## 9. Retry / Recovery 目标规则

以下为目标模型 / Contract Gap。

### 9.1 用户 Retry

目标规则：

```text
用户 retry 必须创建新 run。
终态 run 不复活。
```

目标字段：

```text
retryOfRunId
originalRunId
```

Contract Gap：

```text
retryOfRunId / originalRunId 尚未确认进入 contracts。
```

禁止：

```text
failed -> running
expired -> running
cancelled -> running
completed -> running
```

### 9.2 系统恢复

目标规则：

```text
系统恢复不创建新 run。
系统恢复在同一个 run 下创建新的 ExecutionAttempt。
```

Contract Gap：

```text
ExecutionAttempt 尚未进入 contracts。
```

---

## 10. Cancellation 目标规则

以下为目标模型 / Contract Gap。

目标流转：

```text
queued/running/waiting
  -> cancelling
  -> cancelled
```

目标动作：

```text
记录 cancel request
停止 stream
请求取消 model call
请求取消 tool call
记录已发生外部副作用
释放 worker lease
写 terminal event
```

Contract Gap：

```text
cancelling status
cancelRequestedAt
sideEffectCommitted
tool/model cancel event type
```

硬规则：

```text
cancelled 不是 failed。
cancelled 后不得创建 final assistant answer。
```

---

## 11. RunEvent 规则

当前事实：

```text
RunEvent 已有 eventId、runId、eventType、status、nodeName、agentName、toolName、startedAt、completedAt。
eventType 当前是 string。
RunEventStatus 当前是 pending / running / succeeded / failed / skipped。
```

目标模型：

```text
RunEvent 是 append-only 审计事件流。
RunEvent 不等于 UI timeline item。
UI timeline 必须通过 mapper 转成 ViewModel。
```

目标事件命名：

```text
<domain>.<action>
```

目标事件域：

```text
run
input
validation
policy
context
plan
approval
queue
worker
execution_attempt
model_call
tool_call
evidence
artifact
report
decision
verification
delivery
memory
feedback
evaluation
cost
audit
error
```

Contract Gap：

```text
RunEventType enum
cancelled event status
event refType / refId
event sequence
parentEventId
```

硬规则：

```text
RunEvent 不承载高频 token delta。
高频流式输出应进入 MessageStream 或 stream transport。
```

---

## 12. Message / Stream 边界

当前事实：

```text
conversationId / messageId / turnId 当前仍是候选对象，不是正式 contract。
```

目标模型：

```text
Message 展示 conversation 内容。
MessageStream 传输流式输出。
RunEvent 记录审计事实。
Message 不拥有 ToolCall / Evidence / Report 生命周期。
```

Contract Gap：

```text
Message
MessageStream
conversationId
messageId
turnId
stream chunk schema
```

禁止：

```text
用 message status 代替 run status
用 stream done 代替 run.completed
把 tool/evidence/report 塞进 message 文本作为事实源
```

---

## 13. 前端实现约束

当前正式规则：

```text
前端必须通过 Contract -> ViewModel -> UI。
UI 不直接消费 raw API response。
ViewModel 不能重命名核心业务字段。
```

目标规则：

```text
前端展示 AnalysisRun status / phase / outcome。
前端展示 RunEvent trace。
前端展示 ToolCall / ModelCall / SourceEvidence / Report / Memory / Feedback / Evaluation。
前端可以提交 cancel request、approval decision、user input。
前端不得自行发明 run status。
前端不得自行推导 terminal status。
前端不得用 message stream 替代 run lifecycle。
```

Analysis 工作区目标：

```text
MessageList 只展示 conversation。
Inspector 展示 RunEvent / ToolCall / ModelCall / SourceEvidence / Report / Memory context。
Composer 只提交用户输入，不直接驱动状态机。
RunTrace 以 RunEvent ViewModel 为事实源。
```

---

## 14. 后端实现约束

目标规则：

```text
app 层只负责 HTTP / API / stream transport。
modules 层负责运行时生命周期编排。
infrastructure 层负责 Repository / Model Gateway / Tool Registry / Queue / RAG / Observability。
所有状态写入必须经过 Repository。
所有模型调用必须经过 Model Gateway。
所有工具调用必须经过 Tool Registry 和 policy check。
```

禁止：

```text
HTTP route 直接编排 Agent lifecycle
HTTP route 直接调用模型 SDK
HTTP route 直接执行工具
modules 绕过 contracts
tool call 绕过 governance
raw provider output 进入 UI
```

---

## 15. Contract Gap 清单

### P0 必须补强

```text
AnalysisRunStatus 企业级状态补强
AnalysisRun phase 字段
AnalysisRun outcome 字段
AnalysisRun waitingFor 字段
AnalysisRun terminal timestamp 字段
AnalysisRun retryOfRunId / originalRunId
AnalysisRun / Report / ToolCall / ModelCall / SourceEvidence schema required 补强
RunEventType 收敛
ExecutionAttempt schema
ApprovalRequest schema
OpenAPI 从 /health 扩到最小 runtime 主链路
generated TypeScript / Python types
```

### P1 建议补强

```text
RunEventStatus 是否补 cancelled
Message / MessageStream 是否进入正式 contracts
CostRecord
ErrorRecord
AuditRecord 与 RunEvent 关系
PostRunJob
VerificationResult
ContextSnapshot
PermissionSnapshot
ToolScopeSnapshot
RetrievalScope
Artifact / DraftArtifact
```

### P2 后续按功能触发

```text
MemoryWrite 独立生命周期
ReportPublishApproval
Tool side effect record
Evaluation rubric / dataset / score 细分
BadCase lifecycle
```

---

## 16. 禁止项

禁止：

```text
AnalysisRun / AgentRun 双对象
AnalysisRunStatus / AgentRunStatus 双枚举
runId / agentRunId 双 ID
eventId / runEventId 混用
status = done / success / completed 混用
completed_with_warnings 作为 status
terminal status 复活
tool call before governance
completed before verification
message stream 代替 run lifecycle
frontend 发明 lifecycle
backend route 直接编排模型和工具
raw provider output 进入 UI
metadata 作为未类型化生命周期逃逸口
```

---

## 17. 后续落地顺序

推荐顺序：

```text
1. 先确认本文档口径
2. 写入 docs/runtime-lifecycle.md
3. 更新 docs/contracts.md，标记 Contract Gap
4. 补 packages/contracts/schemas/**
5. 补 OpenAPI 最小 runtime 主链路
6. 补 generated TypeScript / Python types
7. 补 contract check / drift check
8. 再实现 backend lifecycle service
9. 再接 frontend ViewModel / Analysis workspace
```

不得跳过 contracts 直接实现 runtime 状态机。
