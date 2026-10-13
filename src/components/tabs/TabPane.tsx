/**
 * TabPane 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 tabs/tab-pane.vue 一一对应：
 * 非激活页签用 hidden 属性移出视图（保留 DOM 以保活内部状态），
 * role="tabpanel" 与对应 tab 按钮 双向 aria 关联。
 */
import { useContext } from 'react'
import { getTabpanelAria } from '@lh-ui/share/core/tabs'
import { LhTabsContext } from './context'
import type { LhTabPaneProps } from './types'

export function LhTabPane(props: LhTabPaneProps) {
  const { name, children } = props
  const ctx = useContext(LhTabsContext)

  const isActive = ctx ? ctx.activeName === name : false
  const idPrefix = ctx ? ctx.idPrefix : 'lh-tabs'
  const tabId = `${idPrefix}-tab-${name}`

  return (
    <div
      className="lh-tab-pane"
      tabIndex={0}
      hidden={!isActive}
      {...(ctx
        ? { id: `${idPrefix}-panel-${name}`, ...getTabpanelAria({ tabId }) }
        : {})}
    >
      {children}
    </div>
  )
}

LhTabPane.displayName = 'LhTabPane'
