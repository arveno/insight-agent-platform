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
const defaultSelectedNodeKey = defaultViewModel.relationshipGraph.defaultSelectedNodeKey;

function findAssetKey(viewModel: DataKnowledgeViewModel, assetKey: string) {
  return viewModel.assetItems.find((item) => item.key === assetKey)?.key ?? defaultSelectedAssetKey;
}

function findRelationshipNode(
  viewModel: DataKnowledgeViewModel,
  nodeKey: string
): DataKnowledgeRelationshipNodeViewModel | undefined {
  return viewModel.relationshipGraph.columns
    .flatMap((column) => column.nodes)
    .find((node) => node.key === nodeKey);
}

export type DataKnowledgeOverviewController = {
  filteredAssetItems: DataKnowledgeViewModel["assetItems"];
  onSearchChange: (value: string) => void;
  onSelectAsset: (key: string) => void;
  onSelectNode: (key: string) => void;
  searchValue: string;
  selectedAssetKey: string;
  selectedNode: DataKnowledgeRelationshipNodeViewModel;
  selectedNodeKey: string;
  viewModel: DataKnowledgeViewModel;
};

export function useDataKnowledgeOverviewState(
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel = defaultDataKnowledgeWorkspaceBinding
): DataKnowledgeOverviewController {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAssetKey, setSelectedAssetKey] = useState(defaultSelectedAssetKey);
  const [selectedNodeKey, setSelectedNodeKey] = useState(defaultSelectedNodeKey);
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
    findRelationshipNode(viewModel, selectedNodeKey) ??
    findRelationshipNode(viewModel, viewModel.relationshipGraph.defaultSelectedNodeKey) ??
    viewModel.relationshipGraph.columns[0].nodes[0];

  useEffect(() => {
    setSearchValue("");
    setSelectedAssetKey(defaultSelectedAssetKey);
    setSelectedNodeKey(defaultSelectedNodeKey);
  }, [workspaceBinding.workspaceId]);

  useEffect(() => {
    setSelectedNodeKey(viewModel.relationshipGraph.defaultSelectedNodeKey);
  }, [viewModel.relationshipGraph.defaultSelectedNodeKey]);

  return {
    filteredAssetItems,
    onSearchChange: setSearchValue,
    onSelectAsset: (key) => {
      setSelectedAssetKey(findAssetKey(viewModel, key));
    },
    onSelectNode: (key) => {
      setSelectedNodeKey(findRelationshipNode(viewModel, key)?.key ?? viewModel.relationshipGraph.defaultSelectedNodeKey);
    },
    searchValue,
    selectedAssetKey,
    selectedNode,
    selectedNodeKey,
    viewModel
  };
}
