import type { StaticSummaryItemViewModel } from "../../../app/models/staticViewModelTypes";
import { SummaryCardGrid } from "../lists/SummaryCardGrid";

export type ReportEntranceListProps = {
  items: StaticSummaryItemViewModel[];
};

export function ReportEntranceList({ items }: ReportEntranceListProps) {
  return <SummaryCardGrid items={items} />;
}
