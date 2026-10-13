import { createContext } from 'react'
import type { LhBreadcrumbContextValue } from './types'

export const LhBreadcrumbContext = createContext<LhBreadcrumbContextValue | null>(null)
