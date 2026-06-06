import { useEffect, useMemo, useRef, useState } from "react";

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
  const previousAssetKeyRef = useRef(selectedAssetKey);
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
  const defaultRelationshipNodeId =
    viewModel.relationshipGraph.selectedNodeId ?? viewModel.relationshipNodeDetails[0].nodeId;

  useEffect(() => {
    setSearchValue("");
    setSelectedAssetKey(defaultSelectedAssetKey);
    setSelectedNodeId(defaultSelectedNodeId);
    previousAssetKeyRef.current = defaultSelectedAssetKey;
  }, [workspaceBinding.workspaceId]);

  useEffect(() => {
    const currentAssetKey = viewModel.selectedAsset.key;
    const hasCurrentSelection = viewModel.relationshipNodeDetails.some(
      (node) => node.nodeId === selectedNodeId
    );
    const assetChanged = previousAssetKeyRef.current !== currentAssetKey;

    previousAssetKeyRef.current = currentAssetKey;

    if (assetChanged) {
      if (selectedNodeId !== defaultRelationshipNodeId) {
        setSelectedNodeId(defaultRelationshipNodeId);
      }

      return;
    }

    if (!hasCurrentSelection && selectedNodeId !== defaultRelationshipNodeId) {
      setSelectedNodeId(defaultRelationshipNodeId);
    }
  }, [
    defaultRelationshipNodeId,
    selectedNodeId,
    viewModel.relationshipNodeDetails,
    viewModel.selectedAsset.key
  ]);

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
