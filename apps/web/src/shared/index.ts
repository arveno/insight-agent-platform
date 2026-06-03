/**
 * shared 层面向 app 与 feature 的统一出口。
 *
 * 这里暴露 #65 已审查的 Theme、I18n、Icon 基础能力，
 * 以及 #66 已审查的 shared/ui、shared/layout、shared/charts 基础组件边界。
 *
 * 不通过该出口引入页面私有组件、raw fixture、真实 API、contracts 变更或第二套 UI 组件库。
 */
export * from "./charts";
export * from "./i18n";
export * from "./icons";
export * from "./layout";
export * from "./theme";
export * from "./ui";
