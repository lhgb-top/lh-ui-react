import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'

/**
 * Empty Props（与 lh-ui-plus 的 LhEmptyProps 同名同义同构）
 *
 * React 无插槽概念：plus 的 #description 插槽与 description prop 合并为一个
 * ReactNode prop（与 Dialog 的 title/header 映射惯例一致）。
 */
export interface LhEmptyProps {
  /** 自定义图片区（替代 image prop，传入时容器走自定义图样式） */
  children?: ReactNode
  /** 描述文案：未传时取语言包 empty.description */
  description?: ReactNode
  /** 自定义图片 URL */
  image?: string
  /** 动作区（如刷新按钮） */
  actions?: ReactNode
  /** sx 快速布局属性 */
  sx?: LhSxProps
}
