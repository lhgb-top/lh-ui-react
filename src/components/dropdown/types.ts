import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type {
  LhDropdownPlacement,
  LhDropdownTrigger,
} from '@lh-ui/share/core/dropdown'

export type { LhDropdownPlacement, LhDropdownTrigger }

/**
 * Dropdown Props（React 惯用命名：visible/onVisibleChange；对应 plus 的模型 + 事件）
 *
 * 结构与 popover 对称：children 为触发器，dropdown 为菜单内容
 * （对应 plus 的 `#dropdown` 插槽，React 侧改为同名 prop）。
 */
export interface LhDropdownProps {
  /** 触发器节点 */
  children?: ReactNode
  /** 菜单内容（LhDropdownItem 列表，对应 plus 的 #dropdown 插槽） */
  dropdown?: ReactNode
  /** 触发方式（默认 hover） */
  trigger?: LhDropdownTrigger
  /** 展示位置（溢出视口时自动翻转） */
  placement?: LhDropdownPlacement
  /** 是否禁用（禁用时所有触发都不响应） */
  disabled?: boolean
  /** 受控可见状态 */
  visible?: boolean
  /** 非受控默认可见状态 */
  defaultVisible?: boolean
  /** 可见状态变化 */
  onVisibleChange?: (visible: boolean) => void
  /** 点击菜单项后是否自动关闭（默认 true） */
  hideOnClick?: boolean
  /** 菜单最大高度（超出滚动） */
  maxHeight?: string | number
  /** 菜单自定义类名 */
  popperClass?: string
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性（作用于触发器根元素） */
  sx?: LhSxProps
  /** 菜单项被点击时触发（命令式编程，对应 plus 的 command 事件） */
  onCommand?: (command: string | number) => void
  /** 点击菜单外部时触发（默认走内部关闭逻辑，透传给外部感知） */
  onClickOutside?: () => void
}

/** LhDropdown 通过 ref 暴露的命令式 API */
export interface LhDropdownInstance {
  show: () => void
  hide: () => void
  toggle: () => void
  isVisible: boolean
}

/** LhDropdownItem Props */
export interface LhDropdownItemProps {
  /** 子节点 */
  children?: ReactNode
  /** 命令标识，随 onCommand 抛出（菜单项编程式用法） */
  command?: string | number
  /** 是否禁用（禁用项不响应点击且不参与键盘导航） */
  disabled?: boolean
  /** 是否显示分隔线 */
  divided?: boolean
  /** 点击回调（与 onCommand 二选一，两者可共存） */
  onClick?: () => void
}

/**
 * LhDropdown 父子上下文：菜单项向父级注册自身 DOM（供键盘导航与 roving tabindex），
 * 并把点击冒泡成 onCommand / 自动关闭。
 *
 * activeEl 为当前 roving tabindex 锚点（tabIndex=0，其余为 -1）；
 * 打开时默认锚定首个启用项（APG menu pattern）。
 */
export interface LhDropdownContextValue {
  /** 注册菜单项 DOM（effect 内调用，卸载时 unregisterItem） */
  registerItem: (el: HTMLLIElement, disabled: boolean) => void
  /** 注销菜单项 DOM */
  unregisterItem: (el: HTMLLIElement) => void
  /** 点击菜单项：先抛 onClick / onCommand，再按 hideOnClick 决定是否关闭 */
  onItemClick: (command?: string | number, onClick?: () => void) => void
  /** roving tabindex 锚点元素 */
  activeEl: HTMLLIElement | null
  /** 更新锚点（键盘导航移动时调用） */
  setActiveEl: (el: HTMLLIElement | null) => void
}
