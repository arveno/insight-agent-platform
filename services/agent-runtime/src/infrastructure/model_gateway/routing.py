"""职责：
承载模型路由策略的模块位置。

链路位置：
上游是 Model Gateway；当前模块选择模型和 provider；下游是具体 provider adapter。

边界：
允许依据 RoutingPolicy、ModelConfig 和运行上下文选择模型；不允许在业务层散落模型选择逻辑。

原因：
模型选择影响成本、质量和稳定性，必须集中治理并可被审计和回放。
"""
