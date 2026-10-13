/**
 * Tabs 胶水层：share/core/tabs 纯函数组合
 *
 * 对应 plus 的 packages/components/tabs/src/index.vue 的 <script setup> 部分。
 *
 * 与 plus 的差异（React 特化）：
 * - plus 用 token 注册 +插槽 vnode 收集两条路；React 侧统一用 Children.toArray
 *   递归下钻 Fragment 同步收集记录，首帧即正确（无需 effect 注册的二次渲染）。
 * - 键盘导航直接用 shared/keyboard 的 getNextListIndex（core 的 getNextActiveName
 *   已标 @deprecated）。
 */
import { useCallback, useId, useMemo, useRef } from 'react'
import { Children, Fragment, isValidElement } from 'react'
import type { ReactElement, ReactNode } from 'react'
import type { KeyboardEvent } from 'react'
import {
  getTabsClassNames,
  getNameAfterRemove,
  resolveActiveName,
  getTablistAria,
  getTabAria,
  getTabpanelAria,
} from '@lh-ui/share/core/tabs'
import type { LhTabRecord } from '@lh-ui/share/core/tabs'
import { getNextListIndex, LH_KEYS, sxToStyle } from '@lh-ui/share/core/shared'
import type { LhListDirection } from '@lh-ui/share/core/shared'
import { useControlled } from '../../hooks'
import { useLhLocale } from '../../locale'
import { LhTabPane } from './TabPane'
import type { LhTabsContextValue, LhTabsProps } from './types'

export function useLhTabs(props: LhTabsProps) {
  const {
    type = 'line',
    closable = false,
    addable = false,
    tabPosition = 'top',
    onChange,
    onRemove,
    onAdd,
  } = props
  const { t } = useLhLocale()

  const [innerValue, setInnerValue] = useControlled<string | null>({
    value: props.value,
    defaultValue: props.defaultValue ?? null,
    // resolveActiveName 保证激活值恒为有效页签名（或 null），此处只需桥接回调
    onChange: onChange ? (name) => onChange(name as string) : undefined,
  })

  /** 从 children 同步收集页签记录（下钻 Fragment，对齐 plus 的 collectPaneVnodes） */
  const records = useMemo<LhTabRecord[]>(
    () =>
      collectPaneElements(props.children).map((element) => ({
        name: String(element.props.name ?? ''),
        label: String(element.props.label ?? ''),
        disabled: element.props.disabled === true,
      })),
    [props.children],
  )

  const activeName = useMemo(() => resolveActiveName(records, innerValue), [records, innerValue])

  const idPrefix = useId()

  const setActive = useCallback(
    (name: string) => {
      const pane = records.find((record) => record.name === name)
      if (!pane || pane.disabled) return
      setInnerValue(name)
    },
    [records, setInnerValue],
  )

  const removePane = useCallback(
    (name: string) => {
      if (!closable) return
      onRemove?.(name)
      // 被关闭的是激活页签时，联动切换到相邻可用页签
      if (name === activeName) {
        const next = getNameAfterRemove(records, name, activeName ?? '')
        if (next) setActive(next)
      }
    },
    [closable, onRemove, activeName, records, setActive],
  )

  const contextValue = useMemo<LhTabsContextValue>(
    () => ({ activeName, idPrefix }),
    [activeName, idPrefix],
  )

  const tabsClasses = useMemo(
    () => getTabsClassNames({ type, position: tabPosition }),
    [type, tabPosition],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  const addLabel = t('tabs.add', '新增标签页')

  // —— roving tabindex 键盘导航（APG tabs pattern：方向键移动并激活）——
  const tabRefs = useRef(new Map<string, HTMLElement>())

  const setTabRef = useCallback((name: string, el: HTMLElement | null) => {
    if (el) tabRefs.current.set(name, el)
    else tabRefs.current.delete(name)
  }, [])

  const onKeydown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentName = (event.target as HTMLElement | null)?.dataset?.name
      if (!currentName) return

      if (event.key === LH_KEYS.Delete || event.key === LH_KEYS.Backspace) {
        if (closable) removePane(currentName)
        return
      }

      let direction: LhListDirection | null = null
      if (event.key === LH_KEYS.ArrowRight || event.key === LH_KEYS.ArrowDown) direction = 1
      else if (event.key === LH_KEYS.ArrowLeft || event.key === LH_KEYS.ArrowUp) direction = -1
      else if (event.key === LH_KEYS.Home) direction = 'first'
      else if (event.key === LH_KEYS.End) direction = 'last'
      if (direction === null) return

      event.preventDefault()
      const currentIndex = records.findIndex((record) => record.name === currentName)
      const nextIndex = getNextListIndex(records, currentIndex, direction)
      if (nextIndex < 0) return
      const next = records[nextIndex].name
      setActive(next)
      // 焦点搬移在事件处理器内执行，不进 render 主体
      tabRefs.current.get(next)?.focus()
    },
    [records, closable, removePane, setActive],
  )

  return {
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
    tablistAria: getTablistAria(),
    getTabAria,
    getTabpanelAria,
  }
}

/**
 * 从 children 收集 TabPane 元素（递归下钻 Fragment 与数组，与 plus 的
 * collectPaneVnodes 等价）
 */
function collectPaneElements(children: ReactNode): ReactElement<LhTabPaneElementProps>[] {
  const out: ReactElement<LhTabPaneElementProps>[] = []
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.type === LhTabPane) {
      out.push(child as ReactElement<LhTabPaneElementProps>)
    } else if (child.type === Fragment) {
      out.push(...collectPaneElements((child as ReactElement<{ children?: ReactNode }>).props.children))
    }
  })
  return out
}

type LhTabPaneElementProps = { name?: string; label?: ReactNode; disabled?: boolean }
