import type { ReactNode } from "react";
import { RightOutlined } from "@ant-design/icons";
import { Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { ShellNavListItem } from "./ShellNavListItem";

export type NavigationItem = {
  badge?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: ReactNode;
};

export type NavigationGroup = {
  kind?: "primary" | "preview";
  items: NavigationItem[];
  key: string;
  label?: ReactNode;
};

export type LeftNavProps = {
  groups: NavigationGroup[];
  onSelect?: (key: string) => void;
  selectedKey?: string;
};

/**
 * Web 左侧导航容器。
 *
 * 导航分组和 label 由调用方从 i18n / ViewModel 注入；
 * 组件不新增路由、不删除低频入口，也不维护独立导航事实源。
 */
export function LeftNav({ groups, onSelect, selectedKey }: LeftNavProps) {
  const { token } = theme.useToken();
  const secondaryListRoutes = new Set(["analysis", "data-knowledge", "metrics", "reports"]);

  return (
    <nav
      aria-label="Shell navigation"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: shellThemeTokens.navGroupGap,
        paddingBlock: shellThemeTokens.panelPadding,
        paddingInline: shellThemeTokens.navPaddingInline
      }}
    >
      {groups.map((group) => (
        <section key={group.key}>
          {group.label ? (
            <Typography.Text
              style={{
                ...shellTypographyStyles.navGroupLabel,
                color: token.colorTextDescription,
                display: "block",
                marginBottom: 6
              }}
            >
              {group.label}
            </Typography.Text>
          ) : null}
          <Space
            direction="vertical"
            size={
              group.kind === "primary"
                ? shellThemeTokens.navPrimaryItemGap
                : shellThemeTokens.navPreviewItemGap
            }
            style={{ width: "100%" }}
          >
            {group.items.map((item) => {
              const isSelected = selectedKey === item.key;
              const showEntryArrow = secondaryListRoutes.has(item.key);
              const badge = item.badge ? (
                <span
                  style={{
                    background: token.colorFillSecondary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusSM,
                    color: token.colorTextDescription,
                    fontSize: token.fontSizeSM,
                    lineHeight: 1,
                    paddingBlock: 2,
                    paddingInline: token.paddingXS
                  }}
                >
                  {item.badge}
                </span>
              ) : null;
              const rightContent =
                showEntryArrow || badge ? (
                  <>
                    {showEntryArrow ? (
                      <span
                        aria-hidden="true"
                        style={{
                          color: isSelected ? token.colorTextSecondary : token.colorTextDescription,
                          display: "inline-flex",
                          fontSize: token.fontSizeSM
                        }}
                      >
                        <RightOutlined />
                      </span>
                    ) : null}
                    {badge}
                  </>
                ) : undefined;

              return (
                <ShellNavListItem
                  ariaCurrent={isSelected ? "page" : undefined}
                  disabled={item.disabled}
                  icon={item.icon}
                  key={item.key}
                  label={item.label}
                  onClick={() => onSelect?.(item.key)}
                  rightContent={rightContent}
                  selected={isSelected}
                />
              );
            })}
          </Space>
        </section>
      ))}
    </nav>
  );
}
