/**
 * Skeleton 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 skeleton 模板一一对应：
 * - loading=true 渲染骨架占位（aria-busy + aria-live polite）
 * - loading=false 直接渲染子节点（条件渲染，无过渡，与 plus 一致）
 * - 根元素必须有确定宽度（行宽是百分比），由 SCSS 的 width:100% 承担
 */
import { forwardRef } from 'react'
import { LhSkeletonItem } from './SkeletonItem'
import { useLhSkeleton } from './use-skeleton'
import type { LhSkeletonProps } from './types'

export const LhSkeleton = forwardRef<HTMLDivElement, LhSkeletonProps>((props, ref) => {
  const { children } = props
  const { skeletonClasses, rowWidths, sxStyle, loading, avatar, animated } = useLhSkeleton(props)

  if (!loading) return <>{children}</>

  return (
    <div
      ref={ref}
      className={skeletonClasses.join(' ')}
      style={sxStyle}
      aria-busy="true"
      aria-live="polite"
    >
      {avatar && (
        <LhSkeletonItem
          variant="circle"
          animated={animated}
          className="lh-skeleton__avatar"
        />
      )}
      <div className="lh-skeleton__content">
        {rowWidths.map((width, index) => (
          // 行宽序列由 core 纯函数生成，index 天然稳定
          <LhSkeletonItem key={index} variant="text" animated={animated} style={{ width }} />
        ))}
      </div>
    </div>
  )
})

LhSkeleton.displayName = 'LhSkeleton'
