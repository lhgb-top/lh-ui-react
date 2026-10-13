/**
 * DropdownItem 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 dropdown/dropdown-item.vue 一一对应：
 * `<li role="menuitem">`，禁用项 aria-disabled，分隔项 `--divided`。
 *
 * roving tabindex（React 特化）：菜单项在 effect 内向父级注册 DOM，
 * 父级按 APG menu pattern 维护唯一锚点（tabIndex=0，其余 -1）。
 * 未处于 LhDropdown 内时降级为普通列表项，不参与导航。
 */
import { useContext, useEffect, useRef } from 'react'
import { getDropdownItemAria, getDropdownItemClass } from '@lh-ui/share/core/dropdown'
import { LhDropdownContext } from './context'
import type { LhDropdownItemProps } from './types'

export function LhDropdownItem(props: LhDropdownItemProps) {
  const { children, command, disabled = false, divided = false, onClick } = props
  const ctx = useContext(LhDropdownContext)
  const elRef = useRef<HTMLLIElement | null>(null)

  // 向父级注册 / 注销自身 DOM（disabled 变化时重新注册以刷新导航表）
  useEffect(() => {
    const el = elRef.current
    if (!ctx || !el) return undefined
    ctx.registerItem(el, disabled)
    return () => ctx.unregisterItem(el)
  }, [ctx, disabled])

  const handleClick = () => {
    if (disabled) return
    ctx?.onItemClick(command, onClick)
  }

  return (
    <li
      ref={elRef}
      className={getDropdownItemClass({ disabled, divided }).join(' ')}
      // roving tabindex：锚点项可 Tab 进入，其余项仅方向键可达
      tabIndex={ctx ? (ctx.activeEl === elRef.current ? 0 : -1) : undefined}
      onClick={handleClick}
      {...getDropdownItemAria({ disabled })}
    >
      {children}
    </li>
  )
}

LhDropdownItem.displayName = 'LhDropdownItem'
