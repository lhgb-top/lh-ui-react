/**
 * Input 胶水层：share/core/input 纯函数 + ConfigProvider + 表单上下文组合
 *
 * 对应 plus 的 packages/components/input/src/index.ts（useLhInput composable）。
 *
 * 受控策略：useControlled 管理非受控内部状态；受控模式下 setInputValue 为 no-op，
 * 值完全由外部 value 驱动。change 事件由本层在原生事件处理中显式抛出（双参数 value+event）。
 */
import { useContext, useMemo, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react'
import { clampString, getWordCount, shouldShowWordLimit } from '@lh-ui/share/core/input'
import { isActivationKey, sxToStyle } from '@lh-ui/share/core/shared'
import { LH_SIZE_DEFAULT } from '@lh-ui/share/constants'
import { useLhComponentTheme, useControlled } from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import { useLhLocale } from '../../locale'
import { LhFormItemContext } from '../form/context'
import type { LhInputProps } from './types'

export function useLhInput(props: LhInputProps) {
  const {
    type = 'text',
    size,
    disabled = false,
    readonly = false,
    placeholder,
    maxlength,
    minlength,
    showWordLimit = false,
    showPassword = false,
    resize = 'vertical',
    inputStyle,
    value,
    defaultValue,
    onInput,
    onChange,
    onFocus,
    onBlur,
    onClear,
  } = props

  const ctx = useLhConfigContext()
  const formItem = useContext(LhFormItemContext)
  const { t } = useLhLocale()
  const [isFocused, setIsFocused] = useState(false)
  // 密码显隐内部态（showPassword 开启时生效，不影响外部值）
  const [passwordVisible, setPasswordVisible] = useState(false)

  const [inputValue, setInputValue] = useControlled<string>({
    value,
    defaultValue: defaultValue ?? '',
  })

  // size 未传且无 ConfigProvider 时兜底为家族默认尺寸，否则类名会拼出
  // lh-input--undefined 且尺寸样式整体丢失
  const effectiveSize = size ?? ctx.size ?? LH_SIZE_DEFAULT
  const isTextarea = type === 'textarea'
  /** showPassword 开启时按显隐态切换原生 type；其余场景沿用 props.type */
  const resolvedType = showPassword && type === 'password'
    ? passwordVisible
      ? 'text'
      : 'password'
    : type
  const ariaInvalid = formItem.errorMessage ? true : undefined

  const { componentStyle } = useLhComponentTheme('input', props, ctx)

  const wrapperStyle = useMemo(
    () => ({ ...componentStyle, ...sxToStyle(props.sx ?? {}) }),
    [componentStyle, props.sx],
  )

  const nativeElStyle = useMemo(
    () => ({ resize, ...(inputStyle ?? {}) }),
    [resize, inputStyle],
  )

  /** placeholder 未传时用语言包兜底；有 label 时与浮动标签冲突，保持空 */
  const placeholderText = props.label ? '' : placeholder || t('input.placeholder', '请输入')

  const showsWordLimit = useMemo(
    () => showWordLimit && shouldShowWordLimit({ maxlength, minlength }),
    [showWordLimit, maxlength, minlength],
  )

  const wordCount = useMemo(
    () => getWordCount({ value: inputValue, maxlength }),
    [inputValue, maxlength],
  )

  const handleInput = (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = clampString(e.currentTarget.value, maxlength)
    setInputValue(next)
    onInput?.(next, e)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange?.(clampString(e.target.value, maxlength), e)
  }

  const handleFocus = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    setInputValue('')
    // 受控模式下 setInputValue 是 no-op，必须显式抛 onChange 才能让外部状态回写；
    // 清空没有原生 change 事件，事件对象沿用点击事件（回调签名只需事件引用）
    onChange?.('', e as unknown as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)
    onClear?.()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    props.onKeyDown?.(e)
  }

  /** 眼睛按钮切换密码明文 / 密文（type 随 resolvedType 联动） */
  const togglePasswordVisible = () => setPasswordVisible((visible) => !visible)

  const handlePasswordKeydown = (e: KeyboardEvent) => {
    if (isActivationKey(e)) {
      e.preventDefault()
      togglePasswordVisible()
    }
  }

  return {
    inputValue,
    effectiveSize,
    isTextarea,
    isFocused,
    disabled,
    readonly,
    ariaInvalid,
    placeholderText,
    showsWordLimit,
    wordCount,
    wrapperStyle,
    nativeElStyle,
    resolvedType,
    passwordVisible,
    passwordLabel: t('input.password', '密码'),
    handleInput,
    handleChange,
    handleFocus,
    handleBlur,
    handleClear,
    handleKeyDown,
    togglePasswordVisible,
    handlePasswordKeydown,
  }
}
