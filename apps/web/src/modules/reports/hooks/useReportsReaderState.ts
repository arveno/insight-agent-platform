import { useEffect, useMemo, useState } from "react";

import { createReportsViewModel, reportCatalog } from "../fixtures/reportsStaticViewModel";
import type { ReportsViewModel, ReportsWorkspaceBinding } from "../models/reportsViewModel";
import { useCurrentWorkspaceBinding } from "../../../shared/workspace/CurrentWorkspaceBindingProvider";

const defaultSelectedReport = reportCatalog[0];

function findReportByKey(reportKey: string) {
  return reportCatalog.find((report) => report.key === reportKey) ?? defaultSelectedReport;
}

export type ReportsReaderController = {
  filteredReports: ReportsViewModel["reports"];
  onSearchChange: (value: string) => void;
  onSelectReport: (key: string) => void;
  searchValue: string;
  selectedReportKey: string;
  viewModel: ReportsViewModel;
};

export function useReportsReaderState(
  workspaceBinding?: ReportsWorkspaceBinding
): ReportsReaderController {
  const currentWorkspaceBinding = useCurrentWorkspaceBinding();
  const resolvedWorkspaceBinding = workspaceBinding ?? currentWorkspaceBinding;
  const [searchValue, setSearchValue] = useState("");
  const [selectedReportKey, setSelectedReportKey] = useState(defaultSelectedReport.key);
  const viewModel = useMemo(
    () => createReportsViewModel(resolvedWorkspaceBinding, selectedReportKey),
    [resolvedWorkspaceBinding, selectedReportKey]
  );
  const filteredReports = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return viewModel.reports;
    }

    return viewModel.reports.filter((report) =>
      report.title.toLowerCase().includes(normalizedQuery)
    );
  }, [searchValue, viewModel.reports]);

  useEffect(() => {
    setSearchValue("");
    setSelectedReportKey(defaultSelectedReport.key);
  }, [resolvedWorkspaceBinding.workspaceId]);

  return {
    filteredReports,
    onSearchChange: setSearchValue,
    onSelectReport: (key) => {
      setSelectedReportKey(findReportByKey(key).key);
    },
    searchValue,
    selectedReportKey,
    viewModel
  };
}
