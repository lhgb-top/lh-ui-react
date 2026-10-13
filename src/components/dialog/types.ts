import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { ReactNode } from 'react'

export type LhDialogPosition = 'top' | 'center' | 'bottom'

/**
 * Dialog Props（React 惯用命名：open/onClose；对应 plus 的 modelValue/update:modelValue）
 *
 * 受控语义：open 由外部持有，任何关闭路径（遮罩 / Esc / 关闭按钮）都只调 onClose，
 * 由父级决定是否真正关闭；beforeClose 在 onClose 之前拦截。
 */
export interface LhDialogProps {
  /** 子节点 */
  children?: ReactNode
  /** 是否显示 */
  open?: boolean
  /** 标题（无 header 时也作为 aria-label 兜底） */
  title?: string
  /** 宽度 */
  width?: string | number
  /** 是否全屏 */
  fullscreen?: boolean
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  /** 按 ESC 是否关闭 */
  closeOnPressEscape?: boolean
  /** 是否可拖拽（拖拽手柄为头部） */
  draggable?: boolean
  /** 是否居中显示（兼容旧版，建议使用 position） */
  center?: boolean
  /** 弹窗位置 */
  position?: LhDialogPosition
  /** 是否锁定 body 滚动 */
  lockScroll?: boolean
  /** 关闭前回调，调 done 才继续关闭 */
  beforeClose?: (done: () => void) => void
  /** 顶部距离（如 15vh） */
  top?: string
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
  /** sx 快速布局属性 */
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

/** LhDialog 通过 ref 暴露的命令式 API */
export interface LhDialogInstance {
  close: () => void
  isOpen: boolean
}
