import type { ReactNode } from "react";
import { Badge, Menu, Space } from "antd";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";

export type NavigationItem = {
  badge?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: ReactNode;
};

export type NavigationGroup = {
  items: NavigationItem[];
  key: string;
  label?: ReactNode;
};

export type LeftNavProps = {
  groups: NavigationGroup[];
  onSelect?: (key: string) => void;
  selectedKey?: string;
};

function createMenuItem(item: NavigationItem): MenuItemType {
  return {
    disabled: item.disabled,
    icon: item.icon,
    key: item.key,
    label: (
      <Space>
        {item.label}
        {item.badge ? <Badge count={item.badge} size="small" /> : null}
      </Space>
    )
  };
}

/**
 * Web 左侧导航容器。
 *
 * 导航分组和 label 由调用方从 i18n / ViewModel 注入；
 * 组件不新增路由、不删除低频入口，也不维护独立导航事实源。
 */
export function LeftNav({ groups, onSelect, selectedKey }: LeftNavProps) {
  const items = groups.reduce<ItemType[]>((result, group) => {
    if (!group.label) {
      result.push(...group.items.map(createMenuItem));
      return result;
    }

    result.push({
      children: group.items.map(createMenuItem),
      key: group.key,
      label: group.label,
      type: "group"
    });
    return result;
  }, []);

  return (
    <Menu
      items={items}
      mode="inline"
      onClick={({ key }) => onSelect?.(String(key))}
      selectedKeys={selectedKey ? [selectedKey] : []}
    />
  );
}
