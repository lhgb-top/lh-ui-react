/**
 * ConfigProvider 胶水层：主题变量 → CSS 变量对象的转换
 *
 * 对应 plus 的 useLhConfigProvider composable 的计算部分。
 */
import { useMemo } from 'react'
import { cssVarsStyle } from '../../utils/css-var'
import type { LhConfigContext, LhConfigProviderProps } from './types'

export function useLhConfigProvider(props: LhConfigProviderProps) {
  const { size, locale, themeVars, patternComponents, componentTheme } = props

  // Context value 必须 useMemo：直接 `{ ...props }` 每次 render 产生新对象，
  // 会导致所有消费子树无条件重渲染（plus「provide 必须 computed」教训的 React 形态；
  // form 场景的快照化缺陷 V2-02 / P-05 同理）
  const contextValue = useMemo<LhConfigContext>(
    () => ({ size, locale, themeVars, patternComponents, componentTheme }),
    [size, locale, themeVars, patternComponents, componentTheme],
  )

  // themeVars 转为 CSS 变量对象，挂到包裹元素上向子级级联
  const cssVars = useMemo(() => cssVarsStyle(themeVars), [themeVars])

  return { contextValue, cssVars }
}
