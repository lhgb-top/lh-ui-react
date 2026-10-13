/**
 * Popconfirm 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 popconfirm 模板一一对应：
 * 触发器根元素 + 气泡 createPortal 到 body（role=alertdialog + 图标 + 标题 +
 * 确认 / 取消按钮 + 箭头），显隐由 useTransition 驱动（lh-popconfirm-fade-*）。
 */
import { forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from '../../hooks'
import { useLhPopconfirm, POPCONFIRM_TRANSITION_DURATION } from './use-popconfirm'
import { LhIcon } from '../icon'
import { LhButton } from '../button'
import type { LhPopconfirmInstance, LhPopconfirmProps } from './types'

export const LhPopconfirm = forwardRef<LhPopconfirmInstance, LhPopconfirmProps>((props, ref) => {
  const { children, title } = props
  const {
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
  } = useLhPopconfirm(props)

  const { mounted, phase } = useTransition(isVisible, POPCONFIRM_TRANSITION_DURATION)

  useImperativeHandle(
    ref,
    () => ({ show, hide, toggle, isVisible }),
    [show, hide, toggle, isVisible],
  )

  return (
    <div
      ref={triggerRef}
      className="lh-popconfirm"
      style={triggerStyle}
      onMouseEnter={onTriggerMouseenter}
      onMouseLeave={onTriggerMouseleave}
      onClick={onTriggerClick}
      onFocus={onTriggerFocusin}
      onBlur={onTriggerFocusout}
      {...triggerAria}
    >
      {children}

      {typeof document !== 'undefined'
        ? createPortal(
            mounted ? (
              <div
                id={popperId}
                ref={popperRef}
                className={[...classes, `lh-popconfirm-fade-${phase}`].join(' ')}
                style={mergedPopperStyle}
                {...popperAria}
              >
                <div className="lh-popconfirm__main">
                  {showIcon ? (
                    <LhIcon name={iconName} className="lh-popconfirm__icon" />
                  ) : null}
                  <div className="lh-popconfirm__title">{title}</div>
                </div>
                <div className="lh-popconfirm__actions">
                  {hideCancel ? null : (
                    <LhButton size="small" onClick={handleCancel}>
                      {cancelLabel}
                    </LhButton>
                  )}
                  <LhButton size="small" type="primary" onClick={handleConfirm}>
                    {confirmLabel}
                  </LhButton>
                </div>
                <div className="lh-popconfirm__arrow" />
              </div>
            ) : null,
            document.body,
          )
        : null}
    </div>
  )
})

LhPopconfirm.displayName = 'LhPopconfirm'
