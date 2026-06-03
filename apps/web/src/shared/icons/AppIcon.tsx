import type { CSSProperties } from "react";

import type { IconName } from "./iconTypes";

const iconLabels: Record<IconName, string> = {
  analysis: "A",
  dashboard: "D",
  data: "DK",
  evaluation: "E",
  feedback: "F",
  governance: "G",
  language: "L",
  memory: "M",
  metrics: "MT",
  models: "MO",
  observability: "O",
  operations: "OP",
  reports: "R",
  settings: "S",
  theme: "T",
  user: "U",
  workspace: "W"
};

type AppIconProps = {
  name: IconName;
  title?: string;
};

const iconStyle: CSSProperties = {
  alignItems: "center",
  border: "1px solid currentColor",
  borderRadius: 4,
  display: "inline-flex",
  fontSize: 10,
  fontWeight: 700,
  height: 18,
  justifyContent: "center",
  lineHeight: 1,
  marginRight: 8,
  minWidth: 18,
  paddingInline: 3
};

/**
 * UI Shell 的统一 Icon 出口组件。
 *
 * 当前实现只提供 #65 阶段可用的轻量文本图标占位，保证 Header / AppShell 等入口先通过统一出口消费 Icon；
 * 后续替换为真实图标时仍应保留同一个 IconName -> AppIcon 边界。
 *
 * 这里不引入第二套 UI 组件库、不新增图标依赖，也不把页面私有业务组件提升到 shared。
 */
export function AppIcon({ name, title }: AppIconProps) {
  return (
    <span aria-hidden={title ? undefined : true} aria-label={title} style={iconStyle}>
      {iconLabels[name]}
    </span>
  );
}
