import type { ReactNode } from 'react'
import type { LhSxProps, LhComponentSize } from '@lh-ui/share/core/shared'

/**
 * Checkbox Props（React 惯用命名：checked/onChange；对应 plus 的 modelValue/emit）
 */
export interface LhCheckboxProps {
  /** 子节点 */
  children?: ReactNode
  /** 受控选中状态（非 Group 模式） */
  checked?: boolean
  /** 非受控默认选中状态 */
  defaultChecked?: boolean
  /** Group 模式下的选项值 */
  value?: unknown
  /** 文本标签（也可用 children 自定义） */
  label?: string
  disabled?: boolean
  /** 半选状态（受控，仅影响视觉与 indeterminate 属性） */
  indeterminate?: boolean
  name?: string
  size?: LhCheckboxSize
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 选中状态变化（checked） */
  onChange?: (checked: boolean) => void
}

export type LhCheckboxSize = LhComponentSize

export interface LhCheckboxGroupProps {
  /** 子项（LhCheckbox 列表） */
  children?: ReactNode

  /** 受控选中值数组 */
  value?: unknown[]
  /** 非受控默认选中值数组 */
  defaultValue?: unknown[]
  disabled?: boolean
  name?: string
  size?: LhCheckboxSize
  /** 选中值数组变化 */
  onChange?: (values: unknown[]) => void
}

/**
 * Group 向 Checkbox 下发的上下文。
 * 纪律：Context value 必须 useMemo，禁止 props 快照（动态禁用/改尺寸需传导）。
 */
export interface LhCheckboxGroupContext {
  values: unknown[]
  disabled: boolean
  name: string | undefined
  size: LhCheckboxSize
  toggle: (value: unknown, checked: boolean) => void
}
