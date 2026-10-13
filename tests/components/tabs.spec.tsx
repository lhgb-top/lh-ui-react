import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhTabs, LhTabPane } from '@/components/tabs'

describe('LhTabs', () => {
  function ThreePanes() {
    return (
      <LhTabs>
        <LhTabPane name="ink" label="水墨">
          水墨内容
        </LhTabPane>
        <LhTabPane name="danqing" label="丹青">
          丹青内容
        </LhTabPane>
        <LhTabPane name="blank" label="留白">
          留白内容
        </LhTabPane>
      </LhTabs>
    )
  }

  it('渲染页签头与内容区', () => {
    const { container } = render(<ThreePanes />)
    expect(container.querySelector('.lh-tabs')).not.toBeNull()
    expect(container.querySelector('.lh-tabs__header[role="tablist"]')).not.toBeNull()
    expect(container.querySelectorAll('.lh-tabs__tab')).toHaveLength(3)
    expect(container.querySelector('.lh-tabs__content')).not.toBeNull()
  })

  it('默认激活首个页签，仅激活面板可见', () => {
    const { container } = render(<ThreePanes />)
    const panes = container.querySelectorAll('.lh-tab-pane')
    // 激活面板无 hidden，其余面板被隐藏（保留 DOM 以保活内部状态）
    expect(panes[0]?.getAttribute('hidden')).toBeNull()
    expect(panes[1]?.getAttribute('hidden')).not.toBeNull()
    expect(panes[2]?.getAttribute('hidden')).not.toBeNull()
    expect(panes[0]?.textContent).toContain('水墨内容')
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('水墨')
  })

  it('点击页签切换激活态与面板', () => {
    const { container } = render(<ThreePanes />)
    fireEvent.click(screen.getByText('丹青'))
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('丹青')
    const panes = container.querySelectorAll('.lh-tab-pane')
    expect(panes[1]?.getAttribute('hidden')).toBeNull()
    expect(panes[0]?.getAttribute('hidden')).not.toBeNull()
  })

  it('受控模式：value 决定激活页签', () => {
    const onChange = vi.fn()
    const { container, rerender } = render(
      <LhTabs value="blank" onChange={onChange}>
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('留白')
    fireEvent.click(screen.getByText('水墨'))
    expect(onChange).toHaveBeenCalledWith('ink')
    // 受控：外部未更新 value，仍停在留白
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('留白')
    rerender(
      <LhTabs value="ink" onChange={onChange}>
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('水墨')
  })

  it('defaultValue 非受控默认激活', () => {
    const { container } = render(
      <LhTabs defaultValue="danqing">
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="danqing" label="丹青" />
      </LhTabs>,
    )
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('丹青')
  })

  it('type / tabPosition 输出修饰类', () => {
    const { container, rerender } = render(
      <LhTabs type="card" tabPosition="bottom">
        <LhTabPane name="a" label="A" />
      </LhTabs>,
    )
    expect(container.querySelector('.lh-tabs')?.className).toContain('lh-tabs--card')
    expect(container.querySelector('.lh-tabs')?.className).toContain('lh-tabs--bottom')
    rerender(
      <LhTabs>
        <LhTabPane name="a" label="A" />
      </LhTabs>,
    )
    expect(container.querySelector('.lh-tabs')?.className).toContain('lh-tabs--line')
    expect(container.querySelector('.lh-tabs')?.className).toContain('lh-tabs--top')
  })

  it('disabled 页签不可激活', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhTabs onChange={onChange}>
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="danqing" label="丹青" disabled />
      </LhTabs>,
    )
    const tabs = container.querySelectorAll('.lh-tabs__tab')
    expect(tabs[1]?.className).toContain('lh-tabs__tab--disabled')
    fireEvent.click(tabs[1]!)
    expect(onChange).not.toHaveBeenCalled()
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('水墨')
  })

  it('aria 关联：tab 的 aria-controls 与 panel 的 id / aria-labelledby 对上', () => {
    const { container } = render(
      <LhTabs>
        <LhTabPane name="ink" label="水墨" />
      </LhTabs>,
    )
    const tab = container.querySelector('.lh-tabs__tab')!
    const pane = container.querySelector('.lh-tab-pane')!
    const controls = tab.getAttribute('aria-controls')
    expect(controls).toBe(pane.getAttribute('id'))
    expect(pane.getAttribute('aria-labelledby')).toBe(tab.getAttribute('id'))
    expect(tab.getAttribute('aria-selected')).toBe('true')
    expect(tab.getAttribute('role')).toBe('tab')
    expect(pane.getAttribute('role')).toBe('tabpanel')
  })

  it('roving tabindex：仅激活页签 tabindex=0', () => {
    const { container } = render(<ThreePanes />)
    const tabs = container.querySelectorAll('.lh-tabs__tab')
    expect(tabs[0]).toHaveAttribute('tabindex', '0')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')
    fireEvent.click(screen.getByText('丹青'))
    expect(container.querySelectorAll('.lh-tabs__tab')[0]).toHaveAttribute('tabindex', '-1')
    expect(container.querySelectorAll('.lh-tabs__tab')[1]).toHaveAttribute('tabindex', '0')
  })

  it('方向键移动并激活下一个可用页签', () => {
    const { container } = render(
      <LhTabs>
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="danqing" label="丹青" disabled />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    const tabs = container.querySelectorAll('.lh-tabs__tab')
    // 事件目标应是页签按钮本身（真实使用时由按钮聚焦后冒泡到 header）
    fireEvent.keyDown(tabs[0]!, { key: 'ArrowRight' })
    // 从激活的水墨右移，跳过禁用的丹青，落到留白
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('留白')
    expect(document.activeElement).toBe(tabs[2])
  })

  it('Home / End 跳首尾', () => {
    const { container } = render(
      <LhTabs defaultValue="blank">
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    fireEvent.keyDown(container.querySelectorAll('.lh-tabs__tab')[1]!, { key: 'Home' })
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('水墨')
    fireEvent.keyDown(container.querySelectorAll('.lh-tabs__tab')[0]!, { key: 'End' })
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('留白')
  })

  it('closable 渲染关闭按钮并触发 onRemove', () => {
    const onRemove = vi.fn()
    const { container } = render(
      <LhTabs closable onRemove={onRemove}>
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    const closeBtns = container.querySelectorAll('.lh-tabs__tab-close')
    expect(closeBtns).toHaveLength(2)
    fireEvent.click(closeBtns[1]!)
    expect(onRemove).toHaveBeenCalledWith('blank')
  })

  it('关闭激活页签时联动切换到相邻可用页签', () => {
    const onRemove = vi.fn()
    const { container } = render(
      <LhTabs closable onRemove={onRemove} defaultValue="blank">
        <LhTabPane name="ink" label="水墨" />
        <LhTabPane name="blank" label="留白" />
      </LhTabs>,
    )
    fireEvent.click(container.querySelectorAll('.lh-tabs__tab-close')[1]!)
    expect(onRemove).toHaveBeenCalledWith('blank')
    expect(container.querySelector('.lh-tabs__tab--active')).toHaveTextContent('水墨')
  })

  it('Delete 键触发关闭', () => {
    const onRemove = vi.fn()
    const { container } = render(
      <LhTabs closable onRemove={onRemove}>
        <LhTabPane name="ink" label="水墨" />
      </LhTabs>,
    )
    fireEvent.keyDown(container.querySelector('.lh-tabs__tab')!, { key: 'Delete' })
    expect(onRemove).toHaveBeenCalledWith('ink')
  })

  it('addable 渲染新增按钮并触发 onAdd', () => {
    const onAdd = vi.fn()
    const { container } = render(
      <LhTabs addable onAdd={onAdd}>
        <LhTabPane name="ink" label="水墨" />
      </LhTabs>,
    )
    const addBtn = container.querySelector('.lh-tabs__add')!
    expect(addBtn).toHaveAttribute('aria-label', '新增标签页')
    fireEvent.click(addBtn)
    expect(onAdd).toHaveBeenCalledOnce()
  })

  it('可用 .map 渲染页签列表', () => {
    const { container } = render(
      <LhTabs>
        {['水墨', '丹青', '留白'].map((label) => (
          <LhTabPane key={label} name={label} label={label} />
        ))}
      </LhTabs>,
    )
    expect(container.querySelectorAll('.lh-tabs__tab')).toHaveLength(3)
  })

  it('可用 Fragment 包裹页签列表（下钻收集）', () => {
    const { container } = render(
      <LhTabs>
        <>
          <LhTabPane name="ink" label="水墨" />
          <LhTabPane name="blank" label="留白" />
        </>
      </LhTabs>,
    )
    expect(container.querySelectorAll('.lh-tabs__tab')).toHaveLength(2)
  })
})
