/**
 * Checkbox 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 checkbox 模板一一对应：
 * label.lh-checkbox > input.lh-checkbox__input + span.lh-checkbox__box + span.lh-checkbox__label
 * 半选状态通过 ref 同步到原生 input.indeterminate（CSS 无法表达）
 */
import { forwardRef, useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { useLhCheckbox } from './use-checkbox'
import type { LhCheckboxProps } from './types'

export const LhCheckbox = forwardRef<HTMLInputElement, LhCheckboxProps>((props, ref) => {
  const { value, label, children } = props
  const {
    isChecked,
    isDisabled,
    indeterminate,
    inputName,
    rootClasses,
    sxStyle,
    ariaInvalid,
    handleChange,
  } = useLhCheckbox(props)

  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className={rootClasses} style={sxStyle}>
      <input
        ref={(node) => {
          inputRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as MutableRefObject<HTMLInputElement | null>).current = node
        }}
        className="lh-checkbox__input"
        type="checkbox"
        name={inputName}
        value={value as string | number | readonly string[] | undefined}
        checked={isChecked}
        disabled={isDisabled}
        aria-invalid={ariaInvalid}
        onChange={handleChange}
      />
      <span className="lh-checkbox__box" aria-hidden="true" />
      {label || children ? (
        <span className="lh-checkbox__label">{children ?? label}</span>
      ) : null}
    </label>
  )
})

LhCheckbox.displayName = 'LhCheckbox'
