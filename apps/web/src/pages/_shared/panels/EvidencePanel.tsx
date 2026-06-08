import type { StaticRightAssistSummaryViewModel } from "../../../app/models/staticViewModelTypes";
import { SourceEvidenceList } from "../../../shared/ui/evidence/SourceEvidenceList";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { toEvidenceItem } from "../adapters/viewModelAdapters";
import { translateKey } from "../text";

export type EvidencePanelProps = {
  items: StaticRightAssistSummaryViewModel["evidence"];
};

export function EvidencePanel({ items }: EvidencePanelProps) {
  const { t } = useI18n();

  return (
    <SourceEvidenceList
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => toEvidenceItem(t, item))}
    />
  );
}
