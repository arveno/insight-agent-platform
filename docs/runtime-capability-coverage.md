# Runtime Capability Coverage

## 0. 文档定位

本文是 `#155` 后续 runtime 工作的运行能力覆盖、首轮验收深度和范围压缩边界说明。

本文不替代 `AGENTS.md`、`docs/architecture.md`、`docs/contracts.md`、`docs/runtime-lifecycle.md`、`docs/database.md`、`docs/deployment.md`。

本文不新增 contracts，不新增 API，不新增 DB migration。

本文用于后续 Issue / PR 对照运行能力覆盖、承载位置和首轮验收深度。

运行能力链路可以按阶段实现，但正式承载位不能缺失、不能绕过。

## 1. 总原则

- 运行能力链路不缺位。后续 PR 可以分阶段推进，但不能只补表面结果，不补正式承载位。
- 实现规模可以压缩。首轮验收只要求覆盖第一条真实主链，不要求一次铺满全部扩展分支。
- 云端 Preview 可以优先。`#155` 当前允许优先使用 preview 环境承接真实集成验证。
- 本地完整基础设施复刻不作为当前阻塞项。本地先要求 `Docker build`、基础测试、contract check 和 smoke client。
- 数据可以 reset，但必须通过 `migration -> seed -> query verify`。不允许跳过 migration，不允许只改 seed 假装结构已经存在。
- 不能用 `mock / real` 双轨代替真实链路。可以有 test fixture、fake provider for tests、local dev adapter，但不能形成长期双主线。
- 不能用手工散操作代替仓库内脚本和事实源。数据库、部署、smoke、rollback、failure simulation 都必须逐步落回仓库入口。

## 2. 运行能力覆盖矩阵

下表用于约束后续 `#157-#165` 在同一套 runtime 主线下推进。

