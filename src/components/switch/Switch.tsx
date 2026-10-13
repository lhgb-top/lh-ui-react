/**
 * Switch 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 switch 模板一一对应：
 * div.lh-switch[role=switch] > span.lh-switch__core > (loading) + span.lh-switch__label
 * 自定义控件：点击或 Enter/Space 切换，无障碍属性由 core 产出。
 */
import { forwardRef } from 'react'
import { useLhSwitch } from './use-switch'
import type { LhSwitchProps } from './types'

export const LhSwitch = forwardRef<HTMLDivElement, LhSwitchProps>((props, ref) => {
  const { activeText, inactiveText } = props
  const { switchClasses, switchLabel, aria, sxStyle, ariaInvalid, toggle, handleKeyup } =
    useLhSwitch(props)

  return (
    <div
      ref={ref}
      className={switchClasses.join(' ')}
      tabIndex={0}
      style={sxStyle}
      aria-invalid={ariaInvalid}
      onClick={toggle}
      onKeyUp={handleKeyup}
      {...aria}
    >
      <span className="lh-switch__core">{props.loading && <span className="lh-switch__loading" />}</span>
      {activeText || inactiveText ? (
        <span className="lh-switch__label">{switchLabel}</span>
      ) : null}
    </div>
  )
})

LhSwitch.displayName = 'LhSwitch'
