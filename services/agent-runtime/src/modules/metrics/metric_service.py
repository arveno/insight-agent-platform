"""职责：
承载指标和语义层用例编排的模块位置。

链路位置：
上游是 API routes 或 Metric Tool；当前模块编排 metrics domain；
下游是 repository 和 Metric contracts。

边界：
允许组织指标定义、公式、阈值和血缘用例；不允许在页面或 Agent 中重复实现指标口径。

原因：
企业指标必须保持同一语义和同一字段，application 层负责把指标事实源交给上层能力。
"""
