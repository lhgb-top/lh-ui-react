import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhDrawerDirection } from '@lh-ui/share/core/drawer'

/**
 * Drawer Props（React 惯用命名：open/onClose；对应 plus 的 modelValue/update:modelValue）
 *
 * 受控语义与 dialog 一致：open 由外部持有，任何关闭路径（遮罩 / Esc / 关闭按钮）
 * 都只调 onClose；beforeClose 在 onClose 之前拦截。
 *
 * 与 plus 的差异：
 * - `maskClosable` 默认 false（core 的 canDrawerClose 默认拒绝遮罩点击），
 *   plus 的 closeOnClickModal 默认 true，迁移时需显式声明；
 * - 无 plus 的 `modal` 开关（遮罩始终渲染，用 maskClosable 控制是否可点穿）。
 */
export interface LhDrawerProps {
  /** 子节点 */
  children?: ReactNode
  /** 是否显示 */
  open?: boolean
  /** 标题（无 header 时也作为 aria-label 兜底） */
  title?: string
  /** 抽屉方向 */
  direction?: LhDrawerDirection
  /** 面板尺寸：左右方向作用于 width，上下方向作用于 height（数字 → px，字符串支持百分比） */
  size?: string | number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 点击遮罩是否关闭（默认 false，避免误触） */
  maskClosable?: boolean
  /** 按 ESC 是否关闭（默认 true） */
  closeOnEsc?: boolean
  /** 是否锁定 body 滚动（锁定时同时圈住焦点） */
  lockScroll?: boolean
  /** 关闭前回调，调 done 才继续关闭 */
  beforeClose?: (done: () => void) => void
  /** z-index（不传走全局递增体系） */
  zIndex?: number
  /** 头部内容（不传时用 title 渲染默认头部） */
  header?: ReactNode
  /** 底部内容（按钮区） */
  footer?: ReactNode
  /** 组件级主题变量，覆盖 ConfigProvider 配置 */
  themeVars?: Record<string, string>
  /** 组件级背景花纹，覆盖 ConfigProvider 配置 */
  bgPattern?: string
  /** sx 快速布局属性（作用于面板） */
  sx?: LhSxProps
  /** 关闭请求触发（遮罩 / Esc / 关闭按钮；经 beforeClose 拦截后调用） */
  onClose?: () => void
  /** 打开时触发（DOM 挂载后、进入动画前） */
  onOpen?: () => void
  /** 打开动画结束后触发 */
  onOpened?: () => void
  /** 关闭请求被接受、开始离开动画时触发 */
  onCloseStart?: () => void
  /** 关闭动画结束、DOM 卸载后触发 */
  onClosed?: () => void
}

/** LhDrawer 通过 ref 暴露的命令式 API */
export interface LhDrawerInstance {
  close: () => void
  isOpen: boolean
}
