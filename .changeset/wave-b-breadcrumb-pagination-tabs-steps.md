---
'@lh-ui/react': minor
---

# 新增 Wave B 四组件：Breadcrumb / Pagination / Tabs / Steps

按 plus 扩充计划的第二批（导航骨架）补齐四个组件，全部与
`@lh-ui/vue3`（plus）同名同义同构：逻辑复用 `@lh-ui/share/core` 纯函数，
样式复用 `@lh-ui/share/styles`，React 侧只写薄渲染与响应式胶水。

## 新增组件

- **LhBreadcrumb 面包屑** + **LhBreadcrumbItem** —— 自定义分隔符、`maxItems` 折叠
  （首项 + 省略号 + 末项）与点击展开；末项 `aria-current="page"`
- **LhPagination 分页** —— 受控 / 非受控双模式、`siblingCount` 页码区间、
  `showTotal` / `showSizeChanger` / `showJumper`、`simple` 紧凑模式、总页数缩小时
  自动钳制回末页
- **LhTabs 标签页** + **LhTabPane** —— `line` / `card` 两种外观、`closable` / `addable`、
  APG tabs pattern 完整键盘导航（方向键 / Home / End / Delete 关闭、roving tabindex）、
  tab 与 panel 双向 aria 关联
- **LhSteps 步骤条** + **LhStep** —— 横向 / 纵向、`clickable` 可点击导航
  （未来步骤不可点）、`status` 整体覆盖、横向折行连接线自动隐藏、
  `themeVars` 组件级主题变量

## 同步更新

- `src/index.ts` 追加「Wave B：导航组件」分组与四个组件的命名导出
  （`LhBreadcrumb` / `LhBreadcrumbItem`、`LhTabs` / `LhTabPane`、
  `LhSteps` / `LhStep` 成对导出）
- 组件注册表测试期望名单更新为 22 个目录，复合组件成对导出断言补齐
- 四个组件的 RTL 测试（59 例）+ VitePress 文档页、demo 与 sidebar 新增「导航组件」分组
- `docs/.vitepress/theme/index.ts` 补齐 Wave A + Wave B 共十个组件的样式注入
  （此前 Wave A 六个样式仅缺注入，文档页无样式）
