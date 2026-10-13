/**
 * Icon 胶水层：share/core/icon 纯函数组合
 *
 * 对应 plus 的 packages/components/icon/src/index.ts（useLhIcon composable）。
 */
import { useMemo } from 'react'
import { getIconAria, getIconSize, getIconSvg, getIconStyle } from '@lh-ui/share/core/icon'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhComponentTheme } from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhIconProps } from './types'

export function useLhIcon(props: LhIconProps) {
  const { size, color, decorative = true, ariaLabel } = props
  const ctx = useLhConfigContext()
  const { componentStyle } = useLhComponentTheme('icon', props, ctx)

  const svgPath = useMemo(() => getIconSvg(props.name), [props.name])
  const iconSize = useMemo(() => getIconSize(size), [size])
  const iconStyle = useMemo(() => getIconStyle({ size, color }), [size, color])
  const aria = useMemo(
    () => getIconAria({ decorative, label: ariaLabel }),
    [decorative, ariaLabel],
  )

  const mergedStyle = useMemo(
    () => ({ ...iconStyle, ...componentStyle, ...sxToStyle(props.sx ?? {}) }),
    [iconStyle, componentStyle, props.sx],
  )

  return { svgPath, iconSize, iconStyle: mergedStyle, aria }
}
