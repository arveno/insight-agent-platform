import type { ReactNode } from "react";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme";

export type ObjectListNavItem = {
  description?: ReactNode;
  key: string;
  meta?: ReactNode;
  status?: ReactNode;
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
          style={{ justifyContent: "flex-start" }}
          type="text"
        >
          {title}
        </Button>
      ) : (
        <Typography.Text strong>{title}</Typography.Text>
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
            <button
              aria-pressed={isSelected}
              key={item.key}
              onClick={() => onSelect?.(item.key)}
              style={{
                appearance: "none",
                background: isSelected ? token.colorFillSecondary : "transparent",
                border: `${shellThemeTokens.surfaceBorderWidth}px solid ${
                  isSelected ? token.colorBorder : "transparent"
                }`,
                borderRadius: shellThemeTokens.borderRadiusLG,
                cursor: "pointer",
                paddingBlock: shellThemeTokens.navPreviewPaddingBlock,
                paddingInline: shellThemeTokens.navPreviewPaddingInline,
                textAlign: "left",
                width: "100%"
              }}
              type="button"
            >
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Space
                  align="start"
                  size={token.marginXS}
                  style={{ justifyContent: "space-between", width: "100%" }}
                  wrap
                >
                  <Typography.Text
                    strong
                    style={{ color: isSelected ? token.colorText : token.colorTextSecondary }}
                  >
                    {item.title}
                  </Typography.Text>
                  {item.status}
                </Space>
                {item.description ? (
                  <Typography.Text type="secondary">{item.description}</Typography.Text>
                ) : null}
                {item.meta ? (
                  <Typography.Text type="secondary">{item.meta}</Typography.Text>
                ) : null}
              </Space>
            </button>
          );
        })}
      </Space>
    </nav>
  );
}
