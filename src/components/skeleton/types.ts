import type { CSSProperties, ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhSkeletonVariant } from '@lh-ui/share/core/skeleton'

/**
 * Skeleton Props（与 lh-ui-plus 的 LhSkeletonProps 同名同义同构）
 */
export interface LhSkeletonProps {
  /** 真实内容（loading=false 时渲染） */
  children?: ReactNode
  /** 是否显示骨架（false 时渲染子节点） */
  loading?: boolean
  /** 文本行数 */
  rows?: number
  /** 是否含圆形头像占位 */
  avatar?: boolean
  /** 是否开启动画 */
  animated?: boolean
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

/**
 * SkeletonItem Props（与 lh-ui-plus 的 LhSkeletonItemProps 同名同义同构）
 */
export interface LhSkeletonItemProps {
  /** 占位块形状 */
  variant?: LhSkeletonVariant
  /** 是否开启动画（覆盖父 Skeleton 的 animated） */
  animated?: boolean
  /** 追加类名（与内部 lh-skeleton-item 类名合并，如父组件挂的 __avatar） */
  className?: string
  /** 追加内联样式（如父组件给的行宽） */
  style?: CSSProperties
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

export type { LhSkeletonVariant }
