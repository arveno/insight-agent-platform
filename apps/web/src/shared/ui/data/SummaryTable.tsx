import { Typography } from "antd";

import type { StaticSummaryItemViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";
import { toRiskBadge, toStatusTag } from "../../utils/viewModelState";

import { DataTable } from "./DataTable";
import { StatusTag } from "../status/StatusTag";

export type SummaryTableProps = {
  items: StaticSummaryItemViewModel[];
};

export function SummaryTable({ items }: SummaryTableProps) {
  const { t } = useI18n();

  return (
    <DataTable<StaticSummaryItemViewModel>
      columns={[
        {
          dataIndex: "label",
          title: translateKey(t, "table.column.item")
        },
        {
          dataIndex: "value",
          title: translateKey(t, "table.column.value")
        },
        {
          key: "status",
          render: (_, row) => (row.status ? <StatusTag {...toStatusTag(t, row.status)!} /> : null),
          title: translateKey(t, "table.column.status")
        },
        {
          key: "risk",
          render: (_, row) => {
            const risk = toRiskBadge(t, row.risk);
            return risk ? <Typography.Text>{risk.label}</Typography.Text> : null;
          },
          title: translateKey(t, "table.column.risk")
        },
        {
          dataIndex: "description",
          title: translateKey(t, "table.column.description")
        }
      ]}
      rowKey="key"
      rows={items}
      state={
        items.length > 0
          ? { kind: "ready" }
          : { kind: "empty", empty: { title: translateKey(t, "state.empty.default.title") } }
      }
    />
  );
}
