import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LhSpace } from '@/components/space'

describe('LhSpace', () => {
  it('渲染默认水平间距容器', () => {
    const { container } = render(<LhSpace>内容</LhSpace>)
    const space = container.querySelector<HTMLElement>('.lh-space')
    expect(space).not.toBeNull()
    expect(space?.className).toContain('lh-space--horizontal')
    expect(space?.className).toContain('lh-space--medium')
    expect(space?.getAttribute('role')).toBe('presentation')
  })

  it('direction=vertical 输出垂直类名', () => {
    const { container } = render(<LhSpace direction="vertical">内容</LhSpace>)
    expect(container.querySelector('.lh-space')?.className).toContain('lh-space--vertical')
  })

  it('wrap 默认开启（水平方向）', () => {
    const { container } = render(<LhSpace>内容</LhSpace>)
    expect(container.querySelector('.lh-space')?.className).toContain('lh-space--wrap')
  })

  it('wrap=false 关闭换行', () => {
    const { container } = render(<LhSpace wrap={false}>内容</LhSpace>)
    expect(container.querySelector('.lh-space')?.className).not.toContain('lh-space--wrap')
  })

  it('垂直方向永远不换行（wrap 被忽略）', () => {
    const { container } = render(<LhSpace direction="vertical">内容</LhSpace>)
    expect(container.querySelector('.lh-space')?.className).not.toContain('lh-space--wrap')
  })

  it('size 预设档位输出对应类名与令牌 gap', () => {
    const { container } = render(<LhSpace size="large">内容</LhSpace>)
    const space = container.querySelector<HTMLElement>('.lh-space')
    expect(space?.className).toContain('lh-space--large')
    expect(space?.style.columnGap).toBe('var(--lh-spacing-xl, 24px)')
    expect(space?.style.rowGap).toBe('var(--lh-spacing-xl, 24px)')
  })

  it('size 为数字时不入类名、走内联 px gap', () => {
    const { container } = render(<LhSpace size={24}>内容</LhSpace>)
    const space = container.querySelector<HTMLElement>('.lh-space')
    expect(space?.className).not.toMatch(/lh-space--(small|medium|large)/)
    expect(space?.style.columnGap).toBe('24px')
    expect(space?.style.rowGap).toBe('24px')
  })

  it('size 为数组时分别控制水平和垂直间距', () => {
    const { container } = render(<LhSpace size={[8, 16]}>内容</LhSpace>)
    const space = container.querySelector<HTMLElement>('.lh-space')
    expect(space?.style.columnGap).toBe('8px')
    expect(space?.style.rowGap).toBe('16px')
  })

  it('alignment 透传为 align-items', () => {
    const { container } = render(<LhSpace alignment="center">内容</LhSpace>)
    expect(container.querySelector<HTMLElement>('.lh-space')?.style.alignItems).toBe('center')
  })
})
