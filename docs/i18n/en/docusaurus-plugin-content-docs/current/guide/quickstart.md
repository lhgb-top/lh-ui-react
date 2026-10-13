# Quick start

This page assumes you have finished [Installation](./installation.md) and imported `theme.css` plus the styles of the components you use.

## No install needed

`@lh-ui/react` has no plugin mechanism: everything is a named export — just import what you need.

```tsx
import { LhButton } from '@lh-ui/react'
import '@lh-ui/react/theme.css'
import '@lh-ui/react/style/button'

export default function App() {
  return <LhButton type="primary">Get started</LhButton>
}
```

## Controlled and uncontrolled

Controlled components support both `value` + `onChange` (controlled) and `defaultValue` (uncontrolled), matching the semantics of native React forms:

```tsx
import { useState } from 'react'
import { LhInput } from '@lh-ui/react'

function Demo() {
  const [value, setValue] = useState('')

  return (
    <>
      {/* Controlled */}
      <LhInput value={value} onChange={(val) => setValue(val)} />

      {/* Uncontrolled */}
      <LhInput defaultValue="Default value" />
    </>
  )
}
```

:::tip[Event callbacks take two arguments]
The `onChange` of every form component takes `(value, event)`: the first argument is the new value, the second the native event. This mirrors lh-ui-plus's `emit('change', [val, e])` and eases migration from Vue.
:::

## Global configuration

Use `LhConfigProvider` to provide global size, locale, and theme variables:

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

Components do not error when no `LhConfigProvider` wraps them — the consumer side falls back to defaults with every field `undefined`.

## Imperative services

Imperative services such as `message` mount through a lazily created singleton container; the React root is created on first call:

```tsx
import { message, notification, loading } from '@lh-ui/react'
import '@lh-ui/react/style/message'

message.success('Saved successfully')
notification.success({ title: 'Saved successfully', content: 'The artwork has been published to the gallery.' })
loading.show({ text: 'Submitting…' })
```

The three services serve different purposes: `message` is a lightweight top toast, `notification` is a corner notification with a title and body, and `loading` is a fullscreen or local loading overlay. See each component's documentation for details.

## Relationship with lh-ui-plus

`@lh-ui/react` and `@lh-ui/vue3` (lh-ui-plus) share the **same source and structure**:

- Component logic is identical, coming from `@lh-ui/share/core` — neither library keeps a logic copy
- Styles are identical, coming from `@lh-ui/share/styles`, with one-to-one BEM class mapping
- Props share names and semantics, only adapted to React idioms (`v-model` → `value/onChange`, etc.)

Migrating from Vue? Read the [Migration guide](./migration.md).

## Server-side rendering (SSR)

Components are SSR-safe: all DOM operations happen inside `useEffect` / `useIsomorphicLayoutEffect`, and `useLhLocale` provides an SSR snapshot via `useSyncExternalStore`. When called on the server, imperative services (`message`, etc.) only log a warning and no-op.
