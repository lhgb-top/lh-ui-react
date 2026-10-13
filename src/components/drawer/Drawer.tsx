/**
 * Drawer 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 drawer 模板一一对应：
 * 容器（遮罩 + 面板 lh-drawer__panel--<direction>）整体 createPortal 到 body，
 * 显隐由 useTransition 驱动（类名与 SCSS 的 lh-drawer-fade-* 完全一致；
 * 面板按方向的滑动位移由 share SCSS 的后代选择器接管）。
 *
 * 焦点圈生命周期（同 dialog）：
 * - mounted 变 true（DOM 已落位）→ lockScroll 打开时 trap(panelRef) + onOpened
 * - mounted 变 false（离开动画播完）→ release() + onClosed
 */
import { forwardRef, useEffect, useId, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { getDrawerAria } from '@lh-ui/share/core/drawer'
import { useTransition } from '../../hooks'
import { useLhDrawer, DRAWER_TRANSITION_DURATION } from './use-drawer'
import type { LhDrawerInstance, LhDrawerProps } from './types'

export const LhDrawer = forwardRef<LhDrawerInstance, LhDrawerProps>((props, ref) => {
  const { open = false, header, footer, children, onOpened, onClosed } = props
  const {
    panelRef,
    title,
    showClose,
    closeLabel,
    ariaLabel,
    containerClass,
    panelClass,
    panelStyle,
    close,
    handleMaskClick,
    trap,
    release,
    shouldTrap,
  } = useLhDrawer(props)

  const { mounted, phase } = useTransition(open, DRAWER_TRANSITION_DURATION)
  const titleId = useId()
  const aria = getDrawerAria({ titleId })

  // 挂载态变化：焦点圈 + 生命周期回调（与 Vue 版 nextTick 后的 trap 同语义）
  useEffect(() => {
    if (!mounted) {
      release()
      onClosed?.()
      return
    }
    if (shouldTrap) trap(panelRef.current)
    onOpened?.()
  }, [mounted, trap, release, panelRef, shouldTrap, onOpened, onClosed])

  useImperativeHandle(ref, () => ({ close, isOpen: open }), [close, open])

  if (typeof document === 'undefined') return null

  return createPortal(
    mounted ? (
      <div className={[containerClass, `lh-drawer-fade-${phase}`].join(' ')}>
        <div className="lh-drawer__mask" onClick={handleMaskClick} />
        <div
          ref={panelRef}
          className={panelClass}
          style={panelStyle}
          aria-label={ariaLabel}
          {...aria}
        >
          <div className="lh-drawer__header">
            {header ?? <span className="lh-drawer__title" id={titleId}>{title}</span>}
            {showClose ? (
              <button
                type="button"
                className="lh-drawer__close"
                aria-label={closeLabel}
                onClick={close}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    fill="currentColor"
                    d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z"
                  />
                </svg>
              </button>
            ) : null}
          </div>

          <div className="lh-drawer__body">{children}</div>

          {footer ? <div className="lh-drawer__footer">{footer}</div> : null}
        </div>
      </div>
    ) : null,
    document.body,
  )
})

LhDrawer.displayName = 'LhDrawer'
