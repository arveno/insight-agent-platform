import { SelectableList } from "../../../shared/ui/lists/SelectableList";
import type { MetricsOverviewController } from "../hooks/useMetricsOverviewState";

export type MetricsListNavProps = {
  controller: MetricsOverviewController;
  onBack: () => void;
};

export function MetricsListNav({ controller, onBack }: MetricsListNavProps) {
  return (
    <SelectableList
      ariaLabel="Metrics navigation"
      emptyText="暂无匹配指标"
      items={controller.filteredMetrics.map((metric) => ({
        key: metric.key,
        title: metric.metricName
      }))}
      onBack={onBack}
      onSearchChange={controller.onSearchChange}
      onSelect={controller.onSelectMetric}
      searchLabel="搜索指标"
      searchPlaceholder="搜索指标"
      searchValue={controller.searchValue}
      selectedKey={controller.selectedMetricKey}
      title="指标"
    />
  );
}
