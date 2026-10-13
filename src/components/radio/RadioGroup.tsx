import { useLhRadioGroup } from './use-radio'
import { LhRadioGroupContext } from './context'
import type { LhRadioGroupProps } from './types'

/**
 * Radio Group 组件（薄渲染层）
 *
 * 对应 plus 的 packages/components/radio/src/group.vue：
 * role=radiogroup 容器 + Context 下发选中值/禁用/尺寸/变更回调。
 * Context value 必须 useMemo（React 特化纪律）。
 */
export function LhRadioGroup(props: LhRadioGroupProps) {
  const { size = 'medium', children } = props
  const { contextValue } = useLhRadioGroup(props)

  return (
    <LhRadioGroupContext.Provider value={contextValue}>
      <div className={['lh-radio-group', `lh-radio-group--${size}`].join(' ')} role="radiogroup">
        {children}
      </div>
    </LhRadioGroupContext.Provider>
  )
}

LhRadioGroup.displayName = 'LhRadioGroup'
