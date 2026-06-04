import type { ReactNode } from "react";
import { Badge, Space } from "antd";

import type { StaticTabViewModel } from "../../../app/models";
import { AppTabs, useI18n } from "../../../shared";
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
