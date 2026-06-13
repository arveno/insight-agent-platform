# Runtime L3 Golden Path

## 0. 文档定位

本文档是 #156 的正式交付物，也是 #155 及其后续子 PR 共同引用的 L3 golden path acceptance artifact。

它只定义第一条真实闭环验收切片，不实现 runtime，不新增 API、DB、Worker、SSE、前端真实接线、模型调用或工具调用。

正式事实源仍然是：

```text
AGENTS.md
docs/workflow.md
docs/contracts.md
docs/runtime-lifecycle.md
docs/runtime-business-integration.md
packages/contracts/**
```

当前与本切片直接对齐的 contracts example 是：

```text
packages/contracts/examples/analysis-runtime/golden-path.json
```

该 example 当前表达的是这条切片的 contracts-backed terminal snapshot，不等同于完整自动化实现，也不替代本文的验收约束。

如本文与当前 `docs/contracts.md`、`packages/contracts/**` 中的 `AnalysisTaskContextPack` 或 `InspectorTreeNode` 正式结构发生冲突，以 tree-shaped `AnalysisTaskContextPack` 正式口径为准。

## 1. 验收边界

本切片只冻结一条后续共同使用的真实业务闭环：

```text
Metrics finding
-> Open in Analysis with context
-> user sends question
-> Conversation
-> AnalysisTask
-> AnalysisRun
-> RunEvent
-> Message / MessageStream
-> SourceEvidence
-> Report / Decision
-> Feedback
-> BadCase / Evaluation entry
-> follow-up
```

本切片明确禁止：

- fake success
- mock / real 双链路
- `AgentRun`、`agentRunId`、`runtimeId`
- 在 `runId` 主线之外再建第二条 runtime 主链
- 在本 issue 中直接实现 API、DB、Worker、SSE、前端真实接入、模型调用或工具调用

## 2. Demo Slice

| 项目                    | 冻结值                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- |
| demo workspace          | `workspace-northstar-retail-china` / `Northstar Retail China`                           |
| demo user               | `user-zoe` / 业务分析师                                                                 |
| demo business domain    | `business-domain-revenue-quality` / `营收质量`                                          |
| demo source route       | `Metrics -> metric-recognized-revenue -> Open in Analysis with context`                 |
| demo analysis question  | `解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。`                            |
| demo analysisTaskId     | `analysis-task-revenue-gap-q2`                                                          |
| demo analysisTask 语义  | 对 `2026 Q2` 华东区域确认收入增速低于阈值的异常做归因，输出证据支持的原因判断与动作建议 |
| demo conversationId     | `conversation-revenue-gap-q2`                                                           |
| demo conversation title | `收入增速异常`                                                                          |
| demo runId              | `analysis-q2-revenue-gap`                                                               |
| demo turnId             | `turn-revenue-gap-q2-1`                                                                 |

## 3. Seed Data And Context Pack

### 3.1 Seed 数据来源

后续真实实现必须通过仓库自动化 seed 产出本切片依赖的 demo 数据，不允许把这些对象只留在 PR 描述、截图或本地手工造数里。

本切片固定要求的 source context 至少包括：

| 类型               | 冻结对象                               |
| ------------------ | -------------------------------------- |
| metric             | `metric-recognized-revenue`            |
| data table         | `table-sales-order`                    |
| data table         | `table-refund-order`                   |
| knowledge document | `knowledge-document-channel-weekly-17` |
| knowledge document | `knowledge-document-inventory-east-04` |
| workspace          | `workspace-northstar-retail-china`     |
| user               | `user-zoe`                             |

### 3.2 Context Pack 语义

`Open in Analysis with context` 进入 Analysis 草稿态时，必须绑定一个后续会在 submit 时持久化为 `AnalysisTask.contextPack` 的 tree-shaped context pack。

本切片固定采用当前正式 `AnalysisTaskContextPack` 语义：

```ts
type AnalysisTaskContextPack = {
  version: 1;
  suggestedPrompt: "解释华东区域收入增速低于阈值的主要原因，并给出下一步建议。";
  traceability: "direct_refs";
  capturedAt: "2026-07-15T09:00:00Z";
  root: InspectorTreeNode;
};
```

本切片的 `root` 必须通过 `InspectorTreeNode` 表达 `metric / data table / knowledge document` 等 context，而不是回退到 flat `sourceType / sourceId / sourceTitle / summary / chips / suggestedPrompt` 字段集合。

示例方向如下：

