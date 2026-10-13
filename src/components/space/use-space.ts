/**
 * Space 胶水层：share/core/space 纯函数组合
 *
 * 对应 plus 的 packages/components/space/src/index.vue 的 <script setup> 部分。
 * 间距全交原生 CSS gap：预设档位出令牌变量 + 档位类兜底，数字/数组走内联 gap。
 */
import { useMemo } from 'react'
import {
  getSpaceClassNames,
  resolveSpaceGaps,
  resolveSpaceAlignment,
} from '@lh-ui/share/core/space'
import { sxToStyle } from '@lh-ui/share/core/shared'
import type { LhSpaceProps } from './types'

export function useLhSpace(props: LhSpaceProps) {
  const { direction = 'horizontal', size = 'medium', wrap = true, alignment = 'start' } = props

  /** wrap 仅水平方向生效，垂直方向永远不换行 */
  const effectiveWrap = wrap && direction === 'horizontal'

  const spaceClasses = useMemo(
    () => getSpaceClassNames({ direction, wrap: effectiveWrap, size: String(size) }),
    [direction, effectiveWrap, size],
  )

  const spaceStyle = useMemo(() => {
    const { columnGap, rowGap } = resolveSpaceGaps(size)
    return {
      columnGap,
      rowGap,
      alignItems: resolveSpaceAlignment(alignment),
      ...sxToStyle(props.sx ?? {}),
    }
  }, [size, alignment, props.sx])

  return { spaceClasses, spaceStyle, wrap: effectiveWrap }
}
