"""职责：
承载观测与监控查询用例编排的模块位置。

链路位置：
上游是 API routes 或平台运维入口；当前模块编排 observability domain；下游是 trace、metrics、logging 和 cost。

边界：
允许组织运行链路、指标、日志和成本查询；不允许把观测数据当作业务 contract 的事实源。

原因：
观测数据服务排障和运营，需要和业务对象分离，避免监控字段污染核心契约。
"""
