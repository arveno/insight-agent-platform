import type { ReactNode } from "react";
import { Button, Flex, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme";

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

  return (
    <nav
      aria-label="Shell navigation"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: shellThemeTokens.navGroupGap,
        paddingInline: shellThemeTokens.navPaddingInline
      }}
    >
      {groups.map((group) => (
        <section key={group.key}>
          {group.label ? (
            <Typography.Text
              style={{
                color: token.colorTextDescription,
                display: "block",
                fontSize: token.fontSizeSM,
                fontWeight: token.fontWeightStrong,
                letterSpacing: 0.2,
                marginBottom: token.marginSM,
                textTransform: "uppercase"
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
              const isPrimary = group.kind === "primary";
              const isSelected = selectedKey === item.key;
              const iconColor = isSelected
                ? token.colorPrimary
                : isPrimary
                  ? token.colorText
                  : token.colorTextSecondary;
              const itemBackground = isSelected
                ? isPrimary
                  ? token.colorBgContainer
                  : token.colorFillSecondary
                : "transparent";
              const itemBorderColor =
                isSelected && isPrimary ? token.colorBorderSecondary : "transparent";
              const itemTextColor =
                isPrimary || isSelected ? token.colorText : token.colorTextSecondary;

              return (
                <Button
                  aria-current={isSelected ? "page" : undefined}
                  block
                  disabled={item.disabled}
                  key={item.key}
                  onClick={() => onSelect?.(item.key)}
                  style={{
                    alignItems: "center",
                    background: itemBackground,
                    border: `1px solid ${itemBorderColor}`,
                    borderRadius: shellThemeTokens.borderRadiusLG,
                    boxShadow: "none",
                    display: "flex",
                    height: "auto",
                    justifyContent: "space-between",
                    paddingBlock: isPrimary
                      ? shellThemeTokens.navPrimaryPaddingBlock
                      : shellThemeTokens.navPreviewPaddingBlock,
                    paddingInline: isPrimary
                      ? shellThemeTokens.navPrimaryPaddingInline
                      : shellThemeTokens.navPreviewPaddingInline
                  }}
                  type="text"
                >
                  <Flex align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
                    <span
                      style={{
                        color: iconColor,
                        display: "inline-flex"
                      }}
                    >
                      {item.icon}
                    </span>
                    <Typography.Text
                      ellipsis
                      strong={isPrimary}
                      style={{
                        color: itemTextColor,
                        textAlign: "left"
                      }}
                    >
                      {item.label}
                    </Typography.Text>
                  </Flex>
                  {item.badge ? (
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
                  ) : null}
                </Button>
              );
            })}
          </Space>
        </section>
      ))}
    </nav>
  );
}
