/**
 * Space 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 space 模板一一对应：
 * - 容器 display: inline-flex，间距由原生 CSS gap 承载
 * - 不包裹子项（无 SpaceItem），role=presentation 纯装饰
 */
import { forwardRef } from 'react'
import { useLhSpace } from './use-space'
import type { LhSpaceProps } from './types'

export const LhSpace = forwardRef<HTMLDivElement, LhSpaceProps>((props, ref) => {
  const { children } = props
  const { spaceClasses, spaceStyle } = useLhSpace(props)

  return (
    <div
      ref={ref}
      className={spaceClasses.join(' ')}
      style={spaceStyle}
      role="presentation"
    >
      {children}
    </div>
  )
})

LhSpace.displayName = 'LhSpace'
