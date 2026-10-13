import { describe, it, expect, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  useControlled,
  useLhBreakpoint,
  useLhZIndex,
  useLhOverlayStack,
  useTransition,
  useLhClickOutside,
} from '../../src/hooks'

describe('useControlled', () => {
  it('受控模式：返回 value，setValue 触发 onChange', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlled({ value: 'a', onChange }))
    expect(result.current[0]).toBe('a')
    act(() => result.current[1]('b'))
    expect(onChange).toHaveBeenCalledWith('b')
    // 受控模式内部状态不变化（由外部 value 驱动）
    expect(result.current[0]).toBe('a')
  })

  it('非受控模式：defaultValue 起步，setValue 更新内部状态', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useControlled({ defaultValue: 'a', onChange }))
    expect(result.current[0]).toBe('a')
    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('b')
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('受控 + defaultValue 混用时开发态警告一次', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = renderHook(() =>
      useControlled({ value: 'a', defaultValue: 'b', onChange: () => {} }),
    )
    rerender()
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})

describe('useLhZIndex', () => {
  it('每次实例递增', () => {
    const a = renderHook(() => useLhZIndex())
    const b = renderHook(() => useLhZIndex())
    expect(b.result.current.zIndex).toBeGreaterThan(a.result.current.zIndex)
  })

  it('实例内 zIndex 稳定（不随渲染变化）', () => {
    const { result, rerender } = renderHook(() => useLhZIndex())
    const first = result.current.zIndex
    rerender()
    expect(result.current.zIndex).toBe(first)
  })
})

describe('useLhOverlayStack', () => {
  it('后注册的实例是栈顶', () => {
    const a = renderHook(() => useLhOverlayStack())
    const b = renderHook(() => useLhOverlayStack())
    act(() => {
      a.result.current.register()
      b.result.current.register()
    })
    expect(b.result.current.isTopmost()).toBe(true)
    expect(a.result.current.isTopmost()).toBe(false)
  })

  it('unregister 后前一个成为栈顶', () => {
    const a = renderHook(() => useLhOverlayStack())
    const b = renderHook(() => useLhOverlayStack())
    act(() => {
      a.result.current.register()
      b.result.current.register()
    })
    act(() => b.result.current.unregister())
    expect(a.result.current.isTopmost()).toBe(true)
  })
})

describe('useTransition', () => {
  it('visible=false 初始不挂载', () => {
    const { result } = renderHook(() => useTransition(false, 200))
    expect(result.current.mounted).toBe(false)
  })

  it('visible=true 且 appear=false 时初始即终态（无首次进入动画）', () => {
    const { result } = renderHook(() => useTransition(true, 200))
    expect(result.current.mounted).toBe(true)
    expect(result.current.phase).toBe('enter-to')
  })

  it('appear=true 时从 enter-from 起步', () => {
    const { result } = renderHook(() => useTransition(true, 200, true))
    expect(result.current.phase).toBe('enter-from')
  })

  it('visible 由 false 变 true：挂载并进入 enter-from', () => {
    const { result, rerender } = renderHook(({ visible }) => useTransition(visible, 200), {
      initialProps: { visible: false },
    })
    rerender({ visible: true })
    expect(result.current.mounted).toBe(true)
    expect(result.current.phase).toBe('enter-from')
  })

  it('visible 由 true 变 false：延迟 duration 后卸载', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ visible }) => useTransition(visible, 200), {
      initialProps: { visible: true },
    })
    rerender({ visible: false })
    expect(result.current.mounted).toBe(true)

    act(() => vi.advanceTimersByTime(200))
    expect(result.current.mounted).toBe(false)
    vi.useRealTimers()
  })

  it('显隐切换期间 phase 序列合法', async () => {
    const { result } = renderHook(() => useTransition(true, 200, true))
    // enter-from → enter-active 由双 rAF 推进
    await waitFor(() => expect(result.current.phase).toBe('enter-active'))
  })
})

describe('useLhClickOutside', () => {
  it('点击外部触发 handler', () => {
    const handler = vi.fn()
    const el = document.createElement('div')
    document.body.appendChild(el)
    renderHook(() =>
      useLhClickOutside(
        () => [el],
        handler,
      ),
    )
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(handler).toHaveBeenCalled()
    document.body.removeChild(el)
    document.body.removeChild(outside)
  })

  it('点击内部不触发 handler', () => {
    const handler = vi.fn()
    const el = document.createElement('div')
    document.body.appendChild(el)
    renderHook(() => useLhClickOutside(() => [el], handler))
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(handler).not.toHaveBeenCalled()
    document.body.removeChild(el)
  })
})

describe('useLhBreakpoint', () => {
  it('SSR / 无 matchMedia 环境降级为 xs', () => {
    const { result } = renderHook(() => useLhBreakpoint())
    expect(result.current.breakpoint).toBe('xs')
  })
})
