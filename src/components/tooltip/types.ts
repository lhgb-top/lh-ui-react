import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhPlacement } from '@lh-ui/share/core/shared/popper'

export type LhTooltipPlacement = LhPlacement
export type LhTooltipTrigger = 'hover' | 'click' | 'focus'
export type LhTooltipEffect = 'dark' | 'light'
export type LhTooltipType = 'primary' | 'success' | 'warning' | 'danger' | 'info'

/**
 * Tooltip Props（React 惯用命名：visible/onVisibleChange；对应 plus 的 manual+visible）
 *
 * 受控语义：传入 visible 即受控，显隐事件通过 onVisibleChange 抛出由外部决定；
 * 不传时组件自管（可用 defaultVisible 设初值）。
 */
export interface LhTooltipProps {
  /** 子节点 */
  children?: ReactNode
  /** 提示文字内容 */
  content?: string
  /** 展示位置（溢出视口时自动翻转） */
  placement?: LhTooltipPlacement
  /** 触发方式 */
  trigger?: LhTooltipTrigger
  /** 是否禁用（禁用时所有触发都不响应） */
  disabled?: boolean
  /** 受控可见状态 */
  visible?: boolean
  /** 非受控默认可见状态 */
  defaultVisible?: boolean
  /** 可见状态变化 */
  onVisibleChange?: (visible: boolean) => void
  /** 延迟显示时间(ms)，默认 200（防误触） */
  showAfter?: number
  /** 延迟隐藏时间(ms)，默认 0 */
  hideAfter?: number
  /** 延迟显示时间(ms)，showAfter 的别名 */
  openDelay?: number
  /** 关闭延迟，hideAfter 的别名 */
  closeDelay?: number
  /** 主题 */
  effect?: LhTooltipEffect
  /** 内置主题色类型（会覆盖 effect 的背景色） */
  type?: LhTooltipType
  /** 自定义背景色（会覆盖 effect 和 type 的背景色） */
  bgColor?: string
  /** 最大宽度 */
  maxWidth?: string | number
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性（作用于触发器根元素） */
  sx?: LhSxProps
}

/** LhTooltip 通过 ref 暴露的命令式 API */
export interface LhTooltipInstance {
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
}
