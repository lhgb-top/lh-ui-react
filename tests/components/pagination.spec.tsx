import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LhPagination } from '@/components/pagination'

describe('LhPagination', () => {
  it('渲染 nav.lh-pagination 与页码区间', () => {
    const { container } = render(<LhPagination total={30} pageSize={10} />)
    expect(container.querySelector('nav.lh-pagination')).not.toBeNull()
    expect(container.querySelector('.lh-pagination__pages')).not.toBeNull()
    // 30 条 / 10 条 = 3 页，无省略号
    expect(container.querySelectorAll('.lh-pagination__page')).toHaveLength(3)
  })

  it('页数不足时的最小页数为 1', () => {
    const { container } = render(<LhPagination total={0} />)
    expect(container.querySelectorAll('.lh-pagination__page')).toHaveLength(1)
  })

  it('页数过多时出现省略号', () => {
    const { container } = render(<LhPagination total={100} pageSize={10} />)
    expect(container.querySelectorAll('.lh-pagination__ellipsis')).not.toHaveLength(0)
  })

  it('点击页码触发 onChange', () => {
    const onChange = vi.fn()
    const { container } = render(<LhPagination total={30} pageSize={10} onChange={onChange} />)
    fireEvent.click(container.querySelectorAll('.lh-pagination__page')[2]!)
    expect(onChange).toHaveBeenCalledWith(3, 10)
  })

  it('受控模式：current 决定激活页且内部不改写', () => {
    const { container, rerender } = render(<LhPagination total={30} pageSize={10} current={2} />)
    expect(container.querySelector('.lh-pagination__page--active')).toHaveTextContent('2')
    rerender(<LhPagination total={30} pageSize={10} current={3} />)
    expect(container.querySelector('.lh-pagination__page--active')).toHaveTextContent('3')
  })

  it('非受控模式：defaultCurrent 生效，点击切换', () => {
    const { container } = render(<LhPagination total={30} pageSize={10} defaultCurrent={2} />)
    expect(container.querySelector('.lh-pagination__page--active')).toHaveTextContent('2')
    fireEvent.click(container.querySelectorAll('.lh-pagination__page')[0]!)
    expect(container.querySelector('.lh-pagination__page--active')).toHaveTextContent('1')
  })

  it('上一页 / 下一页按钮的禁用边界', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhPagination total={30} pageSize={10} defaultCurrent={1} onChange={onChange} />,
    )
    const prev = container.querySelector<HTMLButtonElement>('.lh-pagination__btn--prev')
    const next = container.querySelector<HTMLButtonElement>('.lh-pagination__btn--next')
    expect(prev?.disabled).toBe(true)
    expect(next?.disabled).toBe(false)
    fireEvent.click(next!)
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('末页时下一页禁用', () => {
    const { container } = render(<LhPagination total={30} pageSize={10} defaultCurrent={3} />)
    const next = container.querySelector<HTMLButtonElement>('.lh-pagination__btn--next')
    expect(next?.disabled).toBe(true)
  })

  it('disabled 禁用全部交互', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhPagination total={30} pageSize={10} disabled onChange={onChange} />,
    )
    expect(container.querySelector('.lh-pagination')?.className).toContain(
      'lh-pagination--disabled',
    )
    fireEvent.click(container.querySelectorAll('.lh-pagination__page')[1]!)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('showTotal 渲染总条数文案', () => {
    render(<LhPagination total={42} showTotal />)
    expect(screen.getByText('共 42 条')).toBeInTheDocument()
  })

  it('showSizeChanger 渲染条数选择器并触发 onSizeChange', () => {
    const onSizeChange = vi.fn()
    const onChange = vi.fn()
    const { container } = render(
      <LhPagination
        total={100}
        pageSize={10}
        pageSizes={[10, 20]}
        showSizeChanger
        onSizeChange={onSizeChange}
        onChange={onChange}
      />,
    )
    const select = container.querySelector('.lh-pagination__size-select') as HTMLSelectElement
    expect(select).not.toBeNull()
    fireEvent.change(select, { target: { value: '20' } })
    expect(onSizeChange).toHaveBeenCalledWith(20)
    // 100/20 = 5 页，原 current=1 未越界，不触发 onChange
    expect(onChange).not.toHaveBeenCalled()
  })

  it('条数变化导致 current 越界时钳制并通知', () => {
    const onChange = vi.fn()
    const { container } = render(
      <LhPagination
        total={30}
        pageSize={10}
        pageSizes={[10, 50]}
        defaultCurrent={3}
        showSizeChanger
        onChange={onChange}
      />,
    )
    const select = container.querySelector('.lh-pagination__size-select') as HTMLSelectElement
    fireEvent.change(select, { target: { value: '50' } })
    // 30/50 = 1 页，current 3 被钳到 1
    expect(onChange).toHaveBeenCalledWith(1, 50)
  })

  it('showJumper 跳页：回车提交', () => {
    const onChange = vi.fn()
    const { container } = render(<LhPagination total={100} pageSize={10} showJumper onChange={onChange} />)
    const input = container.querySelector('.lh-pagination__jumper-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(5, 10)
    // 提交后输入框清空
    expect(input.value).toBe('')
  })

  it('跳页失焦也提交', () => {
    const onChange = vi.fn()
    const { container } = render(<LhPagination total={100} pageSize={10} showJumper onChange={onChange} />)
    const input = container.querySelector('.lh-pagination__jumper-input') as HTMLInputElement
    fireEvent.change(input, { target: { value: '2' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('simple 模式渲染 x/y 文本且无页码列表', () => {
    const { container } = render(<LhPagination total={30} pageSize={10} defaultCurrent={2} simple />)
    expect(container.querySelector('.lh-pagination__simple-text')).toHaveTextContent('2 / 3')
    expect(container.querySelector('.lh-pagination__pages')).toBeNull()
  })

  it('simple 模式仍可翻页', () => {
    const onChange = vi.fn()
    const { container } = render(<LhPagination total={30} pageSize={10} simple onChange={onChange} />)
    const next = container.querySelector<HTMLButtonElement>('.lh-pagination__btn--next')
    fireEvent.click(next!)
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('页码按钮带 aria-current 与 aria-label', () => {
    const { container } = render(<LhPagination total={30} pageSize={10} defaultCurrent={1} />)
    const active = container.querySelector('.lh-pagination__page--active')!
    expect(active).toHaveAttribute('aria-current', 'page')
    expect(active).toHaveAttribute('aria-label', '第 1 页')
  })
})
