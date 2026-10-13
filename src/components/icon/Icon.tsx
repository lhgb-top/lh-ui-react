/**
 * Icon 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 icon 模板一一对应：
 * - 有内置 svg path 时渲染 24x24 viewBox 的 svg
 * - 否则回退渲染 children（自定义图标场景）
 * - 默认装饰态输出 aria-hidden，避免读屏播报无意义图形
 */
import { forwardRef } from 'react'
import { useLhIcon } from './use-icon'
import type { LhIconProps } from './types'

export const LhIcon = forwardRef<HTMLSpanElement, LhIconProps>((props, ref) => {
  const { name, children, className } = props
  const { svgPath, iconSize, iconStyle, aria } = useLhIcon(props)

  return (
    <span
      ref={ref}
      className={['lh-icon', name ? `lh-icon--${name}` : '', className].filter(Boolean).join(' ')}
      style={iconStyle}
      {...aria}
    >
      {svgPath ? (
        <svg viewBox="0 0 24 24" width={iconSize} height={iconSize} fill="currentColor">
          <path d={svgPath} />
        </svg>
      ) : (
        children
      )}
    </span>
  )
})

LhIcon.displayName = 'LhIcon'
