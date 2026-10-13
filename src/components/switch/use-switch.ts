/**
 * Switch 胶水层：share/core/switch 纯函数组合
 *
 * 对应 plus 的 packages/components/switch/src/index.vue 的 <script setup> 部分。
 * 自定义控件（非原生 input）：role=switch + aria-checked 由 core 产出，
 * 键盘激活走 isActivationKey（Enter / Space 等效点击）。
 */
import { useContext, useMemo } from 'react'
import type { KeyboardEvent } from 'react'
import { getSwitchAria, getSwitchClassNames, getSwitchLabel } from '@lh-ui/share/core/switch'
import type { LhSwitchState } from '@lh-ui/share/core/switch'
import { isActivationKey, sxToStyle } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { LhFormItemContext } from '../form/context'
import type { LhSwitchProps } from './types'

export function useLhSwitch(props: LhSwitchProps) {
  const {
    disabled = false,
    loading = false,
    name,
    size = 'medium',
    activeText = '',
    inactiveText = '',
    checked,
    defaultChecked,
    onChange,
  } = props

  const formItem = useContext(LhFormItemContext)
  const [internalChecked, setInternalChecked] = useControlled<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange,
  })

  // core 的 getSwitchClassNames / getSwitchLabel 均按完整 LhSwitchState 取参，统一构造一份复用
  const switchState = useMemo<LhSwitchState>(
    () => ({
      checked: internalChecked,
      disabled,
      loading,
      size,
      name: name ?? '',
      activeText,
      inactiveText,
    }),
    [internalChecked, disabled, loading, size, name, activeText, inactiveText],
  )

  const switchClasses = useMemo(() => getSwitchClassNames(switchState), [switchState])

  const switchLabel = useMemo(() => getSwitchLabel(switchState), [switchState])

  const aria = useMemo(
    () => getSwitchAria({ checked: internalChecked, disabled, loading }),
    [internalChecked, disabled, loading],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const toggle = () => {
    if (disabled || loading) return
    setInternalChecked(!internalChecked)
  }

  /** 键盘激活：Enter / Space 等效点击 */
  const handleKeyup = (e: KeyboardEvent) => {
    if (!isActivationKey(e)) return
    e.preventDefault()
    toggle()
  }

  return {
    switchClasses,
    switchLabel,
    aria,
    sxStyle,
    ariaInvalid: formItem.errorMessage ? true : undefined,
    toggle,
    handleKeyup,
  }
}
