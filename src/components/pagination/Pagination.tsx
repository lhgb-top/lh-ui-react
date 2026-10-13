/**
 * Pagination 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 pagination/index.vue 一一对应：
 * nav.lh-pagination > total / prev btn / pages 列表 / next btn / size select / jumper
 */
import { forwardRef } from 'react'
import { useLhPagination } from './use-pagination'
import type { LhPaginationProps } from './types'

export const LhPagination = forwardRef<HTMLElement, LhPaginationProps>((props, ref) => {
  const {
    current,
    pageCount,
    pageSize,
    range,
    pageSizes,
    go,
    handleSizeChange,
    jumpPage,
    setJumpPage,
    handleJump,
    handleJumpKeyDown,
    totalText,
    prevLabel,
    nextLabel,
    gotoLabel,
    pageSuffixText,
    sizeChangerLabel,
    sizeText,
    pageAria,
    showTotal,
    showSizeChanger,
    showJumper,
    simple,
    disabled,
    prevDisabled,
    nextDisabled,
    rootClasses,
    sxStyle,
  } = useLhPagination(props)

  return (
    <nav ref={ref} className={rootClasses} style={sxStyle} aria-label="pagination">
      {showTotal && <span className="lh-pagination__total">{totalText}</span>}

      <button
        type="button"
        className="lh-pagination__btn lh-pagination__btn--prev"
        disabled={prevDisabled}
        aria-label={prevLabel}
        onClick={() => go(current - 1)}
      >
        <span aria-hidden="true">‹</span>
      </button>

      {simple ? (
        <span className="lh-pagination__simple-text">
          {current} / {pageCount}
        </span>
      ) : (
        <ul className="lh-pagination__pages">
          {range.map((item, index) => (
            <li key={`${item.type}-${index}`} className="lh-pagination__cell">
              {item.type === 'page' ? (
                <button
                  type="button"
                  className={[
                    'lh-pagination__btn',
                    'lh-pagination__page',
                    item.page === current ? 'lh-pagination__page--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={disabled}
                  onClick={() => go(item.page)}
                  {...pageAria(item.page)}
                >
                  {item.page}
                </button>
              ) : (
                <span className="lh-pagination__ellipsis" aria-hidden="true">
                  •••
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="lh-pagination__btn lh-pagination__btn--next"
        disabled={nextDisabled}
        aria-label={nextLabel}
        onClick={() => go(current + 1)}
      >
        <span aria-hidden="true">›</span>
      </button>

      {showSizeChanger && (
        <label className="lh-pagination__size">
          <span className="lh-pagination__size-label">{sizeChangerLabel}</span>
          <select
            className="lh-pagination__size-select"
            value={String(pageSize)}
            disabled={disabled}
            aria-label={sizeChangerLabel}
            onChange={handleSizeChange}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {sizeText(size)}
              </option>
            ))}
          </select>
        </label>
      )}

      {showJumper && (
        <span className="lh-pagination__jumper">
          <label className="lh-pagination__jumper-label">{gotoLabel}</label>
          <input
            type="number"
            min={1}
            max={pageCount}
            className="lh-pagination__jumper-input"
            disabled={disabled}
            value={jumpPage ?? ''}
            onChange={(e) => setJumpPage(e.target.value === '' ? null : Number(e.target.value))}
            onKeyDown={handleJumpKeyDown}
            onBlur={handleJump}
          />
          {pageSuffixText && (
            <span className="lh-pagination__jumper-suffix">{pageSuffixText}</span>
          )}
        </span>
      )}
    </nav>
  )
})

LhPagination.displayName = 'LhPagination'
