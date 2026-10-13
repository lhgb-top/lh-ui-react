/**
 * Card 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 card 模板一一对应：
 * - interactive 时根元素承担 button 语义（role/tabIndex/键盘激活）
 * - loading 时正文区换成三条骨架占位线，整卡 pointer-events 由 SCSS 禁用
 * - header 未传但传了 title 时渲染默认头部
 */
import { forwardRef } from 'react'
import { useLhCard } from './use-card'
import type { LhCardProps } from './types'

export const LhCard = forwardRef<HTMLDivElement, LhCardProps>((props, ref) => {
  const { children, title, cover, header, extra, footer, loading } = props
  const { cardClasses, cardStyle, interactive, handleClick, handleKeydown } = useLhCard(props)

  const showHeader = !!header || !!title

  return (
    <div
      ref={ref}
      className={cardClasses.join(' ')}
      style={cardStyle}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-busy={loading ? true : undefined}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeydown : undefined}
    >
      {cover && <div className="lh-card__cover">{cover}</div>}

      {showHeader && (
        <div className="lh-card__header">
          {header ?? <span className="lh-card__title">{title}</span>}
          {extra && <span className="lh-card__extra">{extra}</span>}
        </div>
      )}

      <div className="lh-card__body">
        {loading ? (
          <div className="lh-card__loading" aria-hidden="true">
            <div className="lh-card__loading-line lh-card__loading-line--wide" />
            <div className="lh-card__loading-line" />
            <div className="lh-card__loading-line lh-card__loading-line--narrow" />
          </div>
        ) : (
          children
        )}
      </div>

      {footer && <div className="lh-card__footer">{footer}</div>}
    </div>
  )
})

LhCard.displayName = 'LhCard'
