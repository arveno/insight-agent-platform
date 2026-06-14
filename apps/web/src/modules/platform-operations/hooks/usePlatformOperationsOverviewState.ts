import { useEffect, useMemo, useState } from "react";

import { createPlatformOperationsViewModel } from "../fixtures/platformOperationsStaticViewModel";
import type {
  PlatformOperationsViewModel,
  PlatformOperationsWorkspaceBinding
} from "../models/platformOperationsViewModel";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";

const defaultSelectedOperationKey = createPlatformOperationsViewModel().selectedOperation.key;

function findOperationKey(viewModel: PlatformOperationsViewModel, operationKey: string) {
  return (
    viewModel.operationItems.find((operation) => operation.key === operationKey)?.key ??
    defaultSelectedOperationKey
  );
}

export type PlatformOperationsOverviewController = {
  onSelectOperation: (key: string) => void;
  selectedOperationKey: string;
  viewModel: PlatformOperationsViewModel;
};

export function usePlatformOperationsOverviewState(
  workspaceBinding?: PlatformOperationsWorkspaceBinding
): PlatformOperationsOverviewController {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const resolvedWorkspaceBinding = workspaceBinding ?? currentWorkspaceBinding;
  const [selectedOperationKey, setSelectedOperationKey] = useState(defaultSelectedOperationKey);
  const viewModel = useMemo(
    () => createPlatformOperationsViewModel(selectedOperationKey, resolvedWorkspaceBinding),
    [resolvedWorkspaceBinding, selectedOperationKey]
  );

  useEffect(() => {
    setSelectedOperationKey(defaultSelectedOperationKey);
  }, [resolvedWorkspaceBinding.workspaceId]);

  return {
    onSelectOperation: (key) => {
      setSelectedOperationKey(findOperationKey(viewModel, key));
    },
    selectedOperationKey,
    viewModel
  };
}
