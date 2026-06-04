import type { StaticSummaryItemViewModel } from "../../../app/models";
import { SummaryCardGrid } from "../lists";

export type ReportEntranceListProps = {
  items: StaticSummaryItemViewModel[];
};

export function ReportEntranceList({ items }: ReportEntranceListProps) {
  return <SummaryCardGrid items={items} />;
}
