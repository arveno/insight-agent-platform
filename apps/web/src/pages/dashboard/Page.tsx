import { useState } from "react";

import { dashboardStaticViewModel } from "../../features/static-view-models";
import type { WebPageProps } from "../_shared";
import { DashboardSections } from "./sections";

export function DashboardPage({ onNavigate }: WebPageProps) {
  const [selectedTimeRangeKey, setSelectedTimeRangeKey] = useState(
    dashboardStaticViewModel.timeRange.selectedKey
  );
  const selectedTimeRange = dashboardStaticViewModel.timeRange.options.find(
    (option) => option.key === selectedTimeRangeKey
  );

  if (!selectedTimeRange) {
    throw new Error(`Unknown dashboard time range: ${selectedTimeRangeKey}`);
  }

  return (
    <DashboardSections
      onNavigate={onNavigate}
      onTimeRangeChange={setSelectedTimeRangeKey}
      selectedTimeRange={selectedTimeRange}
      selectedTimeRangeKey={selectedTimeRangeKey}
      viewModel={dashboardStaticViewModel}
    />
  );
}
