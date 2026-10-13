/**
 * Alert 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 alert 模板一一对应：
 * - role 由类型决定（warning/danger → alert 立即播报；info/success → status 排队播报）
 * - closable 时渲染内置 X 关闭按钮，点击即卸载（非受控，无过渡）
 * - showIcon 时渲染对应类型的 LhIcon
 */
import { forwardRef } from 'react'
import { LhIcon } from '../icon'
import { useLhAlert } from './use-alert'
import type { LhAlertProps } from './types'

export const LhAlert = forwardRef<HTMLDivElement, LhAlertProps>((props, ref) => {
  const { children, closable, showIcon, title } = props
  const { alertClasses, sxStyle, visible, role, iconName, closeLabel, withTitle, handleClose } =
    useLhAlert(props)

  if (!visible) return null

  return (
    <div ref={ref} className={alertClasses.join(' ')} style={sxStyle} role={role}>
      {showIcon && <LhIcon name={iconName} className="lh-alert__icon" />}

      <div className="lh-alert__content">
        {withTitle && <span className="lh-alert__title">{title}</span>}
        <p className="lh-alert__description">{children}</p>
      </div>

      {closable && (
        <button
          type="button"
          className="lh-alert__close"
          aria-label={closeLabel}
          onClick={handleClose}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z"
            />
          </svg>
        </button>
      )}
    </div>
  )
})

LhAlert.displayName = 'LhAlert'
