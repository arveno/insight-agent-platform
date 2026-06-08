"""职责：
承载 Memory 读写工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 Memory Tool 边界；下游是 memory 策略模块和 memory contract。

边界：
允许按 user / workspace / analysis / decision 类型读写记忆；
不允许把 Feedback 或 Evaluation 混入 Memory。

原因：
Memory 是长期状态，需要和一次性反馈、评估结果分域，避免 Agent 上下文污染。
"""
