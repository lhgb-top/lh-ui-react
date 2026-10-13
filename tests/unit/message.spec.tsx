import { describe, it, expect, afterEach } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { message, destroyContainer } from '../../src/imperative'

describe('message 命令式服务', () => {
  afterEach(() => {
    destroyContainer()
  })

  it('调用后渲染消息元素（role=status 语义）', async () => {
    message.success('操作成功')
    expect(await screen.findByText('操作成功')).toBeInTheDocument()
    expect(screen.getByText('操作成功').closest('.lh-message__item')).not.toBeNull()
  })

  it('type 变体类名', async () => {
    message.error('出错了')
    const item = await screen.findByText('出错了')
    expect(item.closest('.lh-message__item')).toHaveClass('lh-message__item--error')
  })

  it('close() 立即移除', async () => {
    const instance = message.info('提示')
    await screen.findByText('提示')
    act(() => instance.close())
    expect(screen.queryByText('提示')).toBeNull()
  })

  it('duration 到期自动移除', async () => {
    // 用真定时器：React 18 的重渲染走 MessageChannel，假定时器管不到它
    message.warning('延时提示', { duration: 100 })
    expect(await screen.findByText('延时提示')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByText('延时提示')).toBeNull()
    })
  })

  it('duration=0 时不自动移除', async () => {
    message.info('常驻提示', { duration: 0 })
    expect(await screen.findByText('常驻提示')).toBeInTheDocument()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 300))
    })
    expect(screen.getByText('常驻提示')).toBeInTheDocument()
  })

  it('多条消息堆叠渲染', async () => {
    message.info('第一条')
    message.info('第二条')
    await screen.findByText('第一条')
    await screen.findByText('第二条')
    expect(screen.getAllByText(/条/)).toHaveLength(2)
  })

  it('showClose 时渲染关闭按钮', async () => {
    message.info('可关闭', { showClose: true })
    const item = (await screen.findByText('可关闭')).closest('.lh-message__item')
    expect(item?.querySelector('.lh-message__close')).not.toBeNull()
  })

  it('loading 渲染加载图标', async () => {
    message.loading('加载中')
    const item = (await screen.findByText('加载中')).closest('.lh-message__item')
    expect(item?.querySelector('.lh-icon--loading')).not.toBeNull()
  })
})
