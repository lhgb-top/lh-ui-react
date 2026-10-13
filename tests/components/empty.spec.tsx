import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LhEmpty } from '@/components/empty'

describe('LhEmpty', () => {
  it('渲染默认水墨插画与语言包兜底描述', () => {
    const { container } = render(<LhEmpty />)
    const empty = container.querySelector('.lh-empty')
    expect(empty?.getAttribute('role')).toBe('status')
    expect(container.querySelector('.lh-empty__illustration')).not.toBeNull()
    expect(container.querySelector('.lh-empty__description')).toHaveTextContent('暂无数据')
  })

  it('description prop 覆盖语言包默认文案', () => {
    render(<LhEmpty description="自定义空态" />)
    expect(screen.getByText('自定义空态')).toBeInTheDocument()
  })

  it('image prop 走自定义图容器', () => {
    const { container } = render(<LhEmpty image="/empty.png" />)
    const imageWrap = container.querySelector('.lh-empty__image')
    expect(imageWrap?.className).toContain('lh-empty__image--custom')
    expect(imageWrap?.querySelector('img')).toHaveAttribute('src', '/empty.png')
    expect(container.querySelector('.lh-empty__illustration')).toBeNull()
  })

  it('children 作为自定义图片区（替代 image prop）', () => {
    const { container } = render(
      <LhEmpty>
        <div data-testid="custom-img">插画</div>
      </LhEmpty>,
    )
    const imageWrap = container.querySelector('.lh-empty__image')
    expect(imageWrap?.className).toContain('lh-empty__image--custom')
    expect(screen.getByTestId('custom-img')).toBeInTheDocument()
  })

  it('actions 渲染动作区', () => {
    render(
      <LhEmpty description="出错啦" actions={<button type="button">重试</button>} />,
    )
    const empty = screen.getByText('出错啦').closest('.lh-empty')
    expect(empty?.querySelector('.lh-empty__actions')).not.toBeNull()
    expect(screen.getByText('重试')).toBeInTheDocument()
  })

  it('无 actions 时不渲染动作区', () => {
    const { container } = render(<LhEmpty />)
    expect(container.querySelector('.lh-empty__actions')).toBeNull()
  })
})
