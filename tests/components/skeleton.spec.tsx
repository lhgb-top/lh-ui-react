import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LhSkeleton, LhSkeletonItem } from '@/components/skeleton'

describe('LhSkeleton', () => {
  it('loading=true 时渲染骨架占位与 aria-busy', () => {
    const { container } = render(<LhSkeleton />)
    const skeleton = container.querySelector('.lh-skeleton')
    expect(skeleton).not.toBeNull()
    expect(skeleton?.getAttribute('aria-busy')).toBe('true')
    expect(skeleton?.getAttribute('aria-live')).toBe('polite')
  })

  it('默认渲染 3 行文本占位，末行 60%', () => {
    const { container } = render(<LhSkeleton />)
    const items = container.querySelectorAll<HTMLElement>(
      '.lh-skeleton__content .lh-skeleton-item--text',
    )
    expect(items).toHaveLength(3)
    expect(items[0]?.style.width).toBe('100%')
    expect(items[2]?.style.width).toBe('60%')
  })

  it('rows 控制文本行数', () => {
    const { container } = render(<LhSkeleton rows={5} />)
    expect(container.querySelectorAll('.lh-skeleton__content .lh-skeleton-item--text')).toHaveLength(5)
  })

  it('rows=1 时单行全宽（无末行收窄逻辑）', () => {
    const { container } = render(<LhSkeleton rows={1} />)
    const items = container.querySelectorAll<HTMLElement>(
      '.lh-skeleton__content .lh-skeleton-item--text',
    )
    expect(items).toHaveLength(1)
    expect(items[0]?.style.width).toBe('100%')
  })

  it('avatar=true 渲染圆形头像占位', () => {
    const { container } = render(<LhSkeleton avatar />)
    const skeleton = container.querySelector('.lh-skeleton')
    expect(skeleton?.className).toContain('lh-skeleton--with-avatar')
    expect(skeleton?.querySelector('.lh-skeleton__avatar.lh-skeleton-item--circle')).not.toBeNull()
  })

  it('loading=false 时渲染真实子节点', () => {
    const { container } = render(
      <LhSkeleton loading={false}>
        <div data-testid="real">真实内容</div>
      </LhSkeleton>,
    )
    expect(container.querySelector('.lh-skeleton')).toBeNull()
    expect(container.querySelector('[data-testid="real"]')).not.toBeNull()
  })

  it('animated=false 时不带动画类名', () => {
    const { container } = render(<LhSkeleton animated={false} />)
    expect(container.querySelector('.lh-skeleton-item')?.className).not.toContain(
      'lh-skeleton-item--animated',
    )
  })
})

describe('LhSkeletonItem', () => {
  it('默认 text 变体', () => {
    const { container } = render(<LhSkeletonItem />)
    const item = container.querySelector('.lh-skeleton-item')
    expect(item?.className).toContain('lh-skeleton-item--text')
    expect(item?.className).toContain('lh-skeleton-item--animated')
  })

  it('variant=rect / circle', () => {
    const { container } = render(<LhSkeletonItem variant="circle" animated={false} />)
    const item = container.querySelector('.lh-skeleton-item')
    expect(item?.className).toContain('lh-skeleton-item--circle')
    expect(item?.className).not.toContain('lh-skeleton-item--animated')
  })

  it('占位块对辅助技术隐藏', () => {
    const { container } = render(<LhSkeletonItem />)
    expect(container.querySelector('.lh-skeleton-item')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('className / style 与内部类名合并', () => {
    const { container } = render(
      <LhSkeletonItem className="extra" style={{ width: '50%' }} />,
    )
    const item = container.querySelector<HTMLElement>('.lh-skeleton-item')
    expect(item?.className).toContain('extra')
    expect(item?.style.width).toBe('50%')
  })
})
