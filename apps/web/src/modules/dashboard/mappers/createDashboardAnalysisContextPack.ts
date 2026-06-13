import type { AnalysisTaskContextPack } from "@insight-agent/contracts/generated/typescript";

import {
  createAnalysisContextPackFromTree,
  findInspectorTreeNodeById
} from "../../../shared/navigation/analysisContextPack";
import type { DashboardSurfaceViewModel } from "../models/dashboardViewModel";

export function createDashboardAnalysisContextPack(args: {
  nodeId?: string;
  suggestedPrompt: string;
  viewModel: DashboardSurfaceViewModel;
}): AnalysisTaskContextPack {
  const selectedNode = args.nodeId
    ? findInspectorTreeNodeById(args.viewModel.root, args.nodeId)
    : args.viewModel.root;

  if (!selectedNode) {
    throw new Error(`Dashboard context node not found: ${args.nodeId}`);
  }

  return createAnalysisContextPackFromTree({
    capturedAt: args.viewModel.lastUpdatedAt,
    root: selectedNode,
    suggestedPrompt: args.suggestedPrompt
  });
}
