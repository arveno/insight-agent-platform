import type { ReactNode } from "react";
import { Flex, Space, Typography, theme } from "antd";

import { shellTypographyStyles } from "../../theme/typography";

/**
 * Shared Pattern：ContextTreeNodeRow 的展示 props。
 *
 * 只接收 Tree / List 行所需的展示模型，不承接业务对象、路由或模块逻辑。
 * 调用方必须先把业务节点映射成 title、secondaryText、valueText 和 badges。
 */
export type ContextTreeNodeRowProps = {
  badges?: ReactNode;
  count?: number;
  secondaryText?: ReactNode;
  selected?: boolean;
  title: ReactNode;
  valueText?: ReactNode;
};

/**
 * Shared Pattern：标准化的 Context Tree / List 行。
 *
 * 组件只负责稳定的两行排版和 compact 信息展示，不显示长描述、
 * sourceRef id 或任何 raw enum。业务规则由调用方在模块内完成映射。
 */
export function ContextTreeNodeRow({
  badges,
  count,
  secondaryText,
  selected = false,
  title,
  valueText
}: ContextTreeNodeRowProps) {
  const { token } = theme.useToken();
  const primaryTextColor = selected ? token.colorText : token.colorTextSecondary;
  const secondaryTextColor = selected ? token.colorTextSecondary : token.colorTextDescription;

  return (
    <div
      data-context-tree-row-state={selected ? "selected" : "idle"}
      style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, width: "100%" }}
    >
      <Flex align="baseline" gap={6} justify="space-between" style={{ width: "100%" }}>
        <Typography.Text
          style={{ ...shellTypographyStyles.navItem, color: primaryTextColor, minWidth: 0 }}
        >
          {title}
        </Typography.Text>
        {typeof count === "number" ? (
          <Typography.Text style={{ ...shellTypographyStyles.meta, color: secondaryTextColor }}>
            {count}
          </Typography.Text>
        ) : null}
      </Flex>

      {secondaryText || valueText || badges ? (
        <Flex align="center" gap={8} wrap style={{ minWidth: 0 }}>
          {secondaryText ? (
            <Typography.Text
              style={{
                ...shellTypographyStyles.meta,
                color: secondaryTextColor,
                minWidth: 0
              }}
            >
              {secondaryText}
            </Typography.Text>
          ) : null}
          {valueText ? (
            <Typography.Text
              style={{
                ...shellTypographyStyles.meta,
                color: secondaryTextColor,
                minWidth: 0
              }}
            >
              {valueText}
            </Typography.Text>
          ) : null}
          {badges ? <Space size={4} wrap>{badges}</Space> : null}
        </Flex>
      ) : null}
    </div>
  );
}
