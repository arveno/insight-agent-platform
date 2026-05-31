"""职责：
承载评估任务和质量回归用例编排的模块位置。

链路位置：
上游是 API routes、CI 或反馈触发流程；当前模块编排 evaluation domain；
下游是 evaluators、datasets、bad_cases 和 contracts。

边界：
允许组织 EvaluationRun、EvaluationScore 和 BadCase 流程；不允许替代业务分析或用户反馈链路。

原因：
评估是质量门禁，需要从业务执行链路中独立出来，形成可重复验证的改进闭环。
"""
