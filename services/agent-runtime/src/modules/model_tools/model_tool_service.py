"""职责：
承载模型、提示词、工具和 RAG 策略管理用例的模块位置。

链路位置：
上游是 API routes 或平台管理入口；当前模块编排 model_tools domain；
下游是 Model Gateway、Tool Registry 和 contracts。

边界：
允许组织 ModelConfig、RoutingPolicy、PromptVersion、ToolDefinition 和 RagStrategy；
不允许直接发起模型调用或工具执行。

原因：
模型和工具配置是运行时治理输入，需要与实际调用链路解耦，避免配置管理变成执行入口。
"""
