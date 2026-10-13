import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhCard } from '@/components/card'

describe('LhCard', () => {
  it('渲染卡片与正文，默认 always 阴影', () => {
    const { container } = render(<LhCard>正文</LhCard>)
    const card = container.querySelector('.lh-card')
    expect(card).not.toBeNull()
    expect(card?.className).toContain('lh-card--shadow-always')
    expect(container.querySelector('.lh-card__body')).toHaveTextContent('正文')
  })

  it('shadow=hover / never', () => {
    const { container, rerender } = render(<LhCard shadow="hover">正文</LhCard>)
    expect(container.querySelector('.lh-card')?.className).toContain('lh-card--shadow-hover')
    rerender(<LhCard shadow="never">正文</LhCard>)
    expect(container.querySelector('.lh-card')?.className).toContain('lh-card--shadow-never')
  })

  it('title 渲染默认头部', () => {
    const { container } = render(<LhCard title="标题">正文</LhCard>)
    const header = container.querySelector('.lh-card__header')
    expect(header).not.toBeNull()
    expect(header?.querySelector('.lh-card__title')).toHaveTextContent('标题')
  })

  it('header 覆盖默认头部', () => {
    const { container } = render(
      <LhCard title="标题" header={<div data-testid="custom-header">自定义头部</div>}>
        正文
      </LhCard>,
    )
    expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    expect(container.querySelector('.lh-card__title')).toBeNull()
  })

  it('cover / extra / footer 区域渲染', () => {
    const { container } = render(
      <LhCard title="标题" cover={<img alt="" src="/cover.png" />} extra={<span>更多</span>} footer={<div>底部</div>}>
        正文
      </LhCard>,
    )
    expect(container.querySelector('.lh-card__cover img')).toHaveAttribute('src', '/cover.png')
    expect(container.querySelector('.lh-card__extra')).toHaveTextContent('更多')
    expect(container.querySelector('.lh-card__footer')).toHaveTextContent('底部')
  })

  it('clickable 时承担 button 语义且可键盘激活', () => {
    const onClick = vi.fn()
    render(
      <LhCard clickable onClick={onClick}>
        正文
      </LhCard>,
    )
    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('tabindex', '0')

    fireEvent.click(card)
    expect(onClick).toHaveBeenCalledOnce()

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('非 clickable 时不承担 button 语义且不触发点击', () => {
    const onClick = vi.fn()
    const { container } = render(<LhCard onClick={onClick}>正文</LhCard>)
    expect(container.querySelector('.lh-card')?.getAttribute('role')).toBeNull()
    fireEvent.click(container.querySelector('.lh-card')!)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading 时正文区换成骨架占位且不响应点击', () => {
    const onClick = vi.fn()
    const { container } = render(
      <LhCard clickable loading onClick={onClick}>
        正文
      </LhCard>,
    )
    const card = container.querySelector('.lh-card')
    expect(card?.className).toContain('lh-card--loading')
    expect(card?.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelector('.lh-card__body')).not.toHaveTextContent('正文')
    expect(container.querySelectorAll('.lh-card__loading-line')).toHaveLength(3)

    // loading 时不可交互：无 button 语义
    expect(card?.getAttribute('role')).toBeNull()
    fireEvent.click(card!)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('themeVars 透传为 CSS 变量', () => {
    const { container } = render(<LhCard themeVars={{ 'card-bg': '#fff' }}>正文</LhCard>)
    expect(container.querySelector<HTMLElement>('.lh-card')?.style.getPropertyValue('--lh-card-bg')).toBe(
      '#fff',
    )
  })

  it('bgPattern 透传为背景图', () => {
    const { container } = render(
      <LhCard bgPattern="var(--lh-pattern-willow)">正文</LhCard>,
    )
    expect(container.querySelector<HTMLElement>('.lh-card')?.style.backgroundImage).toBe(
      'var(--lh-pattern-willow)',
    )
  })
})
