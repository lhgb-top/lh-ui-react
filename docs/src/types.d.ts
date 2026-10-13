/**
 * 文档站全局类型声明
 *
 * __LH_DOCS_LOCALE__ 由 docusaurus.config.ts 的内联插件经 webpack
 * DefinePlugin 注入（值为当前构建的 Docusaurus locale 名，如 'zh-CN' / 'en'），
 * 供 src/locale/init.ts 在模块级把 share 的全局 locale 切到正确语言。
 */
declare const __LH_DOCS_LOCALE__: string
