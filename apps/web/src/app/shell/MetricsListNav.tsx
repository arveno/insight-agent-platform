import type { MetricsOverviewController } from "../../modules/metrics/hooks/useMetricsOverviewState";
import { ObjectListNav } from "../../shared/layout/shell/ObjectListNav";

export type MetricsListNavProps = {
  controller: MetricsOverviewController;
  onBack: () => void;
};

export function MetricsListNav({ controller, onBack }: MetricsListNavProps) {
  return (
    <ObjectListNav
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
