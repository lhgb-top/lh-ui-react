import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhAlert } from '@/components/alert'

describe('LhAlert', () => {
  it('渲染默认 info 类型与正文', () => {
    const { container } = render(<LhAlert>提示内容</LhAlert>)
    const alert = container.querySelector('.lh-alert')
    expect(alert?.className).toContain('lh-alert--info')
    expect(container.querySelector('.lh-alert__description')).toHaveTextContent('提示内容')
  })

  it('四种类型类名', () => {
    const { container, rerender } = render(<LhAlert type="success">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.className).toContain('lh-alert--success')
    rerender(<LhAlert type="warning">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.className).toContain('lh-alert--warning')
    rerender(<LhAlert type="danger">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.className).toContain('lh-alert--danger')
  })

  it('warning/danger 映射 role=alert，info/success 映射 role=status', () => {
    const { container, rerender } = render(<LhAlert type="warning">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.getAttribute('role')).toBe('alert')
    rerender(<LhAlert type="danger">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.getAttribute('role')).toBe('alert')
    rerender(<LhAlert type="info">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.getAttribute('role')).toBe('status')
    rerender(<LhAlert type="success">内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.getAttribute('role')).toBe('status')
  })

  it('title 渲染标题行并带 with-title 钩子类名', () => {
    const { container } = render(<LhAlert title="标题">内容</LhAlert>)
    expect(container.querySelector('.lh-alert__title')).toHaveTextContent('标题')
    expect(container.querySelector('.lh-alert')?.className).toContain('lh-alert--with-title')
  })

  it('无 title 时不渲染标题行', () => {
    const { container } = render(<LhAlert>内容</LhAlert>)
    expect(container.querySelector('.lh-alert__title')).toBeNull()
  })

  it('plain 输出朴素类名', () => {
    const { container } = render(<LhAlert plain>内容</LhAlert>)
    expect(container.querySelector('.lh-alert')?.className).toContain('lh-alert--plain')
  })

  it('showIcon 渲染对应类型的图标', () => {
    const { container } = render(
      <LhAlert type="success" showIcon>
        内容
      </LhAlert>,
    )
    const icon = container.querySelector('.lh-alert__icon')
    expect(icon).not.toBeNull()
    expect(icon?.className).toContain('lh-icon--check')
  })

  it('closable 渲染关闭按钮，点击后卸载并触发 onClose', () => {
    const onClose = vi.fn()
    const { container } = render(
      <LhAlert closable onClose={onClose}>
        内容
      </LhAlert>,
    )
    expect(container.querySelector('.lh-alert__close')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '关闭警告' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(container.querySelector('.lh-alert')).toBeNull()
  })

  it('closeLabel 覆盖语言包兜底的 aria-label', () => {
    render(
      <LhAlert closable closeLabel="dismiss">
        内容
      </LhAlert>,
    )
    expect(screen.getByRole('button', { name: 'dismiss' })).toBeInTheDocument()
  })

  it('不可关闭时不渲染关闭按钮', () => {
    const { container } = render(<LhAlert>内容</LhAlert>)
    expect(container.querySelector('.lh-alert__close')).toBeNull()
  })
})
