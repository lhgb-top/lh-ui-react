/**
 * Dialog 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 dialog 模板一一对应：
 * 容器（遮罩 + wrapper + lh-dialog[role=dialog]）整体 createPortal 到 body，
 * 显隐由 useTransition 驱动（类名与 SCSS 的 lh-dialog-fade-* 完全一致）。
 *
 * 焦点圈生命周期（React 特化，对应 Vue 的 nextTick 时机）：
 * - mounted 变 true（DOM 已落位）→ trap(dialogRef) + onOpened
 * - mounted 变 false（离开动画播完）→ release() + onClosed
 */
import { forwardRef, useEffect, useImperativeHandle, useId } from 'react'
import { createPortal } from 'react-dom'
import { getDialogAria } from '@lh-ui/share/core/dialog'
import { useTransition } from '../../hooks'
import { useLhDialog, DIALOG_TRANSITION_DURATION } from './use-dialog'
import type { LhDialogInstance, LhDialogProps } from './types'

export const LhDialog = forwardRef<LhDialogInstance, LhDialogProps>((props, ref) => {
  const { open = false, header, footer, children, onOpened, onClosed } = props
  const {
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
    close,
    handleModalClick,
    handleHeaderMousedown,
    trap,
    release,
  } = useLhDialog(props)

  const { mounted, phase } = useTransition(open, DIALOG_TRANSITION_DURATION)
  const titleId = useId()
  const ariaLabel = title || 'dialog'
  const aria = getDialogAria({ titleId })

  // 挂载态变化：焦点圈 + 生命周期回调（与 Vue 版 nextTick 后的 trap 同语义）
  useEffect(() => {
    if (!mounted) {
      release()
      onClosed?.()
      return
    }
    trap(dialogRef.current)
    onOpened?.()
  }, [mounted, trap, release, dialogRef, onOpened, onClosed])

  useImperativeHandle(ref, () => ({ close, isOpen: open }), [close, open])

  if (typeof document === 'undefined') return null

  return createPortal(
    mounted ? (
      <div className={['lh-dialog__container', `lh-dialog-fade-${phase}`].join(' ')}>
        <div className="lh-dialog__overlay" onClick={handleModalClick} />
        <div
          className={['lh-dialog__wrapper', `lh-dialog__wrapper--${position}`].join(' ')}
          style={dialogStyle}
        >
          <div
            ref={dialogRef}
            className={[
              'lh-dialog',
              fullscreen && 'lh-dialog--fullscreen',
              center && 'lh-dialog--center',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ ...dialogContentStyle, ...dialogDragStyle, ...componentStyle }}
            aria-label={ariaLabel}
            {...aria}
          >
            <div
              ref={headerRef}
              className="lh-dialog__header"
              onMouseDown={handleHeaderMousedown}
            >
              {header ?? <span className="lh-dialog__title" id={titleId}>{title}</span>}
              {showClose ? (
                <button
                  type="button"
                  className="lh-dialog__close"
                  aria-label="close"
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

            <div className="lh-dialog__body">{children}</div>

            {footer ? <div className="lh-dialog__footer">{footer}</div> : null}
          </div>
        </div>
      </div>
    ) : null,
    document.body,
  )
})

LhDialog.displayName = 'LhDialog'
