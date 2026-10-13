import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhFormRule } from '@lh-ui/share/core/form'
import type { FormEvent, ReactNode } from 'react'

export type LhFormLabelPosition = 'left' | 'right' | 'top'

/**
 * Form Props（与 lh-ui-plus 的 LhFormProps 同名同义同构）
 */
export interface LhFormProps {
  /** 子节点（LhFormItem 列表） */
  children?: ReactNode
  /** 表单数据模型（双向数据源，校验与重置均基于此） */
  model: Record<string, unknown>
  /** 全局校验规则，按字段名（支持点号路径）索引 */
  rules?: Record<string, LhFormRule[]>
  labelPosition?: LhFormLabelPosition
  labelWidth?: string | number
  inline?: boolean
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 提交事件（已阻止默认表单提交） */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

/**
 * Form Item Props（与 lh-ui-plus 的 LhFormItemProps 同名同义同构）
 */
export interface LhFormItemProps {
  /** 内容区 */
  children?: ReactNode
  /** 字段名（支持点号路径，对应 model 中的键） */
  prop?: string
  label?: string
  /** 必填星号（仅渲染标记，校验语义由 rules 的 required 提供） */
  required?: boolean
  /** item 级规则，与 form 级 rules 同名时覆盖 */
  rules?: LhFormRule[]
}

/**
 * Form 向 FormItem 下发的上下文。
 *
 * 纪律（对齐 plus 的 reactive getter 修正）：Context value 必须 useMemo 且
 * 依赖项包含 model/rules/labelPosition/labelWidth，禁止 setup 期快照 props ——
 * 运行时改 rules / labelPosition / labelWidth 必须传导给 FormItem。
 */
export interface LhFormContext {
  model: Record<string, unknown>
  rules?: Record<string, LhFormRule[]>
  labelPosition: LhFormLabelPosition
  labelWidth: string | number | undefined
  /** 注册字段校验函数，返回卸载回调 */
  registerField: (prop: string, validate: () => Promise<boolean>) => () => void
  validateField: (prop: string) => Promise<boolean>
  resetField: (prop: string) => void
  /**
   * 重置版本号：每次 resetFields 自增，FormItem 据此清除自身错误态
   * （React 侧增强：plus 靠 reactive 链路自动清，React 需显式信号）
   */
  resetVersion: number
}

/**
 * FormItem 向后代控件（input/checkbox/radio/switch）下发的上下文。
 *
 * 纪律：errorMessage 必须随状态更新（useState 驱动），控件侧据此绑定 aria-invalid；
 * provide 快照化是已登记的缺陷类型，此处禁止重蹈。
 */
export interface LhFormItemContext {
  /** 校验错误文案，非空即该校验失败 */
  errorMessage: string
  /**
   * 主动触发一次 change 校验（React 增强）。
   *
   * 原生控件（input / textarea / checkbox …）的 change 事件会冒泡到内容区，
   * FormItem 侧已统一捕获；但自定义控件（LhSelect 的选项点击只产生 click）
   * 没有原生 change 事件，需在值变化时主动调本方法，与冒泡路径对齐。
   */
  validateChange: (value?: unknown) => void
}

/** LhForm 通过 ref 暴露的命令式 API（对应 plus 的 defineExpose） */
export interface LhFormInstance {
  validate: () => Promise<boolean>
  validateField: (prop: string) => Promise<boolean>
  resetFields: () => void
  resetField: (prop: string) => void
}

/** LhFormItem 通过 ref 暴露的命令式 API */
export interface LhFormItemInstance {
  validate: () => Promise<boolean>
  errorMessage: string
}

export { type LhFormRule }
