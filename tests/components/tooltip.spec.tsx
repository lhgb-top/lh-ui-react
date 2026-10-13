import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhTooltip } from '../../src/components/tooltip'

describe('LhTooltip', () => {
  it('渲染触发器与提示内容（默认隐藏）', () => {
    render(
      <LhTooltip content="提示文案">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    expect(screen.getByRole('button', { name: '触发' })).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('hover 触发后渲染 role=tooltip 与内容', async () => {
    render(
      <LhTooltip content="提示文案">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发' }))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveClass('lh-tooltip__popper')
    expect(tooltip).toHaveTextContent('提示文案')
    expect(tooltip.querySelector('.lh-tooltip__arrow')).not.toBeNull()
  })

  it('触发器通过 aria-describedby 关联浮层', async () => {
    render(
      <LhTooltip content="提示文案">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.mouseEnter(trigger)
    const tooltip = await screen.findByRole('tooltip')
    // aria-describedby 挂在触发器根（.lh-tooltip 包裹元素），与 plus 同构
    expect(trigger.closest('.lh-tooltip')).toHaveAttribute('aria-describedby', tooltip.id)
  })

  it('移出后隐藏（默认无延迟）', async () => {
    render(
      <LhTooltip content="提示文案">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.mouseEnter(trigger)
    await screen.findByRole('tooltip')
    fireEvent.mouseLeave(trigger)
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('click 触发模式', async () => {
    render(
      <LhTooltip content="提示文案" trigger="click">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.mouseEnter(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
    fireEvent.click(trigger)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })

  it('focus 触发模式', async () => {
    render(
      <LhTooltip content="提示文案" trigger="focus">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.focus(screen.getByRole('button', { name: '触发' }))
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })

  it('disabled 时所有触发都不响应', () => {
    render(
      <LhTooltip content="提示文案" disabled>
        <button type="button">触发</button>
      </LhTooltip>,
    )
    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.mouseEnter(trigger)
    fireEvent.click(trigger)
    fireEvent.focus(trigger)
    expect(screen.queryByRole('tooltip')).toBeNull()
  })

  it('受控模式：visible 驱动显隐', async () => {
    const onVisibleChange = vi.fn()
    const { rerender } = render(
      <LhTooltip content="提示文案" visible={false} onVisibleChange={onVisibleChange}>
        <button type="button">触发</button>
      </LhTooltip>,
    )
    expect(screen.queryByRole('tooltip')).toBeNull()
    rerender(
      <LhTooltip content="提示文案" visible onVisibleChange={onVisibleChange}>
        <button type="button">触发</button>
      </LhTooltip>,
    )
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
  })

  it('非受控触发时 onVisibleChange 传出最新状态', async () => {
    const onVisibleChange = vi.fn()
    render(
      <LhTooltip content="提示文案" trigger="click" onVisibleChange={onVisibleChange}>
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    expect(onVisibleChange).toHaveBeenCalledWith(true)
  })

  it('Escape 关闭', async () => {
    render(
      <LhTooltip content="提示文案" trigger="click">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    await screen.findByRole('tooltip')
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
  })

  it('effect / type 变体类名', async () => {
    render(
      <LhTooltip content="提示" type="success" effect="light">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发' }))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.className).toContain('lh-tooltip__popper--light')
    expect(tooltip.className).toContain('lh-tooltip__popper--success')
  })

  it('bgColor 写入 CSS 变量', async () => {
    render(
      <LhTooltip content="提示" bgColor="#f00">
        <button type="button">触发</button>
      </LhTooltip>,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发' }))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip.style.getPropertyValue('--lh-tooltip-bg')).toBe('#f00')
    expect(tooltip.style.getPropertyValue('--lh-tooltip-arrow-color')).toBe('#f00')
  })
})
