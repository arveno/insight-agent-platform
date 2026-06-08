import type {
  StaticEvidenceEntranceViewModel,
  StaticTraceEntranceViewModel
} from "../../app/shell/models/staticViewModelTypes";
import type { I18nMessageKey } from "../../shared/i18n/messages";
import type { Translate } from "../../shared/i18n/translateKey";
import { translateKey } from "../../shared/i18n/translateKey";
import { toRiskBadge, toStatusTag } from "../../shared/utils/viewModelState";

const evidenceSourceTypeKeyByLabel: Record<string, I18nMessageKey> = {
  "DataQualityCheck / Job": "evidence.sourceType.dataQualityJob",
  "Metric / Report": "evidence.sourceType.metricReport"
};

const evidenceConfidenceKeyByText: Record<string, I18nMessageKey> = {
  High: "evidence.confidence.high",
  Medium: "evidence.confidence.medium"
};

const evidenceSummaryKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.summary.metricRevenue",
  "quality-job-evidence": "evidence.summary.qualityJob"
};

const evidenceTitleKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.title.metricRevenue",
  "quality-job-evidence": "evidence.title.qualityJob"
};

const traceTitleKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.title.analysisRunSummary",
  "tool-permission-trace": "trace.title.toolPermissionCheck"
};

const traceEventKeyByTraceKey: Record<string, I18nMessageKey> = {
  "analysis-run-trace": "trace.event.analysisRunSummary",
  "tool-permission-trace": "trace.event.toolPermissionCheck"
};

function translateMappedText(
  t: Translate,
  value: string | undefined,
  keyMap: Record<string, I18nMessageKey>
): string | undefined {
  if (!value) {
    return undefined;
  }

  const key = keyMap[value];

  return key ? translateKey(t, key) : value;
}

export function toEvidenceItem(t: Translate, item: StaticEvidenceEntranceViewModel) {
  const summaryKey = evidenceSummaryKeyByEvidenceKey[item.key];
  const titleKey = evidenceTitleKeyByEvidenceKey[item.key];

  return {
    confidenceText: translateMappedText(t, item.confidenceText, evidenceConfidenceKeyByText),
    key: item.key,
    sourceTypeLabel:
      translateMappedText(t, item.sourceType, evidenceSourceTypeKeyByLabel) ?? item.sourceType,
    summary: summaryKey ? translateKey(t, summaryKey) : item.summary,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}

export function toTraceItem(t: Translate, item: StaticTraceEntranceViewModel) {
  const eventKey = traceEventKeyByTraceKey[item.key];
  const titleKey = traceTitleKeyByTraceKey[item.key];

  return {
    description: item.latencyText,
    key: item.key,
    risk: toRiskBadge(t, item.risk),
    status: toStatusTag(t, item.status),
    timestampText: eventKey ? translateKey(t, eventKey) : item.eventId,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}
