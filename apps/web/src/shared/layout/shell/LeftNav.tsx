import type { ReactNode } from "react";
import { Badge, Button, Flex, Space, Typography, theme } from "antd";

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
      style={{ display: "flex", flexDirection: "column", gap: token.marginLG, paddingInline: 16 }}
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
          <Space direction="vertical" size={group.kind === "primary" ? 8 : 4} style={{ width: "100%" }}>
            {group.items.map((item) => {
              const isPrimary = group.kind === "primary";
              const isSelected = selectedKey === item.key;

              return (
                <Button
                  aria-current={isSelected ? "page" : undefined}
                  block
                  disabled={item.disabled}
                  key={item.key}
                  onClick={() => onSelect?.(item.key)}
                  style={{
                    alignItems: "center",
                    background: isPrimary
                      ? isSelected
                        ? token.colorPrimaryBg
                        : token.colorBgContainer
                      : isSelected
                        ? token.colorFillSecondary
                        : "transparent",
                    border: isPrimary
                      ? `1px solid ${isSelected ? token.colorPrimaryBorder : token.colorBorderSecondary}`
                      : "1px solid transparent",
                    borderRadius: token.borderRadiusLG,
                    boxShadow: isPrimary && isSelected ? token.boxShadowSecondary : "none",
                    display: "flex",
                    height: "auto",
                    justifyContent: "space-between",
                    paddingBlock: isPrimary ? token.paddingSM : token.paddingXS,
                    paddingInline: isPrimary ? token.padding : token.paddingSM
                  }}
                  type="text"
                >
                  <Flex align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
                    <span
                      style={{
                        color: isSelected
                          ? token.colorPrimary
                          : isPrimary
                            ? token.colorText
                            : token.colorTextSecondary,
                        display: "inline-flex"
                      }}
                    >
                      {item.icon}
                    </span>
                    <Typography.Text
                      ellipsis
                      strong={isPrimary}
                      style={{
                        color: isSelected
                          ? token.colorPrimary
                          : isPrimary
                            ? token.colorText
                            : token.colorTextSecondary,
                        textAlign: "left"
                      }}
                    >
                      {item.label}
                    </Typography.Text>
                  </Flex>
                  {item.badge ? (
                    <Badge color={token.colorError} count={item.badge} size="small" />
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
