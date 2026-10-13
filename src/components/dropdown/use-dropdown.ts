/**
 * Dropdown 胶水层：share/core/dropdown 纯函数 + 共享弹层基建 + 键盘导航
 *
 * 对应 plus 的 packages/components/dropdown/src/index.ts（useLhDropdown composable）。
 * 定位与触发逻辑与 popover / tooltip 同一套基建（useLhPopper / useLhTrigger /
 * useLhClickOutside），叠加 APG menu pattern 的键盘导航：
 * - ArrowUp / ArrowDown 在菜单项间循环移动（跳过禁用项）
 * - Home / End 直达首尾；Enter / Space 激活当前项
 * - Escape 关闭并把焦点归还触发器
 * - roving tabindex：仅锚点项 tabIndex=0，其余 -1，Tab 一次只进菜单一个项
 *
 * 与 plus 的差异：
 * - 菜单内容由 `dropdown` prop 传入（对应 plus 的 `#dropdown` 插槽）；
 * - 菜单项经 Context 注册 DOM，roving tabindex 由 React 侧 activeEl 态驱动。
 */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  getDropdownClass,
  getDropdownMenuAria,
  getDropdownMenuStyle,
  getDropdownTriggerAria,
  LH_DROPDOWN_PLACEMENT_DEFAULT,
} from '@lh-ui/share/core/dropdown'
import {
  getNextListIndex,
  LH_KEYS,
  isActivationKey,
  isEscapeKey,
  isHomeOrEndKey,
  sxToStyle,
} from '@lh-ui/share/core/shared'
import {
  useLhClickOutside,
  useLhComponentTheme,
  useLhPopper,
  useLhTrigger,
  useLhZIndex,
  useControlled,
} from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import type { LhDropdownContextValue, LhDropdownProps } from './types'

/** 与 SCSS 的 lh-dropdown-fade 过渡时长对齐（--lh-transition-duration-fast，0.25s） */
export const DROPDOWN_TRANSITION_DURATION = 250

interface ItemRecord {
  el: HTMLLIElement
  disabled: boolean
}

