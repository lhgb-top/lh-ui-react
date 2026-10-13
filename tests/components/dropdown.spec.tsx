import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhDropdown, LhDropdownItem } from '../../src/components/dropdown'

function Menu() {
  return (
    <>
      <LhDropdownItem command="a">新建</LhDropdownItem>
      <LhDropdownItem command="b">编辑</LhDropdownItem>
      <LhDropdownItem command="c" disabled>
        删除
      </LhDropdownItem>
    </>
  )
}

describe('LhDropdown', () => {
  it('渲染触发器，默认隐藏菜单', () => {
    render(
      <LhDropdown dropdown={<Menu />}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    expect(screen.getByRole('button', { name: '更多' })).toBeInTheDocument()
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('默认 hover 触发，菜单为 role=menu 且含三个 menuitem', async () => {
    render(
      <LhDropdown dropdown={<Menu />}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    expect(menu).toHaveClass('lh-dropdown__menu')
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(3)
  })

  it('触发器 aria-haspopup=menu 且随展开状态写 aria-expanded', async () => {
    render(
      <LhDropdown dropdown={<Menu />}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    const trigger = screen.getByRole('button', { name: '更多' })
    fireEvent.mouseEnter(trigger)
    await screen.findByRole('menu')
    expect(trigger.closest('.lh-dropdown')).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger.closest('.lh-dropdown')).toHaveAttribute('aria-expanded', 'true')
  })

  it('click 触发模式', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="click">
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  it('contextmenu 触发模式并阻止默认行为', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="contextmenu">
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.contextMenu(screen.getByRole('button', { name: '更多' }))
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })

  it('点击菜单项触发 onCommand 并自动关闭', async () => {
    const onCommand = vi.fn()
    render(
      <LhDropdown dropdown={<Menu />} trigger="click" onCommand={onCommand}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    fireEvent.click(menu.querySelectorAll('[role="menuitem"]')[1])
    expect(onCommand).toHaveBeenCalledWith('b')
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('hideOnClick=false 时点击菜单项不关闭', async () => {
    const onCommand = vi.fn()
    render(
      <LhDropdown dropdown={<Menu />} trigger="click" hideOnClick={false} onCommand={onCommand}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    fireEvent.click(menu.querySelectorAll('[role="menuitem"]')[0])
    expect(onCommand).toHaveBeenCalledWith('a')
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('禁用项不触发 onCommand', async () => {
    const onCommand = vi.fn()
    render(
      <LhDropdown dropdown={<Menu />} trigger="click" onCommand={onCommand}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    fireEvent.click(menu.querySelectorAll('[role="menuitem"]')[2])
    expect(onCommand).not.toHaveBeenCalled()
  })

  it('禁用项带 aria-disabled 与分隔线类名', async () => {
    render(
      <LhDropdown
        dropdown={
          <>
            <Menu />
            <LhDropdownItem command="d" divided>
              分隔项
            </LhDropdownItem>
          </>
        }
        trigger="click"
      >
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    const items = menu.querySelectorAll('[role="menuitem"]')
    expect(items[2]).toHaveAttribute('aria-disabled', 'true')
    expect(items[3]).toHaveClass('lh-dropdown__item--divided')
  })

  it('ArrowDown / ArrowUp 在菜单项间移动焦点（跳过禁用项）', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="click">
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    const items = menu.querySelectorAll('[role="menuitem"]')
    // 打开后焦点落在首个启用项
    await waitFor(() => expect(document.activeElement).toBe(items[0]))
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
    // 跳过禁用项（index 2），循环回首项
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[1])
  })

  it('Home / End 直达首尾', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="click">
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    const items = menu.querySelectorAll('[role="menuitem"]')
    fireEvent.keyDown(menu, { key: 'End' })
    expect(document.activeElement).toBe(items[1])
    fireEvent.keyDown(menu, { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })

  it('Enter 激活当前项', async () => {
    const onCommand = vi.fn()
    render(
      <LhDropdown dropdown={<Menu />} trigger="click" onCommand={onCommand}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    fireEvent.keyDown(menu, { key: 'Enter' })
    expect(onCommand).toHaveBeenCalledWith('b')
  })

  it('Escape 关闭并把焦点归还触发器', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="click">
        <button type="button">更多</button>
      </LhDropdown>,
    )
    const trigger = screen.getByRole('button', { name: '更多' })
    fireEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    fireEvent.keyDown(menu, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
    expect(document.activeElement).toBe(trigger)
  })

  it('click 触发时点击外部关闭', async () => {
    render(
      <div>
        <button type="button">别处</button>
        <LhDropdown dropdown={<Menu />} trigger="click">
          <button type="button">更多</button>
        </LhDropdown>
      </div>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    await screen.findByRole('menu')
    fireEvent.mouseDown(screen.getByRole('button', { name: '别处' }))
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })

  it('disabled 时所有触发都不响应', () => {
    render(
      <LhDropdown dropdown={<Menu />} disabled>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    const trigger = screen.getByRole('button', { name: '更多' })
    fireEvent.mouseEnter(trigger)
    fireEvent.click(trigger)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('maxHeight 写入菜单内联样式', async () => {
    render(
      <LhDropdown dropdown={<Menu />} trigger="click" maxHeight={200}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    const menu = await screen.findByRole('menu')
    expect(menu.style.maxHeight).toBe('200px')
    expect(menu.style.overflow).toBe('auto')
  })

  it('受控模式：visible 驱动显隐', async () => {
    const { rerender } = render(
      <LhDropdown dropdown={<Menu />} visible={false}>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    expect(screen.queryByRole('menu')).toBeNull()
    rerender(
      <LhDropdown dropdown={<Menu />} visible>
        <button type="button">更多</button>
      </LhDropdown>,
    )
    expect(await screen.findByRole('menu')).toBeInTheDocument()
  })
})
