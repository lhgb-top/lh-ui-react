import type { MouseEvent, ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhIconName } from '@lh-ui/share/core/icon'
import type { LhComponentSize, LhComponentType } from '@lh-ui/share/core/shared'

/**
 * Button Props（与 lh-ui-plus 的 LhButtonProps 同名同义同构）
 */
export interface LhButtonProps {
  /** 子节点 */
  children?: ReactNode
  /** 按钮类型 */
  type?: LhButtonType
  /** 尺寸，可选。若不传则从 ConfigProvider 继承 */
  size?: LhButtonSize
  /** 加载中状态 */
  loading?: boolean
  /** 禁用状态 */
  disabled?: boolean
  /** 朴素按钮（描边形态） */
  plain?: boolean
  /** 块级按钮（占满父容器宽度） */
  block?: boolean
  /** 圆角按钮 */
  round?: boolean
  /** 圆形按钮 */
  circle?: boolean
  /** 前置图标名 */
  icon?: LhIconName
  /** 原生 type 属性 */
  nativeType?: 'button' | 'submit' | 'reset'
  /** 传入后渲染为锚点 */
  href?: string
  /** 锚点的 target 属性 */
  target?: string
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 点击事件 */
  onClick?: (e: MouseEvent) => void
}

export type LhButtonType = LhComponentType
export type LhButtonSize = LhComponentSize
