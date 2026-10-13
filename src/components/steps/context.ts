import { createContext } from 'react'
import type { LhStepsContextValue } from './types'

export const LhStepsContext = createContext<LhStepsContextValue | null>(null)
