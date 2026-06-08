import type { I18nMessageKey } from "../../../shared/i18n/messages";
import { translateKey, type Translate } from "../../../shared/i18n/translateKey";
import type { StaticEvidenceEntranceViewModel } from "../../../shared/view-model/staticViewModelTypes";

const sourceTypeKeyByLabel: Record<string, I18nMessageKey> = {
  "DataQualityCheck / Job": "evidence.sourceType.dataQualityJob",
  "Metric / Report": "evidence.sourceType.metricReport"
};

const confidenceKeyByText: Record<string, I18nMessageKey> = {
  High: "evidence.confidence.high",
  Medium: "evidence.confidence.medium"
};

const summaryKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.summary.metricRevenue",
  "quality-job-evidence": "evidence.summary.qualityJob"
};

const titleKeyByEvidenceKey: Record<string, I18nMessageKey> = {
  "metric-revenue-evidence": "evidence.title.metricRevenue",
  "quality-job-evidence": "evidence.title.qualityJob"
};

function translateMappedText(
  t: Translate,
  value: string | undefined,
  keyMap: Record<string, I18nMessageKey>
) {
  if (!value) {
    return undefined;
  }

  const key = keyMap[value];

  return key ? translateKey(t, key) : value;
}

export function mapMetricEvidenceItem(t: Translate, item: StaticEvidenceEntranceViewModel) {
  const summaryKey = summaryKeyByEvidenceKey[item.key];
  const titleKey = titleKeyByEvidenceKey[item.key];

  return {
    confidenceText: translateMappedText(t, item.confidenceText, confidenceKeyByText),
    key: item.key,
    sourceTypeLabel: translateMappedText(t, item.sourceType, sourceTypeKeyByLabel) ?? item.sourceType,
    summary: summaryKey ? translateKey(t, summaryKey) : item.summary,
    title: titleKey ? translateKey(t, titleKey) : item.title
  };
}
