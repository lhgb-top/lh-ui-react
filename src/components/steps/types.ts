import type { ReactNode } from 'react'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import type { LhIconName } from '@lh-ui/share/core/icon'
import type { LhStepStatus, LhStepsDirection } from '@lh-ui/share/core/steps'

/**
 * Steps Props（与 lh-ui-plus 的 LhStepsProps 同名同义）
 *
 * 受控 / 非受控双模式：传 current 即受控，传 defaultCurrent 走非受控内部态。
 */
export interface LhStepsProps {
  /** 子节点（必须直接是 LhStep，不可被自定义组件包裹） */
  children?: ReactNode
  /** 当前步骤索引（0 起） */
  current?: number
  /** 当前步骤默认值（非受控） */
  defaultCurrent?: number
  /** 方向 */
  direction?: LhStepsDirection
  /** 步骤是否可点击导航 */
  clickable?: boolean
  /** 整体覆盖所有步骤的状态（用于自定义展示） */
  status?: LhStepStatus
  /** 组件级主题变量（键自动加 --lh- 前缀，如 `steps-item-basis`） */
  themeVars?: Record<string, string>
  /** sx 快速布局属性 */
  sx?: LhSxProps
  /** 当前步骤变化时触发 */
  onChange?: (index: number) => void
}

/**
 * Step Props
 *
 * `index` 由 LhSteps 通过 cloneElement 自动注入，业务侧无需传入；
 * 未包裹在 LhSteps 内时按「独立单项」渲染。
 */
export interface LhStepProps {
  /** 步骤标题 */
  title?: ReactNode
  /** 步骤描述 */
  description?: ReactNode
  /** 自定义图标名称（未传时 finish/error 用勾叉，其余显示序号） */
  icon?: LhIconName
  /** 由父组件注入的索引（DOM 序，0 起） */
  index?: number
}

/**
 * Steps 父子组件上下文
 */
export interface LhStepsContextValue {
  /** 当前步骤索引 */
  current: number
  /** 是否可点击导航 */
  clickable: boolean
  /** 整体覆盖状态 */
  forcedStatus: LhStepStatus | undefined
  /** 横向折行时每行最后一项的索引（用于隐藏行末连接线；纵向为空数组） */
  lineLastIndices: number[]
  /** 点击导航到指定步骤 */
  select: (index: number) => void
}

export type { LhStepStatus, LhStepsDirection }
