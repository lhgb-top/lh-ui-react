/**
 * CSS 变量键的 React 类型断言封装
 *
 * React 的 `CSSProperties` 不含自定义属性键（`--lh-*`），直接写
 * `style={{ '--lh-primary-color': x }}` 会报类型错误；散写 `as React.CSSProperties`
 * 既丑又容易漏。本工具统一处理：键名走 share 的幂等 `toCssVarName`，
 * 类型断言集中在此一处。
 *
 * 前缀逻辑必须幂等：getThemeVars() 等预设来源返回的键已带 `--lh-` 前缀。
 */
import type { CSSProperties } from 'react'
import { toCssVarName } from '@lh-ui/share/utils/css-var'

export function cssVarsStyle(vars: Record<string, string> | undefined): CSSProperties {
  if (!vars) return {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(vars)) {
    result[toCssVarName(key)] = value
  }
  return result as CSSProperties
}
