/**
 * Divider 胶水层：share/core/divider 纯函数组合
 *
 * 对应 plus 的 packages/components/divider/src/index.vue 的 <script setup> 部分。
 */
import { useMemo } from 'react'
import {
  getDividerClassNames,
  getDividerRole,
  needsAriaOrientation,
} from '@lh-ui/share/core/divider'
import { sxToStyle } from '@lh-ui/share/core/shared'
import type { LhDividerProps } from './types'

export function useLhDivider(props: LhDividerProps) {
  const { direction = 'horizontal', dashed = false, labelPosition = 'center', borderStyle } = props

  /** 有子节点即带文案：横向左右排布，竖向上下排布（竖向布局由 share 的纵向 flex 承载） */
  const hasContent = !!props.children

  const dividerClasses = useMemo(
    () => getDividerClassNames({ direction, dashed, hasContent, labelPosition, borderStyle }),
    [direction, dashed, hasContent, labelPosition, borderStyle],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  /** 带文案的是真分割符，纯装饰的不进无障碍树 */
  const role = getDividerRole(hasContent)

  /** 仅「带文案且垂直」时需要 aria-orientation */
  const ariaOrientation = needsAriaOrientation(direction, hasContent)
    ? ('vertical' as const)
    : undefined

  return { dividerClasses, sxStyle, hasContent, role, ariaOrientation }
}
