# Installation

## Requirements

- React `^18.0.0` or `^19.0.0`
- TypeScript `>= 5.0` (optional, but recommended)

The only runtime dependency of `@lh-ui/react` is [`@lh-ui/share`](https://www.npmjs.com/package/@lh-ui/share) — the framework-agnostic shared layer of the family (component logic, styles, themes, and messages). Its only peer dependencies are `react` and `react-dom`.

## Package manager

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

## Importing styles

`@lh-ui/react` follows an **on-demand import** strategy (aligned with `@lh-ui/vue2`): the package entry injects no styles at all — theme variables and component styles are imported separately.

```ts
// Theme variables (required): design tokens plus dark-mode variables
import '@lh-ui/react/theme.css'

// Component styles (on-demand): one import per component you use
import '@lh-ui/react/style/button'
import '@lh-ui/react/style/input'
```

The theme CSS and component CSS share identical class names, so you can also import the same SCSS sources directly from `@lh-ui/share` and compile them yourself:

```scss
@use '@lh-ui/share/styles/theme/common/var.scss';
@use '@lh-ui/share/styles/button';
```

:::tip[Why not inject everything]
On-demand importing is the mainstream in the React ecosystem, and a full-stylesheet side effect would break tree-shaking. Leaving the style entry to the user lets the bundler trim unused component styles precisely.
:::

## Dark mode

Dark variables live in `theme-dark.css` and are mutually exclusive with `theme.css` (pick one), or switch at runtime with `useLhTheme` / `useLhPresetTheme`:

```ts
import { useLhTheme } from '@lh-ui/react'

function App() {
  const { theme, toggleTheme } = useLhTheme()
  return <button onClick={toggleTheme}>{theme === 'dark' ? 'Switch to light' : 'Switch to dark'}</button>
}
```

## Browser support

Modern browsers (the latest two stable versions of Chrome / Edge / Firefox / Safari). Components rely heavily on CSS custom properties (`var(--lh-*)`); IE is not supported.
