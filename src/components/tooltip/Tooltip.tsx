/**
 * Tooltip 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 tooltip 模板一一对应：
 * 触发器根元素（aria-describedby 关联浮层）+ 浮层 createPortal 到 body
 * （role=tooltip + 内容 + 箭头），显隐由 useTransition 驱动
 * （类名与 SCSS 的 lh-tooltip-fade-* 完全一致）。
 */
import { forwardRef, useImperativeHandle } from 'react'
import { createPortal } from 'react-dom'
import { useTransition } from '../../hooks'
import { useLhTooltip, TOOLTIP_TRANSITION_DURATION } from './use-tooltip'
import type { LhTooltipInstance, LhTooltipProps } from './types'

export const LhTooltip = forwardRef<LhTooltipInstance, LhTooltipProps>((props, ref) => {
  const { children } = props
  const {
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
  } = useLhTooltip(props)

  const { mounted, phase } = useTransition(isVisible, TOOLTIP_TRANSITION_DURATION)

  useImperativeHandle(
    ref,
    () => ({ show, hide, toggle, isVisible }),
    [show, hide, toggle, isVisible],
  )

  return (
    <div
      ref={triggerRef}
      className="lh-tooltip"
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
                id={tooltipId}
                ref={tooltipRef}
                className={[...popperClass, `lh-tooltip-fade-${phase}`].join(' ')}
                style={mergedPopperStyle}
                {...popperAria}
              >
                <span className="lh-tooltip__content">{content}</span>
                <div className="lh-tooltip__arrow" />
              </div>
            ) : null,
            document.body,
          )
        : null}
    </div>
  )
})

LhTooltip.displayName = 'LhTooltip'
