/**
 * Empty 胶水层：share/core/empty 纯函数组合
 *
 * 对应 plus 的 packages/components/empty/src/index.vue 的 <script setup> 部分。
 */
import { useMemo } from 'react'
import { getEmptyClassNames } from '@lh-ui/share/core/empty'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import type { LhEmptyProps } from './types'

export function useLhEmpty(props: LhEmptyProps) {
  const { t } = useLhLocale()

  /** 传了自定义图片（image prop 或 children 节点）时走自定义图样式 */
  const hasImage = !!props.image || !!props.children

  const emptyClasses = useMemo(() => getEmptyClassNames({ hasImage }), [hasImage])

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  /** 描述兜底：prop > 语言包默认文案（与 plus 的 || 兜底一致） */
  const description = props.description || t('empty.description', '暂无数据')

  return { emptyClasses, sxStyle, hasImage, description }
}
