/**
 * Button 胶水层：props 加工 + share/core 调用组合
 *
 * 让组件测试可以绕过 DOM（直接断言 hook 的输出），tsx 只做渲染。
 * 对应 plus 的 packages/components/button/src/index.ts（useLhButton composable）。
 */
import { useMemo } from 'react'
import type { MouseEvent } from 'react'
import { getClassNames, getSize, isClickable } from '@lh-ui/share/core/button'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhComponentTheme } from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhButtonProps, LhButtonSize } from './types'


export function useLhButton(props: LhButtonProps) {
  const {
    type,
    size,
    loading = false,
    disabled = false,
    plain = false,
    block = false,
    round = false,
    circle = false,
    onClick,
  } = props

  const ctx = useLhConfigContext()
  // 先合并 ConfigProvider 的尺寸兜底，再交给 getClassNames 产出完整类名
  // share 的 getSize 返回类型标宽为 string，实际入参受限为 LhButtonSize、兜底 'medium'
  const effectiveSize = getSize(size, ctx.size) as LhButtonSize

  const handleClick = (e: MouseEvent) => {
    if (isClickable({ loading, disabled })) onClick?.(e)
  }

  const { componentStyle } = useLhComponentTheme('button', props, ctx)

  const buttonStyle = useMemo(
    () => ({ ...componentStyle, ...sxToStyle(props.sx ?? {}) }),
    [componentStyle, props.sx],
  )

  const classNames = useMemo(
    () =>
      getClassNames({
        type: type ?? 'default',
        size: effectiveSize,
        loading,
        disabled,
        plain,
        block,
        round,
        circle,
      }),
    [type, effectiveSize, loading, disabled, plain, block, round, circle],
  )

  return { handleClick, buttonStyle, classNames }
}
