"""职责：
承载运行链路 trace 事件的模块位置。

链路位置：
上游是 API、runtime、tools 和 model_gateway；当前模块归集 trace；
下游是观测后端和 RunEvent contract。

边界：
允许记录请求、节点、工具和模型调用的链路标识；不允许把 trace 当作业务状态事实源。

原因：
Agent 执行跨节点、工具和模型，必须用统一 trace 还原链路和定位失败点。
"""
