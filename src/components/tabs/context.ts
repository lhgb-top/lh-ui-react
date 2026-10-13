import { createContext } from 'react'
import type { LhTabsContextValue } from './types'

export const LhTabsContext = createContext<LhTabsContextValue | null>(null)
