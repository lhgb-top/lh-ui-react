/**
 * Tag 胶水层：share/core/tag 纯函数组合
 *
 * 对应 plus 的 packages/components/tag/src/index.vue 的 <script setup> 部分。
 * React 侧 clickable 判定比 Vue 简单：props.onClick 直接可见，无需读 vnode。
 */
import { useMemo, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'
import { getTagClassNames } from '@lh-ui/share/core/tag'
import { isActivationKey, sxToStyle } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import type { LhTagProps } from './types'

export function useLhTag(props: LhTagProps) {
  const {
    type = 'default',
    size = 'medium',
    closable = false,
    disabled = false,
    round = false,
    hit = false,
    onClick,
    onClose,
  } = props
  const { t } = useLhLocale()

  /**
   * 内部关闭态（React 侧增强）：点关闭即卸载，与 Alert 的「内部非受控」一致。
   * plus 的 handleClose 只抛 onClose 事件、由外部 v-if 移除节点；React 无指令，
   * 若由外部 state 控制卸载，纯展示场景的用法太重。
   */
  const [closed, setClosed] = useState(false)

  /** 可点击判定：绑定了 onClick 且未禁用 */
  const clickable = !!onClick && !disabled

  const tagClasses = useMemo(
    () => getTagClassNames({ type, size, closable, disabled, round, hit }),
    [type, size, closable, disabled, round, hit],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const handleClick = (e: MouseEvent) => {
    if (disabled) return
    onClick?.(e)
  }

  /** 键盘激活：Enter / Space 等效点击（仅 clickable 时生效） */
  const handleKeydown = (e: KeyboardEvent) => {
    if (!clickable || !isActivationKey(e)) return
    e.preventDefault()
    onClick?.(e as unknown as MouseEvent)
  }
  const handleClose = (e: MouseEvent) => {
    if (disabled) return
    e.stopPropagation()
    setClosed(true)
    onClose?.(e)
  }

  return {
    tagClasses,
    sxStyle,
    clickable,
    closed,
    closeLabel: t('tag.close', '关闭'),
    handleClick,
    handleKeydown,
    handleClose,
  }
}
