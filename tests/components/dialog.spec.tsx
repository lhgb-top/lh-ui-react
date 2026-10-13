import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LhDialog } from '../../src/components/dialog'

describe('LhDialog', () => {
  it('open=false 时不渲染', () => {
    const { baseElement } = render(
      <LhDialog open={false} title="标题">
        正文
      </LhDialog>,
    )
    expect(baseElement.querySelector('.lh-dialog__container')).toBeNull()
  })

  it('open=true 时渲染 role=dialog 与标题/正文/底栏', async () => {
    const { baseElement } = render(
      <LhDialog open title="标题" footer={<button type="button">确定</button>}>
        正文
      </LhDialog>,
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveClass('lh-dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', '标题')
    expect(baseElement.querySelector('.lh-dialog__title')).toHaveTextContent('标题')
    expect(baseElement.querySelector('.lh-dialog__body')).toHaveTextContent('正文')
    expect(baseElement.querySelector('.lh-dialog__footer')).toHaveTextContent('确定')
  })

  it('容器挂载在 body（createPortal）', async () => {
    const { baseElement } = render(<LhDialog open>正文</LhDialog>)
    await screen.findByRole('dialog')
    // baseElement 就是 document.body
    expect(baseElement.querySelector('.lh-dialog__container')?.parentElement).toBe(document.body)
  })

  it('自定义 header 覆盖默认标题', async () => {
    const { baseElement } = render(
      <LhDialog open title="默认" header={<span className="custom-header">自定义</span>}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    expect(baseElement.querySelector('.custom-header')).toHaveTextContent('自定义')
    expect(baseElement.querySelector('.lh-dialog__title')).toBeNull()
  })

  it('showClose=false 时不渲染关闭按钮', async () => {
    const { baseElement } = render(
      <LhDialog open showClose={false}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    expect(baseElement.querySelector('.lh-dialog__close')).toBeNull()
  })

  it('点击关闭按钮触发 onClose', async () => {
    const onClose = vi.fn()
    const { baseElement } = render(
      <LhDialog open onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.click(baseElement.querySelector('.lh-dialog__close') as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closeOnClickModal=true 时点击遮罩触发 onClose', async () => {
    const onClose = vi.fn()
    const { baseElement } = render(
      <LhDialog open onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.click(baseElement.querySelector('.lh-dialog__overlay') as HTMLElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closeOnClickModal=false 时点击遮罩不关闭', async () => {
    const onClose = vi.fn()
    const { baseElement } = render(
      <LhDialog open closeOnClickModal={false} onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.click(baseElement.querySelector('.lh-dialog__overlay') as HTMLElement)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('Escape 触发 onClose', async () => {
    const onClose = vi.fn()
    render(
      <LhDialog open onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closeOnPressEscape=false 时 Escape 不关闭', async () => {
    const onClose = vi.fn()
    render(
      <LhDialog open closeOnPressEscape={false} onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('beforeClose 拦截：不调 done 则不触发 onClose', async () => {
    const onClose = vi.fn()
    render(
      <LhDialog
        open
        beforeClose={(done) => {
          // 拦截：不调 done
          void done
        }}
        onClose={onClose}
      >
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('beforeClose 调 done 后触发 onClose', async () => {
    const onClose = vi.fn()
    render(
      <LhDialog open beforeClose={(done) => done()} onClose={onClose}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'close' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('open 变化时 onOpen 触发，动画结束后 onOpened', async () => {
    const onOpen = vi.fn()
    const onOpened = vi.fn()
    const { rerender } = render(<LhDialog onOpen={onOpen} onOpened={onOpened}>正文</LhDialog>)
    rerender(<LhDialog open onOpen={onOpen} onOpened={onOpened}>正文</LhDialog>)
    expect(onOpen).toHaveBeenCalled()
    await waitFor(() => expect(onOpened).toHaveBeenCalled())
  })

  it('关闭动画结束后 onClosed 触发且 DOM 卸载', async () => {
    const onClosed = vi.fn()
    const { rerender, baseElement } = render(
      <LhDialog open onClosed={onClosed}>
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    rerender(<LhDialog open={false} onClosed={onClosed}>正文</LhDialog>)
    await waitFor(() => expect(onClosed).toHaveBeenCalled())
    expect(baseElement.querySelector('.lh-dialog__container')).toBeNull()
  })

  it('fullscreen / center 变体类名', async () => {
    const { baseElement } = render(
      <LhDialog open fullscreen center>
        正文
      </LhDialog>,
    )
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveClass('lh-dialog--fullscreen')
    expect(dialog).toHaveClass('lh-dialog--center')
    expect(baseElement.querySelector('.lh-dialog__wrapper')).toHaveClass('lh-dialog__wrapper--center')
  })

  it('position 变体类名', async () => {
    const { baseElement } = render(
      <LhDialog open position="top">
        正文
      </LhDialog>,
    )
    await screen.findByRole('dialog')
    expect(baseElement.querySelector('.lh-dialog__wrapper')).toHaveClass('lh-dialog__wrapper--top')
  })

  it('lockScroll 打开时锁定 body 滚动，关闭后还原', async () => {
    document.body.style.overflow = 'visible'
    const { rerender } = render(<LhDialog open>正文</LhDialog>)
    await screen.findByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<LhDialog open={false}>正文</LhDialog>)
    await waitFor(() => expect(document.body.style.overflow).toBe('visible'))
  })

  it('多弹层叠加时 Escape 只关栈顶', async () => {
    const onCloseBottom = vi.fn()
    const onCloseTop = vi.fn()
    render(
      <>
        <LhDialog open onClose={onCloseBottom}>
          底层
        </LhDialog>
        <LhDialog open onClose={onCloseTop}>
          顶层
        </LhDialog>
      </>,
    )
    await screen.findAllByRole('dialog')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCloseTop).toHaveBeenCalledOnce()
    expect(onCloseBottom).not.toHaveBeenCalled()
  })
})
