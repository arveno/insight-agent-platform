"""职责：
承载用户级长期记忆的读写策略位置。

链路位置：
上游是 Memory Tool 或 application 用例；当前模块处理 user memory 边界；
下游是 memory repository 和 MemoryItem contract。

边界：
允许保存稳定的用户偏好和授权范围内的长期信息；不允许保存一次性 Feedback 或 Evaluation 结果。

原因：
用户记忆会长期影响 Agent 行为，必须和工作区、分析过程、决策记忆分域管理。
"""
