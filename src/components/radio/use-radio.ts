/**
 * Radio 胶水层：share/core/radio 纯函数 + Group 上下文 + 表单上下文组合
 *
 * 对应 plus 的 packages/components/radio/src/index.vue 的 <script setup> 部分。
 * Radio 与 Checkbox 不同：选中即代表「选中值为本选项 value」，无需数组切换。
 */
import { useCallback, useContext, useMemo } from 'react'
import { isRadioChecked } from '@lh-ui/share/core/radio'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { LhRadioGroupContext } from './context'
import { LhFormItemContext } from '../form/context'
import type { LhRadioGroupProps, LhRadioProps } from './types'

export function useLhRadio(props: LhRadioProps) {
  const {
    value,
    label,
    disabled = false,
    name,
    size = 'medium',
    checked,
    defaultChecked,
    onChange,
  } = props

  const group = useContext(LhRadioGroupContext)
  const formItem = useContext(LhFormItemContext)
  const isInGroup = Boolean(group && value !== undefined)

  const [internalValue, setInternalValue] = useControlled<unknown>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  })

  const isDisabled = Boolean(disabled || group?.disabled)
  const effectiveSize = group?.size ?? size
  // LhRadioState.checked 为派生字段（isRadioChecked 只比较 modelValue/value），同步填入比较结果
  const radioModelValue = isInGroup && group ? group.modelValue : internalValue
  const isChecked = isRadioChecked({
    modelValue: radioModelValue,
    value,
    checked: Object.is(radioModelValue, value),
  })

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const rootClasses = useMemo(
    () =>
      [
        'lh-radio',
        `lh-radio--${effectiveSize}`,
        isChecked && 'lh-radio--checked',
        isDisabled && 'lh-radio--disabled',
      ]
        .filter(Boolean)
        .join(' '),
    [effectiveSize, isChecked, isDisabled],
  )

  const handleChange = () => {
    if (isDisabled) return
    if (isInGroup && group) {
      group.onChange(value)
      return
    }
    setInternalValue(value)
  }

  return {
    label,
    isChecked,
    isDisabled,
    inputName: group?.name ?? name,
    rootClasses,
    sxStyle,
    ariaInvalid: formItem.errorMessage ? true : undefined,
    handleChange,
  }
}

export function useLhRadioGroup(props: LhRadioGroupProps) {
  const { value, defaultValue, disabled = false, name, size = 'medium', onChange } = props

  const [internalValue, setInternalValue] = useControlled<unknown>({
    value,
    defaultValue,
    onChange,
  })

  const onChangeValue = useCallback(
    (next: unknown) => {
      setInternalValue(next)
    },
    [setInternalValue],
  )

  const contextValue = useMemo(
    () => ({ modelValue: internalValue, disabled, name, size, onChange: onChangeValue }),
    [internalValue, disabled, name, size, onChangeValue],
  )

  return { contextValue, modelValue: internalValue }
}
