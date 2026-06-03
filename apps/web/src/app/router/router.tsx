import type { I18nMessageKey, NavigationItem } from "../../shared";

type Translate = (key: I18nMessageKey) => string;

export function createPrimaryNavigation(t: Translate): NavigationItem[] {
  return [
    { key: "dashboard", label: t("nav.dashboard") },
    { key: "analysis", label: t("nav.analysis") },
    { key: "reports", label: t("nav.reports") },
    { key: "data-knowledge", label: t("nav.dataKnowledge") },
    { key: "metrics", label: t("nav.metrics") },
    { key: "memory", label: t("nav.memory") },
    { key: "feedback", label: t("nav.feedback") },
    { key: "evaluation", label: t("nav.evaluation") },
    { key: "model-tools", label: t("nav.modelTools") },
    { key: "governance", label: t("nav.governance") },
    { key: "observability", label: t("nav.observability") },
    { key: "platform-operations", label: t("nav.platformOperations") },
    { key: "settings", label: t("nav.settings") }
  ];
}
