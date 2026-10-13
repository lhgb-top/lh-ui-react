---
"@lh-ui/react": patch
---

修复文档站从未成功构建过的三处阻断性 bug（本次首次 `pnpm docs:build` 暴露）：

- **`docs/demos/dialog/basic` 对应页 `docs/components/dialog.md`**：Props 表格「说明」列里
  `Promise<false>` 裸写未加反引号，markdown-it 把 `<false>` 当作 HTML 开始标签，
  Vue 编译报「Element is missing end tag」。改为 `` `Promise<false>` `` 行内代码。
- **`docs/guide/theme-customization.md`**：`::: tip` 容器内的内联代码
  `` `style={{ '--lh-primary-color': x }}` `` 里双花括号逃逸出 markdown-it（只转义
  `& < > " '`，不转义 `{`），被 Vue 模板编译器当成插值表达式，报「Did not expect a
  type annotation here」。改为 `{ { ... } }`（中间留空格打断双花括号）。
- **`docs/.vitepress/components/ReactDemo.vue`**：`createRoot` 误从 `'react'` 导入，
  React 18/19 的该 API 实际在 `react-dom/client`；SSR 阶段 Node 的 ESM 加载器对 CJS 包
  做命名导出检查，`react` 无此导出直接报「Named export 'createRoot' not found」。
  拆为 `createElement` from `react` + `createRoot` from `react-dom/client`。
