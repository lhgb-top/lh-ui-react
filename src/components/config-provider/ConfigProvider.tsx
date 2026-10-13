/**
 * LhConfigProvider —— React 形态的全局配置注入
 *
 * 与 lh-ui-plus 的 config-provider 同名同义同构，概念映射：
 *   provide / inject（provide 必须 computed 包装）
 *     → Context + useContext（Provider value 必须 useMemo）
 *
 * @example
 * ```tsx
 * <LhConfigProvider size="small" locale="en-US" themeVars={{ 'primary-color': '#1677ff' }}>
 *   <App />
 * </LhConfigProvider>
 * ```
 */
import { useEffect } from 'react'
import { lhlocale } from '@lh-ui/share/locales'
import { useLhConfigProvider } from './use-config-provider'
import { LhConfigContext } from './context'
import type { LhConfigProviderProps } from './types'

export function LhConfigProvider(props: LhConfigProviderProps) {
  const { locale, children } = props
  const { contextValue, cssVars } = useLhConfigProvider(props)

  // locale 变化时同步更新全局 locale（对齐 plus 的 watch immediate）
  useEffect(() => {
    if (locale) lhlocale.setLocale(locale)
  }, [locale])

  return (
    <LhConfigContext.Provider value={contextValue}>
      <div className="lh-config-provider" style={cssVars}>
        {children}
      </div>
    </LhConfigContext.Provider>
  )
}

LhConfigProvider.displayName = 'LhConfigProvider'
