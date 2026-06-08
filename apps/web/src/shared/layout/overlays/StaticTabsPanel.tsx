import type { ReactNode } from "react";
import { Badge, Space } from "antd";

import type { StaticTabViewModel } from "../../../app/shell/models/staticViewModelTypes";
import { useI18n } from "../../i18n/I18nProvider";
import { translateKey } from "../../i18n/translateKey";

import { AppTabs } from "./AppTabs";

export type StaticTabsPanelProps = {
  childrenByKey: Record<string, ReactNode>;
  tabs: StaticTabViewModel[];
};

export function StaticTabsPanel({ childrenByKey, tabs }: StaticTabsPanelProps) {
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

export { StaticTabsPanel as TabsPanel };
