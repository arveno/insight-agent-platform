import type { ReactNode } from "react";
import { Table, type TableProps } from "antd";

import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { ErrorState, type ErrorStateProps } from "./ErrorState";

export type DataTableState =
  | { kind: "ready" }
  | { kind: "loading"; label?: string }
  | { kind: "empty"; empty?: EmptyStateProps }
  | { kind: "error"; error: ErrorStateProps };

export type DataTableProps<Row extends object> = {
  columns: TableProps<Row>["columns"];
  rowKey: TableProps<Row>["rowKey"];
  rows: Row[];
  state?: DataTableState;
  summary?: ReactNode;
};

/**
 * 高密度列表容器。
 *
 * 列定义、行操作和字段优先级由 feature / page ViewModel 注入；
 * DataTable 不定义业务列、不清洗 raw response，也不建立 Mobile 独立链路。
 */
export function DataTable<Row extends object>({
  columns,
  rowKey,
  rows,
  state = { kind: "ready" },
  summary
}: DataTableProps<Row>) {
  if (state.kind === "error") {
    return <ErrorState {...state.error} />;
  }

  return (
    <Table<Row>
      columns={columns}
      dataSource={rows}
      loading={state.kind === "loading" ? { tip: state.label } : false}
      locale={{
        emptyText: state.kind === "empty" ? <EmptyState {...state.empty} /> : null
      }}
      pagination={false}
      rowKey={rowKey}
      summary={summary ? () => summary : undefined}
    />
  );
}
