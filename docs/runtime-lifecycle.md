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

| 类型        | 当前正式事实                       | 目标模型                                                | Contract Gap                                                |
| ----------- | ---------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| 运行主对象  | 当前正式对象名是 `AnalysisRun`     | 产品语义上可称为 Agent Run，表示一次 Agent 分析运行     | 不得在实现中另起 `AgentRun` 对象名，除非 contracts 正式改名 |
| 主归属 ID   | 当前正式 ID 是 `runId`             | 所有运行过程、证据、产物、反馈、评估都围绕 `runId` 归属 | 不得引入 `agentRunId / runtimeId / traceId` 替代 `runId`    |
| 运行状态    | 当前正式枚举是 `AnalysisRunStatus` | 后续可补强为企业级状态机                                | 不得私自新增 `AgentRunStatus` 双轨                          |
| 运行事件 ID | 当前正式 ID 是 `eventId`           | `RunEvent` 用于运行审计事件                             | 不得把 `eventId` 和 `runEventId` 当同义字段混用             |

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

### 2.2 当前正式 canonical ID

当前 contracts 已确认、且可能被运行链路直接使用或间接引用的 canonical ID 包括：

```text
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
auditLogId
permissionPolicyId
riskRuleId
```

### 2.3 当前正式 AnalysisRunStatus

当前正式 `AnalysisRunStatus` 为：

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

### 2.4 当前正式 RunEventStatus

当前正式 `RunEventStatus` 为：

```text
pending
running
succeeded
failed
skipped
cancelled
```

### 2.5 当前正式 AnalysisRunPhase

当前正式 `AnalysisRunPhase` 为：

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

### 2.6 当前正式 AnalysisRunOutcome

当前正式 `AnalysisRunOutcome` 为：

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

### 2.7 当前正式 AnalysisRunWaitingFor

当前正式 `AnalysisRunWaitingFor` 为：

```text
approval
user_input
tool_callback
external_dependency
rate_limit
quota_reset
scheduled_resume
```

## 中文阅读说明：status 与 phase

本节只用于帮助中文阅读，不新增 contract，不改变正式枚举，也不改变正式生命周期规则。

`status` 表示一次 `AnalysisRun` 的运行大状态，用来回答：

- 这次 run 是否刚创建？
- 是否正在校验？
- 是否已进入队列？
- 是否正在运行？
- 是否等待人工或外部条件？
- 是否已完成？
- 是否失败或取消？

`phase` 表示一次 `AnalysisRun` 当前所处的业务阶段，用来回答：

- 这次 run 现在具体走到哪一步？
- 是刚接收输入？
- 是在做前置检查？
- 是在做权限 / 治理校验？
- 是在绑定上下文？
- 是在规划？
- 是在排队？
- 是在执行？
- 是在调用工具？
- 是在绑定证据？
- 是在综合生成？
- 是在校验结果？
- 是在交付产物？
- 还是进入运行后处理？

简单理解：

```text
status = run 当前的大状态
phase = run 当前的业务步骤
```

### 2.8 当前已确认的 runId 归属关系

当前 contracts 已经确认以下对象必须绑定 `runId`：

```text
RunEvent
ToolCall
ModelCall
SourceEvidence
Feedback
EvaluationRun
Report
Decision
BadCase
ExecutionAttempt
ApprovalRequest
```

---

## 3. 当前 contracts 不足

本次已完成 runtime lifecycle 的 P0 contract hardening，但仍存在剩余 Contract Gap。

### 3.1 当前仍未正式进入 contracts 的对象

```text
PostRunJob
VerificationResult
ContextSnapshot
PermissionSnapshot
ToolScopeSnapshot
RetrievalScope
CostRecord
ErrorRecord
RunAuditRecord
MemoryWrite
```

这些对象当前仍只能作为 `Contract Gap`，不得进入实现链路。

### 3.2 当前仍未正式进入 contracts 的字段

```text
rootTraceId
contextSnapshotId
permissionSnapshotId
toolScopeSnapshotId
retrievalScopeId
```

这些字段如果后续需要进入 API / DB / ViewModel / UI，共享链路前必须先补齐 contracts。

### 3.3 当前仍需继续补强的 schema 约束

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

### 3.4 当前仍未收口的 contract / OpenAPI / generated 范围

