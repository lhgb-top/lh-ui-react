import type { ReactNode } from 'react'
import type { LhComponentLanguage, LhComponentSize } from '@lh-ui/share/core/shared'

/**
 * 可配置主题的组件名称集合（与 plus 的清单保持一致，跨库迁移时 componentTheme 键通用）
 */
export type LhThemeableComponent =
  | 'button'
  | 'input'
  | 'dialog'
  | 'tooltip'
  | 'icon'
  | 'card'
  | 'alert'
  | 'popover'
  | 'popconfirm'
  | 'drawer'
  | 'dropdown'
  | 'message'
  | 'notification'
  | 'loading'
  | 'timeline'
  | 'collapse'
  | 'rate'
  | 'segmented'
  | 'calendar'
  | 'affix'
  | 'backtop'
  | 'image'
  | 'menu'
  | 'table'
  | 'layout'
  | 'tree'
  | 'transfer'
  | 'upload'
  | 'anchor'
  | 'steps'

/**
 * ConfigProvider 配置项（与 plus 的 LhConfigProviderProps 同名同义）
 */
export interface LhConfigProviderProps {
  /** 全局尺寸 */
  size?: LhComponentSize
  /** 全局语言 */
  locale?: LhComponentLanguage
  /** 全局主题变量
   * 支持键（会自动添加 --lh- 前缀）：
   * - `primary-color`, `success-color`, `warning-color`, `danger-color`, `info-color`
   * - `gold-color`, `vermilion-color`, `jade-color`
   * - `bg-color`, `text-color`, `border-color`
   * - `bg-pattern` — 花纹背景 URL（如 `var(--lh-pattern-willow)`）
   * - `bg-pattern-opacity` — 花纹透明度
   * - `bg-pattern-color` — 花纹颜色
   * - `decoration-color` — 装饰色 */
  themeVars?: Record<string, string>
  /** 启用背景花纹的组件白名单
   * - 只有白名单中的组件会应用全局 `themeVars` 中的 bg-pattern
   * - 空数组或 undefined 表示所有组件均禁用背景花纹
   * - 组件自身通过 `bgPattern` 或 `themeVars` 传入的花纹不受此限制
   */
  patternComponents?: LhThemeableComponent[]
  /** 按组件单独配置主题变量（覆盖全局 themeVars）
   * 键为组件名，值为该组件的主题变量对象
   * 优先级: 组件自身 props > componentTheme[组件名] > 全局 themeVars
   */
  componentTheme?: Partial<Record<LhThemeableComponent, Record<string, string>>>
  /** 子节点 */
  children?: ReactNode
}

/**
 * ConfigProvider 通过 Context 传递的配置上下文
 */
export interface LhConfigContext {
  size: LhComponentSize | undefined
  locale: LhComponentLanguage | undefined
  themeVars: Record<string, string> | undefined
  patternComponents?: LhThemeableComponent[]
  componentTheme?: Partial<Record<LhThemeableComponent, Record<string, string>>>
}
