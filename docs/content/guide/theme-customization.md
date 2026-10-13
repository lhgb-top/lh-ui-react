# 主题定制

`@lh-ui/react` 的设计令牌全部来自 `@lh-ui/share/theme`，本库不持有任何令牌副本。定制主题就是覆盖这些 CSS 自定义属性。

## 令牌层级

样式的优先级从低到高：

1. **`theme.css`** —— `@lh-ui/share` 发布的基础令牌（`--lh-primary-color` 等）
2. **`theme-dark.css`** —— 暗色变量（与 `theme.css` 互斥，二选一）
3. **`LhConfigProvider` 的 `themeVars`** —— 挂到包裹元素的级联变量
4. **组件 `themeVars` prop** —— 挂到组件根元素，覆盖一切上级

## 通过 ConfigProvider 定制

最推荐的方式：在应用根部传入 `themeVars`，键名**不带** `--lh-` 前缀（内部自动加）：

```tsx
import { LhConfigProvider } from '@lh-ui/react'

export default function App() {
  return (
    <LhConfigProvider
      themeVars={{
        'primary-color': '#722ed1',
        'bg-color': '#faf9f7',
        'border-radius-base': '6px',
      }}
    >
      <YourApp />
    </LhConfigProvider>
  )
}
```

变量会渲染为包裹元素上的 `style="--lh-primary-color: #722ed1; ..."`，向下级联。

### 可用令牌

| 键 | 说明 |
| --- | --- |
| `primary-color` | 主色 || `success-color` / `warning-color` / `danger-color` / `info-color` | 语义色 |
| `gold-color` / `vermilion-color` / `jade-color` | 国风专属色（金黄 / 朱砂 / 翡翠） |
| `bg-color` / `text-color` / `border-color` | 中性色 |
| `bg-pattern` | 花纹背景 URL（如 `var(--lh-pattern-willow)`） |
| `bg-pattern-opacity` / `bg-pattern-color` | 花纹透明度与颜色 |
| `decoration-color` | 装饰色 |

## 单组件定制

任何支持主题的组件都能直接收 `themeVars`，只影响自身：

```tsx
<LhButton themeVars={{ 'primary-color': '#13c2c2' }}>青色按钮</LhButton>
```

也可以用 `componentTheme` 按组件名批量配置（键名与家族其他库通用）：

```tsx
<LhConfigProvider
  componentTheme={{
    button: { 'primary-color': '#722ed1' },
    input: { 'border-color': '#d9d9d9' },
  }}
>
  <YourApp />
</LhConfigProvider>
```

优先级：**组件自身 props > `componentTheme[组件名]` > 全局 `themeVars`**。

## 背景花纹

国风花纹背景默认关闭。通过 `patternComponents` 白名单开启，只有白名单中的组件会应用全局花纹：

```tsx
<LhConfigProvider
  themeVars={{ 'bg-pattern': 'var(--lh-pattern-willow)' }}
  patternComponents={['dialog', 'card']}
>
  <YourApp />
</LhConfigProvider>
```

组件自身通过 `bgPattern` prop 传入的花纹不受白名单限制。

## sx 快速布局

部分组件支持 `sx` prop，把常用的布局样式写成对象（语义同 emotion / MUI 的 `sx`）：

```tsx
<LhButton sx={{ marginTop: 2, width: '100%' }} block>
  通栏按钮
</LhButton>
```

## 运行时切换

主题切换的本质是改 CSS 变量，因此可以是完全动态的：

```tsx
import { useState } from 'react'
import { LhConfigProvider } from '@lh-ui/react'

function App() {
  const [primary, setPrimary] = useState('#1677ff')
  return (
    <LhConfigProvider themeVars={{ 'primary-color': primary }}>
      <input type="color" onChange={(e) => setPrimary(e.target.value)} />
      <YourApp />
    </LhConfigProvider>
  )
}
```

:::tip[CSS 变量的类型断言]
源码里 `style="{ { '--lh-primary-color': x } }"` 在 TypeScript 下会报错（`CSSProperties` 不含自定义属性键）。本库用 `cssVarsStyle()` 工具统一处理键名转换与断言，组件内部已封装，用户层无需关心。
:::
