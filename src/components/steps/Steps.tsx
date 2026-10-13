/**
 * Steps 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 steps/index.vue 一一对应：ol.lh-steps > li.lh-steps__item...
 * 横向定宽折行时，用 layout effect + ResizeObserver 测量每行末项索引，
 * 交 core 的 getStepsLineLastIndices 计算后下发给各 Step 隐藏行末连接线。
 */
import { forwardRef, useCallback, useRef } from 'react'
import { cloneElement } from 'react'
import type { MutableRefObject } from 'react'
import { getStepsLineLastIndices } from '@lh-ui/share/core/steps'
import { useIsomorphicLayoutEffect } from '../../hooks'
import { useLhSteps } from './use-steps'
import { LhStepsContext } from './context'
import type { LhStepsProps } from './types'

export const LhSteps = forwardRef<HTMLOListElement, LhStepsProps>((props, ref) => {
  const { items, contextValue, stepsClasses, sxStyle, direction, setLineLastIndices } =
    useLhSteps(props)

  const rootRef = useRef<HTMLOListElement | null>(null)
  const mergeRef = (node: HTMLOListElement | null) => {
    rootRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) (ref as MutableRefObject<HTMLOListElement | null>).current = node
  }

  const measureLineLast = useCallback(() => {
    const root = rootRef.current
    if (!root || direction !== 'horizontal') {
      setLineLastIndices([])
      return
    }
    // DOM 顺序即 items 顺序，与各 Step 注入的 index 一一对应
    const offsetTops = Array.from(root.children).map((el) => (el as HTMLElement).offsetTop)
    setLineLastIndices(getStepsLineLastIndices(offsetTops))
  }, [direction, setLineLastIndices])

  // 首屏测量用 layout effect，避免折行连接线闪烁（jsdom 无 ResizeObserver，守卫掉）
  useIsomorphicLayoutEffect(() => {
    measureLineLast()
    if (typeof ResizeObserver === 'undefined' || !rootRef.current) return
    const observer = new ResizeObserver(() => measureLineLast())
    observer.observe(rootRef.current)
    return () => observer.disconnect()
  }, [measureLineLast, items.length])

  return (
    <ol ref={mergeRef} className={stepsClasses.join(' ')} style={sxStyle} role="list">
      <LhStepsContext.Provider value={contextValue}>
        {items.map((item, index) => cloneElement(item, { key: item.key ?? index, index }))}
      </LhStepsContext.Provider>
    </ol>
  )
})

LhSteps.displayName = 'LhSteps'
