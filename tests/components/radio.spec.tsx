import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhRadio, LhRadioGroup } from '../../src/components/radio'

describe('LhRadio', () => {
  it('渲染 label > input[radio] + box + label 结构', () => {
    render(<LhRadio value="a">选项</LhRadio>)
    const input = screen.getByRole('radio')
    expect(input).toHaveClass('lh-radio__input')
    expect(input.closest('.lh-radio')).not.toBeNull()
    expect(screen.getByText('选项')).toHaveClass('lh-radio__label')
  })

  it('受控模式：checked 与 value 匹配即选中', () => {
    const onChange = vi.fn()
    render(
      <>
        <LhRadio value="a" checked="a" onChange={onChange}>
          A
        </LhRadio>
        <LhRadio value="b" checked="a" onChange={onChange}>
          B
        </LhRadio>
      </>,
    )
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'B' })).not.toBeChecked()

    fireEvent.click(screen.getByRole('radio', { name: 'B' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('非受控模式：defaultChecked 初值', () => {
    render(<LhRadio value="a" defaultChecked="a">A</LhRadio>)
    expect(screen.getByRole('radio', { name: 'A' })).toBeChecked()
  })

  it('disabled 禁用且不触发 onChange', () => {
    const onChange = vi.fn()
    render(
      <LhRadio value="a" disabled onChange={onChange}>
        禁用
      </LhRadio>,
    )
    const input = screen.getByRole('radio', { name: '禁用' })
    expect(input).toBeDisabled()
    fireEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('size 变体类名', () => {
    render(<LhRadio value="a" size="small">小</LhRadio>)
    expect(screen.getByRole('radio').closest('.lh-radio')).toHaveClass('lh-radio--small')
  })
})

describe('LhRadioGroup', () => {
  it('role=radiogroup 容器', () => {
    render(
      <LhRadioGroup value="a">
        <LhRadio value="a">A</LhRadio>
      </LhRadioGroup>,
    )
    expect(screen.getByRole('radiogroup')).toHaveClass('lh-radio-group')
  })

  it('受控切换：选中新项传出新值', () => {
    const onChange = vi.fn()
    render(
      <LhRadioGroup value="a" onChange={onChange}>
        <LhRadio value="a">A</LhRadio>
        <LhRadio value="b">B</LhRadio>
      </LhRadioGroup>,
    )
    fireEvent.click(screen.getByRole('radio', { name: 'B' }))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('Group 禁用传导到子项', () => {
    render(
      <LhRadioGroup value="a" disabled>
        <LhRadio value="a">A</LhRadio>
      </LhRadioGroup>,
    )
    expect(screen.getByRole('radio', { name: 'A' })).toBeDisabled()
  })

  it('Group name 透传到子项 input', () => {
    render(
      <LhRadioGroup value="a" name="gender">
        <LhRadio value="a">A</LhRadio>
      </LhRadioGroup>,
    )
    expect(screen.getByRole('radio', { name: 'A' })).toHaveAttribute('name', 'gender')
  })
})
