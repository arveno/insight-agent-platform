"""职责：
承载治理策略决策的模块位置。

链路位置：
上游是 application、runtime、tools 或 API 的权限请求；当前模块处理 policy 判断；下游是 sql_guard、tool_permission、data_access 和 audit。

边界：
允许统一判断权限、风险和策略命中；不允许业务模块绕过治理策略直接访问高风险能力。

原因：
企业场景需要统一的权限和风险口径，策略引擎是防止分散判断和权限漂移的中心边界。
"""
