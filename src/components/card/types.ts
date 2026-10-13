import type { MouseEvent, ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhCardShadow } from '@lh-ui/share/core/card'

/**
 * Card Props（与 lh-ui-plus 的 LhCardProps 同名同义同构）
 *
 * React 无插槽概念：plus 的 cover/header/extra/footer 插槽映射为 ReactNode props，
 * 默认插槽为 children（与 Dialog 的 header/footer 映射惯例一致）。
 */
export interface LhCardProps {
  /** 正文内容（loading 时被骨架占位替换） */
  children?: ReactNode
  /** 标题（无 header 时渲染默认头部） */
  title?: string
  /** 阴影显示时机 */
  shadow?: LhCardShadow
  /** 整卡是否可点击（承担 button 键盘语义） */
  clickable?: boolean
  /** 是否加载中（正文区以骨架占位，整卡禁止交互） */
  loading?: boolean
  /** 封面区 */
  cover?: ReactNode
  /** 头部内容（不传时用 title 渲染默认头部） */
  header?: ReactNode
  /** 头部右侧附加区 */
  extra?: ReactNode
  /** 底部区域 */
  footer?: ReactNode
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 点击事件（仅 clickable 且非 loading 时触发） */
  onClick?: (e: MouseEvent) => void
}

export type { LhCardShadow }
