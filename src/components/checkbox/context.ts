import { createContext } from 'react'
import type { LhCheckboxGroupContext as LhCheckboxGroupContextValue } from './types'

/**
 * Checkbox Group 上下文（对应 plus 的 LH_CHECKBOX_GROUP_KEY）
 *
 * 消费侧通过 useLhCheckboxGroup() 取值，未包裹时返回 null。
 */
export const LhCheckboxGroupContext = createContext<LhCheckboxGroupContextValue | null>(null)
