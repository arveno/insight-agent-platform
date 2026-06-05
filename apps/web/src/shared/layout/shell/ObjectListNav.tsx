import type { ReactNode } from "react";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography, theme } from "antd";

import { shellThemeTokens, shellTypographyStyles } from "../../theme";
import { ShellNavListItem } from "./ShellNavListItem";

export type ObjectListNavItem = {
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  rightContent?: ReactNode;
  title: ReactNode;
};

export type ObjectListNavProps = {
  action?: ReactNode;
  ariaLabel: string;
  emptyText?: ReactNode;
  items: ObjectListNavItem[];
  onBack?: () => void;
  onSearchChange?: (value: string) => void;
  onSelect?: (key: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  selectedKey?: string;
  title: ReactNode;
};

export function ObjectListNav({
  action,
  ariaLabel,
  emptyText = "暂无可用条目",
  items,
  onBack,
  onSearchChange,
  onSelect,
  searchLabel = "搜索",
  searchPlaceholder = "搜索当前列表",
  searchValue = "",
  selectedKey,
  title
}: ObjectListNavProps) {
  const { token } = theme.useToken();

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

      <Space
        direction="vertical"
        size={shellThemeTokens.navPreviewItemGap}
        style={{ width: "100%" }}
      >
        {items.length === 0 ? (
          <Typography.Text type="secondary">{emptyText}</Typography.Text>
        ) : null}
        {items.map((item) => {
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
    </nav>
  );
}
