"""职责：
承载决策级长期记忆的读写策略位置。

链路位置：
上游是 report / decision application 用例；当前模块处理 decision memory 边界；
下游是 memory repository、Decision contract 和 MemoryItem contract。

边界：
允许记录已采纳决策、行动建议和后续效果；不允许把未确认建议当作已执行决策。

原因：
决策记忆会影响后续经营分析和建议优先级，必须和报告生成、用户反馈保持清晰边界。
"""
