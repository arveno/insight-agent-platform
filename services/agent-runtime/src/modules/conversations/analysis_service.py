"""职责：
承载 Analysis 工作区的 conversation-level orchestration / facade。

链路位置：
上游是 API routes；当前模块负责编排 Conversation、Message 和上下文入口；
下游对接 analysis_runs、LangGraph runtime、Tool Registry、Model Gateway 和 contracts。

边界：
允许组织 Conversation、Message、AnalysisTask 和上下文选择入口；
不允许拥有 AnalysisRun lifecycle，也不允许在这里实现具体 Agent 节点逻辑。

原因：
Analysis 工作区需要稳定的 conversation facade，
同时把 AnalysisRun 生命周期 owner 固定在 analysis_runs。
"""
