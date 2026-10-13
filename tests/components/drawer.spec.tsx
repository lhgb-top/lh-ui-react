import { describe, it, expect, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhDrawer } from '../../src/components/drawer'

function Drawer({ open = true, ...rest }: ComponentProps<typeof LhDrawer>) {
  return (
    <LhDrawer open={open} {...rest}>
      抽屉内容
    </LhDrawer>
  )
}

describe('LhDrawer', () => {
  it('open=false 时不渲染', () => {
    render(<Drawer open={false} title="标题" />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('open 渲染遮罩 + 面板（role=dialog / aria-modal）与标题、内容', () => {
    render(<Drawer title="标题" />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('标题')
    expect(dialog).toHaveTextContent('抽屉内容')
    expect(document.querySelector('.lh-drawer__mask')).not.toBeNull()
  })

  it('默认右抽屉：面板类名 lh-drawer__panel--right，宽度走 size', () => {
    render(<Drawer title="标题" size="40%" />)
    const panel = screen.getByRole('dialog')
    expect(panel.className).toContain('lh-drawer__panel--right')
    expect(panel.style.width).toBe('40%')
  })

  it('方向决定尺寸落到 width 还是 height', () => {
    const { rerender } = render(<Drawer title="标题" direction="left" size={200} />)
    let panel = screen.getByRole('dialog')
    expect(panel.className).toContain('lh-drawer__panel--left')
    expect(panel.style.width).toBe('200px')
    rerender(<Drawer title="标题" direction="top" size="20vh" />)
    panel = screen.getByRole('dialog')
    expect(panel.className).toContain('lh-drawer__panel--top')
    expect(panel.style.height).toBe('20vh')
    rerender(<Drawer title="标题" direction="bottom" />)
    panel = screen.getByRole('dialog')
    expect(panel.className).toContain('lh-drawer__panel--bottom')
    // 未传 size 落 core 默认值 30%（上下方向作用于 height）
    expect(panel.style.height).toBe('30%')
  })

  it('默认遮罩不可点穿（maskClosable=false）', () => {
    const onClose = vi.fn()
    render(<Drawer title="标题" onClose={onClose} />)
    fireEvent.click(document.querySelector('.lh-drawer__mask') as HTMLElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('maskClosable 时点遮罩触发 onClose', () => {
    const onClose = vi.fn()
    render(<Drawer title="标题" maskClosable onClose={onClose} />)
    fireEvent.click(document.querySelector('.lh-drawer__mask') as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closeOnEsc=false 时 Esc 不关闭', () => {
    const onClose = vi.fn()
    render(<Drawer title="标题" closeOnEsc={false} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Esc 触发 onClose', () => {
    const onClose = vi.fn()
    render(<Drawer title="标题" onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('showClose=false 时不渲染关闭按钮', () => {
    render(<Drawer title="标题" showClose={false} />)
    expect(screen.queryByRole('button', { name: '关闭抽屉' })).toBeNull()
  })

  it('点击关闭按钮触发 onClose', () => {
    const onClose = vi.fn()
    render(<Drawer title="标题" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('beforeClose 拦截，调 done 才继续关闭', () => {
    const onClose = vi.fn()
    // 不调 done：关闭流程被挂起
    const beforeClose = vi.fn((_done: () => void) => {
      // no-op
    })
    render(<Drawer title="标题" beforeClose={beforeClose} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))
    expect(beforeClose).toHaveBeenCalledTimes(1)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('beforeClose 调 done 后真正关闭', () => {
    const onClose = vi.fn()
    render(
      <Drawer
        title="标题"
        beforeClose={(done) => done()}
        onClose={onClose}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: '关闭抽屉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('lockScroll 打开时锁定 body 滚动，关闭后还原', async () => {
    document.body.style.overflow = ''
    const { rerender } = render(<Drawer title="标题" lockScroll />)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Drawer open={false} title="标题" lockScroll />)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.body.style.overflow).toBe('')
  })

  it('lockScroll=false 时不锁定 body 滚动', () => {
    document.body.style.overflow = ''
    render(<Drawer title="标题" lockScroll={false} />)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('自定义 header / footer 覆盖默认头部', () => {
    render(
      <Drawer
        title="标题"
        header={<div className="custom-header">自定义头部</div>}
        footer={<div className="custom-footer">自定义底部</div>}
      />,
    )
    expect(screen.getByText('自定义头部')).toBeInTheDocument()
    expect(screen.getByText('自定义底部')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).not.toHaveTextContent('标题')
  })

  it('主题变量写入面板内联样式', () => {
    render(<Drawer title="标题" themeVars={{ '--lh-drawer-bg-color': '#fff' }} />)
    expect(screen.getByRole('dialog').style.getPropertyValue('--lh-drawer-bg-color')).toBe('#fff')
  })
})
