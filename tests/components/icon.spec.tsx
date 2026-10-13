import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LhIcon } from '../../src/components/icon'

describe('LhIcon', () => {
  it('渲染内置图标的 svg', () => {
    const { container } = render(<LhIcon name="search" />)
    const svg = container.querySelector('.lh-icon svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('类名带图标名修饰', () => {
    const { container } = render(<LhIcon name="star" />)
    expect(container.querySelector('.lh-icon')?.className).toContain('lh-icon--star')
  })

  it('数字尺寸透传到 svg 宽高', () => {
    const { container } = render(<LhIcon name="star" size={24} />)
    const svg = container.querySelector('.lh-icon svg') as SVGElement
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('预设尺寸键映射为数值', () => {
    const { container } = render(<LhIcon name="star" size="large" />)
    expect(container.querySelector('.lh-icon svg')).toHaveAttribute('width', '20')
  })

  it('颜色覆盖 currentColor', () => {
    const { container } = render(<LhIcon name="star" color="#f00" />)
    expect(container.querySelector('.lh-icon')).toHaveStyle({ color: '#f00' })
  })

  it('默认装饰态输出 aria-hidden', () => {
    const { container } = render(<LhIcon name="star" />)
    expect(container.querySelector('.lh-icon')).toHaveAttribute('aria-hidden', 'true')
  })

  it('decorative=false 时输出 role=img 与 aria-label', () => {
    const { container } = render(<LhIcon name="star" decorative={false} ariaLabel="收藏" />)
    const icon = container.querySelector('.lh-icon')
    expect(icon).toHaveAttribute('role', 'img')
    expect(icon).toHaveAttribute('aria-label', '收藏')
    expect(icon).not.toHaveAttribute('aria-hidden')
  })

  it('无 name 时回退渲染 children', () => {
    const { container } = render(
      <LhIcon>
        <svg data-testid="custom" />
      </LhIcon>,
    )
    expect(container.querySelector('.lh-icon')).toContainElement(screen.getByTestId('custom'))
  })
})
