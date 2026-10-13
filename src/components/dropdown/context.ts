import { createContext } from 'react'
import type { LhDropdownContextValue } from './types'

export const LhDropdownContext = createContext<LhDropdownContextValue | null>(null)
