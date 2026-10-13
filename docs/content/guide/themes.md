# 预设主题

`@lh-ui/share` 内置五套国风预设色板，`@lh-ui/react` 原样消费。预设改变的是 `--lh-*` 配色变量，与明暗模式（`useLhTheme`）正交。

## 预设清单

| 名称 | 说明 |
| --- | --- |
| `cerblue` | 青蓝（默认） |
| `songhua` | 松花 |
| `zhusha` | 朱砂 |
| `shuimo` | 水墨 |
| `golden` | 鎏金 |

## 运行时切换

用 `useLhPresetTheme` 切换。预设变量写入 `<style id="lh-preset-theme">`（`:root` 级），全局生效：

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

返回值：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `preset` | `ThemePresetName` | 当前预设名 |
| `setPreset` | `(name) => void` | 切换预设（同步写入 localStorage） |
| `presets` | `ThemePreset[]` | 全部预设清单 |
| `themeVars` | `Record<string, string>` | 当前预设的 ConfigProvider 兼容变量（键已去掉 `--lh-` 前缀） |

## 与 ConfigProvider 联动

`themeVars` 返回值可直接喂给 `LhConfigProvider`，让预设只作用于子树而非全局：

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

## 防闪烁

本站构建期把「预设名 → 样式文本」序列化进 HTML head 的同步脚本，在首次绘制前应用 localStorage 中记忆的预设，避免刷新时先闪默认色再切换。配置在 `docs/docusaurus.config.ts` 的 `PRESET_FOUC_SCRIPT`。

:::warning[不能用内联 style]
预设变量**只能写 `<style>` 元素，不能写 `document.documentElement.style`**：内联样式特异性 1,0,0,0 恒压样式表，会导致运行时切换预设时页面仍读旧内联值，且压过 `var-dark.scss` 的整段暗色变量。
:::
