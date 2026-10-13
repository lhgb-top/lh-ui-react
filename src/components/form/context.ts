/**
 * Form 上下文（提前独立存放，供 checkbox / radio / switch / input 等表单组件消费）
 *
 * 对应 plus 的 LH_FORM_CONTEXT_KEY / LH_FORM_ITEM_CONTEXT_KEY。
 * React 侧用 createContext + 消费侧兜底：无 Form 包裹时返回默认空实现，
 * 让表单组件内部不必处处判空。
 */
import { createContext } from 'react'
import type { LhFormContext as LhFormContextValue, LhFormItemContext as LhFormItemContextValue } from './types'

/** 无 Form 包裹时的默认实现：校验恒通过，注册/重置均为空操作 */
export const DEFAULT_FORM_CONTEXT: LhFormContextValue = {
  model: {},
  rules: undefined,
  labelPosition: 'right',
  labelWidth: undefined,
  registerField: () => () => {},
  validateField: () => Promise.resolve(true),
  resetField: () => {},
  resetVersion: 0,
}

export const DEFAULT_FORM_ITEM_CONTEXT: LhFormItemContextValue = {
  errorMessage: '',
  validateChange: () => {},
}

export const LhFormContext = createContext<LhFormContextValue>(DEFAULT_FORM_CONTEXT)
export const LhFormItemContext = createContext<LhFormItemContextValue>(DEFAULT_FORM_ITEM_CONTEXT)
