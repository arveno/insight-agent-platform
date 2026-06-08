import type { StaticRightAssistSummaryViewModel } from "../../../shared/view-model/staticViewModelTypes";
import { toTraceItem } from "../../../shared/view-model/staticViewModelAdapters";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../../../shared/i18n/translateKey";
import { EventTimeline } from "../../../shared/ui/lists/EventTimeline";

export type TracePanelProps = {
  items: NonNullable<StaticRightAssistSummaryViewModel["traces"]>;
};

export function TracePanel({ items }: TracePanelProps) {
  const { t } = useI18n();

  return (
    <EventTimeline
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => {
        const traceItem = toTraceItem(t, item);

        return item.status.status === "ready" ? { ...traceItem, status: undefined } : traceItem;
      })}
    />
  );
}