```ts
const root: InspectorTreeNode = {
  nodeId: "context-root-revenue-gap-q2",
  kind: "directory",
  role: "inputContext",
  owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
  title: "Revenue quality / 2026 Q2",
  summary: "华东区域收入增速低于阈值，需要继续解释主因与下一步建议。",
  chips: ["Revenue quality", "2026 Q2", "收入增速 < -2%"],
  capturedAt: "2026-07-15T09:00:00Z",
  children: [
    {
      nodeId: "context-metric-recognized-revenue",
      kind: "metric",
      role: "inputContext",
      owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
      title: "确认收入",
      summary: "当前异常指标来源。",
      sourceRef: { type: "metric", metricId: "metric-recognized-revenue" },
    },
    {
      nodeId: "context-table-sales-order",
      kind: "dataTable",
      role: "inputContext",
      owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
      title: "销售订单表",
      sourceRef: { type: "dataTable", tableId: "table-sales-order" },
    },
    {
      nodeId: "context-table-refund-order",
      kind: "dataTable",
      role: "inputContext",
      owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
      title: "退款订单表",
      sourceRef: { type: "dataTable", tableId: "table-refund-order" },
    },
    {
      nodeId: "context-knowledge-channel-weekly-17",
      kind: "knowledgeDocument",
      role: "inputContext",
      owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
      title: "渠道周报 Week 17",
      sourceRef: {
        type: "knowledgeDocument",
        knowledgeDocumentId: "knowledge-document-channel-weekly-17",
      },
    },
    {
      nodeId: "context-knowledge-inventory-east-04",
      kind: "knowledgeDocument",
      role: "inputContext",
      owner: { type: "analysisTask", analysisTaskId: "analysis-task-revenue-gap-q2" },
      title: "华东库存说明 04",
      sourceRef: {
        type: "knowledgeDocument",
        knowledgeDocumentId: "knowledge-document-inventory-east-04",
      },
    },
  ],
};
```

补充约束：

- `sourceRef` 必须回到 canonical IDs：`metricId`、`tableId`、`knowledgeDocumentId`。
- 草稿态 context tree 与持久化后的 `AnalysisTask.contextPack` 必须保持同一 tree shape；submit transaction 负责补齐正式 `analysisTaskId` 归属。
- 本切片不保留旧 flat context pack 兼容路径。

该 context pack 只进入 Analysis 新聊天草稿态，不立即创建 `conversationId`，不立即创建 `runId`。

## 4. Canonical Object Chain

后续 #157 到 #164 共同验收时，至少要能反查下面这条 canonical object / id 链：

```text
businessDomainId = business-domain-revenue-quality
-> analysisTaskId = analysis-task-revenue-gap-q2
-> conversationId = conversation-revenue-gap-q2
-> runId = analysis-q2-revenue-gap
-> turnId = turn-revenue-gap-q2-1
-> messageId = message-revenue-gap-q2-user
-> messageId = message-revenue-gap-q2-assistant
-> messageStreamId = message-stream-revenue-gap-q2-*
-> eventId = event-analysis-q2-revenue-gap-*
-> sourceEvidenceId = source-evidence-channel-weekly-17
-> sourceEvidenceId = source-evidence-inventory-note-east-04
-> reportId = report-revenue-gap-q2
-> decisionId = decision-revenue-gap-q2
-> feedbackId = feedback-revenue-gap-q2-review
-> badCaseId = bad-case-revenue-gap-q2-depth
-> evaluationRunId = evaluation-run-revenue-gap-q2-review
```

任何后续实现都不得把这条链替换成：

- `sessionId`
- `clientMessageId`
- `runtimeId`
- `agentRunId`
- `traceId` 充当 `runId`

## 5. Expected AnalysisRun Flow

### 5.1 成功判定

本切片的真实成功必须同时满足：

1. 用户发送问题后创建 `Conversation`、`AnalysisTask`、`AnalysisRun`。
2. `AnalysisRun` 经过真实状态流转到 `completed`。
3. 至少产出一条 assistant `Message`，且绑定同一 `runId`。
4. 至少产出一组 `MessageStream` 记录，且 `stream.completed` 不冒充 `run.completed`。
5. 至少产出 `2` 条 `SourceEvidence`。
6. 至少产出 `1` 个 `Report` 和 `1` 个 `Decision`。
7. 用户可从结果继续提交 `Feedback`，并有明确的 `BadCase / Evaluation` 入口。

