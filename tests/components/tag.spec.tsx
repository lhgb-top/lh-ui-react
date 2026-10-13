import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhTag } from '../../src/components/tag'

describe('LhTag', () => {
  it('渲染 span.lh-tag 与文本', () => {
    const { container } = render(<LhTag>标签</LhTag>)
    const tag = container.querySelector('.lh-tag')
    expect(tag?.tagName).toBe('SPAN')
    expect(tag?.className).toContain('lh-tag')
    expect(tag?.className).toContain('lh-tag--default')
    expect(tag?.className).toContain('lh-tag--medium')
    expect(tag).toHaveTextContent('标签')
  })

  it('type / round / hit 变体类名', () => {
    const { container } = render(
      <LhTag type="success" round hit>
        标签
      </LhTag>,
    )
    const tag = container.querySelector('.lh-tag')
    expect(tag?.className).toContain('lh-tag--success')
    expect(tag?.className).toContain('lh-tag--round')
    expect(tag?.className).toContain('lh-tag--hit')
  })

  it('传入 onClick 时升级为 role=button 且可键盘激活', () => {
    const onClick = vi.fn()
    render(<LhTag onClick={onClick}>可点击</LhTag>)
    const tag = screen.getByRole('button')
    expect(tag).toHaveAttribute('tabindex', '0')

    fireEvent.click(tag)
    expect(onClick).toHaveBeenCalledOnce()

    fireEvent.keyDown(tag, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(2)

    fireEvent.keyDown(tag, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('无 onClick 时不是 button 角色', () => {
    render(<LhTag>纯展示</LhTag>)
    expect(screen.getByText('纯展示').closest('[role]')?.getAttribute('role')).toBeUndefined()
  })

  it('disabled 时不响应点击', () => {
    const onClick = vi.fn()
    render(
      <LhTag disabled onClick={onClick}>
        禁用
      </LhTag>,
    )
    fireEvent.click(screen.getByText('禁用'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('closable 渲染关闭按钮并触发 onClose', () => {
    const onClose = vi.fn()
    render(<LhTag closable onClose={onClose}>可关闭</LhTag>)
    const close = screen.getByRole('button', { name: '关闭' })
    fireEvent.click(close)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disabled 时关闭按钮禁用', () => {
    const onClose = vi.fn()
    render(
      <LhTag closable disabled onClose={onClose}>
        可关闭
      </LhTag>,
    )
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('D-03：点关闭后立即卸载（内部关闭态）', () => {
    const onClose = vi.fn()
    render(<LhTag closable onClose={onClose}>可关闭</LhTag>)
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(screen.queryByText('可关闭')).toBeNull()
  })
})
