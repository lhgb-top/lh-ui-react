import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'

/**
 * Breadcrumb Props（与 lh-ui-plus 的 LhBreadcrumbProps 同名同义同构）
 */
export interface LhBreadcrumbProps {
  /** 子节点（必须直接是 LhBreadcrumbItem，不可被自定义组件包裹） */
  children?: ReactNode
  /** 分隔符字符 */
  separator?: string
  /** 最大可见项数（首项 + 省略号 + 末尾若干项），超出折叠；0 或不传表示不折叠 */
  maxItems?: number
  /** sx 快速布局属性 */
  sx?: LhSxProps
}

/**
 * BreadcrumbItem Props
 *
 * `index` 由 LhBreadcrumb 通过 cloneElement 自动注入，业务侧无需传入；
 * 未包裹在 LhBreadcrumb 内时 index 为 undefined，按「独立单项」渲染。
 */
export interface LhBreadcrumbItemProps {
  /** 文案 */
  children?: ReactNode
  /** 跳转地址；存在且非末项时渲染为链接（原生 <a> 导航） */
  to?: string
  /** 保留 plus API 兼容：React 侧无全局路由，原生 <a> 跳转不受此开关影响 */
  replace?: boolean
  /** 由父组件注入的索引（DOM 序，0 起） */
  index?: number
}

/**
 * Breadcrumb 父子组件上下文
 */
export interface LhBreadcrumbContextValue {
  /** 项总数 */
  total: number
  /** 折叠时需要隐藏的项索引集合 */
  hiddenIndexes: number[]
  /** 省略号应插在该索引的项之前（-1 表示不显示） */
  ellipsisBeforeIndex: number
  /** 分隔符字符 */
  separator: string
  /** 展开全部（清除折叠） */
  expand: () => void
}
