/**
 * Popconfirm 胶水层：share/core/popconfirm 纯函数 + 共享弹层基建组合
 *
 * 对应 plus 的 packages/components/popconfirm/src/index.ts（useLhPopconfirm composable）。
 * 与 popover 同一套几何与显隐语义，差别在：alertdialog 语义、确认 / 取消按钮、
 * 确认后自动关闭。
 */
import { useCallback, useEffect, useId, useMemo, useRef } from 'react'
import {
  canCloseOnEscape,
  getDefaultDelay,
  getPopconfirmClass,
  getPopconfirmIconName,
  getPopconfirmPopperAria,
  getPopconfirmTriggerAria,
  LH_POPCONFIRM_PLACEMENT_DEFAULT,
  LH_POPCONFIRM_TYPE_DEFAULT,
} from '@lh-ui/share/core/popconfirm'
import { isEscapeKey, sxToStyle } from '@lh-ui/share/core/shared'
import type { LhIconName } from '@lh-ui/share/core/icon'
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
import { useLhLocale } from '../../locale'
import type { LhPopconfirmProps } from './types'

/** 与 SCSS 的 lh-popconfirm-fade 过渡时长对齐 */
export const POPCONFIRM_TRANSITION_DURATION = 250

export function useLhPopconfirm(props: LhPopconfirmProps) {
  const {
    placement = LH_POPCONFIRM_PLACEMENT_DEFAULT,
    trigger = 'click',
    type = LH_POPCONFIRM_TYPE_DEFAULT,
    disabled = false,
    showIcon = true,
    hideCancel = false,
    visible,
    defaultVisible,
    onVisibleChange,
    onConfirm,
    onCancel,
    showAfter,
    hideAfter,
    popperClass,
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle } = useLhComponentTheme('popconfirm', props, ctx)
  const { zIndex } = useLhZIndex()
  const { t } = useLhLocale()
  const popperId = useId()

  const [isVisible, setIsVisible] = useControlled<boolean>({
    value: visible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  })

  const confirmLabel = props.confirmText ?? t('popconfirm.confirm', '确定')
  const cancelLabel = props.cancelText ?? t('popconfirm.cancel', '取消')

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

  useLhClickOutside(
    () => [triggerRef.current, popperRef.current],
    () => {
      if (isVisible && trigger === 'click') setIsVisible(false)
    },
  )

  const { trap, release } = useLhFocusTrap({ inertOutside: false })

  // 气泡是 alertdialog：打开即圈焦，关闭归还
  useEffect(() => {
    if (isVisible) {
      trap(popperRef.current)
      return () => release(false)
    }
    return undefined
  }, [isVisible, trap, release])

  // Esc 关闭并视为取消
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onKeydown = (e: KeyboardEvent) => {
      if (isEscapeKey(e) && isVisible && canCloseOnEscape({ disabled })) {
        setIsVisible(false)
        onCancel?.()
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [isVisible, disabled, setIsVisible, onCancel])

  const handleConfirm = useCallback(() => {
    onConfirm?.()
    setIsVisible(false)
  }, [onConfirm, setIsVisible])

  const handleCancel = useCallback(() => {
    onCancel?.()
    setIsVisible(false)
  }, [onCancel, setIsVisible])

  const classes = useMemo(
    () => getPopconfirmClass({ type, placement: actualPlacement, popperClass }),
    [type, actualPlacement, popperClass],
  )

  // share 的图标名表是宽字符串，收窄到 LhIconName 交给 LhIcon 校验
  const iconName = useMemo(() => getPopconfirmIconName(type) as LhIconName, [type])

  const mergedPopperStyle = useMemo(
    () => ({ ...positionStyle, ...componentStyle, zIndex: String(zIndex) }),
    [positionStyle, componentStyle, zIndex],
  )

  const triggerStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const triggerAria = useMemo(
    () => getPopconfirmTriggerAria(isVisible, popperId),
    [isVisible, popperId],
  )

  const popperAria = useMemo(() => getPopconfirmPopperAria(popperId), [popperId])

  return {
    popperId,
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
    handleConfirm,
    handleCancel,
    classes,
    iconName,
    confirmLabel,
    cancelLabel,
    showIcon,
    hideCancel,
    mergedPopperStyle,
    triggerStyle,
    triggerAria,
    popperAria,
  }
}
