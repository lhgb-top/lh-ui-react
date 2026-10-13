import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhPlacement } from '@lh-ui/share/core/shared/popper'
import type { LhSelectOption } from '@lh-ui/share/core/select'

export type LhSelectSize = 'small' | 'medium' | 'large'

/**
 * Select Props（React 惯用命名：value/defaultValue/onChange；对应 plus 的 modelValue/emit）
 */
export interface LhSelectProps {
  /** 受控选中值 */
  value?: unknown
  /** 非受控默认选中值 */
  defaultValue?: unknown
  /** 选项列表 */
  options?: LhSelectOption[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  size?: LhSelectSize
  name?: string
  ariaLabel?: string
  /** 下拉方位，默认 bottom-start（溢出视口时自动翻转） */
  placement?: LhPlacement
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 值变化（双参数：值 + 命中选项，未命中为 undefined） */
  onChange?: (value: unknown, option: LhSelectOption | undefined) => void
  /** 清除时触发 */
  onClear?: () => void
}

/** LhSelect 通过 ref 暴露的命令式 API（对应 plus 的 defineExpose） */
export interface LhSelectInstance {
  open: () => void
  close: () => void
  toggle: () => void
  clear: () => void
  isOpen: boolean
}

export { type LhSelectOption }
