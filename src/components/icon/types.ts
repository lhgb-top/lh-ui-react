import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhIconName } from '@lh-ui/share/core/icon'

/**
 * Icon Props（与 lh-ui-plus 的 LhIconProps 同名同义同构）
 */
export interface LhIconProps {
  /** 子节点 */
  children?: ReactNode
  /** 追加类名（与内部 lh-icon 类名合并） */
  className?: string
  /** 图标名称，不传时回退渲染 children（自定义 svg 场景） */
  name?: LhIconName
  /** 图标尺寸（数值按 px，或预设键名 mini/small/medium/large/x-large） */
  size?: string | number
  /** 图标颜色（覆盖 currentColor） */
  color?: string
  /** 是否为纯装饰图标，默认 true 输出 aria-hidden；承载语义时传 false 并给 ariaLabel */
  decorative?: boolean
  /** 装饰态关闭时的可达名称 */
  ariaLabel?: string
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

export type LhIconSize = string | number
