import { useEffect, useMemo, useState } from "react";

import { createPlatformOperationsViewModel, defaultPlatformOperationsWorkspaceBinding } from "../fixtures/platformOperationsStaticViewModel";
import type { PlatformOperationsViewModel, PlatformOperationsWorkspaceBinding } from "../models/platformOperationsViewModel";

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
  workspaceBinding: PlatformOperationsWorkspaceBinding = defaultPlatformOperationsWorkspaceBinding
): PlatformOperationsOverviewController {
  const [selectedOperationKey, setSelectedOperationKey] = useState(defaultSelectedOperationKey);
  const viewModel = useMemo(
    () => createPlatformOperationsViewModel(selectedOperationKey, workspaceBinding),
    [selectedOperationKey, workspaceBinding]
  );

  useEffect(() => {
    setSelectedOperationKey(defaultSelectedOperationKey);
  }, [workspaceBinding.workspaceId]);

  return {
    onSelectOperation: (key) => {
      setSelectedOperationKey(findOperationKey(viewModel, key));
    },
    selectedOperationKey,
    viewModel
  };
}
