/**
 * Form 组件（薄渲染层）
 *
 * 对应 plus 的 packages/components/form/src/index.vue：
 * 原生 form 容器 + Context 下发 model/rules/标签布局/字段注册表，
 * 并通过 ref 暴露 validate / validateField / resetFields / resetField。
 */
import { forwardRef, useImperativeHandle } from 'react'
import { useLhForm } from './use-form'
import { LhFormContext } from './context'
import type { FormEvent } from 'react'
import type { LhFormInstance, LhFormProps } from './types'

export const LhForm = forwardRef<LhFormInstance, LhFormProps>((props, ref) => {
  const { inline, sxStyle, contextValue, validate, validateField, resetFields, resetField } =
    useLhForm(props)

  useImperativeHandle(
    ref,
    () => ({ validate, validateField, resetFields, resetField }),
    [validate, validateField, resetFields, resetField],
  )

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    props.onSubmit?.(e)
  }

  return (
    <LhFormContext.Provider value={contextValue}>
      <form
        className={['lh-form', inline && 'lh-form--inline'].filter(Boolean).join(' ')}
        style={sxStyle}
        onSubmit={handleSubmit}
      >
        {props.children}
      </form>
    </LhFormContext.Provider>
  )
})

LhForm.displayName = 'LhForm'
