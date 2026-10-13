/**
 * Popover 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 popover 模板一一对应：
 * 触发器根元素 + 浮层 createPortal 到 body（role=dialog + 标题 + 内容 + 箭头），
 * 显隐由 useTransition 驱动（类名与 SCSS 的 lh-popover-fade-* 完全一致）。
 * click 触发时弹出层圈焦（对齐 plus 的 isModal 语义）。
 */
import { forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from '../../hooks'
import { useLhPopover, POPOVER_TRANSITION_DURATION } from './use-popover'
import type { LhPopoverInstance, LhPopoverProps } from './types'

export const LhPopover = forwardRef<LhPopoverInstance, LhPopoverProps>((props, ref) => {
  const { children, title, content } = props
  const {
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
  } = useLhPopover(props)

  const { mounted, phase } = useTransition(isVisible, POPOVER_TRANSITION_DURATION)

  useImperativeHandle(
    ref,
    () => ({ show, hide, toggle, isVisible }),
    [show, hide, toggle, isVisible],
  )

  return (
    <div
      ref={triggerRef}
      className="lh-popover"
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
                className={[...classes, `lh-popover-fade-${phase}`].join(' ')}
                style={mergedPopperStyle}
                {...popperAria}
              >
                {title ? (
                  <div id={titleId} className="lh-popover__title">
                    {title}
                  </div>
                ) : null}
                <div className="lh-popover__content">{content}</div>
                {props.arrow === false ? null : <div className="lh-popover__arrow" />}
              </div>
            ) : null,
            document.body,
          )
        : null}
    </div>
  )
})

LhPopover.displayName = 'LhPopover'
