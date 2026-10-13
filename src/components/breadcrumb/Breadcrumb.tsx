/**
 * Breadcrumb 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 breadcrumb/index.vue 一一对应：nav > ol.lh-breadcrumb__list，
 * 通过 Context 下发折叠状态与分隔符；索引由 cloneElement 同步注入（见 use-breadcrumb）。
 */
import { forwardRef } from 'react'
import { cloneElement } from 'react'
import { useLhBreadcrumb } from './use-breadcrumb'
import { LhBreadcrumbContext } from './context'
import type { LhBreadcrumbProps } from './types'

export const LhBreadcrumb = forwardRef<HTMLElement, LhBreadcrumbProps>((props, ref) => {
  const { items, contextValue, sxStyle, navLabel } = useLhBreadcrumb(props)

  return (
    <nav ref={ref} className="lh-breadcrumb" style={sxStyle} aria-label={navLabel}>
      <ol className="lh-breadcrumb__list">
        <LhBreadcrumbContext.Provider value={contextValue}>
          {items.map((item, index) =>
            cloneElement(item, { key: item.key ?? index, index }),
          )}
        </LhBreadcrumbContext.Provider>
      </ol>
    </nav>
  )
})

LhBreadcrumb.displayName = 'LhBreadcrumb'
