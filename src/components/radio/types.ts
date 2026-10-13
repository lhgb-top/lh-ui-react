import type { ReactNode } from 'react'
import type { LhSxProps, LhComponentSize } from '@lh-ui/share/core/shared'

/**
 * Radio Props（React 惯用命名：checked/value/onChange；对应 plus 的 modelValue/emit）
 */
export interface LhRadioProps {
  /** 子节点 */
  children?: ReactNode
  /** 受控选中值（非 Group 模式，与 value 匹配即选中） */
  checked?: unknown
  /** 非受控默认选中值 */
  defaultChecked?: unknown
  /** 该选项代表的值 */
  value?: unknown
  /** 文本标签（也可用 children 自定义） */
  label?: string
  disabled?: boolean
  name?: string
  size?: LhRadioSize
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 选中值变化（传出本选项的 value） */
  onChange?: (value: unknown) => void
}

export type LhRadioSize = LhComponentSize

export interface LhRadioGroupProps {
  /** 子项（LhRadio 列表） */
  children?: ReactNode

  /** 受控选中值 */
  value?: unknown
  /** 非受控默认选中值 */
  defaultValue?: unknown
  disabled?: boolean
  name?: string
  size?: LhRadioSize
  /** 选中值变化 */
  onChange?: (value: unknown) => void
}

/**
 * Group 向 Radio 下发的上下文。
 * 纪律：Context value 必须 useMemo，禁止 props 快照（动态禁用/改尺寸需传导）。
 */
export interface LhRadioGroupContext {
  modelValue: unknown
  disabled: boolean
  name: string | undefined
  size: LhRadioSize
  onChange: (value: unknown) => void
}
