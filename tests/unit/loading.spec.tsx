import { describe, it, expect, afterEach } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { loading } from '../../src/imperative'

describe('loading 命令式服务', () => {
  afterEach(() => {
    loading.closeAll()
  })

  it('show() 渲染全屏遮罩与默认文案（语言包兜底）', async () => {
    loading.show()
    const mask = await screen.findByRole('status')
    expect(mask).toHaveClass('lh-loading', 'lh-loading--fullscreen', 'lh-loading--with-text')
    expect(mask).toHaveAttribute('aria-busy', 'true')
    expect(mask).toHaveTextContent('加载中…')
  })

  it('自定义文案与背景色', async () => {
    loading.show({ text: '上传中…', background: 'rgba(0,0,0,0.5)' })
    const mask = await screen.findByRole('status')
    expect(mask).toHaveTextContent('上传中…')
    expect(mask.style.backgroundColor.replace(/\s/g, '')).toBe('rgba(0,0,0,0.5)')
  })

  it('遮罩内含旋转图标（复用 button spinner 画法）', async () => {
    loading.show()
    const mask = await screen.findByRole('status')
    expect(mask.querySelector('.lh-button__spinner')).not.toBeNull()
  })

  it('挂到指定目标元素（非全屏，遮罩限位在目标内）', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    try {
      loading.show({ target })
      await waitFor(() => {
        expect(target.querySelector('.lh-loading')).not.toBeNull()
      })
      const mask = target.querySelector('.lh-loading') as HTMLElement
      // 局部遮罩不带 --fullscreen（fixed 定位）
      expect(mask).not.toHaveClass('lh-loading--fullscreen')
    } finally {
      target.remove()
    }
  })

  it('lock=true 时锁定目标滚动（overflow hidden）', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    try {
      const handle = loading.show({ target, lock: true })
      await waitFor(() => expect(target.querySelector('.lh-loading')).not.toBeNull())
      expect(target.style.overflow).toBe('hidden')
      act(() => handle.close())
      await waitFor(() => expect(target.querySelector('.lh-loading')).toBeNull())
      expect(target.style.overflow).toBe('')
    } finally {
      target.remove()
    }
  })

  it('非全屏遮罩对目标设 inert 冻结交互', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    try {
      const handle = loading.show({ target })
      await waitFor(() => expect(target.querySelector('.lh-loading')).not.toBeNull())
      expect(target.hasAttribute('inert')).toBe(true)
      act(() => handle.close())
      await waitFor(() => expect(target.querySelector('.lh-loading')).toBeNull())
      expect(target.hasAttribute('inert')).toBe(false)
    } finally {
      target.remove()
    }
  })

  it('static 定位的目标被补 position: relative，关闭后还原', async () => {
    const target = document.createElement('div')
    target.style.position = 'static'
    document.body.appendChild(target)
    try {
      const handle = loading.show({ target })
      await waitFor(() => expect(target.querySelector('.lh-loading')).not.toBeNull())
      expect(target.style.position).toBe('relative')
      act(() => handle.close())
      await waitFor(() => expect(target.querySelector('.lh-loading')).toBeNull())
      expect(target.style.position).toBe('static')
    } finally {
      target.remove()
    }
  })

  it('close() 先挂 --leaving 退场类再卸载', async () => {
    const handle = loading.show()
    const mask = await screen.findByRole('status')
    act(() => handle.close())
    // 立即进入退场类（动画 200ms 后才真正卸载）
    expect(mask).toHaveClass('lh-loading--leaving')
    await waitFor(() => {
      expect(document.querySelector('.lh-loading')).toBeNull()
    })
  })

  it('同一目标重复 show 先卸载旧实例（不叠加）', async () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    try {
      loading.show({ target })
      loading.show({ target })
      await waitFor(() => expect(target.querySelectorAll('.lh-loading').length).toBe(1))
    } finally {
      target.remove()
    }
  })

  it('closeAll() 清空全部活动实例', async () => {
    loading.show({ text: '甲' })
    const target = document.createElement('div')
    document.body.appendChild(target)
    try {
      loading.show({ target, text: '乙' })
      await screen.findByText('甲')
      await waitFor(() => expect(target.querySelector('.lh-loading')).not.toBeNull())
      act(() => loading.closeAll())
      await waitFor(() => {
        expect(screen.queryByText('甲')).toBeNull()
        expect(target.querySelector('.lh-loading')).toBeNull()
      })
    } finally {
      target.remove()
    }
  })
})
