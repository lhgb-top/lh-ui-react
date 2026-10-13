/**
 * Drawer 胶水层：share/core/drawer 纯函数 + 弹层栈 + 焦点圈 + 滚动锁
 *
 * 对应 plus 的 packages/components/drawer/src/index.ts（useLhDrawer composable）。
 * 结构与 dialog 对称，差异：
 * - 关闭闸门走 core 的 canDrawerClose（maskClosable 默认 false / closeOnEsc 默认 true），
 *   而非 dialog 的 canClose；
 * - 面板尺寸由 normalizeDrawerSize + getDrawerPanelStyle 按方向落到 width / height；
 * - 焦点圈只在 lockScroll 打开时启用（shouldDrawerTrapFocus）——抽屉常作为轻量面板
 *   不打断背后表单的 Tab 序列，是否圈焦交给调用方决定；
 * - 进入 / 离开过渡改用自研 useTransition（替代 Vue 的 <Transition>）。
 */
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  canDrawerClose,
  getDrawerClass,
  getDrawerPanelStyle,
  LH_DRAWER_DIRECTION_DEFAULT,
  shouldDrawerTrapFocus,
} from '@lh-ui/share/core/drawer'
import { isEscapeKey, sxToStyle } from '@lh-ui/share/core/shared'
import {
  useLhComponentTheme,
  useLhFocusTrap,
  useLhOverlayStack,
  useLhZIndex,
} from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import { useLhLocale } from '../../locale'
import type { LhDrawerProps } from './types'

/** 与 SCSS 的 lh-drawer-fade 过渡时长对齐（遮罩淡入 / 面板滑动均 0.3s） */
export const DRAWER_TRANSITION_DURATION = 300

export function useLhDrawer(props: LhDrawerProps) {
  const {
    open = false,
    title,
    direction = LH_DRAWER_DIRECTION_DEFAULT,
    size,
    showClose = true,
    maskClosable = false,
    closeOnEsc = true,
    lockScroll = true,
    zIndex: zIndexProp,
    beforeClose,
    onClose,
    onOpen,
    onCloseStart,
  } = props

  const ctx = useLhConfigContext()
  const { t } = useLhLocale()
  const { componentStyle: themeStyle } = useLhComponentTheme('drawer', props, ctx)
  const { trap, release } = useLhFocusTrap()
  const { register, unregister, isTopmost } = useLhOverlayStack()
  const { zIndex: autoZIndex } = useLhZIndex()

  const panelRef = useRef<HTMLDivElement | null>(null)
  const bodyOverflowRef = useRef('')
  const scrollLockedRef = useRef(false)
  const prevOpenRef = useRef(open)

  const zIndex = zIndexProp ?? autoZIndex

  const containerClass = useMemo(
    () => getDrawerClass({ direction }).join(' '),
    [direction],
  )

  const panelClass = useMemo(
    () => `lh-drawer__panel lh-drawer__panel--${direction}`,
    [direction],
  )

  // 面板尺寸按方向落到 width / height，再叠加主题与 sx
  const panelStyle = useMemo(
    () => ({
      ...getDrawerPanelStyle(direction, size),
      ...themeStyle,
      ...sxToStyle(props.sx ?? {}),
      zIndex: String(zIndex),
    }),
    [direction, size, themeStyle, props.sx, zIndex],
  )

  const closeLabel = t('drawer.close', '关闭抽屉')
  const ariaLabel = title || t('drawer.title', '抽屉')

  // ── 关闭流程：beforeClose 拦截后再交由外部决定 ──────────────────────
  const requestClose = useCallback(() => {
    if (beforeClose) {
      beforeClose(() => onClose?.())
    } else {
      onClose?.()
    }
  }, [beforeClose, onClose])

  const handleMaskClick = useCallback(() => {
    if (canDrawerClose({ maskClosable, closeOnEsc }, 'maskClick')) requestClose()
  }, [maskClosable, closeOnEsc, requestClose])

  // ── 滚动锁：未锁过不得解锁，否则会解掉其他弹层的滚动锁 ──────────────
  const lockBodyScroll = useCallback(() => {
    if (lockScroll === false || typeof document === 'undefined') return
    bodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    scrollLockedRef.current = true
  }, [lockScroll])

  const unlockBodyScroll = useCallback(() => {
    if (lockScroll === false || !scrollLockedRef.current) return
    scrollLockedRef.current = false
    if (typeof document === 'undefined') return
    document.body.style.overflow = bodyOverflowRef.current || ''
  }, [lockScroll])

  // ── 打开：注册弹层栈 + 锁滚动 + onOpen；关闭或卸载时清理 ─────────────
  useEffect(() => {
    if (!open) return
    register()
    onOpen?.()
    lockBodyScroll()
    return () => {
      unregister()
      unlockBodyScroll()
    }
  }, [open, register, unregister, lockBodyScroll, unlockBodyScroll, onOpen])

  // ── onCloseStart：open 由 true 变 false 时触发（关闭请求已被接受） ────
  useEffect(() => {
    if (prevOpenRef.current && !open) onCloseStart?.()
    prevOpenRef.current = open
  }, [open, onCloseStart])

  // ── Esc：仅栈顶实例响应（多弹层叠加时一次按键只关最上层） ────────────
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !isTopmost()) return
      if (isEscapeKey(e) && canDrawerClose({ maskClosable, closeOnEsc }, 'escape')) {
        requestClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, isTopmost, maskClosable, closeOnEsc, requestClose])

  // ── 圈焦：仅打开且锁定滚动时圈住（shouldDrawerTrapFocus） ────────────
  const shouldTrap = shouldDrawerTrapFocus({ modelValue: open, lockScroll })

  return {
    panelRef,
    direction,
    title,
    showClose,
    closeLabel,
    ariaLabel,
    containerClass,
    panelClass,
    panelStyle,
    close: requestClose,
    handleMaskClick,
    trap,
    release,
    shouldTrap,
  }
}
