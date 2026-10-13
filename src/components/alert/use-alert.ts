/**
 * Alert 胶水层：share/core/alert 纯函数组合
 *
 * 对应 plus 的 packages/components/alert/src/index.vue 的 <script setup> 部分。
 * 可见性为内部非受控状态（与 plus 一致），关闭即卸载，无过渡动画。
 */
import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  getAlertClassNames,
  getAlertRole,
  getAlertIconName,
} from '@lh-ui/share/core/alert'
import type { LhIconName } from '@lh-ui/share/core/icon'
import { sxToStyle } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../../locale'
import type { LhAlertProps } from './types'

export function useLhAlert(props: LhAlertProps) {
  const {
    type = 'info',
    closable = false,
    showIcon = false,
    plain = false,
    title,
    onClose,
  } = props
  const { t } = useLhLocale()

  const withTitle = !!title

  /** 内部非受控可见性：关闭后直接卸载 */
  const [visible, setVisible] = useState(true)

  const alertClasses = useMemo(
    () => getAlertClassNames({ type, closable, showIcon, plain, withTitle }),
    [type, closable, showIcon, plain, withTitle],
  )

  const sxStyle = useMemo(() => sxToStyle(props.sx ?? {}), [props.sx])

  /** live region 语义：warning/danger 立即播报，info/success 排队播报 */
  const role = getAlertRole(type)

  /** 图标名映射到 LhIcon 图标集（core 返回 string，此处断言为图标名联合） */
  const iconName = getAlertIconName(type) as LhIconName

  /** 关闭按钮无障碍名称兜底语言包 */
  const closeLabel = props.closeLabel ?? t('alert.close', '关闭警告')

  const handleClose = (e: MouseEvent) => {
    setVisible(false)
    onClose?.(e)
  }

  return {
    alertClasses,
    sxStyle,
    visible,
    role,
    iconName,
    closeLabel,
    withTitle,
    handleClose,
  }
}
