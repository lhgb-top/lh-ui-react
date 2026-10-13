import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhPlacement } from '@lh-ui/share/core/shared/popper'
import type { LhPopconfirmTrigger, LhPopconfirmType } from '@lh-ui/share/core/popconfirm'

export type LhPopconfirmPlacement = LhPlacement

/**
 * Popconfirm Props（与 lh-ui-plus 的 LhPopconfirmProps 同名同义同构）
 *
 * 点击元素弹出确认气泡，语义为「危险 / 重要操作前的二次确认」。
 */
export interface LhPopconfirmProps {
  /** 子节点（触发器） */
  children?: ReactNode
  /** 确认的标题 / 问题 */
  title?: ReactNode
  /** 确认按钮文案，默认取语言包 popconfirm.confirm */
  confirmText?: string
  /** 取消按钮文案，默认取语言包 popconfirm.cancel */
  cancelText?: string
  /** 语气类型，默认 warning */
  type?: LhPopconfirmType
  /** 展示位置（溢出视口时自动翻转） */
  placement?: LhPopconfirmPlacement
  /** 触发方式，默认 click */
  trigger?: LhPopconfirmTrigger
  /** 是否禁用（禁用时所有触发都不响应） */
  disabled?: boolean
  /** 是否显示图标，默认 true */
  showIcon?: boolean
  /** 是否隐藏取消按钮（只留确认） */
  hideCancel?: boolean
  /** 受控可见状态 */
  visible?: boolean
  /** 非受控默认可见状态 */
  defaultVisible?: boolean
  /** 可见状态变化 */
  onVisibleChange?: (visible: boolean) => void
  /** 确认回调 */
  onConfirm?: () => void
  /** 取消回调 */
  onCancel?: () => void
  /** 延迟显示时间(ms)，默认 200 */
  showAfter?: number
  /** 延迟隐藏时间(ms)，默认 100 */
  hideAfter?: number
  /** 弹出层附加类名 */
  popperClass?: string
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性（作用于触发器根元素） */
  sx?: LhSxProps
}

/** LhPopconfirm 通过 ref 暴露的命令式 API */
export interface LhPopconfirmInstance {
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
}
