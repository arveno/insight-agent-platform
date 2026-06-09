import { translateKey, type Translate } from "../../i18n/translateKey";
import type { SharedStatusViewModel } from "../../utils/viewModelState";
import { toStatusTag } from "../../utils/viewModelState";
import { StatusTag } from "../../ui/status/StatusTag";

type StaticSectionLike = {
  descriptionKey: string;
  status: SharedStatusViewModel;
  titleKey: string;
};

export function getStaticSectionProps(t: Translate, section: StaticSectionLike) {
  const status = toStatusTag(t, section.status);

  return {
    eyebrow: translateKey(t, section.descriptionKey),
    extra: status ? <StatusTag {...status} /> : undefined,
    title: translateKey(t, section.titleKey)
  };
}
