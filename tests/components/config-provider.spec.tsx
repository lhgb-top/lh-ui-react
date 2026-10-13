import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LhConfigProvider, useLhConfigContext } from '../../src/components/config-provider'

function Probe() {
  const ctx = useLhConfigContext()
  return <span data-testid="probe">{`${ctx.size ?? 'none'}|${ctx.locale ?? 'none'}`}</span>
}

describe('LhConfigProvider', () => {
  it('渲染包裹元素与子节点', () => {
    render(
      <LhConfigProvider>
        <span data-testid="child">子节点</span>
      </LhConfigProvider>,
    )
    const wrapper = screen.getByTestId('child').parentElement
    expect(wrapper).toHaveClass('lh-config-provider')
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('size / locale 下发到消费组件', () => {
    render(
      <LhConfigProvider size="large" locale="en-US">
        <Probe />
      </LhConfigProvider>,
    )
    expect(screen.getByTestId('probe')).toHaveTextContent('large|en-US')
  })

  it('未包裹 Provider 时消费侧返回兜底值（不报错）', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe')).toHaveTextContent('none|none')
  })

  it('themeVars 转为 CSS 变量挂到包裹元素', () => {
    render(
      <LhConfigProvider themeVars={{ 'primary-color': '#1677ff' }}>
        <span>子</span>
      </LhConfigProvider>,
    )
    const wrapper = screen.getByText('子').parentElement as HTMLElement
    expect(wrapper.style.getPropertyValue('--lh-primary-color')).toBe('#1677ff')
  })

  it('themeVars 变化时 CSS 变量更新', () => {
    const { rerender } = render(
      <LhConfigProvider themeVars={{ 'primary-color': '#1677ff' }}>
        <span>子</span>
      </LhConfigProvider>,
    )
    const wrapper = screen.getByText('子').parentElement as HTMLElement
    expect(wrapper.style.getPropertyValue('--lh-primary-color')).toBe('#1677ff')

    rerender(
      <LhConfigProvider themeVars={{ 'primary-color': '#0f0' }}>
        <span>子</span>
      </LhConfigProvider>,
    )
    expect(wrapper.style.getPropertyValue('--lh-primary-color')).toBe('#0f0')
  })

  it('locale 变化时同步全局 locale 单例', async () => {
    const { lhlocale } = await import('../../src/locale')
    const setLocale = vi.spyOn(lhlocale, 'setLocale').mockImplementation(() => {})
    render(
      <LhConfigProvider locale="en-US">
        <span>子</span>
      </LhConfigProvider>,
    )
    expect(setLocale).toHaveBeenCalledWith('en-US')
    setLocale.mockRestore()
  })

  it('componentTheme 下发到消费组件', () => {
    const ProbeTheme = () => {
      const ctx = useLhConfigContext()
      return (
        <span data-testid="probe-theme">
          {ctx.componentTheme?.button?.['primary-color'] ?? 'none'}
        </span>
      )
    }
    render(
      <LhConfigProvider componentTheme={{ button: { 'primary-color': '#abc' } }}>
        <ProbeTheme />
      </LhConfigProvider>,
    )
    expect(screen.getByTestId('probe-theme')).toHaveTextContent('#abc')
  })
})
