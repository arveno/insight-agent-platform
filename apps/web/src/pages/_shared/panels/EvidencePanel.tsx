import type { StaticRightAssistSummaryViewModel } from "../../../app/models";
import { SourceEvidenceList, useI18n } from "../../../shared";
import { toEvidenceItem } from "../adapters";
import { translateKey } from "../text";

export type EvidencePanelProps = {
  items: StaticRightAssistSummaryViewModel["evidence"];
};

export function EvidencePanel({ items }: EvidencePanelProps) {
  const { t } = useI18n();

  return (
    <SourceEvidenceList
      empty={{ title: translateKey(t, "state.empty.default.title") }}
      items={items.map((item) => toEvidenceItem(item))}
    />
  );
}
