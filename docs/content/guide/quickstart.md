# 快速开始

本页假设你已经完成 [安装](./installation.md)，并引入了 `theme.css` 与用到的组件样式。

## 无需 install

`@lh-ui/react` 没有插件机制：全部为命名导出，直接按需引入即可。

```tsx
import { LhButton } from '@lh-ui/react'
import '@lh-ui/react/theme.css'
import '@lh-ui/react/style/button'

export default function App() {
  return <LhButton type="primary">开始使用</LhButton>
}
```

## 受控与非受控

受控组件同时支持 `value` + `onChange`（受控）与 `defaultValue`（非受控），语义与原生 React 表单一致：

```tsx
import { useState } from 'react'
import { LhInput } from '@lh-ui/react'

function Demo() {
  const [value, setValue] = useState('')

  return (
    <>
      {/* 受控 */}
      <LhInput value={value} onChange={(val) => setValue(val)} />

      {/* 非受控 */}
      <LhInput defaultValue="默认值" />
    </>
  )
}
```

:::tip[事件回调是双参数]
所有表单组件的 `onChange` 都是 `(value, event)` 两个参数：第一个是新值，第二个是原生事件。这与 lh-ui-plus 的 `emit('change', [val, e])` 同构，方便从 Vue 迁移。
:::

## 全局配置

用 `LhConfigProvider` 下发全局尺寸、语言与主题变量：

```tsx
import { LhConfigProvider } from '@lh-ui/react'

export default function App() {
  return (
    <LhConfigProvider size="middle" locale="zh-CN">
      <YourApp />
    </LhConfigProvider>
  )
}
```

未包裹 `LhConfigProvider` 时组件也不会报错——消费侧有全字段 `undefined` 的兜底默认值。

## 命令式服务

`message` 等命令式服务通过惰性创建的单例容器挂载，首次调用才创建 React root：

```tsx
import { message, notification, loading } from '@lh-ui/react'
import '@lh-ui/react/style/message'

message.success('保存成功')
notification.success({ title: '保存成功', content: '作品已发布到画廊。' })
loading.show({ text: '提交中…' })
```

三个服务的定位：`message` 是轻量顶部提示，`notification` 是带标题 / 正文的四角通知，
`loading` 是全屏或局部的加载遮罩。详见各自的组件文档。

## 与 lh-ui-plus 的关系

`@lh-ui/react` 与 `@lh-ui/vue3`（lh-ui-plus）**同源同构**：

- 组件逻辑完全相同，来自 `@lh-ui/share/core`，两库都不持有逻辑副本
- 样式完全相同，来自 `@lh-ui/share/styles`，BEM 类名一一对应
- props 同名同义，只做 React 惯用化改写（`v-model` → `value/onChange` 等）

从 Vue 迁移请读 [迁移指南](./migration.md)。

## 服务端渲染（SSR）

组件对 SSR 安全：DOM 操作全部在 `useEffect` / `useIsomorphicLayoutEffect` 内执行，`useLhLocale` 用 `useSyncExternalStore` 提供 SSR 快照。命令式服务（`message` 等）在服务端调用时只打告警并 no-op。