以下情况都不算成功：

- 只写一个 completed run，但没有 `Message` / `RunEvent` / `Report`
- 只写 assistant 文本，没有 `runId` 绑定
- 只有 `stream.completed`，没有 `run.completed`
- 只有报告摘要，没有 `SourceEvidence`
- 只有 fake report 或 fake assistant output，没有可反查对象链

### 5.2 phase / status 流转

本切片冻结的最小成功流转如下：

| 顺序 | AnalysisRun.status        | AnalysisRun.phase  | 说明                                         |
| ---- | ------------------------- | ------------------ | -------------------------------------------- |
| 1    | `created`                 | `intake`           | 用户发送问题后创建 run                       |
| 2    | `validating`              | `preflight`        | 校验 workspace、user、question、context pack |
| 3    | `validating`              | `governance`       | 完成权限和治理判定                           |
| 4    | `validating` 或 `running` | `context_binding`  | 绑定指标、表、文档上下文                     |
| 5    | `validating` 或 `running` | `planning`         | 形成问题拆解和证据召回计划                   |
| 6    | `queued`                  | `queueing`         | 进入真实 runtime dispatch 队列               |
| 7    | `running`                 | `execution`        | 运行主执行阶段已开始                         |
| 8    | `running`                 | `tool_execution`   | 指标或检索调用已完成                         |
| 9    | `running`                 | `evidence_binding` | 证据对象已标准化回挂到 `runId`               |
| 10   | `running`                 | `synthesis`        | 形成结论和报告草稿                           |
| 11   | `running`                 | `verification`     | 验证证据、报告、消息引用关系                 |
| 12   | `running`                 | `delivery`         | 持久化消息、流、报告、决策                   |
| 13   | `completed`               | `delivery`         | 该轮 run 的成功终态                          |

补充约束：

- 第一条 L3 slice 不走 `approval`。
- 第一条 L3 slice 不走 `waiting`。
- `post_run` 保留给后续 feedback / evaluation 衍生动作，不是本切片的 runtime 成功门槛。

## 6. Expected RunEvent Sequence

后续实现必须围绕同一 `runId` 产出可追踪的最小事件序列。推荐顺序固定为：

| sequence | eventType                  | phase              | 最低要求                                  |
| -------- | -------------------------- | ------------------ | ----------------------------------------- |
| 0        | `run.created`              | `intake`           | 记录问题进入 runtime                      |
| 1        | `validation.started`       | `preflight`        | 开始校验输入和上下文                      |
| 2        | `validation.passed`        | `preflight`        | 输入可进入真实执行                        |
| 3        | `policy.decision_recorded` | `governance`       | 记录允许读取本切片上下文                  |
| 4        | `context.bound`            | `context_binding`  | 绑定指标、表、文档上下文                  |
| 5        | `plan.created`             | `planning`         | 生成分析和证据召回计划                    |
| 6        | `run.queued`               | `queueing`         | 进入 dispatch 队列                        |
| 7        | `worker.lease_acquired`    | `execution`        | 真实 worker 接管 run                      |
| 8        | `tool_call.completed`      | `tool_execution`   | 完成指标对比或检索调用                    |
| 9        | `evidence.bound`           | `evidence_binding` | 形成标准化 `SourceEvidence`               |
| 10       | `model_call.completed`     | `synthesis`        | 完成总结和报告生成                        |
| 11       | `verification.passed`      | `verification`     | 校验 message / evidence / report 绑定关系 |
| 12       | `artifact.persisted`       | `delivery`         | 报告与消息持久化完成                      |
| 13       | `run.completed`            | `delivery`         | 标记该轮成功完成                          |

说明：

- `packages/contracts/examples/analysis-runtime/golden-path.json` 当前保存的是这条链路的最小 snapshot。
- 后续实现 issue 可以补齐 example 中尚未展开的 event，但不得改变本文定义的成功判定和对象主线。

## 7. Expected Message And MessageStream

### 7.1 Message

本切片的第一轮会话最少应出现以下消息形态：

1. `system` message：只描述从 `Metrics` 带入的上下文草稿，不承载结果。
2. `user` message：内容固定为 demo question，绑定 `turnId = turn-revenue-gap-q2-1`。
3. `assistant` message：绑定 `runId = analysis-q2-revenue-gap`、`reportId = report-revenue-gap-q2`，并引用 `2` 条 `sourceEvidenceIds`。

assistant message 的最小语义必须同时覆盖：

