/**
 * lh-ui-react 文档站配置（Docusaurus 3）
 *
 * 由 VitePress 迁移而来。与 VitePress 的关键差异：
 * - 站点本身即 React 应用，页面内的 React demo 直接 import 渲染，
 *   不再需要 ReactDemo.vue 的 createRoot 桥接。
 * - 部署 base 由 baseUrl 单一配置（取代原 DOCS_BASE 环境变量分支）。
 * - 暗色模式在 <html> 设 data-theme="dark"，与 share var-dark.scss 的
 *   [data-theme='dark'], .dark 选择器天然吻合，暗色零适配成本。
 * - 家族本地联动经 webpack resolve.alias（createLocalShareWebpackAliases）。
 */
import type { Config } from '@docusaurus/types'
import { themes } from 'prism-react-renderer'
import { resolve } from 'node:path'
import { DefinePlugin } from 'webpack'
import { createLocalShareWebpackAliases } from '../scripts/local-share-alias.mjs'
import {
  LH_THEME_PRESETS,
  buildPresetStyleText,
  LH_PRESET_THEME_STYLE_ID,
} from '@lh-ui/share/theme'

const siteHostname = 'https://www.lhgb.top'
const baseUrl = '/lhui/react/'

// 防闪烁：构建期把「预设名 → 样式文本」序列化为 JSON，供 head 同步脚本读取。
// 与 useLhPresetTheme 共用同一个 <style id="lh-preset-theme"> 元素（同一机制、同一特异性），
// 不能写 documentElement 内联 style——内联特异性 1,0,0,0 恒压样式表，
// 会导致运行时切换预设只改了样式表、页面仍读旧内联值（必须刷新才生效），
// 且会压过 var-dark.scss 的整段暗色变量。
// 顺序注意：headTags 脚本在主样式表 link 之前执行，同为 :root 选择器时后插者压先插者，
// 预设会被主样式表架空；故解析阶段先注入防闪烁，DOMContentLoaded 再把同一个元素挪到队尾压过样式表。
// 持久化键 'lh-docs-preset' 是站点专用（与消费者应用的 'lh-ui-preset' 区分），
// navbar 的预设切换器必须共用此键，否则刷新后预设闪回默认色。
const PRESET_STYLE_JSON = JSON.stringify(
  Object.fromEntries(LH_THEME_PRESETS.map((p) => [p.name, buildPresetStyleText(p.vars)])),
)

const PRESET_FOUC_SCRIPT = `
(function () {
  try {
    var presets = ${PRESET_STYLE_JSON}
    var saved = localStorage.getItem('lh-docs-preset')
    var text = saved && presets[saved] ? presets[saved] : presets['cerblue']
    var styleEl = document.getElementById('${LH_PRESET_THEME_STYLE_ID}')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = '${LH_PRESET_THEME_STYLE_ID}'
    }
    styleEl.textContent = text
    document.head.appendChild(styleEl)
    document.addEventListener('DOMContentLoaded', function () {
      document.head.appendChild(styleEl)
    })
  } catch (e) { /* SSR 或 localStorage 不可用时静默失败 */ }
})()
`.trim()

