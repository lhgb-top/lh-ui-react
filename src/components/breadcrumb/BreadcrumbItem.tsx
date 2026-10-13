/**
 * BreadcrumbItem 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 breadcrumb-item.vue 一一对应：
 * - 折叠时该项之前渲染省略号按钮（lh-breadcrumb__ellipsis），点击展开
 * - 有 to 且非末项渲染为 <a> 链接，否则为纯文本
 * - 非末项渲染分隔符
 */
import { forwardRef, useContext } from 'react'
import { getBreadcrumbItemAria, getBreadcrumbItemClassNames } from '@lh-ui/share/core/breadcrumb'
import { useLhLocale } from '../../locale'
import { LhBreadcrumbContext } from './context'
import type { LhBreadcrumbItemProps } from './types'

export const LhBreadcrumbItem = forwardRef<HTMLLIElement, LhBreadcrumbItemProps>((props, ref) => {
  const { children, to } = props
  const ctx = useContext(LhBreadcrumbContext)
  const { t } = useLhLocale()

  // 未被 LhBreadcrumb 包裹时按「独立单项」渲染（index 缺省视为末项）
  const index = props.index ?? -1
  const isLast = ctx ? index === ctx.total - 1 : true
  const isHidden = ctx ? ctx.hiddenIndexes.includes(index) : false
  const showEllipsisBefore = ctx ? ctx.ellipsisBeforeIndex === index : false
  const isLink = !!to && !isLast

  const itemClasses = getBreadcrumbItemClassNames({ isLast, isLink })
  const separatorText = ctx ? ctx.separator : '/'
  const moreLabel = t('breadcrumb.more', '更多')

  if (isHidden) return null

  return (
    <>
      {showEllipsisBefore && (
        <li className="lh-breadcrumb__ellipsis">
          <button
            type="button"
            className="lh-breadcrumb__ellipsis-btn"
            aria-label={moreLabel}
            onClick={ctx?.expand}
          >
            <span aria-hidden="true">•••</span>
          </button>
        </li>
      )}
      <li ref={ref} className={itemClasses.join(' ')}>
        {isLink ? (
          <a href={to} className="lh-breadcrumb__link">
            {children}
          </a>
        ) : (
          <span className="lh-breadcrumb__text" {...getBreadcrumbItemAria(isLast)}>
            {children}
          </span>
        )}
        {!isLast && (
          <span className="lh-breadcrumb__separator" aria-hidden="true">
            {separatorText}
          </span>
        )}
      </li>
    </>
  )
})

LhBreadcrumbItem.displayName = 'LhBreadcrumbItem'
