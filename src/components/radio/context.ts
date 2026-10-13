import { createContext } from 'react'
import type { LhRadioGroupContext as LhRadioGroupContextValue } from './types'

/**
 * Radio Group 上下文（对应 plus 的 LH_RADIO_GROUP_KEY）
 *
 * 消费侧通过 useContext 取值，未包裹时返回 null。
 */
export const LhRadioGroupContext = createContext<LhRadioGroupContextValue | null>(null)
