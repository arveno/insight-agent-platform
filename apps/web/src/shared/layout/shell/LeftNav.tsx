import type { CSSProperties, ReactNode } from "react";
import { Button, Input, Space, Tag, Typography, theme } from "antd";

export type NavigationItem = {
  badge?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  label: ReactNode;
};

export type NavigationGroup = {
  items: NavigationItem[];
  key: string;
  label?: ReactNode;
};

export type WorkspaceAction = {
  disabled?: boolean;
  key: string;
  label: ReactNode;
};

export type WorkspaceContext = {
  actions: WorkspaceAction[];
  brandDescription: ReactNode;
  brandKicker: ReactNode;
  businessDomain: ReactNode;
  currentLabel: ReactNode;
  name: ReactNode;
  role: ReactNode;
  workspaceId: ReactNode;
};

export type ModuleNavItem = {
  caption?: ReactNode;
  disabled?: boolean;
  key: string;
  title: ReactNode;
};

export type ModuleNavFilter = {
  key: string;
  label: ReactNode;
};

export type ModuleNav = {
  description: ReactNode;
  filterSectionTitle?: ReactNode;
  filters?: ModuleNavFilter[];
  itemSectionDescription?: ReactNode;
  itemSectionTitle: ReactNode;
  items: ModuleNavItem[];
  primaryActionLabel?: ReactNode;
  returnLabel: ReactNode;
  searchPlaceholder?: string;
  title: ReactNode;
};

export type DetailNavItem = {
  description: ReactNode;
  key: string;
  label: ReactNode;
};

export type DetailNav = {
  description: ReactNode;
  items: DetailNavItem[];
  title: ReactNode;
};

export type LeftNavProps = {
  detailNav?: DetailNav;
  globalGroups: NavigationGroup[];
  moduleNav?: ModuleNav;
  navMode: "global" | "analysis" | "reports" | "detail";
  onReturnToGlobalNav?: () => void;
  onSearchChange?: (value: string) => void;
  onSelectDetail?: (key: string) => void;
  onSelectFilter?: (key: string) => void;
  onSelectGlobal?: (key: string) => void;
  onSelectModuleItem?: (key: string) => void;
  onTriggerPrimaryAction?: () => void;
  onWorkspaceAction?: (key: string) => void;
  searchValue?: string;
  selectedDetailKey?: string;
  selectedFilterKey?: string;
  selectedGlobalKey?: string;
  selectedModuleItemKey?: string;
  workspace: WorkspaceContext;
};

function sectionButtonStyle(
  active: boolean,
  disabled: boolean | undefined,
  token: ReturnType<typeof theme.useToken>["token"]
): CSSProperties {
  return {
    alignItems: "flex-start",
    background: active ? token.colorPrimaryBg : "transparent",
    borderColor: active ? token.colorPrimaryBorder : token.colorBorderSecondary,
    boxShadow: "none",
    color: disabled ? token.colorTextDisabled : active ? token.colorPrimaryText : token.colorText,
    display: "flex",
    gap: token.paddingXS,
    height: "auto",
    justifyContent: "flex-start",
    paddingBlock: token.paddingXS,
    paddingInline: token.paddingSM,
    textAlign: "left",
    width: "100%"
  };
}

function renderNavButton(
  item: NavigationItem,
  active: boolean,
  token: ReturnType<typeof theme.useToken>["token"],
  onClick?: (key: string) => void
) {
  return (
    <Button
      block
      disabled={item.disabled}
      key={item.key}
      onClick={() => onClick?.(item.key)}
      style={sectionButtonStyle(active, item.disabled, token)}
      type="default"
    >
      <Space align="start" size={10} style={{ width: "100%" }}>
        {item.icon}
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Typography.Text strong={active}>{item.label}</Typography.Text>
          {item.badge ? (
            <Tag color="orange" style={{ marginInlineEnd: 0, width: "fit-content" }}>
              {item.badge}
            </Tag>
          ) : null}
        </Space>
      </Space>
    </Button>
  );
}

function renderModuleButton(
  item: ModuleNavItem,
  active: boolean,
  token: ReturnType<typeof theme.useToken>["token"],
  onClick?: (key: string) => void
) {
  return (
    <Button
      block
      disabled={item.disabled}
      key={item.key}
      onClick={() => onClick?.(item.key)}
      style={sectionButtonStyle(active, item.disabled, token)}
      type="default"
    >
      <Space direction="vertical" size={2} style={{ alignItems: "flex-start", width: "100%" }}>
        <Typography.Text strong={active}>{item.title}</Typography.Text>
        {item.caption ? <Typography.Text type="secondary">{item.caption}</Typography.Text> : null}
      </Space>
    </Button>
  );
}

function renderDetailButton(
  item: DetailNavItem,
  active: boolean,
  token: ReturnType<typeof theme.useToken>["token"],
  onClick?: (key: string) => void
) {
  return (
    <Button
      block
      key={item.key}
      onClick={() => onClick?.(item.key)}
      style={sectionButtonStyle(active, false, token)}
      type="default"
    >
      <Space direction="vertical" size={2} style={{ alignItems: "flex-start", width: "100%" }}>
        <Typography.Text strong={active}>{item.label}</Typography.Text>
        <Typography.Text type="secondary">{item.description}</Typography.Text>
      </Space>
    </Button>
  );
}

/**
 * Web 左侧导航容器。
 *
 * LeftNav 只消费已经整理好的 Workspace 上下文、导航分组和模块导航视图模型；
 * 不直接读取路由配置、不解析页面数据，也不把产品事实源写死在组件内部。
 */