| 能力项                                                                                                                              | 用途说明                                                                                                     | 主要承载位                                                                                                                           | 首轮验收深度                                                                                                                                         | 允许压缩的范围                                                     | 禁止绕过的边界                                                                       | 相关事实源                                                                                                                                             | 后续关联 Issue                            |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `AnalysisRun Lifecycle（AnalysisRun 生命周期）`                                                                                     | 一次分析运行从创建、校验、治理、上下文绑定、规划、排队、执行、证据绑定、综合生成、校验到交付的完整状态链路。 | `AnalysisRun`、`runId`、`status`、`phase`、`RunEvent`、`ExecutionAttempt`、`LangGraph`（运行图编排框架）runtime owner。              | golden path 的 `status / phase / event sequence` 可以持久化、查询和回放。                                                                            | 首轮只要求先跑通主成功链和基础失败链，不要求一次覆盖全部恢复分支。 | 不得用 `AgentRun`、`agentRunId`、`runtimeId`、`sessionId`、`traceId` 替代正式主线。  | `docs/runtime-lifecycle.md`、`docs/runtime-l3-golden-path.md`、`packages/contracts/schemas/analysis/**`                                                | `#157` `#158` `#159` `#160` `#161` `#165` |
| `访问控制 / RBAC（Role-Based Access Control，基于角色的权限控制）/ ACL（Access Control List，访问控制列表）`                        | 控制哪个用户、角色、workspace 可以访问哪些数据、模型和工具。                                                 | `workspaces`、`users`、`workspace_members`、`roles`、`permissions`、Governance Policy。                                              | 一个 workspace、两个 user、至少两个 role，模型 / 工具 / 数据访问经过权限判断。                                                                       | 不做完整组织树，不做 SSO，不做跨租户复杂授权编排。                 | 不得把权限判断散落到 route、前端或无 owner 的 helper。                               | `docs/architecture.md`、`docs/database.md`、`docs/contracts.md`                                                                                        | `#157` `#159` `#160`                      |
| `Governance（治理）/ SQL Guard（SQL 风险控制）/ Policy（策略）`                                                                     | 对权限、SQL 风险、工具风险、敏感字段、审计进行统一约束。                                                     | governance module、`SQL Guard`、policy decision record、audit / error records、`RunEvent`。                                          | 支持只读 SQL Guard、敏感字段规则、`policy rejected` error / event。                                                                                  | 不接复杂外部策略引擎，不做过度抽象的治理编排中心。                 | 不得让模型直接执行 SQL，不得把策略拒绝只写成日志而不回挂正式对象链。                 | `AGENTS.md`、`docs/architecture.md`、`docs/runtime-lifecycle.md`、`packages/contracts/schemas/governance/**`                                           | `#157` `#159` `#160` `#164`               |
| `Model Gateway（模型网关，统一管理模型 provider、路由、fallback、token、成本、延迟和错误类型）/ Provider Routing（模型供应商路由）` | 统一管理模型调用入口，负责 provider 选择、retry、fallback、token、成本、延迟和错误类型。                     | `Model Gateway`、`model_calls`、provider config、`runId`、`ModelCall`。                                                              | 至少两个 provider 槽位，支持明确路由规则、fallback 路径，并持久化一次 `ModelCall`。                                                                  | 不做大量 provider 接入，不做 L3 自动成本优化。                     | 不得在 route、service、LangGraph node 或前端中直接散写 provider 调用。               | `AGENTS.md`、`docs/architecture.md`、`docs/runtime-lifecycle.md`、`packages/contracts/schemas/analysis/model-call.schema.json`                         | `#159` `#160` `#165`                      |
| `Tool Registry（工具注册表，统一管理工具 schema、权限、风险等级、handler 和审计记录）/ Tool Governance（工具治理）`                 | 统一管理工具 schema、权限、风险等级、handler、调用记录和审计。                                               | `Tool Registry`、tool schema、`riskLevel`、`permission`、handler、`tool_calls`。                                                     | 至少两个或三个 read-only tools，每个工具有 schema、risk level、permission check、trace / audit binding。                                             | 不做计费，不做完整外部插件市场，不做大量第三方插件接入。           | 不得让模型或业务 service 直接调用工具 handler。                                      | `AGENTS.md`、`docs/architecture.md`、`packages/contracts/schemas/analysis/tool-call.schema.json`、`packages/contracts/schemas/model-tools/**`          | `#159` `#160`                             |
| `Human-in-the-loop（人工确认）/ ApprovalRequest（审批请求）`                                                                        | 高风险动作不能直接执行，需要进入 waiting 状态并等待人工确认。                                                | `approval_requests`、waiting status、approval / reject event、`ApprovalRequest`。                                                    | 一个高风险动作可以进入 waiting，并在 approve / reject 后继续或停止。                                                                                 | 不做多级审批链，不做完整审批设计器。                               | 不得把高风险动作直接落地执行后再补审批记录。                                         | `docs/runtime-lifecycle.md`、`packages/contracts/schemas/analysis/approval-request.schema.json`                                                        | `#159` `#160`                             |
| `Knowledge（知识）/ RAG（Retrieval-Augmented Generation，检索增强生成）/ SourceEvidence（来源证据）`                                | 把业务文档、知识切片和向量检索结果转为可追溯证据。                                                           | `LlamaIndex`（知识解析、索引与检索编排层）、`Milvus`（向量库）、`knowledge_documents`、`knowledge_chunks`、`source_evidence`。       | demo documents 可以 chunk、embedding、retrieval，并绑定为 `SourceEvidence`。                                                                         | 文档数量小，检索策略简单，不做复杂 rerank 和多阶段召回。           | 不得把 raw retrieval output 直接塞给 UI，不得绕过 `SourceEvidence` 标准对象。        | `docs/architecture.md`、`docs/database.md`、`packages/contracts/schemas/analysis/source-evidence.schema.json`                                          | `#160` `#165`                             |
| `Message / MessageStream / SSE（Server-Sent Events，服务端事件流）`                                                                 | assistant 输出可以流式返回，并能落库回放。                                                                   | `messages`、`message_streams`、SSE endpoint、replay endpoint。                                                                       | 一个 assistant response 可以 stream、persist chunks、support replay。                                                                                | 不做复杂多客户端协同，不做第二套实时传输主线。                     | 不得用 `RunEvent` 承载 token delta，不得把 `stream.completed` 当作 `run.completed`。 | `docs/runtime-business-integration.md`、`docs/runtime-lifecycle.md`、`packages/contracts/schemas/analysis/message*.schema.json`                        | `#158` `#161` `#162`                      |
| `Report / Decision（报告 / 决策）`                                                                                                  | 一次 run 不只输出聊天文本，还要产出报告、决策和行动建议。                                                    | `reports`、`report_sections`、`decisions`、`action_suggestions`。                                                                    | 一个 run 产出一个 report 和一个 decision，并能关联证据。                                                                                             | 不做高级报告设计器，不做复杂决策编排台。                           | 不得把 raw model output 直接当成正式报告对象。                                       | `docs/runtime-l3-golden-path.md`、`packages/contracts/schemas/reports/**`                                                                              | `#160` `#162`                             |
| `Feedback / BadCase / Evaluation（反馈 / 坏例 / 评估）`                                                                             | 用户反馈可以沉淀为坏例或评估入口，用于后续质量改进。                                                         | `feedback`、`bad_cases`、`evaluation_runs`、`evaluation_scores`、`DeepEval`（评估框架）/ `RAGAs`（RAG 质量评估框架）。               | `feedback` 可以创建 `bad case` 或 `evaluation entry`；一个基础 `evaluation run` 可以记录 `scores`。                                                  | case 数量小，不在 L3 做连续自动优化。                              | 不得把 `Feedback`、`Memory`、`Evaluation` 混成一个对象或一条写链。                   | `AGENTS.md`、`docs/runtime-lifecycle.md`、`packages/contracts/schemas/feedback/**`、`packages/contracts/schemas/evaluation/**`                         | `#163` `#165`                             |
| `Observability（可观测性，用来追踪一次运行从输入、模型调用、工具调用到报告产出的完整链路）/ Trace（调用链追踪）/ Audit（审计）`     | 一次 run 从输入、模型调用、工具调用、RAG、证据、报告到错误都能被追踪。                                       | `run_events`、`model_calls`、`tool_calls`、error records、`LangSmith`（链路调试与评估观测服务）或 `Langfuse`（调用追踪与观测服务）。 | 一个 `runId` 可以串起 model call、tool call、RAG retrieval、`SourceEvidence` 和 report。                                                             | 先接一个观测 provider，不做完整内部监控套件。                      | 不得把观测信息只留在本地日志，不回挂正式运行对象。                                   | `docs/architecture.md`、`docs/runtime-lifecycle.md`、`docs/deployment.md`                                                                              | `#159` `#160` `#161` `#165`               |
| `Cost / Latency / Error Classification（成本 / 延迟 / 错误分类）`                                                                   | 记录模型和工具调用的成本、耗时和错误类型，用于排障和后续优化。                                               | `model_calls`、`tool_calls`、`run_events`、error records。                                                                           | 模型 / 工具 latency、token / cost 占位或真实值、error type 可以存储。                                                                                | L3 不做自动成本优化器，不做复杂预算调度。                          | 不得把成本和错误只放进无类型 `metadata`。                                            | `packages/contracts/schemas/analysis/model-call.schema.json`、`packages/contracts/schemas/analysis/tool-call.schema.json`、`docs/runtime-lifecycle.md` | `#160` `#165`                             |
| `Load Test（小规模负载测试）/ Failure Simulation（故障模拟）`                                                                       | 验证健康检查、run 创建、SSE、模型失败、工具超时、SQL Guard 拒绝等基础风险。                                  | `scripts/load`、`scripts/failure-simulation`、`scripts/smoke`。                                                                      | 小规模 load script 覆盖 `/health` 和一条 run path；failure simulation 逐步覆盖 provider failure、tool timeout、SQL Guard rejection、SSE disconnect。 | 不要求生产级高并发目标，不要求完整压测平台。                       | 不得只靠口头说明存在故障演练，不得让 smoke 长期停留在 echo placeholder。             | `docs/deployment.md`、`scripts/**`、`docs/runtime-l3-golden-path.md`                                                                                   | `#161` `#164`                             |
| `Deployment（部署）/ CloudBase Run（腾讯云云托管容器运行环境）/ Resettable Preview（可重置预览环境）`                               | 后端通过 Docker 部署到 CloudBase Run，preview 环境可以重置并通过脚本恢复。                                   | `deploy/docker`、`deploy/cloudbase-run`、`scripts/build`、`scripts/package`、`scripts/deploy`、`scripts/smoke`、`scripts/rollback`。 | CloudBase Run 可以部署 runtime Docker；preview env 能跑 health / smoke；数据库 reset 通过 `migration / seed / query verify`。                        | 本地完整 MySQL / Redis / Milvus stack 不作为当前阻塞项。           | 不得把 CloudBase Functions 作为当前后端并行主部署链，不得手工改表后反推代码。        | `docs/deployment.md`、`docs/database.md`、`deploy/**`、`database/mysql/**`                                                                             | `#157` `#158` `#161` `#164`               |
| `Memory（记忆）/ L4 Hooks（L4 预留钩子）`                                                                                           | L3 先记录足够的反馈、评估、错误、成本和审计数据，为后续优化提供输入。                                        | Memory 相关表或计划对象、`ContextSnapshot`、`PermissionSnapshot`、`CostRecord`、`ErrorRecord`、`RunAuditRecord`。                    | L3 记录足够的 feedback / evaluation / error / cost / audit 数据。                                                                                    | L3 不做自动 L4 优化，不做静默长期 memory 写入。                    | 不得为了未来优化另起第二套 lifecycle 或把关键对象藏进 metadata。                     | `docs/runtime-lifecycle.md`、`docs/contracts.md`、`packages/contracts/**`                                                                              | `#163` `#165`                             |