export function useLhDropdown(props: LhDropdownProps) {
  const {
    placement = LH_DROPDOWN_PLACEMENT_DEFAULT,
    trigger = 'hover',
    disabled = false,
    visible,
    defaultVisible,
    onVisibleChange,
    hideOnClick = true,
    maxHeight,
    popperClass,
    onCommand,
    onClickOutside,
  } = props

  const ctx = useLhConfigContext()
  const { componentStyle } = useLhComponentTheme('dropdown', props, ctx)
  const { zIndex } = useLhZIndex()
  const menuId = useId()

  const [isVisible, setIsVisible] = useControlled<boolean>({
    value: visible,
    defaultValue: defaultVisible,
    onChange: onVisibleChange,
  })

  const triggerRef = useRef<HTMLDivElement | null>(null)
  const menuRef = useRef<HTMLUListElement | null>(null)
  const itemsRef = useRef<ItemRecord[]>([])
  const [activeEl, setActiveEl] = useState<HTMLLIElement | null>(null)

  const { popperStyle: positionStyle, actualPlacement } = useLhPopper({
    triggerRef,
    popperRef: menuRef,
    visible: isVisible,
    placement,
    gap: 8,
    // 触发器滚出视口即收起菜单，避免 fixed 弹层浮在页面内容之上
    onScrollOut: () => setIsVisible(false),
  })

  const {
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerContextmenu,
  } = useLhTrigger({
    trigger,
    visible: isVisible,
    onVisibleChange: setIsVisible,
    disabled,
  })

  // click / contextmenu 触发时点击外部关闭
  useLhClickOutside(
    () => [triggerRef.current, menuRef.current],
    () => {
      if (isVisible && trigger !== 'hover') {
        setIsVisible(false)
        onClickOutside?.()
      }
    },
  )

  // ── 菜单项注册（effect 内成对增删，保持 DOM 序） ─────────────────────
  const registerItem = useCallback((el: HTMLLIElement, itemDisabled: boolean) => {
    const items = itemsRef.current
    if (!items.some((item) => item.el === el)) items.push({ el, disabled: itemDisabled })
    // 首次打开尚无锚点时锚定首个启用项
    setActiveEl((current) => {
      if (current) return current
      const first = items.find((item) => !item.disabled)
      return first ? first.el : null
    })
  }, [])

  const unregisterItem = useCallback((el: HTMLLIElement) => {
    itemsRef.current = itemsRef.current.filter((item) => item.el !== el)
    setActiveEl((current) => (current === el ? null : current))
  }, [])

  // ── 菜单项点击：回调 → 命令 → 自动关闭 ──────────────────────────────
  const onItemClick = useCallback(
    (command?: string | number, onClick?: () => void) => {
      onClick?.()
      if (command !== undefined && command !== null) onCommand?.(command)
      if (hideOnClick) hide()
    },
    [hideOnClick, hide, onCommand],
  )

  const enabledItems = useCallback(
    () => itemsRef.current.filter((item) => !item.disabled),
    [],
  )

  // ── 键盘导航（APG menu pattern，挂在菜单元素的 keydown 上） ──────────
  const onMenuKeydown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const items = itemsRef.current
      if (!items.length) return
      const els = items.map((item) => item.el)
      // 焦点可能落在菜单内任意项（含禁用项），以 activeElement 为准而非 activeEl
      const current =
        typeof document !== 'undefined'
          ? els.indexOf(document.activeElement as HTMLLIElement)
          : -1

      const move = (direction: 1 | -1 | 'first' | 'last') => {
        const next = getNextListIndex(items, current, direction)
        if (next < 0) return
        e.preventDefault()
        const target = els[next]
        setActiveEl(target)
        target.focus()
      }

      if (e.key === LH_KEYS.ArrowDown) return move(1)
      if (e.key === LH_KEYS.ArrowUp) return move(-1)
      if (isHomeOrEndKey(e)) return move(e.key === LH_KEYS.Home ? 'first' : 'last')

      if (isActivationKey(e)) {
        if (current < 0 || items[current].disabled) return
        e.preventDefault()
        els[current].click()
        return
      }

      if (isEscapeKey(e)) {
        e.preventDefault()
        hide()
        // 焦点归还触发器：根元素是普通 div 不可聚焦，找内部首个可聚焦后代
        const focusable = triggerRef.current?.querySelector<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        focusable?.focus()
      }
    },
    [hide],
  )

  // 打开时（click / contextmenu）把焦点移入首个启用项；hover 触发不抢焦点
  const focusFirstItem = useCallback(() => {
    const first = enabledItems()[0]
    if (first) {
      setActiveEl(first.el)
      first.el.focus({ preventScroll: true })
    }
  }, [enabledItems])

  // 关闭时重置锚点，下次打开重新锚定首个启用项
  useEffect(() => {
    if (!isVisible) setActiveEl(null)
  }, [isVisible])

  const classes = useMemo(
    () => getDropdownClass({ placement: actualPlacement, popperClass }),
    [actualPlacement, popperClass],
  )

  const menuStyle = useMemo(
    () => ({
      ...getDropdownMenuStyle(maxHeight),
      ...positionStyle,
      ...componentStyle,
      zIndex: String(zIndex),
    }),
    [maxHeight, positionStyle, componentStyle, zIndex],
  )

  const triggerStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const triggerAria = useMemo(
    () => getDropdownTriggerAria(isVisible, menuId),
    [isVisible, menuId],
  )

  const menuAria = useMemo(() => getDropdownMenuAria(menuId), [menuId])

  const contextValue = useMemo<LhDropdownContextValue>(
    () => ({
      registerItem,
      unregisterItem,
      onItemClick,
      activeEl,
      setActiveEl,
    }),
    [registerItem, unregisterItem, onItemClick, activeEl],
  )

  return {
    menuId,
    isVisible,
    triggerRef,
    menuRef,
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerContextmenu,
    onMenuKeydown,
    focusFirstItem,
    classes,
    menuStyle,
    triggerStyle,
    triggerAria,
    menuAria,
    contextValue,
  }
}
