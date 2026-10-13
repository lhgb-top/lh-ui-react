import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhSelect } from '../../src/components/select'
import type { LhSelectOption } from '../../src/components/select'

const OPTIONS: LhSelectOption[] = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '樱桃', value: 'cherry', disabled: true },
]

describe('LhSelect', () => {
  it('渲染 combobox 触发器与占位文案', () => {
    render(<LhSelect options={OPTIONS} placeholder="挑水果" />)
    const trigger = screen.getByRole('combobox')
    expect(trigger).toHaveClass('lh-select__trigger')
    expect(trigger).toHaveTextContent('挑水果')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('占位文案缺省时走语言包兜底', () => {
    render(<LhSelect options={OPTIONS} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('请选择')
  })

  it('受控值命中选项时显示其 label', () => {
    render(<LhSelect options={OPTIONS} value="banana" />)
    expect(screen.getByRole('combobox')).toHaveTextContent('香蕉')
  })

  it('点击触发器展开 listbox 并标记 aria-expanded', async () => {
    render(<LhSelect options={OPTIONS} />)
    fireEvent.click(screen.getByRole('combobox'))
    const listbox = await screen.findByRole('listbox')
    expect(listbox).toHaveClass('lh-select__dropdown')
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    expect(listbox.querySelectorAll('.lh-select__option')).toHaveLength(3)
  })

  it('选项 role=option 且 aria-selected 标记选中态', async () => {
    render(<LhSelect options={OPTIONS} value="apple" />)
    fireEvent.click(screen.getByRole('combobox'))
    const options = await screen.findAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    expect(options[0]).toHaveClass('lh-select__option--selected')
  })

  it('禁用选项 aria-disabled 且不可选', async () => {
    const onChange = vi.fn()
    render(<LhSelect options={OPTIONS} onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox'))
    const disabled = await screen.findByRole('option', { name: '樱桃' })
    expect(disabled).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(disabled)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('点选选项触发 onChange（值 + 选项）并收起', async () => {
    const onChange = vi.fn()
    render(<LhSelect options={OPTIONS} onChange={onChange} />)
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: '香蕉' }))
    expect(onChange).toHaveBeenCalledWith('banana', { label: '香蕉', value: 'banana' })
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false'),
    )
  })

  it('方向键导航：高亮项同步到 aria-activedescendant', async () => {
    render(<LhSelect options={OPTIONS} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    const listbox = await screen.findByRole('listbox')
    const options = [...listbox.querySelectorAll('.lh-select__option')]
    const [firstId, secondId] = options.map((o) => o.id)

    // 展开时已高亮首项（与 plus 一致），ArrowDown 才移到第二项
    expect(trigger).toHaveAttribute('aria-activedescendant', firstId)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    expect(trigger).toHaveAttribute('aria-activedescendant', secondId)
  })

  it('Enter 选中当前高亮项', async () => {
    const onChange = vi.fn()
    render(<LhSelect options={OPTIONS} onChange={onChange} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    await screen.findByRole('listbox')
    // 展开时已高亮首项（apple），Enter 直接选中
    fireEvent.keyDown(trigger, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('apple', expect.objectContaining({ value: 'apple' }))
  })

  it('Escape 收起', async () => {
    render(<LhSelect options={OPTIONS} />)
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    await screen.findByRole('listbox')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false'),
    )
  })

  it('点击外部收起', async () => {
    render(
      <div>
        <LhSelect options={OPTIONS} />
        <button type="button">别处</button>
      </div>,
    )
    fireEvent.click(screen.getByRole('combobox'))
    await screen.findByRole('listbox')
    fireEvent.mouseDown(screen.getByRole('button', { name: '别处' }))
    await waitFor(() =>
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false'),
    )
  })

  it('clearable + 有选中值时渲染清除按钮', async () => {
    const onClear = vi.fn()
    render(<LhSelect options={OPTIONS} value="apple" clearable onClear={onClear} />)
    fireEvent.click(screen.getByRole('button', { name: '清除选择' }))
    expect(onClear).toHaveBeenCalledOnce()
  })

  it('空选项渲染暂无数据', async () => {
    render(<LhSelect options={[]} />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(await screen.findByText('暂无数据')).toHaveClass('lh-select__empty')
  })

  it('disabled 不展开', () => {
    render(<LhSelect options={OPTIONS} disabled />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('size 变体类名', () => {
    render(<LhSelect options={OPTIONS} size="large" />)
    expect(screen.getByRole('combobox').closest('.lh-select')).toHaveClass('lh-select--large')
  })
})
