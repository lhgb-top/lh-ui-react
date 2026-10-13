/**
 * 文档站 locale 初始化（模块级副作用）
 *
 * 做两件事：
 * 1. 把 demo 文案包（docs.* 命名空间）深合并进 share 的内置语言包——
 *    lhlocale.add 只登记用户包、不覆盖内置键，组件内部文案仍走 share。
 * 2. 把 share 的全局 locale 切到当前构建语言。
 *
 * 为什么在模块级而不是 render/effect 里切换：Docusaurus 按.locale 分别
 * SSR，构建期由 DefinePlugin 把当前 locale 烧进本模块（__LH_DOCS_LOCALE__），
 * 模块级执行保证 SSR 期就是正确语言；render 期写 store 会触发
 * useSyncExternalStore 的重渲染，effect 期写则英文站首屏先闪中文。
 *
 * 本模块由 src/theme/Root.tsx 顶层 import，其副作用先于任何页面/demo 执行。
 */
import { lhlocale } from '@lh-ui/react'
import { DEMO_ZH, DEMO_EN } from './demo-messages'

// Docusaurus locale 名与 share locale 名的映射（站点只配了 zh-CN / en）
const DOCS_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
}

lhlocale.add('zh-CN', DEMO_ZH)
lhlocale.add('en-US', DEMO_EN)
lhlocale.setLocale(
  DOCS_LOCALE_MAP[__LH_DOCS_LOCALE__] ?? __LH_DOCS_LOCALE__ ?? 'zh-CN',
)
