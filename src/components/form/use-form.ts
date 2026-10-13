/**
 * Form 胶水层：share/core/form 纯函数 + 字段注册表 + 初始值快照
 *
 * 对应 plus 的 packages/components/form/src/index.vue 的 <script setup> 部分。
 *
 * 与 plus 的差异（已登记到迁移指南）：
 * - validateField 的异步规则正确等待：plus 版用 Promise.resolve(!message) 未等
 *   异步 validator 的 Promise，异步校验恒返回 true；本版对 thenable 结果显式等待。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getFormFieldValue, validateFormField } from '@lh-ui/share/core/form'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import type { LhFormProps } from './types'

/** share/core 未导出的 thenable 判定（与 core 内部实现同口径） */
function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { then?: unknown }).then === 'function'
  )
}

export function useLhForm(props: LhFormProps) {
  const { model, rules, labelPosition = 'right', labelWidth, inline = false } = props
  const { t } = useLhLocale()

  // 初始值快照：供 resetField 还原。ref Map 随 rules 变化增量补拍
  // （异步加载的 rules 在挂载后才到达，挂载期已声明的 rules 也要覆盖）
  const initialValues = useRef(new Map<string, unknown>())
  // 已注册字段的校验函数表
  const fieldValidators = useRef(new Map<string, () => Promise<boolean>>())
  // 重置信号：自增后 FormItem 据此清除错误态
  const [resetVersion, setResetVersion] = useState(0)

  useEffect(() => {
    for (const prop of Object.keys(rules ?? {})) {
      if (!initialValues.current.has(prop)) {
        initialValues.current.set(prop, getFormFieldValue(model, prop))
      }
    }
  }, [rules, model])

  const getRules = useCallback(
    (prop: string) => rules?.[prop] ?? [],
    [rules],
  )

  const validateField = useCallback(
    (prop: string): Promise<boolean> => {
      const message = validateFormField(
        getFormFieldValue(model, prop),
        getRules(prop),
        model,
        t('form.required'),
      )
      if (isThenable(message)) {
        return message.then((error) => !error)
      }
      return Promise.resolve(!message)
    },
    [model, getRules, t],
  )

  const resetField = useCallback(
    (prop: string) => {
      if (!initialValues.current.has(prop)) return
      const keys = prop.split('.')
      const lastKey = keys.pop()
      if (!lastKey) return

      let target: Record<string, unknown> = model
      for (const key of keys) {
        const value = target[key]
        if (!value || typeof value !== 'object') return
        target = value as Record<string, unknown>
      }
      target[lastKey] = initialValues.current.get(prop)
    },
    [model],
  )

  const validate = useCallback(() => {
    const validators = new Set<() => Promise<boolean>>()
    fieldValidators.current.forEach((validator) => validators.add(validator))
    Object.keys(rules ?? {}).forEach((prop) => validators.add(() => validateField(prop)))
    return Promise.all([...validators].map((validator) => validator())).then((results) =>
      results.every(Boolean),
    )
  }, [rules, validateField])

  const resetFields = useCallback(() => {
    Object.keys(rules ?? {}).forEach(resetField)
    setResetVersion((version) => version + 1)
  }, [rules, resetField])

  const registerField = useCallback((prop: string, validator: () => Promise<boolean>) => {
    fieldValidators.current.set(prop, validator)
    return () => {
      fieldValidators.current.delete(prop)
    }
  }, [])

  const contextValue = useMemo(
    () => ({
      model,
      rules,
      labelPosition,
      labelWidth,
      registerField,
      validateField,
      resetField,
      resetVersion,
    }),
    // 禁止快照：model/rules/labelPosition/labelWidth 变化必须立即传导给 FormItem
    [
      model,
      rules,
      labelPosition,
      labelWidth,
      registerField,
      validateField,
      resetField,
      resetVersion,
    ],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  return {
    inline,
    sxStyle,
    contextValue,
    validate,
    validateField,
    resetFields,
    resetField,
  }
}