本次已补最小 runtime OpenAPI 主链路、TypeScript / Python generated outputs 和 contracts drift check。

但以下范围仍保持为后续 Contract Gap：

```text
PostRunJob contract
VerificationResult contract
Context / Permission / ToolScope / Retrieval snapshot contracts
Cost / Error / RunAudit / MemoryWrite contracts
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
Decision
BadCase
ExecutionAttempt
ApprovalRequest
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

其中 `ExecutionAttempt`、`ApprovalRequest` 已在当前 contracts 中正式化，其余对象尚未进入当前 contracts。

规则：

```text
上述对象在进入实现前，必须先完成 contracts 补强。
生命周期文档只能把它们列为目标模型 / Contract Gap，不能让实现层直接采用。
```

---

## 5. 页面与运行主线的关系

页面结构已经完成基础搭建，后续不应继续重做页面结构，而应把运行时对象插入对应模块。

| 页面 / 模块            | 与 AnalysisRun 的关系                                               |
| ---------------------- | ------------------------------------------------------------------- |
| `Analysis`             | 运行入口和工作区，发起、继续、查看一次分析运行                      |
| `Observability`        | 展示 RunEvent、ModelCall、ToolCall、成本、延迟、错误、trace         |
| `Reports`              | 展示 Report、ReportSection、Decision、ActionSuggestion              |
| `Data Knowledge`       | 展示 SourceEvidence 背后的数据、知识、lineage、对象上下文           |
| `Metrics`              | 展示运行使用的业务指标上下文，Metric 可被 run 引用，但不是 run 产物 |
| `Memory`               | 展示运行后的长期记忆沉淀                                            |
| `Feedback`             | 展示用户对运行结果的反馈，必须绑定 runId                            |
| `Evaluation`           | 展示运行质量评估和坏例复盘                                          |
| `Governance`           | 配置和展示运行前 / 运行中的权限、风险、策略、审批、审计             |
| `Model Tools`          | 配置运行能力来源，包括模型、工具、Prompt、RAG 策略                  |
| `Platform Operations`  | 支撑调度、通知、数据质量和运维状态                                  |
| `Workspace / Settings` | 支撑工作区、用户、偏好和平台配置边界                                |

硬规则：

```text
页面只能展示、触发或配置运行时对象。
页面不得发明自己的运行状态机。
页面不得绕过 contracts 解释 raw model/tool output。
```

---

## 6. 当前正式生命周期模型

以下内容已经进入当前 contracts，是当前正式 runtime lifecycle 事实。

### 6.1 当前正式 status

当前正式状态为：

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

| 状态         | 说明                                      |
| ------------ | ----------------------------------------- |
| `created`    | 运行已创建，尚未进入 validating           |
| `validating` | 正在做入场校验、治理校验或基础限制校验    |
| `rejected`   | 入场前被拒绝，属于终态                    |
| `queued`     | 已通过校验，等待 worker / 并发槽位 / 资源 |
| `running`    | 正在执行                                  |
| `waiting`    | 暂停等待外部动作                          |
| `cancelling` | 收到取消请求，正在收尾                    |
| `cancelled`  | 已取消，属于终态                          |
| `failed`     | 执行失败，属于终态                        |
| `completed`  | 正常完成，属于终态                        |
| `expired`    | 等待或调度超时，属于终态                  |

当前正式模型中，旧的 `waiting_approval` 已被拆分为：

```text
status = waiting
waitingFor = approval
```

### 6.2 当前正式 phase

当前正式阶段为：

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

### 6.3 当前正式 outcome

当前正式 outcome 为：

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

正式表达方式：

```text
status = completed
outcome = partial_success
```

不得新增：

```text
completed_with_warnings
```

### 6.4 当前正式 waitingFor

当前正式 waitingFor 为：

```text
approval
user_input
tool_callback
external_dependency
rate_limit
quota_reset
scheduled_resume
```

---

## 7. 当前正式业务阶段流

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

## 业务阶段中文解释

本节只用于帮助理解 phase 的中文含义，不构成新的 contract、状态机或实现要求。

| phase              | 中文理解              | 含义                                                                                                    |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `intake`           | 接收 / 受理           | 接住用户问题和基础归属关系，例如 `workspaceId`、`userId`、`conversationId`、`analysisTaskId`、`runId`。 |
| `preflight`        | 前置检查 / 起飞前检查 | 检查输入是否完整、上下文是否合法、必要字段是否存在。                                                    |
| `governance`       | 治理校验              | 检查权限、数据访问范围、风险策略、工具和模型是否允许使用。                                              |
| `context_binding`  | 上下文绑定            | 把本次分析需要的指标、数据表、知识文档、时间范围和业务域固定下来。                                      |
| `planning`         | 分析规划              | 决定本次 run 要怎么分析、需要哪些工具、哪些证据、生成什么产物。                                         |
| `queueing`         | 排队                  | 把 run 放进队列，等待 worker 接手执行。                                                                 |
| `execution`        | 主执行                | worker 接手后开始真正执行。                                                                             |
| `tool_execution`   | 工具执行              | 调用指标查询、数据查询、知识检索或其他工具。                                                            |
| `evidence_binding` | 证据绑定              | 把工具、数据、检索结果整理为标准 `SourceEvidence`，并回挂到 `runId`。                                   |
| `synthesis`        | 综合生成              | 基于上下文和证据生成结论、消息和报告草稿。                                                              |
| `verification`     | 结果校验              | 校验 `message`、`evidence`、`report`、`decision` 与 `runId` 的引用关系是否可信。                        |
| `delivery`         | 交付                  | 持久化并交付 `Message`、`MessageStream`、`Report`、`Decision` 等产物。                                  |
| `post_run`         | 运行后处理            | 处理 `Feedback`、`BadCase`、`Evaluation`，以及未来 L4 hooks。                                           |

一条正常 `AnalysisRun` 可以粗略理解为：

```text
接收问题
-> 前置检查
-> 权限 / 治理校验
-> 绑定上下文
-> 制定分析计划
-> 排队等待 worker
-> 执行
-> 调用工具
-> 绑定证据
-> 综合生成
-> 校验结果
-> 交付消息和报告
-> 反馈 / 评估 / 后续处理
```

当前正式主状态流：

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

以上规则当前已经由 contracts 承接，可作为实现约束。

---

## 8. 生命周期阶段规则

### 8.1 Intake

当前事实：

```text
AnalysisRun 有 runId、workspaceId、userId、analysisTaskId。
```

`#157-1` frozen foundation 的补充规则：