- 主结论：华东渠道确认延迟
- 次结论：促销库存错配
- 排除项：不是整体价格体系失效
- 动作入口：进入报告 / 决策 / follow-up

### 7.2 MessageStream

本切片冻结的最小流式输出形态为：

| sequence | eventType          | status      | 说明                          |
| -------- | ------------------ | ----------- | ----------------------------- |
| 0        | `stream.started`   | `created`   | assistant 输出开始            |
| 1        | `stream.delta`     | `streaming` | 至少一段增量文本              |
| 2        | `stream.completed` | `completed` | 流结束，但不替代 run terminal |

补充约束：

- live transport 未来只能是 SSE。
- replay / history 未来只能走 `MessageStream` records 的 HTTP JSON 读取。
- `RunEvent` 不承载 token delta。

## 8. Expected SourceEvidence

本切片的最小交付要求是 `2` 条标准化 `SourceEvidence`：

| sourceEvidenceId                         | sourceType           | sourceId                               | 作用                           |
| ---------------------------------------- | -------------------- | -------------------------------------- | ------------------------------ |
| `source-evidence-channel-weekly-17`      | `knowledge_document` | `knowledge-document-channel-weekly-17` | 支撑“华东渠道确认延迟”的主结论 |
| `source-evidence-inventory-note-east-04` | `knowledge_document` | `knowledge-document-inventory-east-04` | 支撑“促销库存错配”的次结论     |

同时，本切片的上游 context 必须能反查到：

- `metric-recognized-revenue`
- `table-sales-order`
- `table-refund-order`

第一条 L3 slice 允许把 metric / table 保留为 context pack 与工具输入来源，而不是要求它们在首轮输出中都落成 `SourceEvidence`。

## 9. Expected Report

本切片的报告对象固定为：

| 字段       | 冻结值                                                      |
| ---------- | ----------------------------------------------------------- |
| `reportId` | `report-revenue-gap-q2`                                     |
| `title`    | `收入异常分析摘要`                                          |
| `summary`  | 形成“确认延迟 + 库存错配”的主结论，并给出渠道与库存复核动作 |

最小报告结构必须包括：

1. `summary` 字段，可独立表达主结论。
2. `sourceEvidence` 字段，至少引用 `2` 条证据。
3. `sections` 字段，至少包含 `下一步动作` 段落。
4. `Decision` 入口，固定回挂 `decision-revenue-gap-q2`。

后续实现可以把 `sections` 扩展为 `核心结论 / 证据引用 / 下一步动作`，但不得去掉：

- report summary
- evidence ref
- action / decision 入口

## 10. Expected Feedback / BadCase / Evaluation

### 10.1 Feedback 输入

本切片要求结果页必须存在一个真实反馈入口。冻结的 baseline feedback 输入为：

| 字段           | 冻结值                                                                |
| -------------- | --------------------------------------------------------------------- |
| `feedbackId`   | `feedback-revenue-gap-q2-review`                                      |
| `runId`        | `analysis-q2-revenue-gap`                                             |
| `reportId`     | `report-revenue-gap-q2`                                               |
| `feedbackType` | `analysis_shallow`                                                    |
| `comment`      | `请进一步拆到渠道确认周期与促销库存错配分别来自哪些 SKU / 渠道组合。` |
| `correction`   | `null`                                                                |

这表示：

- run 本身可以真实成功；
- 但用户仍可对“分析深度不足”给出结构化反馈；
- feedback 是闭环的一部分，不得与 run success / failure 混为一谈。

### 10.2 BadCase / Evaluation entry

收到上述 feedback 后，后续 #163 必须至少落出：

| 对象                | 冻结值                                                            |
| ------------------- | ----------------------------------------------------------------- |
| `badCaseId`         | `bad-case-revenue-gap-q2-depth`                                   |
| `failureType`       | `analysis_depth_gap`                                              |
| `failureReason`     | `报告给出了结论，但未拆到 SKU / 渠道组合层。`                     |
| `expectedBehavior`  | `在保持证据可追溯的前提下，把异常拆到可执行的 SKU / 渠道组合层。` |
| `evaluationRunId`   | `evaluation-run-revenue-gap-q2-review`                            |
| `datasetId`         | `dataset-analysis-l3-golden-path`                                 |
| `evaluation status` | `needs_review`                                                    |

`BadCase` 与 `EvaluationRun` 是 feedback 之后的质量入口，不得回写成新的 `runId` 主链。

