---
"@lh-ui/react": minor
---

# Divider 竖向支持文案

此前 `useLhDivider` 的 `hasContent` 锁死为 `direction === 'horizontal' && !!props.children`，
导致 share 的 `needsAriaOrientation(direction, hasContent)` 要求的「有文案且竖向」恒不可达，
`aria-orientation="vertical"` 从未输出。本次放开横向门控：

- 竖向分割线传入子节点时渲染文案，升级为 `role="separator"` 并声明 `aria-orientation="vertical"`
  （横向是 separator 的默认方向，仍不声明）
- 竖向文案恒居中——`labelPosition` 是横向语义，不产出 `--label-*` 修饰类
- 竖向文案的纵向布局（线段排在文案上下）由 `@lh-ui/share` 的 scss 承载
- 文档 demo 补「垂直带文案」示例（固定高度 flex 行，线段靠 align-self: stretch 撑开）

依赖 `@lh-ui/share` 的 divider scss 与 `getDividerClassNames` 同步改动。
