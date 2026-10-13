/**
 * FormItem 组件（薄渲染层）
 *
 * 对应 plus 的 packages/components/form/src/item.vue：
 * 标签 + 内容区 + 错误提示（role=alert），失焦离开时触发校验。
 *
 * 点击标签聚焦内容区第一个可聚焦元素（slot 内控件 id 无法静态得知，
 * label 的 for 关联不适用，退而求其次）。
 */
import { forwardRef, useImperativeHandle, useRef } from 'react'
import type { ChangeEvent, FocusEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useLhFormItem } from './use-form-item'
import { LhFormItemContext } from './context'
import type { LhFormItemInstance, LhFormItemProps } from './types'

const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])'

export const LhFormItem = forwardRef<LhFormItemInstance, LhFormItemProps>((props, ref) => {
  const { label, required = false, children } = props
  const {
    labelStyle,
    errorMessage,
    errorId,
    isTop,
    itemContextValue,
    validate,
    validateChange,
  } = useLhFormItem(props)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useImperativeHandle(ref, () => ({ validate, errorMessage }), [validate, errorMessage])

  const focusControl = (e: ReactMouseEvent) => {
    e.preventDefault()
    const target = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    target?.focus()
  }

  /**
   * 焦点在 item 内部移动（控件 ↔ 控件 / 标签）不触发校验，只有真正离开才校验，
   * 否则中途焦点切换会闪出错误态
   */
  const handleFocusout = (e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    void validate()
  }

  /**
   * 内容区 change 冒泡校验（React 侧增强）：合成 change 事件从子控件冒泡上来，
   * 只触发 trigger === 'change' 的规则；与失焦校验互补。
   *
   * 直接取事件目标的新值：父级 setState 与事件派发不在同一拍，回头读 model 会滞后一拍。
   * 勾选类控件（checkbox / radio）的 value 不能代表选中态，仍走 model。
   */
  const handleChange = (e: ChangeEvent<HTMLDivElement>) => {
    const target = e.target as HTMLInputElement
    const isCheck =
      target instanceof HTMLInputElement &&
      (target.type === 'checkbox' || target.type === 'radio')
    void validateChange(isCheck ? undefined : target.value)
  }

  return (
    <div
      className={[
        'lh-form-item',
        errorMessage && 'lh-form-item--error',
        isTop && 'lh-form-item--top',
      ]
        .filter(Boolean)
        .join(' ')}
      onBlur={handleFocusout}
    >
      {label ? (
        <label className="lh-form-item__label" style={labelStyle} onClick={focusControl}>
          {required ? <span className="lh-form-item__required">*</span> : null}
          {label}
        </label>
      ) : null}
      <LhFormItemContext.Provider value={itemContextValue}>
        <div
          ref={contentRef}
          className="lh-form-item__content"
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={handleChange}
        >
          {children}
          {errorMessage ? (
            <span id={errorId} className="lh-form-item__error" role="alert">
              {errorMessage}
            </span>
          ) : null}
        </div>
      </LhFormItemContext.Provider>
    </div>
  )
})

LhFormItem.displayName = 'LhFormItem'
