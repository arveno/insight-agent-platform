import type { ReactNode } from "react";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography, theme } from "antd";

import { shellThemeTokens, shellTypographyStyles } from "../../theme";
import type { ObjectListNavItem } from "./ObjectListNav";
import { ShellNavListItem } from "./ShellNavListItem";

export type GroupedObjectListNavGroup = {
  description?: ReactNode;
  items: ObjectListNavItem[];
  key: string;
  title: ReactNode;
};

export type GroupedObjectListNavProps = {
  action?: ReactNode;
  ariaLabel: string;
  emptyText?: ReactNode;
  groups: GroupedObjectListNavGroup[];
  onBack?: () => void;
  onSearchChange?: (value: string) => void;
  onSelect?: (key: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  selectedKey?: string;
  title: ReactNode;
};

export function GroupedObjectListNav({
  action,
  ariaLabel,
  emptyText = "暂无可用条目",
  groups,
  onBack,
  onSearchChange,
  onSelect,
  searchLabel = "搜索",
  searchPlaceholder = "搜索当前列表",
  searchValue = "",
  selectedKey,
  title
}: GroupedObjectListNavProps) {
  const { token } = theme.useToken();
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  return (
    <nav
      aria-label={ariaLabel}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.margin,
        paddingInline: shellThemeTokens.navPaddingInline,
        paddingTop: token.paddingSM
      }}
    >
      {onBack ? (
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          style={{ ...shellTypographyStyles.buttonLabel, justifyContent: "flex-start" }}
          type="text"
        >
          {title}
        </Button>
      ) : (
        <Typography.Text style={shellTypographyStyles.cardTitle}>{title}</Typography.Text>
      )}

      {onSearchChange ? (
        <Input
          aria-label={searchLabel}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          value={searchValue}
        />
      ) : null}

      {action}

      {visibleGroups.length === 0 ? (
        <Typography.Text type="secondary">{emptyText}</Typography.Text>
      ) : null}

      <Space direction="vertical" size={shellThemeTokens.navGroupGap} style={{ width: "100%" }}>
        {visibleGroups.map((group) => (
          <section key={group.key}>
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Typography.Text
                  style={{
                    ...shellTypographyStyles.navGroupLabel,
                    color: token.colorTextDescription,
                    display: "block"
                  }}
                >
                  {group.title}
                </Typography.Text>
                {group.description ? (
                  <Typography.Text
                    type="secondary"
                    style={shellTypographyStyles.cardDescription}
                  >
                    {group.description}
                  </Typography.Text>
                ) : null}
              </Space>

              <Space
                direction="vertical"
                size={shellThemeTokens.navPreviewItemGap}
                style={{ width: "100%" }}
              >
                {group.items.map((item) => {
                  const isSelected = selectedKey === item.key;

                  return (
                    <ShellNavListItem
                      ariaPressed={isSelected}
                      disabled={item.disabled}
                      icon={item.icon}
                      key={item.key}
                      label={item.title}
                      onClick={() => onSelect?.(item.key)}
                      rightContent={item.rightContent}
                      selected={isSelected}
                    />
                  );
                })}
              </Space>
            </Space>
          </section>
        ))}
      </Space>
    </nav>
  );
}
