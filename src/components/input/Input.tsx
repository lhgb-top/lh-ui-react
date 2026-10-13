/**
 * Input 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 input 模板一一对应：
 * div.lh-input__wrapper > (浮动 label) + div.lh-input[.lh-input--textarea] >
 *   (prefix) + input/textarea.lh-input__inner + (suffix/clear) + (字数统计)
 *
 * 差异点（已登记到迁移指南）：
 * - React 版 autosize 由本组件 effect 直接操作 DOM 高度（Vue 版通过 data-autosize 属性 + 指令）
 */
import { forwardRef, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useLhInput } from './use-input'
import { LhIcon } from '../icon'
import type { LhInputProps } from './types'

export const LhInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, LhInputProps>(
  (props, ref) => {
    const {
      type = 'text',
      disabled = false,
      readonly = false,
      clearable = false,
      showPassword = false,
      prefixIcon,
      suffixIcon,
      label,
      maxlength,
      minlength,
      autofocus,
      autocomplete,
      nativeType,
      name,
      rows,
      tabindex,
      form,
      autosize,
    } = props
    const {
      inputValue,
      effectiveSize,
      isTextarea,
      isFocused,
      placeholderText,
      showsWordLimit,
      wordCount,
      wrapperStyle,
      nativeElStyle,
      ariaInvalid,
      resolvedType,
      passwordVisible,
      passwordLabel,
      handleInput,
      handleChange,
      handleFocus,
      handleBlur,
      handleClear,
      handleKeyDown,
      togglePasswordVisible,
      handlePasswordKeydown,
    } = useLhInput(props)

    const innerRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const mergeRef = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref)
        (ref as MutableRefObject<HTMLInputElement | HTMLTextAreaElement | null>).current = node
    }

    // autosize：textarea 高度随内容自适应（min/maxRows 约束行数）
    useEffect(() => {
      if (!isTextarea || !autosize || !innerRef.current) return
      const el = innerRef.current as HTMLTextAreaElement
      const opts = typeof autosize === 'object' ? autosize : {}
      const minRows = opts.minRows ?? 1
      const maxRows = opts.maxRows
      const lineHeight = Number.parseFloat(
        getComputedStyle(el).lineHeight || '20',
      )
      const adjust = () => {
        el.style.height = 'auto'
        let next = el.scrollHeight
        if (maxRows !== undefined) next = Math.min(next, maxRows * lineHeight)
        next = Math.max(next, minRows * lineHeight)
        el.style.height = `${next}px`
      }
      // share 样式给 textarea 设了 min-height:100px。autosize 读 scrollHeight 前若不解除它，
      // height='auto' 时 clientHeight 被抬高到 116px，scrollHeight 恒 ≥116，min/maxRows 夹逼
      // 永远落在 maxRows，高度与内容完全无关。autosize 期间用 inline min-height 接管该下限。
      el.style.minHeight = '0px'
      adjust()
      return () => {
        el.style.minHeight = ''
      }
    }, [isTextarea, autosize, inputValue, effectiveSize])

    const wrapperClasses = [
      'lh-input__wrapper',
      disabled && 'lh-input__wrapper--disabled',
      isFocused && 'lh-input__wrapper--focused',
      label && 'lh-input__wrapper--has-label',
      inputValue && 'lh-input__wrapper--has-value',
    ]
      .filter(Boolean)
      .join(' ')

    const baseClasses = [
      'lh-input',
      isTextarea && 'lh-input--textarea',
      `lh-input--${effectiveSize}`,
      prefixIcon && 'lh-input--prefix',
      (suffixIcon || clearable || showPassword) && 'lh-input--suffix',
      disabled && 'lh-input--disabled',
    ]
      .filter(Boolean)
      .join(' ')

    const commonProps = {
      className: 'lh-input__inner',
      style: nativeElStyle,
      value: inputValue,
      disabled,
      readOnly: readonly,
      'aria-invalid': ariaInvalid,
      placeholder: placeholderText,
      maxLength: maxlength,
      minLength: minlength,
      name,
      tabIndex: tabindex,
      form,
      onInput: handleInput,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    }

    return (
      <div className={wrapperClasses} style={wrapperStyle}>
        {label ? (
          <label
            className={[
              'lh-input__label',
              (isFocused || inputValue) && 'lh-input__label--float',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
          </label>
        ) : null}

        <div className={baseClasses}>
          {prefixIcon ? (
            <span className="lh-input__prefix">
              <LhIcon name={prefixIcon} />
            </span>
          ) : null}

          {isTextarea ? (
            <textarea
              {...commonProps}
              ref={mergeRef as (node: HTMLTextAreaElement | null) => void}
              rows={rows}
              autoFocus={autofocus}
            />
          ) : (
            <input
              {...commonProps}
              ref={mergeRef as (node: HTMLInputElement | null) => void}
              type={nativeType ?? resolvedType}
              autoFocus={autofocus}
              autoComplete={autocomplete}
            />
          )}

          {suffixIcon || clearable || showPassword ? (
            <span className="lh-input__suffix">
              {suffixIcon ? <LhIcon name={suffixIcon} /> : null}
              {clearable && inputValue ? (
                <svg
                  className="lh-input__suffix-icon lh-input__clear"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  onClick={handleClear}
                >
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              ) : null}
              {showPassword && type === 'password' ? (
                // share 仅有 eye 图标、无 eye-off，显隐两态同图形，靠 aria-pressed 区分
                <svg
                  className="lh-input__suffix-icon lh-input__clear"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  aria-pressed={passwordVisible}
                  aria-label={passwordLabel}
                  onClick={togglePasswordVisible}
                  onKeyDown={handlePasswordKeydown}
                >
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              ) : null}
            </span>
          ) : null}
        </div>

        {showsWordLimit ? <span className="lh-input__count">{wordCount}</span> : null}
      </div>
    )
  },
)

LhInput.displayName = 'LhInput'
