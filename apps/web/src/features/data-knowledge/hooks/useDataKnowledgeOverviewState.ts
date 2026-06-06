import { useEffect, useMemo, useState } from "react";

import {
  createDataKnowledgeViewModel,
  defaultDataKnowledgeWorkspaceBinding
} from "../fixtures";
import type {
  DataKnowledgeRelationshipNodeViewModel,
  DataKnowledgeViewModel,
  DataKnowledgeWorkspaceBindingViewModel
} from "../models";

const defaultViewModel = createDataKnowledgeViewModel();
const defaultSelectedAssetKey = defaultViewModel.selectedAsset.key;
const defaultSelectedNodeId =
  defaultViewModel.relationshipGraph.selectedNodeId ??
  defaultViewModel.relationshipNodeDetails[0].nodeId;

function findAssetKey(viewModel: DataKnowledgeViewModel, assetKey: string) {
  return viewModel.assetItems.find((item) => item.key === assetKey)?.key ?? defaultSelectedAssetKey;
}

function findRelationshipNode(
  viewModel: DataKnowledgeViewModel,
  nodeId: string
): DataKnowledgeRelationshipNodeViewModel | undefined {
  return viewModel.relationshipNodeDetails.find((node) => node.nodeId === nodeId);
}

export type DataKnowledgeOverviewController = {
  filteredAssetItems: DataKnowledgeViewModel["assetItems"];
  onSearchChange: (value: string) => void;
  onSelectAsset: (key: string) => void;
  onSelectNode: (nodeId: string) => void;
  searchValue: string;
  selectedAssetKey: string;
  selectedNode: DataKnowledgeRelationshipNodeViewModel;
  selectedNodeId: string;
  viewModel: DataKnowledgeViewModel;
};

export function useDataKnowledgeOverviewState(
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel = defaultDataKnowledgeWorkspaceBinding
): DataKnowledgeOverviewController {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAssetKey, setSelectedAssetKey] = useState(defaultSelectedAssetKey);
  const [selectedNodeId, setSelectedNodeId] = useState(defaultSelectedNodeId);
  const viewModel = useMemo(
    () => createDataKnowledgeViewModel(selectedAssetKey, workspaceBinding),
    [selectedAssetKey, workspaceBinding]
  );
  const filteredAssetItems = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return viewModel.assetItems;
    }

    return viewModel.assetItems.filter((item) => item.title.toLowerCase().includes(normalizedQuery));
  }, [searchValue, viewModel.assetItems]);
  const selectedNode =
    findRelationshipNode(viewModel, selectedNodeId) ??
    findRelationshipNode(viewModel, viewModel.relationshipGraph.selectedNodeId ?? "") ??
    viewModel.relationshipNodeDetails[0];

  useEffect(() => {
    setSearchValue("");
    setSelectedAssetKey(defaultSelectedAssetKey);
    setSelectedNodeId(defaultSelectedNodeId);
  }, [workspaceBinding.workspaceId]);

  useEffect(() => {
    setSelectedNodeId(
      viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId
    );
  }, [viewModel.relationshipGraph.selectedNodeId, viewModel.relationshipNodeDetails]);

  return {
    filteredAssetItems,
    onSearchChange: setSearchValue,
    onSelectAsset: (key) => {
      setSelectedAssetKey(findAssetKey(viewModel, key));
    },
    onSelectNode: (nodeId) => {
      setSelectedNodeId(
        findRelationshipNode(viewModel, nodeId)?.nodeId ??
          viewModel.relationshipGraph.selectedNodeId ??
          viewModel.relationshipNodeDetails[0].nodeId
      );
    },
    searchValue,
    selectedAssetKey,
    selectedNode,
    selectedNodeId,
    viewModel
  };
}