本 issue 不要求把这些对象补进当前 `packages/contracts/examples/analysis-runtime/golden-path.json`；它们在本文中被先行冻结为 #163 的强制验收目标。

## 11. Follow-up 追问入口

本切片的 follow-up 入口固定为：

```text
进一步拆解华东渠道确认延迟分别来自哪些 SKU 与渠道组合？哪些 SKU 同时受到促销库存错配影响？
```

follow-up 规则：

- follow-up 必须从已有 report / evidence / decision 进入 Analysis 草稿态。
- follow-up 必须创建新的 `analysisTaskId` 与新的 `runId`。
- follow-up 不得覆盖 `analysis-q2-revenue-gap` 原始结果。

## 12. Query Verify And Smoke Targets

### 12.1 Query verify 目标

后续自动化必须能验证：

1. `analysis-task-revenue-gap-q2`、`conversation-revenue-gap-q2`、`analysis-q2-revenue-gap` 同链存在。
2. `message-revenue-gap-q2-user` 与 `message-revenue-gap-q2-assistant` 绑定同一 `turnId`。
3. `message-stream-revenue-gap-q2-*` sequence 连续递增，且存在 `stream.completed`。
4. `runEvent` sequence 连续递增，且存在 `run.completed`。
5. `report-revenue-gap-q2` 引用 `2` 条 `SourceEvidence`。
6. `decision-revenue-gap-q2` 回挂到 `report-revenue-gap-q2`。
7. feedback / bad case / evaluation 落地后，`feedbackId -> badCaseId / evaluationRunId` 可反查。

### 12.2 Smoke 目标

后续自动化必须能证明：

1. 用户可从 `Metrics` 的 `metric-recognized-revenue` 进入 Analysis 草稿态。
2. 用户发送问题后创建 conversation 和 run。
3. 后端可读出 run、events、messages、source evidence、report。
4. SSE live 与 replay history 都能回放同一条 assistant 输出链。
5. 用户可从 report 进入 feedback，并看到后续 bad case / evaluation 入口。

### 12.3 当前命令责任

本 issue 只冻结验收目标，不补实现命令。

若仓库当前尚无对应自动化入口，则默认由 #164 补齐以下承载位，并被 #157 到 #163 共同引用：

- migration：`scripts/migration/` + `database/mysql/migrations/`
- seed：`database/mysql/seeds/`
- query verify：`database/mysql/queries/`
- smoke：`scripts/smoke/`

## 13. 页面人工验收路径

页面人工验收路径固定为：

1. 进入 `Northstar Retail China` workspace。
2. 进入 `Metrics` 页面，定位 `metric-recognized-revenue`。
3. 通过 `Open in Analysis with context` 进入 Analysis 新聊天草稿态。
4. 确认草稿态带入了 metric / time range / knowledge context，但尚未创建 conversation 或 run。
5. 发送 demo question。
6. 在 Analysis workspace 中确认：
   - 出现 `conversation-revenue-gap-q2`
   - 当前 run 为 `analysis-q2-revenue-gap`
   - Inspector 可查看 run trace
   - 对话区出现 assistant 输出
7. 打开 report / evidence 入口，确认：
   - `report-revenue-gap-q2` 可读
   - `2` 条 `SourceEvidence` 可追溯
   - `decision-revenue-gap-q2` 可见
8. 提交 feedback，确认后续 bad case / evaluation 入口存在。
9. 通过结果页或 evidence / report 入口发起 follow-up。

## 14. Follow-up Issue Binding

从 #157 到 #164，所有实现 PR 都必须显式引用本文，并说明自己补齐的是哪一段链路：

- #157-1：`AnalysisTask` input contract + `AnalysisTask / Conversation / AnalysisRun` persistence foundation；seed / query verify 只允许停在 `run.status = created`、`run.phase = intake`
- #157：`AnalysisTask / Conversation / AnalysisRun` 持久化和输入地基
- #158：Conversation / AnalysisRun API 真实成功
- #159：真实 lifecycle / Worker / Queue / Dispatch
- #160：`RunEvent / ToolCall / ModelCall / SourceEvidence / Report / Decision`
- #161：`Message / MessageStream / SSE / replay`
- #162：前端真实 API 接入和页面联通
- #163：`Feedback / BadCase / Evaluation`
- #164：migration / seed / query verify / smoke / rollback 自动化

任何后续 PR 都不得重新发明第二条 golden path，也不得把本文退化成“仅供参考”的口头约束。
