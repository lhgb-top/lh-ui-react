import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhPlacement } from '@lh-ui/share/core/shared/popper'
import type { LhPopoverTrigger } from '@lh-ui/share/core/popover'

export type LhPopoverPlacement = LhPlacement

/**
 * Popover Props（与 lh-ui-plus 的 LhPopoverProps 同名同义同构）
 *
 * 受控语义与 Tooltip 一致：传入 visible 即受控，显隐事件通过 onVisibleChange 抛出。
 */
export interface LhPopoverProps {
  /** 子节点（触发器） */
  children?: ReactNode
  /** 标题 */
  title?: ReactNode
  /** 正文内容 */
  content?: ReactNode
  /** 展示位置（溢出视口时自动翻转） */
  placement?: LhPopoverPlacement
  /** 触发方式，默认 click */
  trigger?: LhPopoverTrigger
  /** 是否禁用（禁用时所有触发都不响应） */
  disabled?: boolean
  /** 是否显示箭头，默认 true */
  arrow?: boolean
  /** 弹出层宽度（数字为 px） */
  width?: string | number
  /** 受控可见状态 */
  visible?: boolean
  /** 非受控默认可见状态 */
  defaultVisible?: boolean
  /** 可见状态变化 */
  onVisibleChange?: (visible: boolean) => void
  /** 延迟显示时间(ms)，默认 200（防误触） */
  showAfter?: number
  /** 延迟隐藏时间(ms)，默认 100（留给指针移进弹出层） */
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

/** LhPopover 通过 ref 暴露的命令式 API */
export interface LhPopoverInstance {
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
}
