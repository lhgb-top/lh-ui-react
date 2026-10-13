/**
 * Radio 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 radio 模板一一对应：
 * label.lh-radio > input.lh-radio__input + span.lh-radio__box + span.lh-radio__label
 */
import { forwardRef } from 'react'
import { useLhRadio } from './use-radio'
import type { LhRadioProps } from './types'

export const LhRadio = forwardRef<HTMLInputElement, LhRadioProps>((props, ref) => {
  const { value, label, children } = props
  const {
    isChecked,
    isDisabled,
    inputName,
    rootClasses,
    sxStyle,
    ariaInvalid,
    handleChange,
  } = useLhRadio(props)

  return (
    <label className={rootClasses} style={sxStyle}>
      <input
        ref={ref}
        className="lh-radio__input"
        type="radio"
        name={inputName}
        value={value as string | number | readonly string[] | undefined}
        checked={isChecked}
        disabled={isDisabled}
        aria-invalid={ariaInvalid}
        onChange={handleChange}
      />
      <span className="lh-radio__box" aria-hidden="true" />
      {label || children ? <span className="lh-radio__label">{children ?? label}</span> : null}
    </label>
  )
})

LhRadio.displayName = 'LhRadio'
