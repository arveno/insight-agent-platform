import type { StaticRightAssistSummaryViewModel } from "../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../shared/i18n/I18nProvider";
import { translateKey } from "../../shared/i18n/translateKey";

import { toTraceItem } from "../analysis/viewModelAdapters";
import { TraceTimeline } from "./TraceTimeline";

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
