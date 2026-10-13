/**
 * Select 胶水层：share/core/select 纯函数 + 受控状态 + 键盘导航组合
 *
 * 对应 plus 的 packages/components/select/src/index.vue 的 <script setup> 部分。
 * 定位 / 点击外部 / 过渡由 Select.tsx 侧的 hooks 承接，本层只管状态与语义。
 */
import { useCallback, useContext, useId, useMemo, useState } from 'react'
import { findSelectOption, getSelectOptionId, getSelectTriggerAria } from '@lh-ui/share/core/select'
import { getNextListIndex, LH_KEYS, isEscapeKey } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { useLhLocale } from '../../locale'
import { LhFormItemContext } from '../form/context'
import type { KeyboardEvent } from 'react'
import type { LhSelectOption, LhSelectProps } from './types'

export function useLhSelect(props: LhSelectProps) {
  const {
    options = [],
    disabled = false,
    clearable = false,
    placeholder,
    ariaLabel,
    value,
    defaultValue,
    onChange,
    onClear,
  } = props

  const formItem = useContext(LhFormItemContext)
  const { t } = useLhLocale()
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const listboxId = useId()

  const [internalValue, setInternalValue] = useControlled<unknown>({ value, defaultValue })
  const selectedOption = useMemo(
    () => findSelectOption(options, internalValue),
    [options, internalValue],
  )

  const isSelected = useCallback(
    (option: LhSelectOption) => Object.is(option.value, internalValue),
    [internalValue],
  )

  const open = useCallback(() => {
    if (disabled) return
    setIsOpen(true)
    const selectedIndex = options.findIndex(isSelected)
    setHighlightedIndex(
      selectedIndex >= 0 ? selectedIndex : getNextListIndex(options, -1, 1),
    )
  }, [disabled, options, isSelected])

  const close = useCallback(() => setIsOpen(false), [])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, open, close])

  const selectOption = useCallback(
    (option: LhSelectOption) => {
      if (option.disabled) return
      setInternalValue(option.value)
      onChange?.(option.value, option)
      // 选项点击只产生 click，无原生 change 事件冒泡到 FormItem，主动带着新值触发 change 校验
      formItem.validateChange(option.value)
      close()
    },
    [setInternalValue, onChange, formItem, close],
  )

  const clear = useCallback(() => {
    setInternalValue(undefined)
    onChange?.(undefined, undefined)
    formItem.validateChange(undefined)
    onClear?.()
    close()
  }, [setInternalValue, onChange, formItem, onClear, close])

  const handleKeydown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === LH_KEYS.ArrowDown || event.key === LH_KEYS.ArrowUp) {
        event.preventDefault()
        if (!isOpen) {
          open()
        } else {
          setHighlightedIndex((current) =>
            getNextListIndex(options, current, event.key === LH_KEYS.ArrowDown ? 1 : -1),
          )
        }
        return
      }

      if (event.key === LH_KEYS.Enter && isOpen && highlightedIndex >= 0) {
        event.preventDefault()
        const option = options[highlightedIndex]
        if (option) selectOption(option)
        return
      }

      if (isEscapeKey(event)) close()
    },
    [isOpen, highlightedIndex, options, open, close, selectOption],
  )

  const triggerAria = useMemo(
    () => getSelectTriggerAria({ visible: isOpen, listboxId, highlightedIndex }),
    [isOpen, listboxId, highlightedIndex],
  )

  const displayLabel = selectedOption?.label || placeholder || t('select.placeholder', '请选择')

  return {
    options,
    isOpen,
    highlightedIndex,
    listboxId,
    selectedOption,
    internalValue,
    clearable,
    disabled,
    ariaLabel,
    name: props.name,
    displayLabel,
    triggerAria,
    ariaInvalid: formItem.errorMessage ? true : undefined,
    isSelected,
    getOptionId: (index: number) => getSelectOptionId(listboxId, index),
    open,
    close,
    toggle,
    selectOption,
    clear,
    handleKeydown,
    setHighlightedIndex,
  }
}
