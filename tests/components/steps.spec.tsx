import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhSteps, LhStep } from '@/components/steps'

describe('LhSteps', () => {
  it('渲染 ol.lh-steps 与全部步骤项', () => {
    const { container } = render(
      <LhSteps current={1}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
        <LhStep title="题款" />
      </LhSteps>,
    )
    expect(container.querySelector('ol.lh-steps')).not.toBeNull()
    expect(container.querySelectorAll('.lh-steps__item')).toHaveLength(3)
  })

  it('direction 输出对应修饰类', () => {
    const { container, rerender } = render(
      <LhSteps>
        <LhStep title="一" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps')?.className).toContain('lh-steps--horizontal')
    rerender(
      <LhSteps direction="vertical">
        <LhStep title="一" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps')?.className).toContain('lh-steps--vertical')
  })

  it('current 之前为 finish、当前为 process、之后为 wait', () => {
    const { container } = render(
      <LhSteps current={1}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
        <LhStep title="题款" />
      </LhSteps>,
    )
    const items = container.querySelectorAll('.lh-steps__item')
    expect(items[0]?.className).toContain('lh-steps__item--finish')
    expect(items[1]?.className).toContain('lh-steps__item--process')
    expect(items[2]?.className).toContain('lh-steps__item--wait')
  })

  it('process 项输出 aria-current="step"', () => {
    render(
      <LhSteps current={0}>
        <LhStep title="起笔" />
      </LhSteps>,
    )
    expect(screen.getByText('起笔').closest('.lh-steps__item')).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('默认非受控 current=0，clickable 时点击切换', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhSteps defaultCurrent={1} clickable onChange={onChange}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
        <LhStep title="题款" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__item--process')).toHaveTextContent('晕染')
    // current=1 时第 0 项是 finish（可点击），第 2 项是 wait（span，不可点击）
    const buttons = container.querySelectorAll('.lh-steps__head')
    expect(buttons[0]?.tagName).toBe('BUTTON')
    expect(buttons[2]?.tagName).toBe('SPAN')
    fireEvent.click(buttons[0]!)
    expect(onChange).toHaveBeenCalledWith(0)
    expect(container.querySelector('.lh-steps__item--process')).toHaveTextContent('起笔')
  })

  it('受控 current 不被内部改写', () => {
    const onChange = vi.fn()
    const { container, rerender } = render(
      <LhSteps current={1} clickable onChange={onChange}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
      </LhSteps>,
    )
    fireEvent.click(container.querySelectorAll('.lh-steps__head')[0]!)
    expect(onChange).toHaveBeenCalledWith(0)
    // 受控：外部未更新 current，仍停留在 1
    expect(container.querySelector('.lh-steps__item--process')).toHaveTextContent('晕染')
    rerender(
      <LhSteps current={0} clickable onChange={onChange}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__item--process')).toHaveTextContent('起笔')
  })

  it('非 clickable 时 head 渲染为 span 且不响应点击', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhSteps onChange={onChange}>
        <LhStep title="起笔" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__head')?.tagName).toBe('SPAN')
    fireEvent.click(container.querySelector('.lh-steps__head')!)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('wait 项即使 clickable 也不可点击', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhSteps current={0} clickable onChange={onChange}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
      </LhSteps>,
    )
    const heads = container.querySelectorAll('.lh-steps__head')
    expect(heads[1]?.tagName).toBe('SPAN')
    expect(heads[0]?.tagName).toBe('BUTTON')
  })

  it('圆圈图标：finish 显示勾、process/wait 显示序号', () => {
    const { container } = render(
      <LhSteps current={1}>
        <LhStep title="起笔" />
        <LhStep title="晕染" />
        <LhStep title="题款" />
      </LhSteps>,
    )
    const icons = container.querySelectorAll('.lh-steps__icon')
    expect(icons[0]).toHaveTextContent('✓')
    expect(icons[1]).toHaveTextContent('2')
    expect(icons[2]).toHaveTextContent('3')
  })

  it('status="error" 整体覆盖：所有步骤显示叉', () => {
    const { container } = render(
      <LhSteps current={1} status="error">
        <LhStep title="起笔" />
        <LhStep title="晕染" />
        <LhStep title="题款" />
      </LhSteps>,
    )
    const icons = container.querySelectorAll('.lh-steps__icon')
    expect(icons[0]).toHaveTextContent('✕')
    expect(icons[1]).toHaveTextContent('✕')
    expect(icons[2]).toHaveTextContent('✕')
  })

  it('status 整体覆盖所有步骤的状态', () => {
    const { container } = render(
      <LhSteps current={1} status="error">
        <LhStep title="起笔" />
        <LhStep title="晕染" />
      </LhSteps>,
    )
    expect(container.querySelectorAll('.lh-steps__item--error')).toHaveLength(2)
  })

  it('icon prop 渲染自定义图标', () => {
    const { container } = render(
      <LhSteps current={0}>
        <LhStep title="起笔" icon="check" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__icon svg')).not.toBeNull()
  })

  it('description 渲染描述区', () => {
    const { container } = render(
      <LhSteps current={0}>
        <LhStep title="起笔" description="勾勒山石轮廓" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__description')).toHaveTextContent('勾勒山石轮廓')
  })

  it('可点击项的 head 带 aria-label（序号 1 起）', () => {
    const { container } = render(
      <LhSteps current={0} clickable>
        <LhStep title="起笔" />
      </LhSteps>,
    )
    expect(container.querySelector('.lh-steps__head')).toHaveAttribute('aria-label', '第 1 步')
  })

  it('未包裹在 LhSteps 内时按独立单项渲染', () => {
    const { container } = render(<LhStep title="起笔" />)
    expect(container.querySelectorAll('.lh-steps__item')).toHaveLength(1)
  })
})
