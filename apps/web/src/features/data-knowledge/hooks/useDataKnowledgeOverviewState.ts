import { useEffect, useMemo, useState } from "react";

import {
  createDataKnowledgeViewModel,
  defaultDataKnowledgeWorkspaceBinding
} from "../fixtures";
import type {
  DataKnowledgeViewModel,
  DataKnowledgeWorkspaceBindingViewModel
} from "../models";

const defaultSelectedAssetKey = createDataKnowledgeViewModel().selectedAsset.key;

function findAssetKey(viewModel: DataKnowledgeViewModel, assetKey: string) {
  return viewModel.assetItems.find((item) => item.key === assetKey)?.key ?? defaultSelectedAssetKey;
}

export type DataKnowledgeOverviewController = {
  filteredAssetItems: DataKnowledgeViewModel["assetItems"];
  onSearchChange: (value: string) => void;
  onSelectAsset: (key: string) => void;
  searchValue: string;
  selectedAssetKey: string;
  viewModel: DataKnowledgeViewModel;
};

export function useDataKnowledgeOverviewState(
  workspaceBinding: DataKnowledgeWorkspaceBindingViewModel = defaultDataKnowledgeWorkspaceBinding
): DataKnowledgeOverviewController {
  const [searchValue, setSearchValue] = useState("");
  const [selectedAssetKey, setSelectedAssetKey] = useState(defaultSelectedAssetKey);
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

  useEffect(() => {
    setSearchValue("");
    setSelectedAssetKey(defaultSelectedAssetKey);
  }, [workspaceBinding.workspaceId]);

  return {
    filteredAssetItems,
    onSearchChange: setSearchValue,
    onSelectAsset: (key) => {
      setSelectedAssetKey(findAssetKey(viewModel, key));
    },
    searchValue,
    selectedAssetKey,
    viewModel
  };
}
