# 安装

## 环境要求

- React `^18.0.0` 或 `^19.0.0`
- TypeScript `>= 5.0`（可选，但推荐）

`@lh-ui/react` 的唯一运行时依赖是 [`@lh-ui/share`](https://www.npmjs.com/package/@lh-ui/share) —— 家族的框架无关共享层（组件逻辑、样式、主题、文案）。peer 依赖只有 `react` 与 `react-dom`。

## 包管理器安装

```bash tab=pnpm
pnpm add @lh-ui/react
```

```bash tab=npm
npm install @lh-ui/react
```

```bash tab=yarn
yarn add @lh-ui/react
```

```bash tab=bun
bun add @lh-ui/react
```

## 引入样式

`@lh-ui/react` 采用**按需引入**策略（与 `@lh-ui/vue2` 对齐）：包入口不注入任何样式，主题变量与组件样式分别引入。

```ts
// 主题变量（必需）：包含设计令牌与暗色变量
import '@lh-ui/react/theme.css'

// 组件样式（按需）：每用到一个组件就引一条
import '@lh-ui/react/style/button'
import '@lh-ui/react/style/input'
```

主题 CSS 与组件 CSS 的类名完全一致，因此你也可以直接从 `@lh-ui/share` 引入同一份 SCSS 源自行编译：

```scss
@use '@lh-ui/share/styles/theme/common/var.scss';
@use '@lh-ui/share/styles/button';
```

:::tip[为什么不全量注入]
React 生态的按需引入是主流，且全量样式 side-effect 会破坏 tree-shaking。把样式入口交给用户，打包器能精确裁剪未用到的组件样式。
:::

## 暗色模式

暗色变量在 `theme-dark.css`，与 `theme.css` 互斥（二选一），或在运行时通过 `useLhTheme` / `useLhPresetTheme` 切换：

```ts
import { useLhTheme } from '@lh-ui/react'

function App() {
  const { theme, toggleTheme } = useLhTheme()
  return <button onClick={toggleTheme}>{theme === 'dark' ? '切换到日间' : '切换到夜间'}</button>
}
```

## 浏览器支持

现代浏览器（Chrome / Edge / Firefox / Safari 最近两个稳定版）。组件大量使用 CSS 自定义属性（`var(--lh-*)`），不支持 IE。
