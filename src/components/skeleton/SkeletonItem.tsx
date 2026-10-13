/**
 * SkeletonItem 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 skeleton-item 模板一一对应：
 * - 占位块对辅助技术隐藏（aria-hidden）
 * - 形状由 --text / --rect / --circle 修饰符承担
 * - 外部 className / style 与内部类名/样式合并（父 Skeleton 挂 __avatar、行宽等）
 */
import { forwardRef } from 'react'
import { useLhSkeletonItem } from './use-skeleton'
import type { LhSkeletonItemProps } from './types'

export const LhSkeletonItem = forwardRef<HTMLDivElement, LhSkeletonItemProps>((props, ref) => {
  const { className, style } = props
  const { itemClasses, sxStyle, aria } = useLhSkeletonItem(props)

  const mergedClassName = className
    ? [...itemClasses, className].filter(Boolean).join(' ')
    : itemClasses.join(' ')

  return (
    <div ref={ref} className={mergedClassName} style={{ ...sxStyle, ...style }} {...aria} />
  )
})

LhSkeletonItem.displayName = 'LhSkeletonItem'
