# Preset themes

`@lh-ui/share` ships five built-in Chinese-style preset palettes, consumed as-is by `@lh-ui/react`. Presets change the `--lh-*` color variables and are orthogonal to light/dark mode (`useLhTheme`).

## Presets

| Name | Description |
| --- | --- |
| `cerblue` | Ceramic blue (default) |
| `songhua` | Pine green |
| `zhusha` | Vermilion |
| `shuimo` | Ink wash |
| `golden` | Golden autumn |

## Runtime switching

Switch with `useLhPresetTheme`. The preset variables are written into `<style id="lh-preset-theme">` (at the `:root` level) and apply globally:

```tsx
import { useLhPresetTheme } from '@lh-ui/react'

function PresetSwitcher() {
  const { preset, setPreset, presets } = useLhPresetTheme()

  return (
    <select value={preset} onChange={(e) => setPreset(e.target.value as never)}>
      {presets.map((p) => (
        <option key={p.name} value={p.name}>
          {p.name}
        </option>
      ))}
    </select>
  )
}
```

Return values:

| Field | Type | Description |
| --- | --- | --- |
| `preset` | `ThemePresetName` | Current preset name |
| `setPreset` | `(name) => void` | Switch preset (writes to localStorage synchronously) |
| `presets` | `ThemePreset[]` | The full preset list |
| `themeVars` | `Record<string, string>` | ConfigProvider-compatible variables of the current preset (keys without the `--lh-` prefix) |

## Pairing with ConfigProvider

The `themeVars` return value can be fed directly to `LhConfigProvider` so that a preset only affects a subtree instead of the whole page:

```tsx
import { LhConfigProvider, useLhPresetTheme } from '@lh-ui/react'

function App() {
  const { themeVars } = useLhPresetTheme({ initialPreset: 'zhusha' })
  return (
    <LhConfigProvider themeVars={themeVars}>
      <YourApp />
    </LhConfigProvider>
  )
}
```

## Anti-flicker

At build time this site serializes "preset name → style text" into a synchronous script in the HTML head, applying the preset remembered in localStorage before first paint to avoid a flash of the default colors on refresh. The config lives in the `PRESET_FOUC_SCRIPT` of `docs/docusaurus.config.ts`.

:::warning[Never use inline style]
Preset variables must be written to a `<style>` element, never to `document.documentElement.style`: inline style has specificity 1,0,0,0, which always beats the stylesheets — the page would keep reading stale inline values when switching presets at runtime, and it would override the entire dark-variable block of `var-dark.scss`.
:::
