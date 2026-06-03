/**
 * UI Shell 共享主题 token。
 *
 * 这些 token 是 #65 阶段 AppProviders、AppShell 和 Ant Design theme config 的基础输入；
 * 组件应通过 shared/theme 消费这些值，避免在页面内散落硬编码主题常量。
 *
 * 当前 token 只服务静态 UI Shell，不承接业务状态、用户偏好持久化或后端配置。
 */
export const shellThemeTokens = {
  borderRadius: 6,
  colorBgContainer: "#ffffff",
  colorBgLayout: "#f6f8fb",
  colorBorder: "#e5e7eb",
  colorPrimary: "#1677ff",
  colorTextSecondary: "#64748b",
  headerHeight: 64,
  siderWidth: 260
} as const;
