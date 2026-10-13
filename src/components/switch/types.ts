import type { LhSxProps, LhComponentSize } from '@lh-ui/share/core/shared'

/**
 * Switch Props（React 惯用命名：checked/onChange；对应 plus 的 modelValue/emit）
 */
export interface LhSwitchProps {
  /** 受控开关状态 */
  checked?: boolean
  /** 非受控默认开关状态 */
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  name?: string
  size?: LhSwitchSize
  /** 开启时文案 */
  activeText?: string
  /** 关闭时文案 */
  inactiveText?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 开关状态变化（checked） */
  onChange?: (checked: boolean) => void
}

export type LhSwitchSize = LhComponentSize
