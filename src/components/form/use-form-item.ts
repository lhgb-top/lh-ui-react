/**
 * FormItem 胶水层：share/core/form 纯函数 + Form 上下文消费
 *
 * 对应 plus 的 packages/components/form/src/item.vue 的 <script setup> 部分。
 *
 * 与 plus 的差异（已登记到迁移指南）：
 * - validate 的异步规则正确等待（同 useLhForm 的修正）；
 * - 字段注册改为 useEffect 注册 / cleanup 卸载（Vue 版 onMounted/onUnmounted）。
 */
import { useCallback, useContext, useEffect, useMemo, useId, useState } from 'react'
import { getFormFieldValue, validateFormField } from '@lh-ui/share/core/form'
import { useLhLocale } from '../../locale'
import { LhFormContext } from './context'
import type { LhFormItemProps } from './types'

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

export function useLhFormItem(props: LhFormItemProps) {
  const { prop, label, required = false, rules: itemRules } = props
  const form = useContext(LhFormContext)
  const { t } = useLhLocale()
  const [errorMessage, setErrorMessage] = useState('')
  // 校验失败时错误文案的锚点：role="alert" 自动播报，aria-describedby 关联到内容区
  const errorId = `lh-form-item__error-${useId()}`

  /** 合并 item 级与 form 级规则：item 级规则存在时覆盖 form 级同名规则 */
  const rules = useMemo(() => {
    const formRules = prop ? form.rules?.[prop] ?? [] : []
    if (itemRules) return required ? [{ required: true }, ...itemRules] : itemRules
    return required ? [{ required: true }, ...formRules] : formRules
  }, [prop, form.rules, itemRules, required])

  const validate = useCallback(async () => {
    if (!prop) return true
    const message = validateFormField(
      getFormFieldValue(form.model, prop),
      rules,
      form.model,
      t('form.required'),
    )
    if (isThenable(message)) {
      const error = await message
      setErrorMessage(error ?? '')
      return !error
    }
    setErrorMessage(message ?? '')
    return !message
  }, [prop, form.model, rules, t])

  /**
   * change 触发的校验（React 侧增强）：只跑显式标注 trigger === 'change' 的规则子集。
   * share 的 validateFormField 不读 trigger，过滤在本层做；无 change 规则时直接放行，
   * 避免失焦校验规则在输入过程中反复报错。
   *
   * 可传入显式 value：控件值变化与父级 setState 不在同一拍（React 的状态更新是异步的），
   * 冒泡校验若回头读 model 会读到旧值，故事件侧 / 自定义控件直接把新值带进来。
   */
  const validateChange = useCallback(
    async (value?: unknown) => {
      if (!prop) return true
      const changeRules = rules.filter((rule) => rule.trigger === 'change')
      if (!changeRules.length) return true
      const message = validateFormField(
        value ?? getFormFieldValue(form.model, prop),
        changeRules,
        form.model,
        t('form.required'),
      )
      if (isThenable(message)) {
        const error = await message
        setErrorMessage(error ?? '')
        return !error
      }
      setErrorMessage(message ?? '')
      return !message
    },
    [prop, form.model, rules, t],
  )

  // 向 Form 注册字段校验函数，卸载时注销
  useEffect(() => {
    if (!prop) return
    return form.registerField(prop, () => validate())
  }, [prop, form, validate])

  // 重置信号：Form 调 resetFields 时清空错误态（外部 model 的还原仍由用户负责）
  useEffect(() => {
    setErrorMessage('')
  }, [form.resetVersion])

  const labelStyle = useMemo(() => {
    if (!form.labelWidth || form.labelPosition === 'top') return undefined
    const width =
      typeof form.labelWidth === 'number' ? `${form.labelWidth}px` : form.labelWidth
    return { width }
  }, [form.labelWidth, form.labelPosition])

  const itemContextValue = useMemo(
    () => ({ errorMessage, validateChange }),
    // errorMessage 变化必须刷新 context，否则后代控件读到的还是旧错误态（快照化缺陷）
    [errorMessage, validateChange],
  )

  return {
    label,
    labelStyle,
    errorMessage,
    errorId,
    isTop: form.labelPosition === 'top',
    itemContextValue,
    validate,
    validateChange,
  }
}
