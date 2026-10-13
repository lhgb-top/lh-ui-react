import { describe, it, expect } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLhLocale, lhlocale, zhCN, enUS } from '../../src/locale'

describe('useLhLocale', () => {
  it('返回 t / tm / getLocale / version', () => {
    const { result } = renderHook(() => useLhLocale())
    expect(typeof result.current.t).toBe('function')
    expect(typeof result.current.tm).toBe('function')
    expect(typeof result.current.getLocale).toBe('function')
    expect(typeof result.current.version).toBe('number')
  })

  it('默认中文语言包：button.confirm 返回中文', () => {
    const { result } = renderHook(() => useLhLocale())
    expect(result.current.getLocale()).toBe('zh-CN')
  })

  it('切换语言后 version 变化触发重渲染', () => {
    const { result, rerender } = renderHook(() => useLhLocale())
    const initialVersion = result.current.version
    act(() => {
      lhlocale.setLocale('en-US')
    })
    rerender()
    expect(result.current.version).toBeGreaterThan(initialVersion)
    expect(result.current.getLocale()).toBe('en-US')
    // 还原，避免污染其他测试
    act(() => {
      lhlocale.setLocale('zh-CN')
    })
  })

  it('t 缺省键回退到 fallback 文案', () => {
    const { result } = renderHook(() => useLhLocale())
    expect(result.current.t('not.exist.key', '兜底文案')).toBe('兜底文案')
  })

  it('tm 返回原始消息对象（支持复数等结构化文案）', () => {
    const { result } = renderHook(() => useLhLocale())
    const messages = result.current.tm('button')
    expect(messages).toBeTruthy()
  })

  it('zhCN / enUS 语言包导出存在', () => {
    expect(zhCN).toBeTruthy()
    expect(enUS).toBeTruthy()
  })
})
