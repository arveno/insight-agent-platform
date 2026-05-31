"""职责：
承载评估回归检查的模块位置。

链路位置：
上游是 evaluation datasets、bad cases 和历史运行结果；当前模块表示回归评估边界；下游是 EvaluationRun、EvaluationScore 和 BadCase contract。

边界：
允许组织评估任务和回归验证入口；不允许在这里实现业务分析逻辑或替代用户反馈。

原因：
回归评估用于防止 Agent 能力退化，需要和 Memory、Feedback 分域，形成可重复验证的质量门禁。
"""
