# Theme customization

All design tokens of `@lh-ui/react` come from `@lh-ui/share/theme`; this library holds no token copies. Customizing a theme means overriding these CSS custom properties.

## Token precedence

Style precedence, from lowest to highest:

1. **`theme.css`** — base tokens published by `@lh-ui/share` (`--lh-primary-color`, etc.)
2. **`theme-dark.css`** — dark-mode variables (mutually exclusive with `theme.css`; pick one)
3. **`themeVars` of `LhConfigProvider`** — cascading variables attached to the wrapping element
4. **The `themeVars` prop of a component** — attached to the component root, overriding any ancestor

## Customizing via ConfigProvider

The recommended approach: pass `themeVars` at the app root. Keys are written **without** the `--lh-` prefix (it is added internally):

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

The variables render as `style="--lh-primary-color: #722ed1; ..."` on the wrapping element and cascade downward.

### Available tokens

| Key | Description |
| --- | --- |
| `primary-color` | Primary color |
| `success-color` / `warning-color` / `danger-color` / `info-color` | Semantic colors |
| `gold-color` / `vermilion-color` / `jade-color` | Chinese-style colors (gold / vermilion / jade) |
| `bg-color` / `text-color` / `border-color` | Neutral colors |
| `bg-pattern` | Pattern background URL (e.g. `var(--lh-pattern-willow)`) |
| `bg-pattern-opacity` / `bg-pattern-color` | Pattern opacity and color |
| `decoration-color` | Decoration color |

## Per-component customization

Any theme-aware component accepts `themeVars` directly, affecting only itself:

```tsx
<LhButton themeVars={{ 'primary-color': '#13c2c2' }}>Cyan button</LhButton>
```

You can also configure components by name with `componentTheme` (the keys are shared with the other libraries of the family):

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

Precedence: **component's own props > `componentTheme[componentName]` > global `themeVars`**.

## Background patterns

The Chinese-style pattern background is off by default. Enable it via the `patternComponents` allowlist — only components in the list apply the global pattern:

```tsx
<LhConfigProvider
  themeVars={{ 'bg-pattern': 'var(--lh-pattern-willow)' }}
  patternComponents={['dialog', 'card']}
>
  <YourApp />
</LhConfigProvider>
```

A pattern passed through the component's own `bgPattern` prop is not restricted by the allowlist.

## sx layout shorthand

Some components support the `sx` prop, which turns common layout styles into an object (semantics match the `sx` of emotion / MUI):

```tsx
<LhButton sx={{ marginTop: 2, width: '100%' }} block>
  Block button
</LhButton>
```

## Runtime switching

Theming is ultimately about changing CSS variables, so it can be fully dynamic:

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

:::tip[Type assertion for CSS variables]
In source code, `style="{ { '--lh-primary-color': x } }"` errors under TypeScript (`CSSProperties` has no custom-property keys). This library uses the `cssVarsStyle()` utility to normalize key conversion and assertions. It is already wrapped inside the components, so consumers do not need to care.
:::
