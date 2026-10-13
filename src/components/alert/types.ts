import type { MouseEvent, ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhAlertType } from '@lh-ui/share/core/alert'

/**
 * Alert Props（与 lh-ui-plus 的 LhAlertProps 同名同义同构）
 *
 * React 无插槽概念：plus 的 #title 插槽与 title prop 合并为一个 ReactNode prop。
 * 关闭为内部非受控状态 + onClose 回调（与 plus 一致），无过渡动画。
 */
export interface LhAlertProps {
  /** 描述正文 */
  children?: ReactNode
  /** 警告类型 */
  type?: LhAlertType
  /** 标题（不传时不渲染标题行） */
  title?: ReactNode
  /** 是否可关闭 */
  closable?: boolean
  /** 是否显示类型图标 */
  showIcon?: boolean
  /** 是否朴素样式（浅色描边） */
  plain?: boolean
  /** 关闭按钮 aria-label，未传取语言包 alert.close */
  closeLabel?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 关闭按钮点击时触发 */
  onClose?: (e: MouseEvent) => void
}

export type { LhAlertType }
