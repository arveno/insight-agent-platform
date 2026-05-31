"""职责：
承载受控 SQL 查询工具的模块位置。

链路位置：
上游是 Tool Registry；当前模块表示 SQL 工具适配边界；下游是 governance/sql_guard 和 repository 层。

边界：
允许定义 SQL 工具契约和受控执行入口；不允许模型直接拼接或执行 SQL，不允许绕过 SQL Guard。

原因：
SQL 是高风险工具，必须通过注册、权限、审计和治理链路后才能接触数据访问层。
"""
