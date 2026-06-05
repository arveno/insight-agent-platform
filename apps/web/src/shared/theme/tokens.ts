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
  borderRadius: 8,
  borderRadiusLG: 10,
  borderRadiusSM: 6,
  cardContentGap: 10,
  cardGridGap: 14,
  cardHeaderHeight: 44,
  fontSizeBody: 14,
  fontSizeButton: 13,
  fontSizeCardLabel: 13,
  fontSizeCardTitle: 14,
  fontSizeHeroTitle: 24,
  fontSizeMeta: 12,
  fontSizeMetricValue: 22,
  fontSizeNavItem: 14,
  fontSizePageTitle: 24,
  fontSizeSectionTitle: 16,
  fontWeightMedium: 500,
  fontWeightSemibold: 600,
  headerHeight: 60,
  headerPaddingInline: 20,
  inspectorWidth: 336,
  navGroupGap: 14,
  navPaddingInline: 16,
  navPrimaryItemGap: 6,
  navPrimaryPaddingBlock: 8,
  navPrimaryPaddingInline: 10,
  navPreviewItemGap: 4,
  navPreviewPaddingBlock: 7,
  navPreviewPaddingInline: 10,
  pagePadding: 20,
  pageSectionGap: 14,
  panelPadding: 18,
  popoverMinWidth: 240,
  shellFooterPadding: 14,
  shellSectionGap: 10,
  siderWidth: 272,
  surfaceBorderWidth: 1,
  userButtonPaddingBlock: 8,
  userButtonPaddingInline: 10
} as const;
