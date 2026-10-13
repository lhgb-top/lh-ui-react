---
'@lh-ui/react': minor
---

# docs 站点国际化与多主题支持

- **英文站全量翻译**：37 篇正文页（29 组件 + 8 指南）从此前的空壳占位补齐为完整英文内容，Props / Events 表格、`<DemoBlock>` 标题与示例代码全部英译。
- **demo 文案随站点语言切换**：31 个 demo 的硬编码文案改走库内 `useLhLocale`（`docs.*` 命名空间文案包经 `lhlocale.add()` 深合并进内置语言包，不覆盖 share 内置键）；Docusaurus locale 到 share locale 的桥接用构建期 `DefinePlugin` 注入 `__LH_DOCS_LOCALE__` + 模块级 `setLocale`，SSR 期即为正确语言，无首屏闪烁。
- **首页 i18n**：Hero 与特性卡片文案改用 `@docusaurus/Translator` 的 `translate()`，条目收于 `homepage.*` 命名空间；补齐 `zh-CN/code.json`。
- **navbar 主题预设切换器**：新增自定义 NavbarItem `PresetThemeSwitcher`，与防闪烁脚本共用 `localStorage` 键 `lh-docs-preset`，五套预设色板下拉切换、刷新无闪烁；标签跟随站点语言。
- **主题定制台**：新增指南页《主题定制台》及交互组件 `ThemeStudio`（移植自 lh-ui-plus），预设选择 → 分组令牌编辑 → 局部 CSS 变量实时预览（明 / 暗切换与导出文本同源走 `buildPresetDarkVars`）→ 复制 / 下载 SCSS。
- **收尾**：修正 `zh-CN/navbar.json` 的死 key；`docs/content/guide/themes.md` 过时的 VitePress 路径修正为 `docusaurus.config.ts`。
