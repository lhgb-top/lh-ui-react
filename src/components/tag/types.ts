import type { MouseEvent, ReactNode } from 'react'
import type { LhSxProps, LhComponentSize } from '@lh-ui/share/core/shared'
import type { LhTagType } from '@lh-ui/share/core/tag'

/**
 * Tag Props（与 lh-ui-plus 的 LhTagProps 同名同义同构）
 */
export interface LhTagProps {
  /** 子节点 */
  children?: ReactNode
  /** 标签类型 */
  type?: LhTagType
  /** 尺寸 */
  size?: LhTagSize
  /** 是否可关闭（渲染关闭按钮） */
  closable?: boolean
  /** 禁用状态（关闭按钮与点击均失效） */
  disabled?: boolean
  /** 圆角 */
  round?: boolean
  /** 描边形态（hit） */
  hit?: boolean
  /** 点击事件（传入时根元素升级为 role=button 并支持键盘激活） */
  onClick?: (e: MouseEvent) => void
  /** 关闭按钮点击事件 */
  onClose?: (e: MouseEvent) => void
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

export type LhTagSize = LhComponentSize
