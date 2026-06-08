import type { ReactNode } from "react";
import { Badge, Space } from "antd";

import type { StaticTabViewModel } from "../../../app/models/staticViewModelTypes";
import { AppTabs } from "../../../shared/layout/overlays/AppTabs";
import { useI18n } from "../../../shared/i18n/I18nProvider";
import { translateKey } from "../text";

export type TabsPanelProps = {
  childrenByKey: Record<string, ReactNode>;
  tabs: StaticTabViewModel[];
};

export function TabsPanel({ childrenByKey, tabs }: TabsPanelProps) {
  const { t } = useI18n();

  return (
    <AppTabs
      items={tabs.map((tab) => ({
        children: childrenByKey[tab.key],
        key: tab.key,
        label: (
          <Space>
            {translateKey(t, tab.labelKey)}
            {typeof tab.count === "number" ? <Badge count={tab.count} size="small" /> : null}
          </Space>
        )
      }))}
    />
  );
}
