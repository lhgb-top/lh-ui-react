/**
 * Breadcrumb 胶水层：share/core/breadcrumb 纯函数组合
 *
 * 对应 plus 的 packages/components/breadcrumb/src/index.vue 的 <script setup> 部分。
 *
 * 与 plus 的差异（React 特化）：plus 的子项在各自 setup 阶段 push token 注册索引，
 * React render 主体禁写外部变量（AGENTS.md 红线 React-1/2），且 effect 注册会让
 * 首帧所有项的 ownIndex 都是 -1（core 的 getStepClassNames 注释亦警告此语义），
 * 故改为由父组件用 cloneElement 同步注入 index：render 纯、首帧即正确、SSR 正确。
 */
import { useMemo, useState } from 'react'
import { Children, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { getCollapsedHiddenIndexes, getEllipsisBeforeIndex } from '@lh-ui/share/core/breadcrumb'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import { LhBreadcrumbItem } from './BreadcrumbItem'
import type { LhBreadcrumbContextValue, LhBreadcrumbProps } from './types'

export function useLhBreadcrumb(props: LhBreadcrumbProps) {
  const { separator = '/', maxItems = 0 } = props
  const { t } = useLhLocale()

  /** 折叠态为内部状态：点击省略号按钮后展开全部 */
  const [expanded, setExpanded] = useState(false)

  const items = useMemo(() => collectItems(props.children), [props.children])
  const total = items.length

  const effectiveMax = expanded ? 0 : maxItems

  const hiddenIndexes = useMemo(
    () => getCollapsedHiddenIndexes({ total, maxItems: effectiveMax }),
    [total, effectiveMax],
  )

  const ellipsisBeforeIndex = useMemo(
    () => getEllipsisBeforeIndex({ total, maxItems: effectiveMax }),
    [total, effectiveMax],
  )

  const contextValue = useMemo<LhBreadcrumbContextValue>(
    () => ({
      total,
      hiddenIndexes,
      ellipsisBeforeIndex,
      separator,
      expand: () => setExpanded(true),
    }),
    [total, hiddenIndexes, ellipsisBeforeIndex, separator],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const navLabel = t('breadcrumb.label', '面包屑导航')

  return { items, contextValue, sxStyle, navLabel }
}

/**
 * 收集直接子元素中的 BreadcrumbItem（跳过文本节点、非法节点与其它组件）
 *
 * 与 plus 的 collectPaneVnodes 下钻不同：React 侧要求 children 直接是
 * LhBreadcrumbItem（可用 `.map` 渲染，但不可被自定义组件包裹），文档注明该约束。
 */
function collectItems(children: ReactNode): ReactElement[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child) && child.type === LhBreadcrumbItem,
  )
}
