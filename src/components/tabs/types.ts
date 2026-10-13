import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhTabsType, LhTabsPosition } from '@lh-ui/share/core/tabs'

/**
 * Tabs Props（与 lh-ui-plus 的 LhTabsProps 同名同义）
 *
 * 受控 / 非受控双模式：传 value 即受控，传 defaultValue 走非受控内部态。
 */
export interface LhTabsProps {
  /** 子节点（必须直接是 LhTabPane，可用 `.map` 渲染，不可被自定义组件包裹） */
  children?: ReactNode
  /** 当前激活页签的 name（受控） */
  value?: string
  /** 当前激活页签的 name（非受控默认值） */
  defaultValue?: string
  /** 外观 */
  type?: LhTabsType
  /** 页签是否可关闭 */
  closable?: boolean
  /** 是否显示新增按钮 */
  addable?: boolean
  /** 页签位置 */
  tabPosition?: LhTabsPosition
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 激活页签变化时触发 */
  onChange?: (name: string) => void
  /** 关闭页签时触发（页签的显隐由业务侧控制，组件本身不卸载子节点） */
  onRemove?: (name: string) => void
  /** 新增按钮点击时触发 */
  onAdd?: () => void
}

/**
 * TabPane Props
 *
 * `name` 为页签稳定键，建议显式传入（不传时按渲染顺序兜底）。
 */
export interface LhTabPaneProps {
  /** 页签唯一标识（作为稳定键，不建议动态修改） */
  name: string
  /** 页签标题 */
  label?: ReactNode
  /** 是否禁用 */
  disabled?: boolean
  /** 页签内容 */
  children?: ReactNode
}

/**
 * Tabs 父子组件上下文（TabPane 只需激活态与 id 前缀做 aria 关联）
 */
export interface LhTabsContextValue {
  /** 当前激活页签名 */
  activeName: string | null
  /** aria 关联 id 前缀 */
  idPrefix: string
}

export type { LhTabsType, LhTabsPosition }
