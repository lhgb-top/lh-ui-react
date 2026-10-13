/**
 * Divider 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 divider 模板一一对应：
 * - 水平方向且传入文案时渲染 lh-divider__label，并升级为 role=separator
 * - 纯装饰分割线为 role=presentation，移出无障碍树
 */
import { forwardRef } from 'react'
import { useLhDivider } from './use-divider'
import type { LhDividerProps } from './types'

export const LhDivider = forwardRef<HTMLDivElement, LhDividerProps>((props, ref) => {
  const { children } = props
  const { dividerClasses, sxStyle, hasContent, role, ariaOrientation } = useLhDivider(props)

  return (
    <div
      ref={ref}
      className={dividerClasses.join(' ')}
      style={sxStyle}
      role={role}
      aria-orientation={ariaOrientation}
    >
      {hasContent && <span className="lh-divider__label">{children}</span>}
    </div>
  )
})

LhDivider.displayName = 'LhDivider'
