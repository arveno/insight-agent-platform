import type { StaticSectionViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { translateKey, type Translate } from "../../i18n/translateKey";
import { toStatusTag } from "../../utils/viewModelState";
import { StatusTag } from "../../ui/status/StatusTag";

export function getStaticSectionProps(t: Translate, section: StaticSectionViewModel) {
  const status = toStatusTag(t, section.status);

  return {
    eyebrow: translateKey(t, section.descriptionKey),
    title: translateKey(t, section.titleKey),
    titleSuffix: status ? <StatusTag {...status} /> : undefined
  };
}
