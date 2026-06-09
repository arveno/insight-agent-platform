/**
 * UI Shell 共享主题 token。
 *
 * 这些 token 是 #65 阶段 AppProviders、AppShell 和 Ant Design theme config 的基础输入；
 * 组件应通过 shared/theme 消费这些值，避免在页面内散落硬编码主题常量。
 *
 * 当前 token 只服务静态 UI Shell，不承接业务状态、用户偏好持久化或后端配置。
 */
export const shellThemeTokens = {
  colorActionPrimaryBg: "#171717",
  colorActionPrimaryBgActive: "#111111",
  colorActionPrimaryBgHover: "#262626",
  colorActionPrimaryText: "#ffffff",
  colorLink: "#2563eb",
  colorLinkActive: "#1e40af",
  colorLinkHover: "#1d4ed8",
  borderRadius: 6,
  borderRadiusLG: 8,
  borderRadiusSM: 6,
  cardContentGap: 8,
  cardGridGap: 12,
  cardHeaderHeight: 40,
  fontSizeBody: 14,
  fontSizeButton: 13,
  fontSizeCardLabel: 13,
  fontSizeCardTitle: 14,
  fontSizeHeroTitle: 20,
  fontSizeMeta: 12,
  fontSizeMetricValue: 20,
  fontSizeNavItem: 14,
  fontSizePageTitle: 20,
  fontSizeSectionTitle: 14,
  fontWeightMedium: 400,
  fontWeightSemibold: 600,
  headerHeight: 52,
  headerPaddingInline: 16,
  inspectorWidth: 336,
  navGroupGap: 12,
  navPaddingInline: 14,
  navPrimaryItemGap: 2,
  navPrimaryPaddingBlock: 6,
  navPrimaryPaddingInline: 8,
  navPreviewItemGap: 2,
  navPreviewPaddingBlock: 6,
  navPreviewPaddingInline: 8,
  pagePadding: 18,
  pageSectionGap: 20,
  panelPadding: 16,
  popoverMinWidth: 240,
  sectionContentGap: 12,
  shellFooterPadding: 12,
  shellSectionGap: 8,
  siderWidth: 252,
  surfaceBorderWidth: 1,
  userButtonPaddingBlock: 6,
  userButtonPaddingInline: 8
} as const;
