import { describe, it, expect, afterEach, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { notification, destroyContainer } from '../../src/imperative'

describe('notification 命令式服务', () => {
  afterEach(() => {
    destroyContainer()
  })

  it('对象式：渲染标题与正文（role=status 语义）', async () => {
    notification.info({ title: '系统通知', content: '作品审核已通过' })
    const item = await screen.findByText('系统通知')
    expect(item.closest('.lh-notification__item')).not.toBeNull()
    expect(screen.getByText('作品审核已通过')).toBeInTheDocument()
    expect(item.closest('.lh-notification')).toHaveClass('lh-notification--top-right')
  })

  it('字符串简写：仅渲染标题行（不重复正文）', async () => {
    notification.success('保存成功')
    const item = await screen.findByText('保存成功')
    expect(item.className).toContain('lh-notification__title')
    expect(item.closest('.lh-notification__item')?.querySelector('.lh-notification__content'))
      .toBeNull()
  })

  it('type 变体类名与图标', async () => {
    notification.error('出错了')
    const item = (await screen.findByText('出错了')).closest('.lh-notification__item')
    expect(item).toHaveClass('lh-notification__item--error')
    expect(item?.querySelector('.lh-icon--error')).not.toBeNull()
  })

  it('position 映射到对应角容器', async () => {
    notification.info({ title: '左下角', position: 'bottom-left' })
    const item = await screen.findByText('左下角')
    expect(item.closest('.lh-notification')).toHaveClass('lh-notification--bottom-left')
  })

  it('不同位置的条目分组到各自容器', async () => {
    notification.info('右上')
    notification.info({ title: '左上', position: 'top-left' })
    await screen.findByText('右上')
    await screen.findByText('左上')
    expect(document.querySelectorAll('.lh-notification--top-right')).toHaveLength(1)
    expect(document.querySelectorAll('.lh-notification--top-left')).toHaveLength(1)
  })

  it('句柄 close() 经退场动画后只移除自己', async () => {
    const first = notification.info('甲')
    notification.info('乙')
    await screen.findByText('甲')
    await screen.findByText('乙')
    act(() => first.close())
    await waitFor(() => {
      expect(screen.queryByText('甲')).toBeNull()
    })
    expect(screen.getByText('乙')).toBeInTheDocument()
  })

  it('closeAll() 清空全部并触发 onClose', async () => {
    const onClose = vi.fn()
    notification.info({ title: '甲', onClose })
    notification.info({ title: '乙', onClose })
    await screen.findByText('甲')
    await screen.findByText('乙')
    act(() => notification.closeAll())
    await waitFor(() => {
      expect(screen.queryByText('甲')).toBeNull()
      expect(screen.queryByText('乙')).toBeNull()
    })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('duration 到期自动移除', async () => {
    notification.warning({ title: '延时通知', duration: 100 })
    expect(await screen.findByText('延时通知')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('延时通知')).toBeNull()
    })
  })

  it('duration=0 时不自动移除', async () => {
    notification.info({ title: '常驻通知', duration: 0 })
    expect(await screen.findByText('常驻通知')).toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    })
    expect(screen.getByText('常驻通知')).toBeInTheDocument()
  })

  it('showClose 渲染关闭按钮且点击后移除', async () => {
    notification.info('可关闭')
    const item = (await screen.findByText('可关闭')).closest('.lh-notification__item')
    const closeBtn = item?.querySelector('.lh-notification__close') as HTMLButtonElement
    expect(closeBtn).not.toBeNull()
    act(() => closeBtn.click())
    await waitFor(() => {
      expect(screen.queryByText('可关闭')).toBeNull()
    })
  })

  it('warning / danger 渲染为 role=alert（立即播报）', async () => {
    notification.warning('警告')
    notification.danger('危险')
    const warn = (await screen.findByText('警告')).closest('.lh-notification__item')
    const danger = screen.getByText('危险').closest('.lh-notification__item')
    expect(warn).toHaveAttribute('role', 'alert')
    expect(danger).toHaveAttribute('role', 'alert')
  })

  it('info / success 渲染为 role=status（排队播报）', async () => {
    notification.info('信息')
    const item = (await screen.findByText('信息')).closest('.lh-notification__item')
    expect(item).toHaveAttribute('role', 'status')
  })

  it('onClick 使卡片可点击并响应点击', async () => {
    const onClick = vi.fn()
    notification.info({ title: '可点击', onClick })
    const item = await screen.findByText('可点击')
    expect(item.closest('.lh-notification__item')).toHaveClass('lh-notification__item--clickable')
    act(() => (item.closest('.lh-notification__item') as HTMLElement).click())
    expect(onClick).toHaveBeenCalledOnce()
  })
})
