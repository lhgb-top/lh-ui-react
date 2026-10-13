import { useLhCheckboxGroup } from './use-checkbox'
import { LhCheckboxGroupContext } from './context'
import type { LhCheckboxGroupProps } from './types'

/**
 * Checkbox Group 组件（薄渲染层）
 *
 * 对应 plus 的 packages/components/checkbox/src/group.vue：
 * role=group 容器 + Context 下发选中值/禁用/尺寸/切换函数。
 * Context value 必须 useMemo（React 特化纪律）。
 */
export function LhCheckboxGroup(props: LhCheckboxGroupProps) {
  const { size = 'medium', children } = props
  const { contextValue } = useLhCheckboxGroup(props)

  return (
    <LhCheckboxGroupContext.Provider value={contextValue}>
      <div className={['lh-checkbox-group', `lh-checkbox-group--${size}`].join(' ')} role="group">
        {children}
      </div>
    </LhCheckboxGroupContext.Provider>
  )
}

LhCheckboxGroup.displayName = 'LhCheckboxGroup'
