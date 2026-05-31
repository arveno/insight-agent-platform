"""职责：
承载用户反馈用例编排的模块位置。

链路位置：
上游是 API routes 或前端反馈入口；当前模块编排 feedback domain；下游是 Feedback contract、bad case 和 evaluation 触发点。

边界：
允许记录用户对本次结果的反馈和纠正；不允许把反馈直接当作系统评估结论或长期 Memory。

原因：
Feedback 是用户观点，需要和系统 Evaluation、长期 Memory 保持明确分域。
"""