```text
Metrics finding context 先进入 Analysis 草稿态
草稿态只绑定 AnalysisTask.contextPack，不立即创建 conversationId，不立即创建 runId
用户发送 question 后，才进入 AnalysisTask -> Conversation -> AnalysisRun 的正式持久化链路
本轮 seed / query verify 只覆盖 AnalysisTask、Conversation、AnalysisRun 三个对象
```

目标模型：

```text
创建 runId
绑定 workspaceId
绑定 userId / requester
绑定 conversationId 或 analysisTaskId
记录 input snapshot
记录 idempotency key
创建 root trace id
```

Contract Gap：

```text
inputSnapshotId
idempotencyKey
rootTraceId
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
reject reason
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
AnalysisRunPhase 当前有 planning。
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
ApprovalRequest 已是正式 contract 对象。
AnalysisRun 当前通过 status=waiting + waitingFor=approval 表达等待审批。
```

当前正式规则：

```text
ApprovalRequest 是独立对象。
approval 不应只是 run status。
approval 应绑定 runId、planId 或 toolCallId。
approval 只批准明确动作，不批准整个 run 的所有后续行为。
plan 变化后旧 approval 必须 superseded。
```

### 8.7 Queueing / ExecutionAttempt

当前正式规则：

```text
进入队列
等待 worker
获取 worker lease
创建 ExecutionAttempt
记录 leaseExpiresAt
记录 heartbeat
worker crash 后同 run 创建新 ExecutionAttempt
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
```

### 8.11 Delivery

目标模型：

```text
创建 final assistant message
持久化 report / artifact / decision / action suggestion
持久化 source evidence refs
关闭 MessageStream
释放 worker lease
结算 cost
写 run.completed event
```

Contract Gap：

