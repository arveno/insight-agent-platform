import type { StaticRightAssistSummaryViewModel } from "../../../app/models/staticViewModelTypes";
import { TraceTimeline } from "../../../shared/ui/trace/TraceTimeline";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toTraceItem } from "../adapters/viewModelAdapters";
import { translateKey } from "../text";

export type TracePanelProps = {
  items: NonNullable<StaticRightAssistSummaryViewModel["traces"]>;
};

export function TracePanel({ items }: TracePanelProps) {
  const { t } = useI18n();

  return (
    <TraceTimeline
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => {
        const traceItem = toTraceItem(t, item);

        return item.status.status === "ready" ? { ...traceItem, status: undefined } : traceItem;
      })}
    />
  );
}
