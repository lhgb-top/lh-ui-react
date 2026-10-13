import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhBreadcrumb, LhBreadcrumbItem } from '@/components/breadcrumb'

describe('LhBreadcrumb', () => {
  it('渲染 nav > ol.lh-breadcrumb__list 与全部项', () => {
    const { container } = render(
      <LhBreadcrumb>
        <LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/list">列表</LhBreadcrumbItem>
        <LhBreadcrumbItem>详情</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    expect(container.querySelector('nav.lh-breadcrumb')).not.toBeNull()
    expect(container.querySelector('ol.lh-breadcrumb__list')).not.toBeNull()
    expect(container.querySelectorAll('.lh-breadcrumb__item')).toHaveLength(3)
  })

  it('nav 带 aria-label（语言包兜底）', () => {
    render(
      <LhBreadcrumb>
        <LhBreadcrumbItem>首页</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', '面包屑导航')
  })

  it('非末项渲染链接与分隔符，末项渲染纯文本', () => {
    const { container } = render(
      <LhBreadcrumb separator="/">
        <LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>
        <LhBreadcrumbItem>详情</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    const items = container.querySelectorAll('.lh-breadcrumb__item')
    expect(items[0]?.querySelector('a.lh-breadcrumb__link')).toHaveAttribute('href', '/')
    expect(items[0]?.querySelector('.lh-breadcrumb__separator')).toHaveTextContent('/')
    expect(items[1]?.querySelector('.lh-breadcrumb__text')).toHaveTextContent('详情')
    expect(items[1]?.querySelector('.lh-breadcrumb__separator')).toBeNull()
  })

  it('末项输出 aria-current="page"', () => {
    render(
      <LhBreadcrumb>
        <LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>
        <LhBreadcrumbItem>详情</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    expect(screen.getByText('详情').closest('.lh-breadcrumb__text')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('separator 自定义分隔符', () => {
    const { container } = render(
      <LhBreadcrumb separator=">">
        <LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>
        <LhBreadcrumbItem>详情</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    expect(container.querySelector('.lh-breadcrumb__separator')).toHaveTextContent('>')
  })

  it('maxItems 折叠中间项并渲染省略号按钮', () => {
    const { container } = render(
      <LhBreadcrumb maxItems={3}>
        <LhBreadcrumbItem to="/1">一</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/2">二</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/3">三</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/4">四</LhBreadcrumbItem>
        <LhBreadcrumbItem>五</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    expect(container.querySelectorAll('.lh-breadcrumb__item')).toHaveLength(3)
    expect(container.querySelector('.lh-breadcrumb__ellipsis')).not.toBeNull()
  })

  it('点击省略号按钮展开全部', () => {
    const { container } = render(
      <LhBreadcrumb maxItems={3}>
        <LhBreadcrumbItem to="/1">一</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/2">二</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/3">三</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/4">四</LhBreadcrumbItem>
        <LhBreadcrumbItem>五</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    fireEvent.click(screen.getByRole('button', { name: '更多' }))
    expect(container.querySelectorAll('.lh-breadcrumb__item')).toHaveLength(5)
    expect(container.querySelector('.lh-breadcrumb__ellipsis')).toBeNull()
  })

  it('省略号按钮带 aria-label', () => {
    render(
      <LhBreadcrumb maxItems={3}>
        <LhBreadcrumbItem to="/1">一</LhBreadcrumbItem>
        <LhBreadcrumbItem to="/2">二</LhBreadcrumbItem>
        <LhBreadcrumbItem>三</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    // total 等于 maxItems 时不折叠，无省略号
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull()
  })

  it('未包裹在 LhBreadcrumb 内时按末项渲染', () => {
    const { container } = render(<LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>)
    expect(container.querySelectorAll('.lh-breadcrumb__item')).toHaveLength(1)
    // to 存在但无父级时视为末项 → 纯文本而非链接
    expect(container.querySelector('.lh-breadcrumb__link')).toBeNull()
  })
})

describe('LhBreadcrumbItem（className 集成）', () => {
  it('链接项输出 --link 修饰类', () => {
    const { container } = render(
      <LhBreadcrumb>
        <LhBreadcrumbItem to="/">首页</LhBreadcrumbItem>
        <LhBreadcrumbItem>详情</LhBreadcrumbItem>
      </LhBreadcrumb>,
    )
    const items = container.querySelectorAll('.lh-breadcrumb__item')
    expect(items[0]?.className).toContain('lh-breadcrumb__item--link')
    expect(items[1]?.className).toContain('lh-breadcrumb__item--last')
  })
})
