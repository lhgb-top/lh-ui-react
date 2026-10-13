import type { ReactNode, CSSProperties } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type {
  LhSpaceAlignment,
  LhSpaceSizeInput,
} from '@lh-ui/share/core/space'

/**
 * Space Props（与 lh-ui-plus 的 LhSpaceProps 同名同义同构）
 */
export interface LhSpaceProps {
  /** 子节点 */
  children?: ReactNode
  /** 排列方向 */
  direction?: 'horizontal' | 'vertical'
  /** 间距：预设档位 / 数字 / [水平, 垂直] */
  size?: LhSpaceSizeInput
  /** 是否换行（仅水平方向生效） */
  wrap?: boolean
  /** 对齐方式（align-items） */
  alignment?: LhSpaceAlignment
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

export type { LhSpaceAlignment, LhSpaceSizeInput }
export type LhSpaceStyle = CSSProperties
