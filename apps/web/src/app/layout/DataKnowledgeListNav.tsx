import type { DataKnowledgeOverviewController } from "../../features/data-knowledge/hooks";
import { GroupedObjectListNav, useI18n } from "../../shared";

export type DataKnowledgeListNavProps = {
  controller: DataKnowledgeOverviewController;
  onBack: () => void;
};

export function DataKnowledgeListNav({
  controller,
  onBack
}: DataKnowledgeListNavProps) {
  const { t } = useI18n();
  const groupedItems = [
    {
      items: controller.filteredAssetItems
        .filter((item) => item.kind === "data_source")
        .map((item) => ({
          key: item.key,
          title: item.title
        })),
      key: "data-assets",
      title: t("page.dataKnowledge.nav.group.data")
    },
    {
      items: controller.filteredAssetItems
        .filter((item) => item.kind === "knowledge_document")
        .map((item) => ({
          key: item.key,
          title: item.title
        })),
      key: "knowledge-docs",
      title: t("page.dataKnowledge.nav.group.docs")
    }
  ];

  return (
    <GroupedObjectListNav
      ariaLabel="Data & Knowledge navigation"
      emptyText={t("page.dataKnowledge.nav.empty")}
      groups={groupedItems}
      onBack={onBack}
      onSearchChange={controller.onSearchChange}
      onSelect={controller.onSelectAsset}
      searchLabel={t("page.dataKnowledge.nav.searchLabel")}
      searchPlaceholder={t("page.dataKnowledge.nav.searchPlaceholder")}
      searchValue={controller.searchValue}
      selectedKey={controller.selectedAssetKey}
      title={t("page.dataKnowledge.nav.title")}
    />
  );
}
