import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhCheckbox, LhCheckboxGroup } from '../../src/components/checkbox'

describe('LhCheckbox', () => {
  it('渲染 label > input + box + label 结构', () => {
    render(<LhCheckbox label="同意">同意</LhCheckbox>)
    const input = screen.getByRole('checkbox')
    expect(input).toHaveClass('lh-checkbox__input')
    expect(input.closest('.lh-checkbox')).not.toBeNull()
    expect(screen.getByText('同意')).toHaveClass('lh-checkbox__label')
  })

  it('受控模式：checked + onChange', () => {
    const onChange = vi.fn()
    render(<LhCheckbox checked onChange={onChange} label="条款" />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('非受控模式：defaultChecked + 多次切换', () => {
    const onChange = vi.fn()
    render(<LhCheckbox defaultChecked onChange={onChange} label="条款" />)
    const input = screen.getByRole('checkbox')
    expect(input).toBeChecked()

    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith(false)
    expect(input).not.toBeChecked()

    fireEvent.click(input)
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('disabled 禁用且不触发 onChange', () => {
    const onChange = vi.fn()
    render(
      <LhCheckbox disabled onChange={onChange} label="禁用">
        禁用
      </LhCheckbox>,
    )
    const input = screen.getByRole('checkbox')
    expect(input).toBeDisabled()
    fireEvent.click(input)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('indeterminate 同步到原生属性', () => {
    render(<LhCheckbox indeterminate label="半选" />)
    expect(screen.getByRole('checkbox')).toHaveProperty('indeterminate', true)
  })

  it('size 变体类名', () => {
    render(<LhCheckbox size="large" label="大号" />)
    expect(screen.getByRole('checkbox').closest('.lh-checkbox')).toHaveClass('lh-checkbox--large')
  })
})

describe('LhCheckboxGroup', () => {
  it('role=group 容器', () => {
    render(
      <LhCheckboxGroup value={['a']}>
        <LhCheckbox value="a">A</LhCheckbox>
      </LhCheckboxGroup>,
    )
    expect(screen.getByRole('group')).toHaveClass('lh-checkbox-group')
  })

  it('受控切换：点选把值加入数组', () => {
    const onChange = vi.fn()
    render(
      <LhCheckboxGroup value={['a']} onChange={onChange}>
        <LhCheckbox value="a">A</LhCheckbox>
        <LhCheckbox value="b">B</LhCheckbox>
      </LhCheckboxGroup>,
    )
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'B' }))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('受控切换：取消勾选把值移出数组', () => {
    const onChange = vi.fn()
    render(
      <LhCheckboxGroup value={['a', 'b']} onChange={onChange}>
        <LhCheckbox value="a">A</LhCheckbox>
        <LhCheckbox value="b">B</LhCheckbox>
      </LhCheckboxGroup>,
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'A' }))
    expect(onChange).toHaveBeenCalledWith(['b'])
  })

  it('Group 禁用传导到子项', () => {
    render(
      <LhCheckboxGroup value={[]} disabled>
        <LhCheckbox value="a">A</LhCheckbox>
      </LhCheckboxGroup>,
    )
    expect(screen.getByRole('checkbox', { name: 'A' })).toBeDisabled()
  })

  it('Group name 透传到子项 input', () => {
    render(
      <LhCheckboxGroup value={[]} name="hobbies">
        <LhCheckbox value="a">A</LhCheckbox>
      </LhCheckboxGroup>,
    )
    expect(screen.getByRole('checkbox', { name: 'A' })).toHaveAttribute('name', 'hobbies')
  })
})
