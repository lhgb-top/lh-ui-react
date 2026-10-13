/**
 * Tag 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 tag 模板一一对应：
 * - 传入 onClick 且未禁用时，根 span 升级为 role=button 并支持键盘激活
 * - closable 时渲染 lh-tag__close 关闭按钮（aria-label 走 i18n）
 */
import { forwardRef } from 'react'
import { useLhTag } from './use-tag'
import type { LhTagProps } from './types'

export const LhTag = forwardRef<HTMLSpanElement, LhTagProps>((props, ref) => {
  const { closable, disabled, children } = props
  const {
    tagClasses,
    sxStyle,
    clickable,
    closed,
    closeLabel,
    handleClick,
    handleKeydown,
    handleClose,
  } = useLhTag(props)

  // 内部关闭态：点关闭即卸载（对齐 Alert 的「内部非受控」语义）
  if (closed) return null

  return (
    <span
      ref={ref}
      className={tagClasses.join(' ')}
      style={sxStyle}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeydown}
    >
      <span className="lh-tag__text">{children}</span>
      {closable && (
        <button
          type="button"
          className="lh-tag__close"
          disabled={disabled}
          aria-label={closeLabel}
          onClick={handleClose}
        >
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z"
            />
          </svg>
        </button>
      )}
    </span>
  )
})

LhTag.displayName = 'LhTag'
