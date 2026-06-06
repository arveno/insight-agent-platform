import { Space, Typography } from "antd";

import type { DataKnowledgeOverviewController } from "../../features/data-knowledge/hooks";
import { ObjectListNav, useI18n } from "../../shared";

export type DataKnowledgeListNavProps = {
  controller: DataKnowledgeOverviewController;
  onBack: () => void;
};

export function DataKnowledgeListNav({
  controller,
  onBack
}: DataKnowledgeListNavProps) {
  const { t } = useI18n();

  return (
    <ObjectListNav
      ariaLabel="Data & Knowledge navigation"
      emptyText={t("page.dataKnowledge.nav.empty")}
      items={controller.filteredAssetItems.map((item) => ({
        key: item.key,
        rightContent: (
          <Space size={6}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {item.kind === "data_source"
                ? t("page.dataKnowledge.assetKind.dataSource")
                : t("page.dataKnowledge.assetKind.knowledgeDocument")}
            </Typography.Text>
            {item.risk ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {item.risk.level}
              </Typography.Text>
            ) : item.status ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {item.status.status}
              </Typography.Text>
            ) : null}
          </Space>
        ),
        title: item.title
      }))}
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
