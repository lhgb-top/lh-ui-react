/**
 * Empty 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 empty 模板一一对应：
 * - 自定义图片（image prop 或 children）走 lh-empty__image--custom 容器
 * - 否则渲染默认水墨内联插画（aria-hidden，主题变量着色）
 * - 根元素 role=status 温和播报；描述兜底语言包
 *
 * 注意：getEmptyClassNames 会在根上输出 lh-empty--custom-image 语义钩子，
 * 实际生效的尺寸约束在 image 包裹元素的 --custom 修饰符上，与 plus 逐字一致。
 */
import { forwardRef } from 'react'
import { useLhEmpty } from './use-empty'
import type { LhEmptyProps } from './types'

export const LhEmpty = forwardRef<HTMLDivElement, LhEmptyProps>((props, ref) => {
  const { children, image, actions } = props
  const { emptyClasses, sxStyle, hasImage, description } = useLhEmpty(props)

  return (
    <div ref={ref} className={emptyClasses.join(' ')} style={sxStyle} role="status">
      {hasImage ? (
        <div className="lh-empty__image lh-empty__image--custom">
          {children ?? (image ? <img src={image} alt="" /> : null)}
        </div>
      ) : (
        <div className="lh-empty__image" aria-hidden="true">
          <svg
            className="lh-empty__illustration"
            viewBox="0 0 96 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse className="lh-empty__ink-wash" cx="48" cy="58" rx="30" ry="6" />
            <rect x="24" y="22" width="48" height="32" rx="4" className="lh-empty__ink-frame" />
            <path d="M38 44 L48 30 L58 44" className="lh-empty__ink-mountain" />
            <circle cx="62" cy="30" r="4" className="lh-empty__ink-seal" />
          </svg>
        </div>
      )}

      <p className="lh-empty__description">{description}</p>

      {actions && <div className="lh-empty__actions">{actions}</div>}
    </div>
  )
})

LhEmpty.displayName = 'LhEmpty'
