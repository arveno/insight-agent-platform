/**
 * shared 层面向 app 与 feature 的统一出口。
 *
 * 这里仅暴露 #65 已审查的 Theme、I18n 和 Icon 基础能力；
 * shared/ui、shared/layout、shared/charts 的完整组件边界由 #66 承接。
 *
 * 不通过该出口引入业务页面、真实 API、contracts 变更或第二套 UI 组件库。
 */
export * from "./i18n";
export * from "./icons";
export * from "./theme";
