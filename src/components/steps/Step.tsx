/**
 * Step 组件（薄渲染层）
 *
 * 渲染规则与 plus 的 steps/step.vue 一一对应：
 * li.lh-steps__item > head(button|span) > icon + main(title + description)
 * 状态、类名与 aria 全走 core 纯函数。
 */
import { forwardRef, useContext } from 'react'
import { getStepAria, getStepClassNames, getStepStatus } from '@lh-ui/share/core/steps'
import { formatMessage } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import { LhIcon } from '../icon'
import { LhStepsContext } from './context'
import type { LhStepProps } from './types'

export const LhStep = forwardRef<HTMLLIElement, LhStepProps>((props, ref) => {
  const { title, description, icon } = props
  const ctx = useContext(LhStepsContext)
  const { t } = useLhLocale()

  const index = props.index ?? -1

  const status = ctx
    ? getStepStatus({ index, current: ctx.current, forced: ctx.forcedStatus })
    : 'process'

  const clickable = ctx?.clickable ?? false
  /** 当前步骤与历史步骤可点击导航；等待中的后续步骤不引导跳转 */
  const isButton = clickable && status !== 'wait'

  const isLineLast = ctx ? ctx.lineLastIndices.includes(index) : false

  const itemClasses = getStepClassNames({ status, clickable: isButton, lineLast: isLineLast })

  const iconContent = icon ? (
    <LhIcon name={icon} />
  ) : (
    <>
      {status === 'finish' ? '✓' : status === 'error' ? '✕' : index + 1}
    </>
  )

  const stepLabel =
    status === 'finish'
      ? t('steps.finish', '已完成')
      : status === 'error'
        ? t('steps.error', '出错')
        : formatMessage(t('steps.step', '第 {index} 步'), { index: index + 1 })

  const Head = isButton ? 'button' : 'span'

  return (
    <li ref={ref} className={itemClasses.join(' ')} {...getStepAria(status)}>
      <Head
        className="lh-steps__head"
        {...(isButton
          ? { type: 'button' as const, 'aria-label': stepLabel, onClick: () => ctx?.select(index) }
          : {})}
      >
        <span className="lh-steps__icon" aria-hidden="true">
          {iconContent}
        </span>
      </Head>
      <div className="lh-steps__main">
        <div className="lh-steps__title">{title}</div>
        {description && <div className="lh-steps__description">{description}</div>}
      </div>
    </li>
  )
})

LhStep.displayName = 'LhStep'
