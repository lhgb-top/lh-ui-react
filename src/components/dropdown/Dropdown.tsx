/**
 * Dropdown 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 dropdown 模板一一对应：
 * 触发器根元素（aria-haspopup="menu" / aria-expanded 关联菜单）+
 * 菜单 createPortal 到 body（role="menu" + 菜单项），显隐由 useTransition 驱动
 * （类名与 SCSS 的 lh-dropdown-fade-* 完全一致）。
 *
 * 键盘导航时机（React 特化）：
 * - 菜单挂载（mounted 变 true）且非 hover 触发时，焦点移入首个启用项；
 * - 键盘事件挂在菜单元素上，随菜单卸载自动解绑。
 */
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import type { MouseEventHandler } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from '../../hooks'
import { LhDropdownContext } from './context'
import { useLhDropdown, DROPDOWN_TRANSITION_DURATION } from './use-dropdown'
import type { LhDropdownInstance, LhDropdownProps } from './types'

export const LhDropdown = forwardRef<LhDropdownInstance, LhDropdownProps>((props, ref) => {
  const { children, dropdown } = props
  const {
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
  } = useLhDropdown(props)

  const { mounted, phase } = useTransition(isVisible, DROPDOWN_TRANSITION_DURATION)

  // 挂载后移入焦点：hover 触发不抢焦点，click / contextmenu 按 APG menu pattern 落点
  useEffect(() => {
    if (mounted && props.trigger !== 'hover') focusFirstItem()
  }, [mounted, props.trigger, focusFirstItem])

  useImperativeHandle(
    ref,
    () => ({ show, hide, toggle, isVisible }),
    [show, hide, toggle, isVisible],
  )

  // 共享基建的 contextmenu 处理器吃原生 MouseEvent，合成事件结构兼容，断言一次即可
  return (
    <LhDropdownContext.Provider value={contextValue}>
      <div
        ref={triggerRef}
        className="lh-dropdown"
        style={triggerStyle}
        onMouseEnter={onTriggerMouseenter}
        onMouseLeave={onTriggerMouseleave}
        onClick={onTriggerClick}
        onContextMenu={onTriggerContextmenu as unknown as MouseEventHandler<HTMLDivElement>}
        {...triggerAria}
      >
        {children}

        {typeof document !== 'undefined'
          ? createPortal(
              mounted ? (
                <ul
                  id={menuId}
                  ref={menuRef}
                  className={[...classes, `lh-dropdown-fade-${phase}`].join(' ')}
                  style={menuStyle}
                  onKeyDown={onMenuKeydown}
                  {...menuAria}
                >
                  {dropdown}
                </ul>
              ) : null,
              document.body,
            )
          : null}
      </div>
    </LhDropdownContext.Provider>
  )
})

LhDropdown.displayName = 'LhDropdown'
