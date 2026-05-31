"""职责：
承载 Memory 管理用例编排的模块位置。

链路位置：
上游是 API routes、runtime 或 Memory Tool；当前模块编排 memory domain；下游是 memory 策略和 repository。

边界：
允许组织 MemoryItem 的查询、写入和治理入口；不允许把 Feedback 或 Evaluation 作为 Memory 写入。

原因：
Memory 会长期影响 Agent 行为，需要由 application 层统一控制来源、类型和生命周期。
"""
