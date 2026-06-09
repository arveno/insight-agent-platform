import { SelectableList } from "../../../shared/ui/lists/SelectableList";
import type { ReportsReaderController } from "../hooks/useReportsReaderState";

export type ReportsListNavProps = {
  controller: ReportsReaderController;
  onBack: () => void;
};

export function ReportsListNav({ controller, onBack }: ReportsListNavProps) {
  return (
    <SelectableList
      ariaLabel="Reports navigation"
      emptyText="暂无匹配报告"
      items={controller.filteredReports.map((report) => ({
        key: report.key,
        title: report.title
      }))}
      onBack={onBack}
      onSearchChange={controller.onSearchChange}
      onSelect={controller.onSelectReport}
      searchLabel="搜索报告"
      searchPlaceholder="搜索报告"
      searchValue={controller.searchValue}
      selectedKey={controller.selectedReportKey}
      title="报告"
    />
  );
}
