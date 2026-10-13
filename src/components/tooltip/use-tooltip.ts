/**
 * Tooltip 胶水层：share/core/tooltip 纯函数 + 共享弹层基建组合
 *
 * 对应 plus 的 packages/components/tooltip/src/index.ts（useLhTooltip composable）。
 * 定位与触发逻辑走共享基建（useLhPopper / useLhTrigger / useLhClickOutside），
 * 与 popover / popconfirm / dropdown 同一套几何与显隐语义。
 *
 * 与 plus 的差异（已登记到迁移指南）：
 * - 受控模式简化：React 版直接看 visible prop 是否传入（useControlled），
 *   不再保留 manual 开关（plus 需 manual=true 才认 visible）。
 */
import { useEffect, useId, useMemo, useRef } from 'react'
import {
  getDefaultDelay,
  getPopperClassNames,
  getPopperStyle,
  getTooltipPopperAria,
  getTooltipTriggerAria,
} from '@lh-ui/share/core/tooltip'
import { isEscapeKey, sxToStyle } from '@lh-ui/share/core/shared'
import {
  useLhClickOutside,
  useLhComponentTheme,
  useLhPopper,
  useLhTrigger,
  useLhZIndex,
  useControlled,
} from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhTooltipProps } from './types'

/** 与 SCSS 的 lh-tooltip-fade 过渡时长对齐（opacity 0.2s） */
export const TOOLTIP_TRANSITION_DURATION = 200

export function useLhTooltip(props: LhTooltipProps) {
  const {
    content,
    placement = 'top',
    trigger = 'hover',
    disabled = false,
    visible,
    defaultVisible,
    onVisibleChange,
    showAfter,
    hideAfter,
    openDelay,
    closeDelay,
    effect = 'dark',
    type,
    bgColor,
    maxWidth = '200px',
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle } = useLhComponentTheme('tooltip', props, ctx)
  const { zIndex } = useLhZIndex()
  const tooltipId = useId()

  const [isVisible, setIsVisible] = useControlled<boolean>({
    value: visible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  })

  const delay = useMemo(
    () => getDefaultDelay(showAfter ?? openDelay, hideAfter ?? closeDelay),
    [showAfter, openDelay, hideAfter, closeDelay],
  )

  const triggerRef = useRef<HTMLDivElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const { popperStyle: positionStyle, actualPlacement } = useLhPopper({
    triggerRef,
    popperRef: tooltipRef,
    visible: isVisible,
    placement,
    gap: 8,
    // 触发器滚出视口即收起提示，避免 fixed 弹层浮在页面内容之上
    onScrollOut: () => setIsVisible(false),
  })

  const { show, hide, toggle, onTriggerMouseenter, onTriggerMouseleave, onTriggerClick, onTriggerFocusin, onTriggerFocusout } =
    useLhTrigger({
      trigger,
      visible: isVisible,
      onVisibleChange: setIsVisible,
      disabled,
      delay,
    })

  // click 触发时点击外部关闭
  useLhClickOutside(() => [triggerRef.current, tooltipRef.current], () => {
    if (isVisible && trigger === 'click') setIsVisible(false)
  })

  // 键盘 Esc 关闭（对齐 APG tooltip pattern）
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onKeydown = (e: KeyboardEvent) => {
      if (isEscapeKey(e) && isVisible) setIsVisible(false)
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [isVisible, setIsVisible])

  const popperClass = useMemo(() => {
    const cls = getPopperClassNames({ effect, placement: actualPlacement })
    if (type) cls.push(`lh-tooltip__popper--${type}`)
    return cls
  }, [effect, actualPlacement, type])

  const popperStyle = useMemo(() => {
    const style = getPopperStyle({ maxWidth })
    // 优先使用 bgColor，其次 type，最后 fallback 给 effect
    const bg =
      bgColor ||
      (type ? `var(--lh-${type}-color, var(--lh-primary-color))` : undefined)
    if (bg) {
      style['--lh-tooltip-bg'] = bg
      // 彩底上的文字色走语义令牌（浅主色预设下写死 #fff 对比度不足 AA）
      style['--lh-tooltip-text'] = 'var(--lh-color-on-primary, #fff)'
      // 箭头颜色同步
      style['--lh-tooltip-arrow-color'] = bg
    }
    return style
  }, [maxWidth, bgColor, type])

  const mergedPopperStyle = useMemo(
    () => ({ ...positionStyle, ...popperStyle, ...componentStyle, zIndex: String(zIndex) }),
    [positionStyle, popperStyle, componentStyle, zIndex],
  )

  const triggerStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const triggerAria = useMemo(
    () => getTooltipTriggerAria(isVisible ? tooltipId : undefined),
    [isVisible, tooltipId],
  )

  const popperAria = useMemo(() => getTooltipPopperAria(tooltipId), [tooltipId])

  return {
    content,
    tooltipId,
    isVisible,
    triggerRef,
    tooltipRef,
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerFocusin,
    onTriggerFocusout,
    popperClass,
    mergedPopperStyle,
    triggerStyle,
    triggerAria,
    popperAria,
  }
}
