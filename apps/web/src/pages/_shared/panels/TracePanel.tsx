import type { StaticRightAssistSummaryViewModel } from "../../../app/models";
import { TraceTimeline, useI18n } from "../../../shared";
import { toTraceItem } from "../adapters";
import { translateKey } from "../text";

export type TracePanelProps = {
  items: NonNullable<StaticRightAssistSummaryViewModel["traces"]>;
};

export function TracePanel({ items }: TracePanelProps) {
  const { t } = useI18n();

  return (
    <TraceTimeline
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => toTraceItem(t, item))}
    />
  );
}
