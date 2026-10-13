import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhPopover } from '../../src/components/popover'

describe('LhPopover', () => {
  it('渲染触发器，默认隐藏浮层', () => {
    render(
      <LhPopover title="标题" content="内容">
        <button type="button">触发</button>
      </LhPopover>,
    )
    expect(screen.getByRole('button', { name: '触发' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('默认 click 触发，浮层为 role=dialog 且含 title / content / 箭头', async () => {
    render(
      <LhPopover title="标题" content="内容">
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    const popper = await screen.findByRole('dialog')
    expect(popper).toHaveClass('lh-popover__popper')
    expect(popper).toHaveTextContent('标题')
    expect(popper).toHaveTextContent('内容')
    expect(popper.querySelector('.lh-popover__arrow')).not.toBeNull()
  })

  it('标题存在时浮层 aria-labelledby 指向标题', async () => {
    render(
      <LhPopover title="标题" content="内容">
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    const popper = await screen.findByRole('dialog')
    const title = popper.querySelector('.lh-popover__title')
    expect(title).not.toBeNull()
    expect(popper.getAttribute('aria-labelledby')).toBe(title!.id)
  })

  it('hover 触发模式', async () => {
    render(
      <LhPopover title="标题" content="内容" trigger="hover">
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.mouseEnter(screen.getByRole('button', { name: '触发' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('disabled 时所有触发都不响应', () => {
    render(
      <LhPopover title="标题" content="内容" disabled>
        <button type="button">触发</button>
      </LhPopover>,
    )
    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.click(trigger)
    fireEvent.mouseEnter(trigger)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('受控模式：visible 驱动显隐并抛 onVisibleChange', async () => {
    const onVisibleChange = vi.fn()
    const { rerender } = render(
      <LhPopover title="标题" content="内容" visible={false} onVisibleChange={onVisibleChange}>
        <button type="button">触发</button>
      </LhPopover>,
    )
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    // 受控模式下内部状态不变，事件外抛由外部决定
    expect(onVisibleChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog')).toBeNull()
    rerender(
      <LhPopover title="标题" content="内容" visible onVisibleChange={onVisibleChange}>
        <button type="button">触发</button>
      </LhPopover>,
    )
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('Escape 关闭', async () => {
    render(
      <LhPopover title="标题" content="内容">
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    await screen.findByRole('dialog')
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('placement 体现在浮层类名（溢出翻转后同步）', async () => {
    render(
      <LhPopover title="标题" content="内容" placement="bottom">
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    const popper = await screen.findByRole('dialog')
    expect(popper.className).toContain('lh-popover__popper--bottom')
  })

  it('width 写入浮层内联样式', async () => {
    render(
      <LhPopover title="标题" content="内容" width={240}>
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    const popper = await screen.findByRole('dialog')
    expect(popper.style.width).toBe('240px')
  })

  it('主题变量写入浮层内联样式', async () => {
    render(
      <LhPopover title="标题" content="内容" themeVars={{ '--lh-popover-bg': '#fff' }}>
        <button type="button">触发</button>
      </LhPopover>,
    )
    fireEvent.click(screen.getByRole('button', { name: '触发' }))
    const popper = await screen.findByRole('dialog')
    expect(popper.style.getPropertyValue('--lh-popover-bg')).toBe('#fff')
  })
})
