import type { LhSxProps, LhComponentSize } from '@lh-ui/share/core/shared'
import type { LhIconName } from '@lh-ui/share/core/icon'
import type { ChangeEvent, FocusEvent, FormEvent, KeyboardEvent } from 'react'

/**
 * Input 类型
 */
export const LH_INPUT_TYPE_CONST = {
  text: 'text',
  textarea: 'textarea',
  password: 'password',
  number: 'number',
  email: 'email',
  url: 'url',
  tel: 'tel',
  date: 'date',
  time: 'time',
} as const

export type LhInputType = (typeof LH_INPUT_TYPE_CONST)[keyof typeof LH_INPUT_TYPE_CONST]

/**
 * Input 尺寸
 */
export type LhInputSize = LhComponentSize

/**
 * Input Props（React 惯用命名：value/defaultValue/onChange；对应 plus 的 modelValue/emit）
 *
 * 事件回调统一双参数 (value, event)：与 plus 的 emit('change', [val, e]) 同义，
 * React 用户既能直接拿值，也能取原生事件。
 */
export interface LhInputProps {
  /** 受控文本值 */
  value?: string
  /** 非受控默认值 */
  defaultValue?: string
  type?: LhInputType
  size?: LhInputSize
  disabled?: boolean
  readonly?: boolean
  placeholder?: string
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  clearable?: boolean
  /**
   * 密码显隐开关（React 首创，plus / vue2 无此 prop）：type 为 password 时，
   * 后缀渲染眼睛按钮切换 password ↔ text 明文显示
   */
  showPassword?: boolean
  /** 前缀图标名称（内置 LhIcon 图标，如 `search`） */
  prefixIcon?: LhIconName
  /** 后缀图标名称（内置 LhIcon 图标，如 `date`） */
  suffixIcon?: LhIconName
  autofocus?: boolean
  autocomplete?: string
  /** 覆盖原生 input type（如 button/submit 等 type 枚举之外的形态） */
  nativeType?: string
  /** textarea 自适应高度：true 等价于 { minRows: 1 } */
  autosize?: boolean | { minRows?: number; maxRows?: number }
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  name?: string
  rows?: number
  tabindex?: number
  form?: string
  inputStyle?: Record<string, string>
  /** 浮动标签（有 label 时 placeholder 自动失效） */
  label?: string
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 输入时触发（受控场景应在此同步 value） */
  onInput?: (value: string, e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  /** 值变化时触发（change 事件，含失焦提交场景） */
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onFocus?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onBlur?: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onClear?: () => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}
