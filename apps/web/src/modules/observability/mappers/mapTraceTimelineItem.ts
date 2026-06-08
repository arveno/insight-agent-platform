import type { I18nMessageKey } from "../../../shared/i18n/messages";
import { translateKey, type Translate } from "../../../shared/i18n/translateKey";
import { toRiskBadge, toStatusTag } from "../../../shared/utils/viewModelState";
import type { StaticTraceEntranceViewModel } from "../../../shared/view-model/staticViewModelTypes";

const titleKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.title.analysisRunSummary",
  "tool-permission-trace": "trace.title.toolPermissionCheck"
};

const eventKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.event.analysisRunSummary",
  "tool-permission-trace": "trace.event.toolPermissionCheck"
};

export function mapTraceTimelineItem(t: Translate, item: StaticTraceEntranceViewModel) {
  const eventKey = eventKeyByTraceKey[item.key];
  const titleKey = titleKeyByTraceKey[item.key];

  return {
    description: item.latencyText,
    key: item.key,
    risk: toRiskBadge(t, item.risk),
    status: toStatusTag(t, item.status),
    timestampText: eventKey ? translateKey(t, eventKey) : item.eventId,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}
