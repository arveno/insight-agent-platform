import type { AnalysisWorkspaceViewModel } from "../models/analysisViewModel";
import { mapAnalysisRuntimeContractsToWorkspaceViewModel } from "../mappers/mapAnalysisRuntimeContractsToWorkspaceViewModel";

import { analysisRuntimeContractSessionFixtures } from "./analysisRuntimeContractFixtures";

const workspaceViewModels = analysisRuntimeContractSessionFixtures.map((fixture) =>
  mapAnalysisRuntimeContractsToWorkspaceViewModel(fixture.input, {
    contextPanelNote: "点击消息后，右侧会显示对应的分析详情与上下文。",
    followUpComposerDraft: fixture.drafts.followUp,
    inputComposerDraft: fixture.drafts.input
  })
);

export const analysisStaticViewModel: AnalysisWorkspaceViewModel = {
  contextPanelNote:
    "右侧会根据当前消息显示分析详情。当前页面使用静态示例数据。",
  modelOptions: workspaceViewModels[0]?.modelOptions ?? [],
  sessions: workspaceViewModels.flatMap((workspaceViewModel) => workspaceViewModel.sessions)
};
