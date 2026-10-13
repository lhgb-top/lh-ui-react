import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhDividerDirection, LhDividerLabelPosition } from '@lh-ui/share/core/divider'

/**
 * Divider Props（与 lh-ui-plus 的 LhDividerProps 同名同义同构）
 */
export interface LhDividerProps {
  /** 分割线文案（仅水平方向渲染） */
  children?: ReactNode
  /** 方向 */
  direction?: LhDividerDirection
  /** 是否虚线 */
  dashed?: boolean
  /** 文案位置 */
  labelPosition?: LhDividerLabelPosition
  /** 边框样式（显式指定时优先于 dashed） */
  borderStyle?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

export type { LhDividerDirection, LhDividerLabelPosition }