## 3. 云端 Preview 优先策略

- 当前 `#155` 可以优先使用云端 preview 环境作为真实集成环境。
- 本地只要求 `Docker build`、基础测试、contract check、smoke client。
- 本地完整 MySQL / Redis / Milvus 复刻不是当前阻塞项。
- Preview 数据库允许 reset。
- reset 必须通过 `migration -> seed -> query verify`。
- 不能用 Navicat 或控制台手工改表结构后反推代码。
- `CloudBase Run` 是后端主部署链路。
- `CloudBase Functions` 不作为当前主部署链路。

## 4. 后续 PR 使用方式

后续 `#155` 子任务 PR 必须在 PR body 或执行报告中说明：

- 本 PR 覆盖了本文件中的哪些能力项。
- 哪些能力已经实现。
- 哪些仅完成承载位。
- 哪些是范围压缩，不是能力缺失。
- 使用了哪些事实源。
- 跑了哪些验证。
- 是否涉及 contracts / migration / deployment / env 变化。
- 是否存在 `mock / real` 双轨风险。

如果某项能力本轮只完成承载位，也必须明确写出承载位已经落在哪里，以及仍未实现的是哪一段运行链路。

## 5. 非目标

以下内容不要求在一个 PR 中一次性完成：

- 一次性实现所有 runtime 能力。
- 一次性完成全部 provider 接入。
- 一次性完成完整外部插件市场。
- 一次性完成完整审批系统。
- 一次性完成生产级高并发压测。
- 一次性完成 L4 自动优化。

这些非目标不代表可以绕过正式承载位，也不代表后续可以用散实现替代正式边界。
