import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhPopconfirm } from '../../src/components/popconfirm'

describe('LhPopconfirm', () => {
  it('渲染触发器，默认隐藏气泡', () => {
    render(
      <LhPopconfirm title="确定删除吗？">
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    expect(screen.getByRole('button', { name: '删除' })).toBeInTheDocument()
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('点击触发后弹出 role=alertdialog，含标题与确认 / 取消按钮', async () => {
    render(
      <LhPopconfirm title="确定删除吗？">
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveClass('lh-popconfirm__popper')
    expect(dialog).toHaveTextContent('确定删除吗？')
    expect(dialog.querySelector('.lh-popconfirm__icon')).not.toBeNull()
    expect(dialog).toHaveTextContent('确定')
    expect(dialog).toHaveTextContent('取消')
  })

  it('确认按钮触发 onConfirm 并关闭', async () => {
    const onConfirm = vi.fn()
    render(
      <LhPopconfirm title="确定删除吗？" onConfirm={onConfirm}>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    await screen.findByRole('alertdialog')
    fireEvent.click(screen.getByRole('button', { name: '确定' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('取消按钮触发 onCancel 并关闭', async () => {
    const onCancel = vi.fn()
    render(
      <LhPopconfirm title="确定删除吗？" onCancel={onCancel}>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    await screen.findByRole('alertdialog')
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('hideCancel 时只渲染确认按钮', async () => {
    render(
      <LhPopconfirm title="确定删除吗？" hideCancel>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).not.toHaveTextContent('取消')
    expect(dialog).toHaveTextContent('确定')
  })

  it('自定义确认 / 取消文案', async () => {
    render(
      <LhPopconfirm title="标题" confirmText="Yes" cancelText="No">
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('Yes')
    expect(dialog).toHaveTextContent('No')
  })

  it('type 变体体现在浮层类名与图标类名', async () => {
    render(
      <LhPopconfirm title="标题" type="danger">
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog.className).toContain('lh-popconfirm__popper--danger')
    expect(dialog.querySelector('.lh-popconfirm__icon')).not.toBeNull()
  })

  it('showIcon=false 时不渲染图标', async () => {
    render(
      <LhPopconfirm title="标题" showIcon={false}>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog.querySelector('.lh-popconfirm__icon')).toBeNull()
  })

  it('Escape 关闭并触发 onCancel', async () => {
    const onCancel = vi.fn()
    render(
      <LhPopconfirm title="标题" onCancel={onCancel}>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    await screen.findByRole('alertdialog')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
  })

  it('disabled 时点击不弹出', () => {
    render(
      <LhPopconfirm title="标题" disabled>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    fireEvent.click(screen.getByRole('button', { name: '删除' }))
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('受控模式：visible 驱动显隐', async () => {
    const { rerender } = render(
      <LhPopconfirm title="标题" visible={false}>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    expect(screen.queryByRole('alertdialog')).toBeNull()
    rerender(
      <LhPopconfirm title="标题" visible>
        <button type="button">删除</button>
      </LhPopconfirm>,
    )
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
  })
})
