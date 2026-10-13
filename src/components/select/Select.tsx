/**
 * Select 组件（薄渲染层）
 *
 * 渲染规则与 lh-ui-plus 的 select 模板一一对应：
 * div.lh-select > div.lh-select__trigger[role=combobox] + 下拉面板[role=listbox]
 *
 * 差异点（已登记到迁移指南）：
 * - 定位改用 useLhPopper（share/core/shared/popper 几何计算 + 溢出翻转），
 *   Vue 版手写 fixed 定位且无翻转；
 * - 下拉面板通过 createPortal 挂到 body，显隐由 useTransition 驱动
 *   （类名与 SCSS 的 lh-select-fade-* 完全一致）。
 */
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getSelectListboxAria, getSelectOptionAria } from '@lh-ui/share/core/select'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhClickOutside, useLhPopper, useTransition, useLhZIndex } from '../../hooks'
import { useLhSelect } from './use-select'
import { useLhLocale } from '../../locale'
import type { LhSelectInstance, LhSelectProps } from './types'

const TRANSITION_DURATION = 200

export const LhSelect = forwardRef<LhSelectInstance, LhSelectProps>((props, ref) => {
  const { size = 'medium', sx } = props
  const {
    options,
    isOpen,
    highlightedIndex,
    listboxId,
    selectedOption,
    clearable,
    disabled,
    ariaLabel,
    name,
    displayLabel,
    triggerAria,
    ariaInvalid,
    isSelected,
    getOptionId,
    toggle,
    selectOption,
    clear,
    open,
    handleKeydown,
    setHighlightedIndex,
    close,
  } = useLhSelect(props)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const { zIndex } = useLhZIndex()
  const { t } = useLhLocale()

  const { popperStyle } = useLhPopper({
    triggerRef: rootRef,
    popperRef: dropdownRef,
    visible: isOpen,
    placement: props.placement ?? 'bottom-start',
    gap: 4,
    // 下拉面板 teleport 到 body 后失去原容器宽度约束，需显式跟齐。
    // triggerRef 指向 .lh-select 根而非视觉触发器：teleport 前面板正是靠
    // left:0/right:0 贴齐根宽，这里复刻同一宽度基准
    matchTriggerWidth: true,
  })

  useLhClickOutside(() => [rootRef.current, dropdownRef.current], close)

  const { mounted, phase } = useTransition(isOpen, TRANSITION_DURATION)

  useImperativeHandle(
    ref,
    () => ({ open, close, toggle, clear, isOpen }),
    [open, close, toggle, clear, isOpen],
  )

  const dropdown = mounted ? (
    <div
      ref={dropdownRef}
      className={[
        'lh-select__dropdown',
        'lh-select__dropdown--teleported',
        `lh-select-fade-${phase}`,
      ].join(' ')}
      style={{ ...popperStyle, zIndex }}
      {...getSelectListboxAria(listboxId)}
      aria-activedescendant={
        highlightedIndex >= 0 ? getOptionId(highlightedIndex) : undefined
      }
    >
      {options.map((option, index) => {
        const aria = getSelectOptionAria({
          listboxId,
          index,
          selected: isSelected(option),
          disabled: option.disabled,
        })
        return (
          <button
            key={`${option.value}-${index}`}
            id={getOptionId(index)}
            className={[
              'lh-select__option',
              isSelected(option) && 'lh-select__option--selected',
              highlightedIndex === index && 'lh-select__option--highlighted',
              option.disabled && 'lh-select__option--disabled',
            ]
              .filter(Boolean)
              .join(' ')}
            type="button"
            disabled={option.disabled}
            onMouseEnter={() => setHighlightedIndex(index)}
            onClick={() => selectOption(option)}
            {...aria}
          >
            {option.label}
          </button>
        )
      })}
      {!options.length ? (
        <span className="lh-select__empty">{t('select.noData', '暂无数据')}</span>
      ) : null}
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      className={[
        'lh-select',
        `lh-select--${size}`,
        isOpen && 'lh-select--open',
        disabled && 'lh-select--disabled',
      ]
        .filter(Boolean)
        .join(' ')}
      style={sxToStyle(sx ?? {})}
    >
      <div
        className="lh-select__trigger"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        aria-invalid={ariaInvalid}
        aria-haspopup="listbox"
        onClick={toggle}
        onKeyDown={handleKeydown}
        {...triggerAria}
      >
        <span
          className={[
            'lh-select__value',
            !selectedOption && 'lh-select__value--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {displayLabel}
        </span>
        <span className="lh-select__actions">
          {clearable && selectedOption ? (
            <button
              type="button"
              className="lh-select__clear"
              aria-label={t('select.clear', '清除选择')}
              onClick={(e) => {
                e.stopPropagation()
                clear()
              }}
            >
              ×
            </button>
          ) : null}
          <span className="lh-select__arrow" aria-hidden="true">
            ⌄
          </span>
        </span>
      </div>

      {name ? (
        // 自定义控件无原生表单元素，用隐藏 input 承接 name 以支持原生表单提交
        <input
          type="hidden"
          name={name}
          value={selectedOption ? String(selectedOption.value) : ''}
          readOnly
        />
      ) : null}

      {typeof document !== 'undefined' ? createPortal(dropdown, document.body) : null}
    </div>
  )
})

LhSelect.displayName = 'LhSelect'
