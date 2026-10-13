---
'@lh-ui/react': minor
---

# 新增 Wave A 六组件：Divider / Space / Card / Empty / Skeleton / Alert

按 plus 扩充计划的第一批（布局 + 反馈基础件）补齐六个组件，全部与
`@lh-ui/vue3`（plus）同名同义同构：逻辑复用 `@lh-ui/share/core` 纯函数，
样式复用 `@lh-ui/share/styles`，React 侧只写薄渲染与响应式胶水。

## 新增组件

- **LhDivider 分割线** —— 水平/垂直、虚线、文案对齐；带文案 `role="separator"`，
  纯装饰 `role="presentation"`
- **LhSpace 间距** —— 预设档位 / 数字 / `[水平, 垂直]` 三种 size，间距交原生 CSS `gap`，
  不包裹子项
- **LhCard 卡片** —— 封面/头部/正文/底部四区，`shadow` 三档，`clickable` 时整卡承担
  button 键盘语义，`loading` 时正文区换骨架占位
- **LhEmpty 空状态** —— 内置水墨内联插画（主题变量着色），自定义图片/描述/动作区，
  `role="status"` 温和播报
- **LhSkeleton 骨架屏** + **LhSkeletonItem** —— 文本行数与末行收窄算法、头像占位、
  `aria-busy` + 占位块 `aria-hidden`
- **LhAlert 警告提示** —— 四种类型、标题、朴素样式、类型图标、可关闭（内部非受控）；
  `warning`/`danger` 走 `role="alert"`，`info`/`success` 走 `role="status"`

## 同步更新

- `src/index.ts` 追加六个组件的命名导出（`LhSkeleton` / `LhSkeletonItem` 成对导出）
- 组件注册表测试期望名单更新为 18 个目录
- 六个组件的 RTL 测试 + VitePress 文档页与 sidebar 条目
