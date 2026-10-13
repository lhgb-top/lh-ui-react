/**
 * Button 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 button 模板一一对应：
 * - 有 href 时渲染锚点（<a>），否则渲染原生 <button>
 * - loading 时插入 lh-button__loading 旋转动画，且按钮不可点击
 * - icon prop 渲染前置图标，文字内容统一包在 lh-button__text 内
 */
import { forwardRef } from 'react'
import { useLhButton } from './use-button'
import { LhIcon } from '../icon'
import type { LhButtonProps } from './types'

export const LhButton = forwardRef<HTMLButtonElement, LhButtonProps>((props, ref) => {
  const {
    nativeType = 'button',
    href,
    target = '_self',
    loading = false,
    disabled = false,
    icon,
    children,
  } = props
  const { handleClick, buttonStyle, classNames } = useLhButton(props)

  const iconNode = icon ? (
    <span className="lh-button__icon">
      <LhIcon name={icon} />
    </span>
  ) : null

  const textNode = children ? <span className="lh-button__text">{children}</span> : null

  if (href) {
    return (
      <a
        href={href}
        target={target}
        className={classNames.join(' ')}
        style={buttonStyle}
        onClick={handleClick}
      >
        {iconNode}
        {textNode}
      </a>
    )
  }

  return (
    <button
      ref={ref}
      type={nativeType}
      className={classNames.join(' ')}
      style={buttonStyle}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && (
        <span className="lh-button__loading">
          <svg className="lh-button__spinner" viewBox="0 0 100 100">
            <circle className="lh-button__path" cx="50" cy="50" r="20" fill="none" strokeWidth="16" />
          </svg>
        </span>
      )}
      {iconNode}
      {textNode}
    </button>
  )
})

LhButton.displayName = 'LhButton'
