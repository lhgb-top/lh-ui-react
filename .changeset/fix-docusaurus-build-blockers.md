---
"@lh-ui/react": patch
---

修复文档站（Docusaurus）从未成功构建过的四处阻断性 bug（本次批量构建十站时首次暴露）：

- **`docs/docusaurus.config.ts` 导航栏自定义类型未带 `custom-` 前缀**：
  `navbar.items` 里的 `{ type: 'PresetThemeSwitcher' }` 未通过配置校验
  （`@docusaurus/theme-classic` 的 `CustomNavbarItemRegexp` 要求自定义类型以
  `custom-` 开头），报「Bad navbar item type PresetThemeSwitcher」。改为
  `custom-presetThemeSwitcher`。
- **`docs/src/theme/NavbarItem/ComponentTypes.ts` 缺失**：运行时按 type 查
  `ComponentTypes[type]` 取组件，未注册会抛「No NavbarItem component found for type」。
  补上 swizzle 版注册表。注意不能 `import ... from '@theme/NavbarItem/ComponentTypes'`
  再展开——该别名会被 `createThemeAliases` 解析回本文件自身形成自引用，SSR 抛
  `Cannot access '__WEBPACK_DEFAULT_EXPORT__' before initialization`；
  需逐个引入 `@theme/NavbarItem/*` 各原始子组件再组装。
- **`docs/docusaurus.config.ts` 的 `DefinePlugin` 未定义**：`import webpack from 'webpack'`
  的默认导入在 ESM interop 下取不到命名导出，SSR 时 `__LH_DOCS_LOCALE__` 未注入。
  改为 `import { DefinePlugin } from 'webpack'`。
- **`translate()` 导入路径笔误**：`docs/src/pages/index.tsx` 从 `@docusaurus/Translator`
  导入（多了 r），Docusaurus 用细粒度别名 `@docusaurus/<文件名>` 指向
  `core/lib/client/exports/<文件名>`，正确来源是 `@docusaurus/Translate`。
- **`theme-studio.mdx` 容器标题里的 `<style>` 未转义**（中英两份）： admonition 标题
  `:::warning[只能写 <style> 元素]` 里的 `<style>` 被 MDX 当作未闭合 JSX 标签，
  报「Expected a closing tag for `<style>`」。改为 `&lt;style&gt;`。
