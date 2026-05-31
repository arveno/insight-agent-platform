"""职责：
承载分析任务和分析运行的用例编排模块位置。

链路位置：
上游是 API routes；当前模块编排 analysis domain 与 runtime；下游是 LangGraph runtime、Tool Registry、Model Gateway 和 contracts。

边界：
允许组织 AnalysisTask、AnalysisRun 和运行事件生命周期；不允许在这里实现具体 Agent 节点逻辑。

原因：
分析用例需要连接 API、domain、runtime 和契约输出，必须用 application 层稳定业务入口。
"""
