/**
 * Skeleton 胶水层：share/core/skeleton 纯函数组合
 *
 * 对应 plus 的 packages/components/skeleton/src/index.vue 与 skeleton-item.vue 的
 * <script setup> 部分。一个文件导出两个 hook（仿 use-checkbox.ts 的先例）。
 */
import { useMemo } from 'react'
import {
  getSkeletonClassNames,
  getSkeletonItemClassNames,
  getSkeletonRowWidths,
  getSkeletonAria,
} from '@lh-ui/share/core/skeleton'
import { sxToStyle } from '@lh-ui/share/core/shared'
import type { LhSkeletonProps, LhSkeletonItemProps } from './types'

export function useLhSkeleton(props: LhSkeletonProps) {
  const { loading = true, rows = 3, avatar = false, animated = true } = props

  const skeletonClasses = useMemo(
    () => getSkeletonClassNames({ animated, avatar }),
    [animated, avatar],
  )

  /** 行宽序列：仅 rows>1 时末行缩为 60%，模拟真实段落 */
  const rowWidths = useMemo(() => getSkeletonRowWidths(rows), [rows])

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  return { skeletonClasses, rowWidths, sxStyle, loading, avatar, animated }
}

export function useLhSkeletonItem(props: LhSkeletonItemProps) {
  const { variant = 'text', animated = true } = props

  const itemClasses = useMemo(
    () => getSkeletonItemClassNames(variant, animated),
    [variant, animated],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  /** 占位块无信息量，对辅助技术隐藏 */
  const aria = getSkeletonAria()

  return { itemClasses, sxStyle, aria }
}
