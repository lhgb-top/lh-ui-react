/**
 * Dialog 胶水层：share/core/dialog 纯函数 + 弹层栈 + 焦点圈 + 滚动锁 + 拖拽
 *
 * 对应 plus 的 packages/components/dialog/src/index.ts（useLhDialog composable）。
 *
 * 与 plus 的差异（已登记到迁移指南）：
 * - 显隐受控化：React 版由外部 open 驱动，内部不再持有 isVisible，
 *   关闭路径只调 onClose（plus 内部 isVisible + watch modelValue 双向同步）；
 * - 打开 / 关闭的生命周期拆成两组 effect（在 Dialog.tsx 内）：
 *   open 变化负责注册弹层栈与滚动锁，useTransition 的 mounted 变化负责焦点圈
 *   与 onOpened / onClosed 回调；
 * - 进入 / 离开过渡改用自研 useTransition（替代 Vue 的 <Transition>）。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { canClose, getDialogStyle } from '@lh-ui/share/core/dialog'
import { isEscapeKey, sxToStyle } from '@lh-ui/share/core/shared'
import {
  useLhComponentTheme,
  useLhFocusTrap,
  useLhOverlayStack,
  useLhZIndex,
} from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhDialogProps } from './types'

/** 与 SCSS 的 lh-dialog-fade 过渡时长对齐（enter 0.3s / leave 0.2s，取长者） */
export const DIALOG_TRANSITION_DURATION = 300

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  initialX: number
  initialY: number
}

export function useLhDialog(props: LhDialogProps) {
  const {
    open = false,
    title,
    width = '480px',
    fullscreen = false,
    showClose = true,
    closeOnClickModal = true,
    closeOnPressEscape = true,
    draggable = false,
    center = false,
    position = 'center',
    lockScroll = true,
    top = '15vh',
    zIndex: zIndexProp,
    beforeClose,
    onClose,
    onOpen,
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle: themeStyle } = useLhComponentTheme('dialog', props, ctx)
  const { trap, release } = useLhFocusTrap()
  const { register, unregister, isTopmost } = useLhOverlayStack()
  const { zIndex: autoZIndex } = useLhZIndex()

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  })
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const bodyOverflowRef = useRef('')
  const scrollLockedRef = useRef(false)

  const zIndex = zIndexProp ?? autoZIndex

  const componentStyle = useMemo(
    () => ({ ...themeStyle, ...sxToStyle(props.sx ?? {}) }),
    [themeStyle, props.sx],
  )

  const dialogStyle = useMemo(
    () => getDialogStyle({ top, zIndex, position }),
    [top, zIndex, position],
  )

  const dialogContentStyle = useMemo(() => {
    const style: Record<string, string> = {}
    if (width) style.width = typeof width === 'number' ? `${width}px` : width
    if (top && (position === 'top' || !position)) style.marginTop = top
    return style
  }, [width, top, position])

  const dialogDragStyle = useMemo(() => {
    if (draggable && (dragOffset.x !== 0 || dragOffset.y !== 0)) {
      return { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }
    }
    return {}
  }, [draggable, dragOffset.x, dragOffset.y])

  // ── 关闭流程：beforeClose 拦截后再交由外部决定 ──────────────────────
  const requestClose = useCallback(() => {
    if (beforeClose) {
      beforeClose(() => onClose?.())
    } else {
      onClose?.()
    }
  }, [beforeClose, onClose])

  const handleModalClick = useCallback(() => {
    if (canClose({ closeOnClickModal }, 'modalClick')) requestClose()
  }, [closeOnClickModal, requestClose])

  // ── 拖拽：手柄在头部，拖拽中监听挂在 document 上，成对清理 ──────────
  // 函数声明提升：detachDragListeners 引用 handleDragEnd、handleDragEnd 又引用
  // detachDragListeners，用 function 声明避免 const 的 TDZ 与 exhaustive-deps 死结
  function detachDragListeners() {
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
  }

  function handleDragEnd() {
    dragStateRef.current.isDragging = false
    detachDragListeners()
  }

  function handleDragMove(e: MouseEvent) {
    const state = dragStateRef.current
    if (!state.isDragging) return
    const dx = e.clientX - state.startX
    const dy = e.clientY - state.startY
    let newX = state.initialX + dx
    let newY = state.initialY + dy

    // 边界约束：阻止 dialog 完全拖出视口
    const dialog = headerRef.current?.closest('.lh-dialog') as HTMLElement | null
    if (dialog) {
      const rect = dialog.getBoundingClientRect()
      newX = Math.max(
        -rect.left + dragOffsetRef.current.x,
        Math.min(window.innerWidth - rect.left - rect.width + dragOffsetRef.current.x, newX),
      )
      newY = Math.max(
        -rect.top + dragOffsetRef.current.y,
        Math.min(window.innerHeight - rect.top - rect.height + dragOffsetRef.current.y, newY),
      )
    }

    dragOffsetRef.current = { x: newX, y: newY }
    setDragOffset({ x: newX, y: newY })
  }

  const handleHeaderMousedown = useCallback(
    (e: ReactMouseEvent) => {
      if (!draggable) return
      e.preventDefault()
      const state = dragStateRef.current
      state.isDragging = true
      state.startX = e.clientX
      state.startY = e.clientY
      state.initialX = dragOffsetRef.current.x
      state.initialY = dragOffsetRef.current.y
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
    },
    [draggable],
  )

  // 组件在拖拽中被卸载时的兜底清理
  useEffect(() => detachDragListeners, [])

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

  // ── Esc：仅栈顶实例响应（多弹层叠加时一次按键只关最上层） ────────────
  useEffect(() => {
    if (typeof document === 'undefined') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open || !isTopmost()) return
      if (isEscapeKey(e) && canClose({ closeOnPressEscape }, 'escape')) requestClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, isTopmost, closeOnPressEscape, requestClose])

  return {
    dialogRef,
    headerRef,
    title,
    showClose,
    fullscreen,
    center,
    position,
    dialogStyle,
    dialogContentStyle,
    dialogDragStyle,
    componentStyle,
    close: requestClose,
    handleModalClick,
    handleHeaderMousedown,
    trap,
    release,
  }
}
