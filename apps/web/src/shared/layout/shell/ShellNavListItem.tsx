import { useState, type ReactNode } from "react";
import { Flex, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";

export type ShellNavListItemProps = {
  ariaCurrent?: "page";
  ariaPressed?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  onClick?: () => void;
  rightContent?: ReactNode;
  selected?: boolean;
};

export function ShellNavListItem({
  ariaCurrent,
  ariaPressed,
  disabled = false,
  icon,
  label,
  onClick,
  rightContent,
  selected = false
}: ShellNavListItemProps) {
  const { token } = theme.useToken();
  const [isHovered, setIsHovered] = useState(false);
  const textColor = selected ? token.colorText : token.colorTextSecondary;
  const iconColor = selected ? token.colorTextSecondary : token.colorTextDescription;
  const background = selected
    ? token.colorFillSecondary
    : isHovered && !disabled
      ? token.colorFillTertiary
      : "transparent";

  return (
    <button
      aria-current={selected ? ariaCurrent : undefined}
      aria-pressed={ariaPressed}
      disabled={disabled}
      onBlur={() => setIsHovered(false)}
      onClick={onClick}
      onFocus={() => setIsHovered(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        appearance: "none",
        background,
        border: `${shellThemeTokens.surfaceBorderWidth}px solid transparent`,
        borderRadius: shellThemeTokens.borderRadius,
        color: textColor,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        justifyContent: "space-between",
        minHeight: 34,
        minWidth: 0,
        opacity: disabled ? 0.5 : 1,
        paddingBlock: shellThemeTokens.navPrimaryPaddingBlock,
        paddingInline: shellThemeTokens.navPrimaryPaddingInline,
        textAlign: "left",
        transition: "background-color 120ms ease, border-color 120ms ease, color 120ms ease",
        width: "100%"
      }}
      type="button"
    >
      <Flex align="center" gap={token.marginXS} style={{ minWidth: 0 }}>
        {icon ? (
          <span
            style={{
              color: iconColor,
              display: "inline-flex",
              flex: "0 0 auto"
            }}
          >
            {icon}
          </span>
        ) : null}
        <Typography.Text
          ellipsis
          style={{ ...shellTypographyStyles.navItem, color: textColor, minWidth: 0 }}
        >
          {label}
        </Typography.Text>
      </Flex>
      {rightContent ? (
        <Space size={4} style={{ color: iconColor, flex: "0 0 auto" }}>
          {rightContent}
        </Space>
      ) : null}
    </button>
  );
}
