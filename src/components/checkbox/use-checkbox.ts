/**
 * Checkbox 胶水层：share/core/checkbox 纯函数 + Group 上下文 + 表单上下文组合
 *
 * 对应 plus 的 packages/components/checkbox/src/index.vue 的 <script setup> 部分。
 */
import { useCallback, useContext, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import { isCheckboxChecked, toggleCheckboxValue } from '@lh-ui/share/core/checkbox'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { LhCheckboxGroupContext } from './context'
import { LhFormItemContext } from '../form/context'
import type { LhCheckboxGroupProps, LhCheckboxProps } from './types'

export function useLhCheckbox(props: LhCheckboxProps) {
  const {
    value,
    label,
    disabled = false,
    indeterminate = false,
    name,
    size = 'medium',
    checked,
    defaultChecked,
    onChange,
  } = props

  const group = useContext(LhCheckboxGroupContext)
  const formItem = useContext(LhFormItemContext)
  const isInGroup = Boolean(group && value !== undefined)

  const [internalChecked, setInternalChecked] = useControlled<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  })

  const isDisabled = Boolean(disabled || group?.disabled)
  const effectiveSize = group?.size ?? size
  const isChecked = isInGroup && group ? isCheckboxChecked(group.values, value) : internalChecked

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const rootClasses = useMemo(
    () =>
      [
        'lh-checkbox',
        `lh-checkbox--${effectiveSize}`,
        isChecked && 'lh-checkbox--checked',
        isDisabled && 'lh-checkbox--disabled',
        indeterminate && 'lh-checkbox--indeterminate',
      ]
        .filter(Boolean)
        .join(' '),
    [effectiveSize, isChecked, isDisabled, indeterminate],
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 禁用态不响应变更（与 radio 一致；真实浏览器不派发，jsdom 会派发，需显式拦截）
    if (isDisabled) return
    const next = e.target.checked
    if (isInGroup && group) {
      group.toggle(value, next)
      return
    }
    setInternalChecked(next)
  }

  return {
    label,
    isChecked,
    isDisabled,
    indeterminate,
    inputName: group?.name ?? name,
    rootClasses,
    sxStyle,
    ariaInvalid: formItem.errorMessage ? true : undefined,
    handleChange,
  }
}

export function useLhCheckboxGroup(props: LhCheckboxGroupProps) {
  const {
    value,
    defaultValue,
    disabled = false,
    name,
    size = 'medium',
    onChange,
  } = props

  const [internalValue, setInternalValue] = useControlled<unknown[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange,
  })

  const toggle = useCallback(
    (itemValue: unknown, checked: boolean) => {
      setInternalValue(toggleCheckboxValue(internalValue, itemValue, checked))
    },
    [internalValue, setInternalValue],
  )

  const contextValue = useMemo(
    () => ({ values: internalValue, disabled, name, size, toggle }),
    [internalValue, disabled, name, size, toggle],
  )

  return { contextValue, values: internalValue }
}
