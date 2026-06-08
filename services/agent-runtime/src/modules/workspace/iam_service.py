"""职责：
承载 IAM 用例编排的模块位置。

链路位置：
上游是 API routes；当前模块编排 iam domain；下游是 governance、repository 和 contract response。

边界：
允许组织用户、角色和权限用例；不允许把权限判断散落到工具、Agent 或前端。

原因：
身份和权限是所有企业能力的前置条件，必须通过统一 application 边界协调治理链路。
"""
