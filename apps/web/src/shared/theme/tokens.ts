/**
 * UI Shell 共享主题 token。
 *
 * 这些 token 是 #65 阶段 AppProviders、AppShell 和 Ant Design theme config 的基础输入；
 * 组件应通过 shared/theme 消费这些值，避免在页面内散落硬编码主题常量。
 *
 * 当前 token 只服务静态 UI Shell，不承接业务状态、用户偏好持久化或后端配置。
 */
export const shellThemeTokens = {
  colorActionPrimaryDark: "#f3f4f6",
  colorActionPrimaryDarkActive: "#e5e7eb",
  colorActionPrimaryDarkHover: "#ffffff",
  colorActionPrimaryLight: "#111827",
  colorActionPrimaryLightActive: "#030712",
  colorActionPrimaryLightHover: "#1f2937",
  colorActionPrimaryTextDark: "#111827",
  colorActionPrimaryTextLight: "#ffffff",
  colorLink: "#2563eb",
  colorLinkActive: "#1e40af",
  colorLinkHover: "#1d4ed8",
  borderRadius: 8,
  borderRadiusLG: 10,
  borderRadiusSM: 6,
  headerHeight: 60,
  headerPaddingInline: 20,
  inspectorWidth: 336,
  navGroupGap: 16,
  navPaddingInline: 16,
  navPrimaryItemGap: 8,
  navPrimaryPaddingBlock: 10,
  navPrimaryPaddingInline: 12,
  navPreviewItemGap: 4,
  navPreviewPaddingBlock: 8,
  navPreviewPaddingInline: 10,
  panelPadding: 20,
  popoverMinWidth: 240,
  shellFooterPadding: 16,
  shellSectionGap: 12,
  siderWidth: 272,
  surfaceBorderWidth: 1,
  userButtonPaddingBlock: 10,
  userButtonPaddingInline: 12
} as const;
