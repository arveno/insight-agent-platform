import type { AnalysisWorkspaceViewModel } from "../models/analysisViewModel";
import { mapAnalysisRuntimeContractsToWorkspaceViewModel } from "../mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel";

import { analysisRuntimeContractSessionFixtures } from "./analysisRuntimeContractFixtures";

const workspaceViewModels = analysisRuntimeContractSessionFixtures.map((fixture) =>
  mapAnalysisRuntimeContractsToWorkspaceViewModel(fixture.input, {
    contextPanelNote: `${fixture.presentation.sourceRoute} · ${fixture.presentation.sourceObject} · ${fixture.presentation.timeRange}`,
    followUpComposerDraft: fixture.drafts.followUp,
    inputComposerDraft: fixture.drafts.input
  })
);

export const analysisStaticViewModel: AnalysisWorkspaceViewModel = {
  contextPanelNote:
    "当前 Analysis 使用 contracts-backed 静态数据源。切换会话、提交问题、继续追问和反馈标记都只更新页面级 UI State，不触发真实 API、Agent、Tool、RAG 或 SSE 订阅。",
  modelOptions: workspaceViewModels[0]?.modelOptions ?? [],
  sessions: workspaceViewModels.flatMap((workspaceViewModel) => workspaceViewModel.sessions)
};
