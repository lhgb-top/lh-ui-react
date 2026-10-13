/**
 * Tabs 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 tabs/index.vue 一一对应：
 * div.lh-tabs > header(role=tablist) > tab 按钮(*) + add 按钮 / content > slot
 * roving tabindex：仅激活页签 tabindex=0，其余 -1。
 */
import { forwardRef } from 'react'
import { useLhTabs } from './use-tabs'
import { LhTabsContext } from './context'
import type { LhTabsProps } from './types'

export const LhTabs = forwardRef<HTMLDivElement, LhTabsProps>((props, ref) => {
  const {
    records,
    activeName,
    idPrefix,
    setActive,
    removePane,
    contextValue,
    tabsClasses,
    sxStyle,
    closable,
    addable,
    addLabel,
    onAdd,
    onKeydown,
    setTabRef,
    tablistAria,
    getTabAria,
  } = useLhTabs(props)

  const { children } = props

  return (
    <div ref={ref} className={tabsClasses.join(' ')} style={sxStyle}>
      <div className="lh-tabs__header" onKeyDown={onKeydown} {...tablistAria}>
        {records.map((pane) => {
          const active = pane.name === activeName
          const panelId = `${idPrefix}-panel-${pane.name}`
          return (
            <button
              key={pane.name}
              type="button"
              ref={(el) => setTabRef(pane.name, el)}
              className={[
                'lh-tabs__tab',
                active ? 'lh-tabs__tab--active' : '',
                pane.disabled ? 'lh-tabs__tab--disabled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              disabled={pane.disabled}
              data-name={pane.name}
              onClick={() => setActive(pane.name)}
              {...getTabAria({
                active,
                disabled: pane.disabled,
                panelId,
                id: `${idPrefix}-tab-${pane.name}`,
              })}
            >
              <span className="lh-tabs__tab-label">{pane.label}</span>
              {closable && !pane.disabled && (
                <span
                  className="lh-tabs__tab-close"
                  aria-hidden="true"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePane(pane.name)
                  }}
                >
                  ✕
                </span>
              )}
            </button>
          )
        })}
        {addable && (
          <button
            type="button"
            className="lh-tabs__add"
            aria-label={addLabel}
            onClick={() => onAdd?.()}
          >
            <span aria-hidden="true">+</span>
          </button>
        )}
      </div>
      <div className="lh-tabs__content">
        <LhTabsContext.Provider value={contextValue}>{children}</LhTabsContext.Provider>
      </div>
    </div>
  )
})

LhTabs.displayName = 'LhTabs'
