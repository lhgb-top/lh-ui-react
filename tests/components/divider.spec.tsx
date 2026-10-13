import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { LhDivider } from '@/components/divider'

describe('LhDivider', () => {
  it('渲染默认水平分割线', () => {
    const { container } = render(<LhDivider />)
    const divider = container.querySelector('.lh-divider')
    expect(divider).not.toBeNull()
    expect(divider?.className).toContain('lh-divider--horizontal')
    expect(divider?.className).not.toContain('lh-divider--with-text')
  })

  it('direction=vertical 输出垂直类名', () => {
    const { container } = render(<LhDivider direction="vertical" />)
    expect(container.querySelector('.lh-divider')?.className).toContain('lh-divider--vertical')
  })

  it('dashed 输出虚线类名', () => {
    const { container } = render(<LhDivider dashed />)
    expect(container.querySelector('.lh-divider')?.className).toContain('lh-divider--dashed')
  })

  it('borderStyle 优先于 dashed 生成对应修饰符', () => {
    const { container } = render(<LhDivider borderStyle="dotted" />)
    expect(container.querySelector('.lh-divider')?.className).toContain('lh-divider--dotted')
  })

  it('有文案时渲染标签并升级为 role=separator', () => {
    const { container } = render(<LhDivider>分组标题</LhDivider>)
    const divider = container.querySelector('.lh-divider')
    expect(divider?.className).toContain('lh-divider--with-text')
    expect(divider?.className).toContain('lh-divider--label-center')
    expect(divider?.getAttribute('role')).toBe('separator')
    expect(container.querySelector('.lh-divider__label')).toHaveTextContent('分组标题')
  })

  it('labelPosition 生效', () => {
    const { container } = render(<LhDivider labelPosition="left">标题</LhDivider>)
    expect(container.querySelector('.lh-divider')?.className).toContain('lh-divider--label-left')
  })

  it('垂直方向渲染文案并声明 aria-orientation（纵向 flex 布局）', () => {
    const { container } = render(<LhDivider direction="vertical">标题</LhDivider>)
    const divider = container.querySelector('.lh-divider')
    expect(divider?.className).toContain('lh-divider--with-text')
    // labelPosition 是横向语义，竖向文案恒居中，不产出修饰类
    expect(divider?.className).not.toContain('lh-divider--label-center')
    expect(divider?.getAttribute('role')).toBe('separator')
    expect(divider?.getAttribute('aria-orientation')).toBe('vertical')
    expect(container.querySelector('.lh-divider__label')).toHaveTextContent('标题')
  })

  it('纯装饰分割线为 role=presentation，移出无障碍树', () => {
    const { container } = render(<LhDivider />)
    expect(container.querySelector('.lh-divider')?.getAttribute('role')).toBe('presentation')
  })

  it('水平方向（有/无文案）恒不声明 aria-orientation（默认方向无需声明）', () => {
    const { container } = render(<LhDivider>标题</LhDivider>)
    expect(container.querySelector('.lh-divider')?.getAttribute('aria-orientation')).toBeNull()
  })
})
