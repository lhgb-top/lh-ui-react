/**
 * Card 胶水层：share/core/card 纯函数组合
 *
 * 对应 plus 的 packages/components/card/src/index.vue 的 <script setup> 部分。
 * 主题层级：props.themeVars > ConfigProvider.componentTheme.card > 全局 themeVars。
 */
import { useMemo } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { getCardClassNames, isCardInteractive } from '@lh-ui/share/core/card'
import { isActivationKey, sxToStyle } from '@lh-ui/share/core/shared'
import { useLhComponentTheme } from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhCardProps } from './types'

export function useLhCard(props: LhCardProps) {
  const {
    shadow = 'always',
    clickable = false,
    loading = false,
    bgPattern,
    onClick,
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle: themeStyle } = useLhComponentTheme('card', props, ctx)

  const cardClasses = useMemo(
    () => getCardClassNames({ shadow, clickable, loading }),
    [shadow, clickable, loading],
  )

  const cardStyle = useMemo(
    () => ({
      ...themeStyle,
      ...(bgPattern ? { backgroundImage: bgPattern } : null),
      ...sxToStyle(props.sx ?? {}),
    }),
    [themeStyle, bgPattern, props.sx],
  )

  /** 仅 clickable 且非 loading 时整卡承担 button 语义 */
  const interactive = isCardInteractive({ shadow, clickable, loading })

  const handleClick = (e: MouseEvent) => {
    if (!interactive) return
    onClick?.(e)
  }

  /** 键盘激活：Enter / Space 等效点击（Space 需 preventDefault 防滚动） */
  const handleKeydown = (e: KeyboardEvent) => {
    if (!interactive || !isActivationKey(e)) return
    e.preventDefault()
    onClick?.(e as unknown as MouseEvent)
  }

  return { cardClasses, cardStyle, interactive, handleClick, handleKeydown }
}
