import { useState, type ReactNode } from "react";
import { Flex, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme";

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
  const background = selected
    ? token.colorFillSecondary
    : isHovered && !disabled
      ? token.colorFillTertiary
      : "transparent";
  const borderColor =
    selected || (isHovered && !disabled) ? token.colorBorderSecondary : "transparent";

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
        border: `${shellThemeTokens.surfaceBorderWidth}px solid ${borderColor}`,
        borderRadius: shellThemeTokens.borderRadiusLG,
        color: textColor,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        justifyContent: "space-between",
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
              color: textColor,
              display: "inline-flex",
              flex: "0 0 auto"
            }}
          >
            {icon}
          </span>
        ) : null}
        <Typography.Text ellipsis strong={selected} style={{ color: textColor, minWidth: 0 }}>
          {label}
        </Typography.Text>
      </Flex>
      {rightContent ? (
        <Space size={token.marginXS} style={{ color: textColor, flex: "0 0 auto" }}>
          {rightContent}
        </Space>
      ) : null}
    </button>
  );
}
