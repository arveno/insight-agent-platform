"""职责：
承载业务看板用例编排的模块位置。

链路位置：
上游是 API routes 或前端 dashboard 页面；当前模块编排 dashboard domain；下游是 metrics、reports 和 contract response。

边界：
允许聚合已契约化的指标、报告和状态；不允许直接拼装数据库字段或模型原始输出给 UI。

原因：
Dashboard 面向稳定经营视图，需要从 contracts 和 ViewModel 链路获取数据，避免前端消费 raw response。
"""