```text
Artifact
CostRecord
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

## 9. Retry / Recovery 规则

### 9.1 用户 Retry

当前正式规则：

```text
用户 retry 必须创建新 run。
终态 run 不复活。
```

当前正式字段：

```text
retryOfRunId
originalRunId
```

禁止：

```text
failed -> running
expired -> running
cancelled -> running
completed -> running
```

### 9.2 系统恢复

当前正式规则：

```text
系统恢复不创建新 run。
系统恢复在同一个 run 下创建新的 ExecutionAttempt。
```

---

## 10. Cancellation 规则

当前正式流转：

```text
queued/running/waiting
  -> cancelling
  -> cancelled
```

当前正式动作：

```text
记录 cancel request
停止 stream
请求取消 model call
请求取消 tool call
记录已发生外部副作用
释放 worker lease
写 terminal event
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
RunEvent 已有 eventId、runId、eventType、status、phase、sequence、actor、occurredAt、summary、parentEventId、refType、refId、errorCode、errorMessage、nodeName、agentName、toolName、startedAt、completedAt。
eventType 当前已经收敛为受控 RunEventType 枚举。
RunEventStatus 当前是 pending / running / succeeded / failed / skipped / cancelled。
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

硬规则：

```text
RunEvent 不承载高频 token delta。
高频流式输出应进入 MessageStream 或 stream transport。
```

---

## 12. Message / Stream 边界

当前事实：

```text
conversationId / messageId / turnId / messageStreamId 已进入正式 contracts。
```

硬规则：

```text
Conversation 承接会话主线和 currentRunId 引用。
Message 展示 conversation 内容。
MessageStream 传输流式输出。
RunEvent 记录审计事实。
Message 不拥有 ToolCall / Evidence / Report 生命周期。
SSE 是 live MessageStream 的唯一实时传输方式。
HTTP JSON 只用于 MessageStream snapshot / replay / history，不替代 live streaming 主通道。
```

禁止：

```text
用 message status 代替 run status
用 stream done 代替 run.completed
把 tool/evidence/report 塞进 message 文本作为事实源
```

当前冻结的 transport 策略：

```text
GET /conversations/{conversationId}/messages/{messageId}/stream
  - Accept: text/event-stream -> live SSE stream
  - Accept: application/json -> replay / history snapshot
```

实现边界：

```text
stream.completed 表示消息流结束，不表示 AnalysisRun 已 completed。
RunEvent 不承载 token delta。
前端实时渲染 assistant 增量时，事实源是 MessageStream，不是 RunEvent。
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
前端真实接线主线固定为 Contract -> mapper -> ViewModel -> UI。
```

Analysis 工作区目标：

```text
MessageList 只展示 conversation。
Inspector 展示 RunEvent / ToolCall / ModelCall / SourceEvidence / Report / Memory context。
Composer 只提交用户输入，不直接驱动状态机。
RunTrace 以 RunEvent ViewModel 为事实源。
```

当前接入骨架：

```text
apps/web/src/modules/analysis/mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel.ts
  -> 读取 Conversation / Message / AnalysisRun / RunEvent / ToolCall / ModelCall / SourceEvidence / Report / MessageStream
  -> 输出 AnalysisWorkspaceViewModel
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

当前 route skeleton：

```text
services/agent-runtime/src/app/routes/conversations.py
services/agent-runtime/src/app/routes/analysis_runs.py
```

硬规则：

```text
route stub 当前可以返回统一 501 NOT_IMPLEMENTED。
route stub 不得返回 fake success 业务数据。
conversations route 只代表 Conversation facade 边界。
analysis_runs route 只代表 AnalysisRun lifecycle owner 边界。
```

---

## 15. Contract Gap 清单

### P0 必须补强

```text
本轮 P0 已收口，当前无新增 P0 Contract Gap。
```

### P1 建议补强

```text
CostRecord
ErrorRecord
RunAuditRecord 与 RunEvent 关系
PostRunJob
VerificationResult
ContextSnapshot
PermissionSnapshot
ToolScopeSnapshot
RetrievalScope
rootTraceId / contextSnapshotId / permissionSnapshotId / toolScopeSnapshotId / retrievalScopeId
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
7. 补 contract examples / validation / route stubs / mapper skeleton
8. 补 runtime-business-integration guide
9. 再实现 backend lifecycle service / SSE / real API
10. 再接 frontend live data source
```

不得跳过 contracts 直接实现 runtime 状态机。
