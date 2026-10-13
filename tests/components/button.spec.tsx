import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhButton } from '../../src/components/button'

describe('LhButton', () => {
  it('默认渲染 button 元素', () => {
    render(<LhButton>点我</LhButton>)
    const button = screen.getByRole('button')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveTextContent('点我')
    expect(button.className).toContain('lh-button--default')
    expect(button.className).toContain('lh-button--medium')
  })

  it('传入 href 时渲染锚点', () => {
    render(<LhButton href="https://example.com">链接</LhButton>)
    const link = screen.getByRole('link')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('type / size / plain / round / circle 变体类名', () => {
    render(
      <LhButton type="primary" size="small" plain round circle>
        变体
      </LhButton>,
    )
    const button = screen.getByRole('button')
    expect(button.className).toContain('lh-button--primary')
    expect(button.className).toContain('lh-button--small')
    expect(button.className).toContain('lh-button--plain')
    expect(button.className).toContain('lh-button--round')
    expect(button.className).toContain('lh-button--circle')
  })

  it('block 类名', () => {
    render(<LhButton block>块级</LhButton>)
    expect(screen.getByRole('button').className).toContain('lh-button--block')
  })

  it('点击触发 onClick', () => {
    const onClick = vi.fn()
    render(<LhButton onClick={onClick}>按钮</LhButton>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disabled 时不触发 onClick 且原生禁用', () => {
    const onClick = vi.fn()
    render(
      <LhButton disabled onClick={onClick}>
        禁用
      </LhButton>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.className).toContain('lh-button--disabled')
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('loading 时不触发 onClick 且渲染加载指示', () => {
    const onClick = vi.fn()
    render(
      <LhButton loading onClick={onClick}>
        加载中
      </LhButton>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button.className).toContain('lh-button--loading')
    expect(button.querySelector('.lh-button__loading')).not.toBeNull()
    fireEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('icon 渲染前置图标', () => {
    render(<LhButton icon="search">搜索</LhButton>)
    const button = screen.getByRole('button')
    expect(button.querySelector('.lh-button__icon .lh-icon')).not.toBeNull()
  })

  it('文字内容包在 lh-button__text 内', () => {
    render(<LhButton>文案</LhButton>)
    expect(screen.getByRole('button').querySelector('.lh-button__text')).toHaveTextContent('文案')
  })

  it('nativeType 透传', () => {
    render(<LhButton nativeType="submit">提交</LhButton>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})