export function LeftNav({
  detailNav,
  globalGroups,
  moduleNav,
  navMode,
  onReturnToGlobalNav,
  onSearchChange,
  onSelectDetail,
  onSelectFilter,
  onSelectGlobal,
  onSelectModuleItem,
  onTriggerPrimaryAction,
  onWorkspaceAction,
  searchValue,
  selectedDetailKey,
  selectedFilterKey,
  selectedGlobalKey,
  selectedModuleItemKey,
  workspace
}: LeftNavProps) {
  const { token } = theme.useToken();
  const showModuleNav = navMode === "analysis" || navMode === "reports";
  const showDetailNav = navMode === "detail" && detailNav;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.paddingLG,
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        padding: token.paddingLG
      }}
    >
      <Space direction="vertical" size={6}>
        <Typography.Text type="secondary">{workspace.brandKicker}</Typography.Text>
        <Typography.Paragraph style={{ margin: 0 }} type="secondary">
          {workspace.brandDescription}
        </Typography.Paragraph>
      </Space>

      <div
        style={{
          background: token.colorBgLayout,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          padding: token.padding
        }}
      >
        <Space direction="vertical" size={10} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{workspace.currentLabel}</Typography.Text>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {workspace.name}
            </Typography.Title>
            <Typography.Paragraph style={{ marginBottom: 0, marginTop: token.marginXXS }}>
              {workspace.businessDomain}
            </Typography.Paragraph>
          </div>
          <Space size={[8, 8]} wrap>
            <Tag color="blue" style={{ marginInlineEnd: 0 }}>
              {workspace.role}
            </Tag>
            <Tag style={{ marginInlineEnd: 0 }}>{workspace.workspaceId}</Tag>
          </Space>
          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {workspace.actions.map((action) => (
              <Button
                block
                disabled={action.disabled}
                key={action.key}
                onClick={() => onWorkspaceAction?.(action.key)}
                style={{ textAlign: "left" }}
              >
                {action.label}
              </Button>
            ))}
          </Space>
        </Space>
      </div>

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          paddingInlineEnd: 4
        }}
      >
        {showModuleNav && moduleNav ? (
          <Space direction="vertical" size={token.padding} style={{ width: "100%" }}>
            <Button block onClick={onReturnToGlobalNav} style={{ textAlign: "left" }}>
              {moduleNav.returnLabel}
            </Button>

            <div>
              <Typography.Text type="secondary">{moduleNav.title}</Typography.Text>
              <Typography.Title level={3} style={{ marginBottom: token.marginXXS, marginTop: 4 }}>
                {moduleNav.title}
              </Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                {moduleNav.description}
              </Typography.Paragraph>
            </div>

            {moduleNav.primaryActionLabel ? (
              <Button block onClick={onTriggerPrimaryAction} type="default">
                {moduleNav.primaryActionLabel}
              </Button>
            ) : null}

            {moduleNav.searchPlaceholder ? (
              <Input.Search
                allowClear
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={moduleNav.searchPlaceholder}
                value={searchValue}
              />
            ) : null}

            {moduleNav.filters && moduleNav.filters.length > 0 ? (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {moduleNav.filterSectionTitle ? (
                  <Typography.Text strong>{moduleNav.filterSectionTitle}</Typography.Text>
                ) : null}
                <Space size={[8, 8]} wrap>
                  {moduleNav.filters.map((filter) => (
                    <Button
                      key={filter.key}
                      onClick={() => onSelectFilter?.(filter.key)}
                      type={selectedFilterKey === filter.key ? "primary" : "default"}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </Space>
              </Space>
            ) : null}

            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text strong>{moduleNav.itemSectionTitle}</Typography.Text>
              {moduleNav.itemSectionDescription ? (
                <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                  {moduleNav.itemSectionDescription}
                </Typography.Paragraph>
              ) : null}
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                {moduleNav.items.map((item) =>
                  renderModuleButton(
                    item,
                    selectedModuleItemKey === item.key,
                    token,
                    onSelectModuleItem
                  )
                )}
              </Space>
            </Space>
          </Space>
        ) : null}

        {showDetailNav ? (
          <Space direction="vertical" size={token.padding} style={{ width: "100%" }}>
            <Button block onClick={onReturnToGlobalNav} style={{ textAlign: "left" }}>
              {moduleNav?.returnLabel ?? "←"}
            </Button>
            <div>
              <Typography.Text type="secondary">{detailNav.title}</Typography.Text>
              <Typography.Title level={3} style={{ marginBottom: token.marginXXS, marginTop: 4 }}>
                {detailNav.title}
              </Typography.Title>
              <Typography.Paragraph style={{ marginBottom: 0 }} type="secondary">
                {detailNav.description}
              </Typography.Paragraph>
            </div>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              {detailNav.items.map((item) =>
                renderDetailButton(item, selectedDetailKey === item.key, token, onSelectDetail)
              )}
            </Space>
          </Space>
        ) : null}

        {!showModuleNav && !showDetailNav ? (
          <Space direction="vertical" size={token.padding} style={{ width: "100%" }}>
            {globalGroups.map((group) => (
              <Space direction="vertical" key={group.key} size={8} style={{ width: "100%" }}>
                {group.label ? <Typography.Text strong>{group.label}</Typography.Text> : null}
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {group.items.map((item) =>
                    renderNavButton(item, selectedGlobalKey === item.key, token, onSelectGlobal)
                  )}
                </Space>
              </Space>
            ))}
          </Space>
        ) : null}
      </div>
    </div>
  );
}
