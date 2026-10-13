/**
 * Popover 胶水层：share/core/popover 纯函数 + 共享弹层基建组合
 *
 * 对应 plus 的 packages/components/popover/src/index.ts（useLhPopover composable）。
 * 定位与触发逻辑与 tooltip 同一套基建（useLhPopper / useLhTrigger / useLhClickOutside），
 * 差别在内容结构（title + content）、默认 trigger 为 click、以及 click 触发时圈焦
 * （对齐 plus 的 isModal 语义：弹出层是模态对话框，焦点应在内部循环）。
 */
import { useEffect, useId, useMemo, useRef } from 'react'
import {
  canCloseOnEscape,
  getDefaultDelay,
  getPopoverClass,
  getPopoverPopperAria,
  getPopoverTriggerAria,
  getPopoverWidthStyle,
  LH_POPOVER_PLACEMENT_DEFAULT,
} from '@lh-ui/share/core/popover'
import { isEscapeKey, sxToStyle } from '@lh-ui/share/core/shared'
import {
  useLhClickOutside,
  useLhComponentTheme,
  useLhFocusTrap,
  useLhPopper,
  useLhTrigger,
  useLhZIndex,
  useControlled,
} from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhPopoverProps } from './types'

/** 与 SCSS 的 lh-popover-fade 过渡时长对齐（--lh-transition-duration-fast，0.25s） */
export const POPOVER_TRANSITION_DURATION = 250

export function useLhPopover(props: LhPopoverProps) {
  const {
    placement = LH_POPOVER_PLACEMENT_DEFAULT,
    trigger = 'click',
    disabled = false,
    arrow = true,
    width,
    visible,
    defaultVisible,
    onVisibleChange,
    showAfter,
    hideAfter,
    popperClass,
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle } = useLhComponentTheme('popover', props, ctx)
  const { zIndex } = useLhZIndex()
  const popperId = useId()
  const titleId = useId()

  const [isVisible, setIsVisible] = useControlled<boolean>({
    value: visible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  })

  const delay = useMemo(() => getDefaultDelay(showAfter, hideAfter), [showAfter, hideAfter])

  const triggerRef = useRef<HTMLDivElement | null>(null)
  const popperRef = useRef<HTMLDivElement | null>(null)

  const { popperStyle: positionStyle, actualPlacement } = useLhPopper({
    triggerRef,
    popperRef,
    visible: isVisible,
    placement,
    gap: 8,
    onScrollOut: () => setIsVisible(false),
  })

  const {
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerFocusin,
    onTriggerFocusout,
  } = useLhTrigger({
    trigger,
    visible: isVisible,
    onVisibleChange: setIsVisible,
    disabled,
    delay,
  })

  // click 触发时点击外部关闭
  useLhClickOutside(
    () => [triggerRef.current, popperRef.current],
    () => {
      if (isVisible && trigger === 'click') setIsVisible(false)
    },
  )

  const { trap, release } = useLhFocusTrap({ inertOutside: false })

  // click 触发即模态：弹出层打开时圈焦，关闭时归还
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      trap(popperRef.current)
      return () => release(false)
    }
    return undefined
  }, [trigger, isVisible, trap, release])

  // 键盘 Esc 关闭（canCloseOnEscape 读 disabled 语义）
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onKeydown = (e: KeyboardEvent) => {
      if (isEscapeKey(e) && isVisible && canCloseOnEscape({ disabled })) setIsVisible(false)
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [isVisible, disabled, setIsVisible])

  const classes = useMemo(
    () => getPopoverClass({ placement: actualPlacement, arrow, popperClass }),
    [actualPlacement, arrow, popperClass],
  )

  const widthStyle = useMemo(() => getPopoverWidthStyle(width), [width])

  const mergedPopperStyle = useMemo(
    () => ({ ...positionStyle, ...widthStyle, ...componentStyle, zIndex: String(zIndex) }),
    [positionStyle, widthStyle, componentStyle, zIndex],
  )

  const triggerStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const triggerAria = useMemo(
    () => getPopoverTriggerAria(isVisible, popperId),
    [isVisible, popperId],
  )

  const popperAria = useMemo(
    () => getPopoverPopperAria(popperId, props.title ? titleId : undefined),
    [popperId, titleId, props.title],
  )

  return {
    popperId,
    titleId,
    isVisible,
    triggerRef,
    popperRef,
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerFocusin,
    onTriggerFocusout,
    classes,
    mergedPopperStyle,
    triggerStyle,
    triggerAria,
    popperAria,
  }
}
