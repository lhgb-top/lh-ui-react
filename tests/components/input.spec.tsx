import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhInput } from '../../src/components/input'

describe('LhInput', () => {
  it('渲染 input 与包裹结构', () => {
    render(<LhInput placeholder="占位" />)
    const input = screen.getByPlaceholderText('占位')
    expect(input).toHaveClass('lh-input__inner')
    expect(input.closest('.lh-input')).not.toBeNull()
    expect(input.closest('.lh-input__wrapper')).not.toBeNull()
  })

  it('受控模式：value + onChange 传出值与事件', () => {
    const onChange = vi.fn()
    render(<LhInput value="abc" onChange={onChange} />)
    const input = screen.getByDisplayValue('abc')
    fireEvent.change(input, { target: { value: 'abcd' } })
    expect(onChange).toHaveBeenCalledWith('abcd', expect.anything())
  })

  it('非受控模式：defaultValue + onInput 驱动内部状态', () => {
    const onInput = vi.fn()
    render(<LhInput defaultValue="x" onInput={onInput} />)
    const input = screen.getByDisplayValue('x')
    fireEvent.input(input, { target: { value: 'xy' } })
    expect(onInput).toHaveBeenCalledWith('xy', expect.anything())
    expect(input).toHaveDisplayValue('xy')
  })

  it('placeholder 未传时走语言包兜底', () => {
    render(<LhInput />)
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument()
  })

  it('有 label 时 placeholder 失效（避免与浮动标签冲突）', () => {
    // 与 plus 一致：label 存在时 placeholder 置空（占位不展示），而非删除属性
    render(<LhInput label="姓名" placeholder="占位" />)
    const input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('placeholder', '')
  })

  it('label 渲染浮动标签', () => {
    render(<LhInput label="姓名" />)
    expect(screen.getByText('姓名')).toHaveClass('lh-input__label')
  })

  it('disabled / readonly 透传', () => {
    render(<LhInput disabled readonly />)
    const input = screen.getByDisplayValue('')
    expect(input).toBeDisabled()
    expect(input).toHaveAttribute('readonly')
  })

  it('maxlength 截断输入值', () => {
    const onInput = vi.fn()
    render(<LhInput maxlength={3} onInput={onInput} />)
    const input = screen.getByDisplayValue('')
    fireEvent.input(input, { target: { value: 'abcdef' } })
    expect(onInput).toHaveBeenCalledWith('abc', expect.anything())
    expect(input).toHaveDisplayValue('abc')
  })

  it('showWordLimit + maxlength 渲染字数统计', () => {
    render(<LhInput maxlength={5} showWordLimit defaultValue="abc" />)
    expect(screen.getByText('3/5')).toHaveClass('lh-input__count')
  })

  it('type=textarea 渲染 textarea', () => {
    render(<LhInput type="textarea" rows={4} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
    expect(textarea).toHaveClass('lh-input__inner')
  })

  it('type=password 渲染密码输入框', () => {
    render(<LhInput type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
  })

  it('prefixIcon / suffixIcon 渲染图标', () => {
    const { container } = render(<LhInput prefixIcon="search" suffixIcon="date" />)
    expect(container.querySelector('.lh-input__prefix .lh-icon')).not.toBeNull()
    expect(container.querySelector('.lh-input__suffix .lh-icon')).not.toBeNull()
  })

  it('clearable + 有值时渲染清除按钮并触发 onClear', () => {
    const onClear = vi.fn()
    const { container } = render(<LhInput defaultValue="abc" clearable onClear={onClear} />)
    const clear = container.querySelector('.lh-input__clear') as SVGElement
    expect(clear).not.toBeNull()
    fireEvent.click(clear)
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('D-04：清空时受控模式同步抛 onChange（空串）', () => {
    const onChange = vi.fn()
    const { container } = render(<LhInput value="abc" onChange={onChange} clearable />)
    const clear = container.querySelector('.lh-input__clear') as SVGElement
    fireEvent.click(clear)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('', expect.anything())
  })

  it('D-10：showPassword 渲染眼睛按钮并切换原生 type', () => {
    const { container } = render(<LhInput type="password" showPassword />)
    const input = screen.getByDisplayValue('')
    expect(input).toHaveAttribute('type', 'password')
    // 清除图标与眼睛按钮共用 .lh-input__clear，眼睛带 role=button
    const eye = container.querySelector('.lh-input__clear[role="button"]') as SVGElement
    expect(eye).not.toBeNull()
    expect(eye).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(eye)
    expect(input).toHaveAttribute('type', 'text')
    expect(eye).toHaveAttribute('aria-pressed', 'true')
  })

  it('D-10：showPassword 的眼睛按钮响应 Enter / Space', () => {
    const { container } = render(<LhInput type="password" showPassword />)
    const input = screen.getByDisplayValue('')
    const eye = container.querySelector('.lh-input__clear[role="button"]') as SVGElement
    fireEvent.keyDown(eye, { key: 'Enter' })
    expect(input).toHaveAttribute('type', 'text')
    fireEvent.keyDown(eye, { key: ' ' })
    expect(input).toHaveAttribute('type', 'password')
  })

  it('D-10：非 password 类型下 showPassword 不生效', () => {
    const { container } = render(<LhInput type="text" showPassword />)
    expect(container.querySelector('.lh-input__clear[role="button"]')).toBeNull()
  })

  it('focus / blur 切换 wrapper 聚态类名', () => {
    render(<LhInput />)
    const input = screen.getByDisplayValue('')
    const wrapper = input.closest('.lh-input__wrapper') as HTMLElement

    fireEvent.focus(input)
    expect(wrapper.className).toContain('lh-input__wrapper--focused')

    fireEvent.blur(input)
    expect(wrapper.className).not.toContain('lh-input__wrapper--focused')
  })

  it('size 变体类名', () => {
    render(<LhInput size="large" />)
    expect(screen.getByDisplayValue('').closest('.lh-input')).toHaveClass('lh-input--large')
  })
})
