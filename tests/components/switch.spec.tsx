import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhSwitch } from '../../src/components/switch'

describe('LhSwitch', () => {
  it('渲染 role=switch 的自定义控件', () => {
    render(<LhSwitch />)
    const sw = screen.getByRole('switch')
    expect(sw.tagName).toBe('DIV')
    expect(sw).toHaveClass('lh-switch')
    expect(sw).toHaveClass('lh-switch--medium')
    expect(sw.querySelector('.lh-switch__core')).not.toBeNull()
  })

  it('受控模式：checked + aria-checked + onChange', () => {
    const onChange = vi.fn()
    render(<LhSwitch checked onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'true')
    expect(sw.className).toContain('lh-switch--checked')

    fireEvent.click(sw)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('非受控模式：defaultChecked + 多次切换', () => {
    const onChange = vi.fn()
    render(<LhSwitch defaultChecked onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(sw)
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect(sw).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(sw)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('Enter / Space 键盘激活', () => {
    const onChange = vi.fn()
    render(<LhSwitch onChange={onChange} />)
    const sw = screen.getByRole('switch')

    fireEvent.keyUp(sw, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(true)

    fireEvent.keyUp(sw, { key: ' ' })
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('disabled 禁用且不响应交互', () => {
    const onChange = vi.fn()
    render(<LhSwitch disabled onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw.className).toContain('lh-switch--disabled')
    expect(sw).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(sw)
    fireEvent.keyUp(sw, { key: 'Enter' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('loading 态渲染指示且不响应交互', () => {
    const onChange = vi.fn()
    render(<LhSwitch loading onChange={onChange} />)
    const sw = screen.getByRole('switch')
    expect(sw.className).toContain('lh-switch--loading')
    expect(sw.querySelector('.lh-switch__loading')).not.toBeNull()
    expect(sw).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(sw)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('activeText / inactiveText 文案随状态切换', () => {
    render(<LhSwitch checked activeText="开" inactiveText="关" />)
    expect(screen.getByRole('switch').querySelector('.lh-switch__label')).toHaveTextContent('开')
  })

  it('size 变体类名', () => {
    render(<LhSwitch size="large" />)
    expect(screen.getByRole('switch')).toHaveClass('lh-switch--large')
  })
})
