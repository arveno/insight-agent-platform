import type { ReactNode } from "react";
import { ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography, theme } from "antd";

import { shellThemeTokens } from "../../theme/tokens";
import { shellTypographyStyles } from "../../theme/typography";
import { SelectableListItem } from "./SelectableListItem";

/**
 * Shared Pattern：SelectableList 的通用 item contract。
 *
 * 只描述“可被选择的条目”这一通用形态，不包含业务对象。
 * 各模块必须先把业务数据映射成 title、icon、rightContent 和 disabled 等通用字段。
 */
export type SelectableListItemData = {
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  /** 右侧补充内容 slot，适合计数或标签，不应传入业务对象本身。 */
  rightContent?: ReactNode;
  title: ReactNode;
};

/**
 * Shared Pattern：SelectableList 的公共 props 契约。
 *
 * 只承接通用导航列表的展示与基础交互。
 * 搜索、选择和返回行为由调用方注入；组件不负责 route 映射、排序或业务过滤。
 */
export type SelectableListProps = {
  /** 标题下方的补充 action slot；布局由组件负责，业务决策由调用方负责。 */
  action?: ReactNode;
  ariaLabel: string;
  emptyText?: ReactNode;
  items: SelectableListItemData[];
  /** 返回上一级的通用回调；不等同于 route-to-page 映射。 */
  onBack?: () => void;
  /** 搜索输入回调；过滤逻辑必须在调用方完成。 */
  onSearchChange?: (value: string) => void;
  /** 选择条目回调；组件只回传 key，不解释业务含义。 */
  onSelect?: (key: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  /** 当前选中的通用 key，不得复用为共享业务 id 语义。 */
  selectedKey?: string;
  title: ReactNode;
};

/**
 * Shared Pattern：通用可选列表。
 *
 * 基于 Ant Input / Button / Typography 和 SelectableListItem，
 * 只负责展示、搜索输入承接和选中态排布。
 * 不做 route 映射、跨模块逻辑、排序或业务过滤。
 */
export function SelectableList({
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
}: SelectableListProps) {
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
            <SelectableListItem
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
