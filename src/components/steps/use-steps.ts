/**
 * Steps 胶水层：share/core/steps 纯函数组合
 *
 * 对应 plus 的 packages/components/steps/src/index.vue 的 <script setup> 部分。
 * 状态计算全走 core 纯函数；横向折行检测在组件层用 layout effect + ResizeObserver。
 *
 * 与 plus 的差异（React 特化）：plus 的子项在 setup 阶段 push token 注册索引，
 * React render 主体禁写外部变量（AGENTS.md 红线 React-1/2），且 effect 注册会让
 * 首帧所有项的 ownIndex 都是 -1（core 的 getStepClassNames 注释亦警告此语义），
 * 故改为由父组件用 cloneElement 同步注入 index：render 纯、首帧即正确、SSR 正确。
 */
import { useCallback, useMemo, useState } from 'react'
import { Children, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { getStepsClassNames } from '@lh-ui/share/core/steps'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useControlled, useLhComponentTheme } from '../../hooks'
import { useLhConfigContext } from '../config-provider'
import { LhStep } from './Step'
import type { LhStepsContextValue, LhStepsProps } from './types'

export function useLhSteps(props: LhStepsProps) {
  const { direction = 'horizontal', clickable = false, status, onChange } = props
  const ctx = useLhConfigContext()

  const [current, setCurrent] = useControlled<number>({
    value: props.current,
    defaultValue: props.defaultCurrent ?? 0,
    onChange,
  })

  const items = useMemo(() => collectItems(props.children), [props.children])

  /** 横向折行时每行最后一项的索引；由组件层的测量 effect 写入 */
  const [lineLastIndices, setLineLastIndices] = useState<number[]>([])

  const select = useCallback(
    (index: number) => {
      if (!clickable || index === current) return
      setCurrent(index)
    },
    [clickable, current, setCurrent],
  )

  const contextValue = useMemo<LhStepsContextValue>(
    () => ({ current, clickable, forcedStatus: status, lineLastIndices, select }),
    [current, clickable, status, lineLastIndices, select],
  )

  const stepsClasses = useMemo(() => getStepsClassNames(direction), [direction])

  const { componentStyle } = useLhComponentTheme('steps', props, ctx)

  const sxStyle = useMemo(
    () => ({ ...componentStyle, ...sxToStyle(props.sx ?? {}) }),
    [componentStyle, props.sx],
  )

  return {
    items,
    contextValue,
    stepsClasses,
    sxStyle,
    direction,
    setLineLastIndices,
  }
}

/**
 * 收集直接子元素中的 Step（跳过文本节点、非法节点与其它组件）
 *
 * 与 plus 的 token 注册不同：React 侧要求 children 直接是 LhStep
 * （可用 `.map` 渲染，但不可被自定义组件包裹），文档注明该约束。
 */
function collectItems(children: ReactNode): ReactElement[] {
  return Children.toArray(children).filter(
    (child): child is ReactElement => isValidElement(child) && child.type === LhStep,
  )
}
