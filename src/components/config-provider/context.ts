/**
 * ConfigProvider 上下文
 *
 * 对应 plus 的 inject(LH_CONFIG_KEY, null)。
 * React 侧消费兜底：未包裹 Provider 时返回全字段 undefined 的默认值，
 * 等价 plus 的 inject(..., null) 但免去每个组件内判空。
 */
import { createContext, useContext } from 'react'
import type { LhConfigContext as LhConfigContextValue } from './types'

/** 未包裹 Provider 时的兜底值 */
export const DEFAULT_CONFIG_CONTEXT: LhConfigContextValue = {
  size: undefined,
  locale: undefined,
  themeVars: undefined,
  patternComponents: undefined,
  componentTheme: undefined,
}

export const LhConfigContext = createContext<LhConfigContextValue>(DEFAULT_CONFIG_CONTEXT)

/**
 * 子组件中读取 ConfigProvider 配置
 * @returns 配置上下文（未包裹 Provider 时返回全字段 undefined 的兜底值，免去组件内判空）
 */
export function useLhConfigContext(): LhConfigContextValue {
  return useContext(LhConfigContext)
}