const config: Config = {
  title: 'lh-ui-react',
  tagline: '企业级 React 18/19 国风组件库',
  favicon: 'img/favicon.ico',
  url: siteHostname,
  baseUrl,

  // GitHub Pages 部署到 <org>.github.io/<repo>/ 时设 true；本项目部署到自定义域名子路径，无需此项
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  onDuplicateRoutes: 'warn',

  // 即使构建产物提交到 gh-pages 分支也保持干净
  organizationName: 'lhgb-top',
  projectName: 'lh-ui-react',

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeConfigs: {
      'zh-CN': {
        label: '中文',
        direction: 'ltr',
        htmlLang: 'zh-CN',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
      },
    },
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'content',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: false,
          // 非 git 仓库（单库下载 / CI 单仓 clone）下取 last commit 会致命报错，关掉
          showLastUpdateTime: false,
          editUrl: 'https://github.com/lhgb-top/lh-ui-react/edit/master/docs/',
          exclude: ['**/en/**'],
        },
        blog: false,
        theme: {
          customCss: ['./src/css/custom.scss'],
        },
      },
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-sass',
      {
        // bare 的 @use '@lh-ui/share/styles/...' 在无本地联动别名时（CI 单仓 clone）
        // 需从 node_modules 解析；Dart Sass 不读包 exports 映射，loadPaths 是必需兜底
        sassOptions: {
          loadPaths: [resolve(__dirname, '../node_modules')],
          silenceDeprecations: ['legacy-js-api', 'import'],
        },
      },
    ],
    // 家族本地联动：把 @lh-ui/share / @lh-ui/react 解析到同级 share 仓源码与本库源码，
    // 改 share 即时在 docs 生效；兄弟仓不存在时守卫返回空对象、回退 npm 包
    // 同时把当前构建的 Docusaurus locale 注入为全局常量，供 src/locale/init.ts
    // 在模块级把 share 的全局 locale 切到正确语言（多 locale SSR 正确性）
    (context) => ({
      name: 'lh-ui-local-aliases',
      configureWebpack: (config) => {
        config.resolve ??= {}
        config.resolve.alias = {
          ...config.resolve.alias,
          '@lh-ui/react': resolve(__dirname, '../src/index.ts'),
          ...createLocalShareWebpackAliases(resolve(__dirname, '..')),
        }
        // sass-loader 走 webpack resolver，但默认 extensions 不含 .scss，
        // 显式补上保证无后缀的组件样式别名能被 resolve 命中
        config.resolve.extensions = [...new Set([...(config.resolve.extensions ?? []), '.scss', '.sass'])]
        config.plugins ??= []
        config.plugins.push(
          new DefinePlugin({
            __LH_DOCS_LOCALE__: JSON.stringify(context.i18n.currentLocale),
          }),
        )
      },
    }),
  ],

  themeConfig: {
    // 暗色模式：<html data-theme="dark"> 与 share var-dark.scss 选择器吻合
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    image: 'img/og.png',
    navbar: {
      title: 'lh-ui-react',
      logo: { src: 'img/logo.svg', alt: 'lh-ui logo' },
      items: [
        { type: 'docSidebar', sidebarId: 'guide', label: '指南', position: 'left' },
        { type: 'docSidebar', sidebarId: 'components', label: '组件', position: 'left' },
        // 站点互链：各组件库文档统一部署在 www.lhgb.top/lhui/{库名}/
        { href: 'https://www.lhgb.top/lhui/plus/', label: 'Vue3 版', position: 'right' },
        { href: 'https://www.lhgb.top/lhui/vue2/', label: 'Vue2 版', position: 'right' },
        // 主题预设切换器：自定义 NavbarItem（src/theme/NavbarItem/PresetThemeSwitcher），
        // storageKey 与 PRESET_FOUC_SCRIPT 共用 'lh-docs-preset'，刷新无闪烁。
        // Docusaurus 配置校验要求自定义 navbar item 的 type 以 custom- 开头
        // （@docusaurus/theme-classic 的 CustomNavbarItemRegexp），运行时按完整 type
        // 字符串查 src/theme/NavbarItem/ComponentTypes 的同名键取组件。
        { type: 'custom-presetThemeSwitcher', position: 'right' },
        { type: 'localeDropdown', position: 'right' },
        {
          href: 'https://github.com/lhgb-top/lh-ui-react',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `Copyright © ${new Date().getFullYear()} lhgb.top`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ['bash', 'json', 'sass', 'scss', 'typescript', 'jsx', 'tsx'],
    },
  } satisfies Config['themeConfig'],

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          '企业级 React 18/19 国风组件库，基于 @lh-ui/share 框架无关共享层，与 lh-ui-plus（Vue 3）同源同构。',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'React,React18,React19,Component,UI,lh-ui,国风,组件库,水墨,Chinese,Design',
      },
    },
    { tagName: 'meta', attributes: { property: 'og:title', content: 'lh-ui-react - 企业级 React 国风组件库' } },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: '与 lh-ui-plus 同源同构的 React 18/19 UI 层，共享设计令牌与组件逻辑。',
      },
    },
    { tagName: 'meta', attributes: { property: 'og:type', content: 'website' } },
    { tagName: 'meta', attributes: { property: 'og:url', content: siteHostname + baseUrl } },
    { tagName: 'meta', attributes: { name: 'twitter:card', content: 'summary' } },
    {
      tagName: 'meta',
      attributes: { name: 'twitter:title', content: 'lh-ui-react - Enterprise React Component Library' },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:description',
        content: 'React 18/19 UI layer of the lh-ui family, sharing tokens and logic with lh-ui-plus.',
      },
    },
    // 主题预设防闪烁：在页面首次绘制前同步应用用户上次选择的预设变量
    { tagName: 'script', attributes: {}, innerHTML: PRESET_FOUC_SCRIPT },
  ],
} satisfies Config

export default config
