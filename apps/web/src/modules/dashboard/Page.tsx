import { useState } from "react";

import { ResponsivePageShell } from "../../shared/layout/containers/ResponsivePageShell";
import type { PageRouteProps } from "../../shared/navigation/navigationTypes";

import { dashboardStaticViewModel } from "./fixtures/dashboardStaticViewModel";
import { DashboardSections } from "./sections/DashboardSections";

export function DashboardPage({ onNavigate }: PageRouteProps) {
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
    <ResponsivePageShell>
      <DashboardSections
        onNavigate={onNavigate}
        onTimeRangeChange={setSelectedTimeRangeKey}
        selectedTimeRange={selectedTimeRange}
        selectedTimeRangeKey={selectedTimeRangeKey}
        viewModel={dashboardStaticViewModel}
      />
    </ResponsivePageShell>
  );
}
