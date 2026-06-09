import { useState, type ReactNode } from "react";
import { Flex, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";

/**
 * Shared Pattern：SelectableListItem 的公共 props 契约。
 *
 * 只描述单个可选条目的视觉和基础交互。
 * 不包含业务对象，不承接 route 映射或跨模块行为。
 */
export type SelectableListItemProps = {
  /** 用于当前页语义标记；仅在 selected 时透传到 aria-current。 */
  ariaCurrent?: "page";
  /** 用于按钮式选中态表达，不等同于业务状态字段。 */
  ariaPressed?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  /** 点击回调只表达“被选中”，不解释业务含义。 */
  onClick?: () => void;
  /** 右侧补充内容 slot，适合轻量 meta 或标签。 */
  rightContent?: ReactNode;
  selected?: boolean;
};

/**
 * Shared Pattern：单个可选列表项。
 *
 * 基于原生 button + Ant Typography / Flex，只负责选中态、hover 和可点击外观。
 * 不消费业务对象，也不决定列表排序或筛选。
 */
export function SelectableListItem({
  ariaCurrent,
  ariaPressed,
  disabled = false,
  icon,
  label,
  onClick,
  rightContent,
  selected = false
}: SelectableListItemProps) {
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
