/**
 * Notification 命令式服务
 *
 * 用法：
 * ```ts
 * import { notification } from '@lh-ui/react'
 * const handle = notification.success({ title: '保存成功', content: '作品已发布到画廊' })
 * handle.close()
 * notification.closeAll()
 *
 * // 字符串简写：只渲染标题行
 * notification.info('系统通知')
 * ```
 *
 * 与 message 同范式（单容器 + action 频道 + NotificationHost），差别在：
 * - 四角弹出（top-right 默认）而非顶部居中
 * - 结构带标题 / 正文 / 类型图标，支持更长的内容
 * - 条目自管退场：close 先播 `lh-notification-slide-leave-*` 再让 host 删记录
 *
 * 对应 plus 的 Notification 服务（store + mountComponent 形态）。
 *
 * 已知限制：`lh-notification-slide-move` 的 FLIP 让位动画由 Vue 的 transition-group
 * 提供，React 侧无等价原语；新通知加入 / 旧通知退场时兄弟卡片瞬时跳位，
 * 堆叠间距完全由容器的 flex gap 承接。
 */
import { useCallback, useEffect, useState } from 'react'
import {
  LH_NOTIFICATION_DURATION_DEFAULT,
  getNotificationAria,
  getNotificationClassNames,
  getNotificationIconName,
  groupNotificationsByPosition,
} from '@lh-ui/share/core/notification'
import type {
  LhNotificationPosition,
  LhNotificationRecord,
  LhNotificationType,
} from '@lh-ui/share/core/notification'
import type { LhIconName } from '@lh-ui/share/core/icon'
import { sxToStyle } from '@lh-ui/share/core/shared'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../locale'
import { useTransition } from '../hooks'
import { LhIcon } from '../components/icon'
import {
  destroyContainer,
  dispatchAction,
  mountHost,
  subscribeActions,
  unmountHost,
} from './container'

const HOST_KEY = 'notification'
const TRANSITION_DURATION = 280
let _seq = 0

/** 通知选项（对象式，对齐 plus 的 Notification(options)；字符串简写等价于只传 title） */
export interface LhNotificationOptions {
  /** 标题（未传时取 content，两者同值时只渲染标题行） */
  title?: string
  /** 正文（比 message 更长的内容） */
  content?: string
  /** 自动关闭毫秒数，0 表示不自动关闭；默认 4500 */
  duration?: number
  /** 弹出位置，默认 top-right */
  position?: LhNotificationPosition
  /** 是否显示关闭按钮，默认 true */
  showClose?: boolean
  /** 关闭按钮的 aria-label */
  closeLabel?: string
  /** sx 样式 */
  sx?: LhSxProps
  /** 点击通知回调（传入后卡片可点击） */
  onClick?: () => void
  /** 关闭时回调 */
  onClose?: () => void
}

/** 入参形态：字符串简写或完整选项 */
type NotificationInput = string | LhNotificationOptions

type NotificationAction =
  | { type: 'add'; record: LhNotificationRecord }
  | { type: 'close'; id: number }
  | { type: 'clear' }

function dispatch(action: NotificationAction): void {
  dispatchAction(HOST_KEY, action)
}

/** 规范化入参：字符串当 title，对象原样取值 */
function normalizeOptions(input: NotificationInput | undefined): LhNotificationOptions {
  if (typeof input === 'string') return { title: input }
  return input ?? {}
}

/** 创建一条通知并投递进队列 */
function createNotification(
  type: LhNotificationType,
  input?: NotificationInput,
): { close: () => void } {
  const options = normalizeOptions(input)
  const title = options.title ?? options.content ?? ''
  const record: LhNotificationRecord = {
    id: ++_seq,
    type,
    title,
    content: options.content ?? '',
    duration: options.duration ?? LH_NOTIFICATION_DURATION_DEFAULT,
    position: options.position ?? 'top-right',
    showClose: options.showClose ?? true,
    sx: options.sx,
    onClick: options.onClick,
    onClose: options.onClose,
  }

  mountHost(HOST_KEY, <NotificationHost />)
  dispatch({ type: 'add', record })

  return {
    close: () => dispatch({ type: 'close', id: record.id }),
  }
}

export const notification = {
  info: (input?: NotificationInput) => createNotification('info', input),
  success: (input?: NotificationInput) => createNotification('success', input),
  warning: (input?: NotificationInput) => createNotification('warning', input),
  error: (input?: NotificationInput) => createNotification('error', input),
  danger: (input?: NotificationInput) => createNotification('danger', input),
  /** 关闭单条通知（先播退场动画再移除） */
  close: (id: number) => dispatch({ type: 'close', id }),
  /** 关闭全部通知并卸载容器 */
  closeAll: () => {
    dispatch({ type: 'clear' })
    unmountHost(HOST_KEY)
    destroyContainer()
  },
}

/**
 * 单条通知项：visible 由 host 通过 closing 集合驱动，退场动画结束后回调移除。
 *
 * 显隐相位全部交给 useTransition（类名 `lh-notification-slide-${phase}` 与
 * share SCSS 一一对应），组件自身只管「播完 leave → 通知 host 删记录」。
 */
function NotificationItem({
  record,
  visible,
  closeLabel,
  onRequestClose,
  onRemoved,
}: {
  record: LhNotificationRecord
  visible: boolean
  closeLabel?: string
  /** 请求关闭（走退场动画）：关闭按钮与外部 close(id) 共用此路径 */
  onRequestClose: () => void
  /** 退场动画结束后通知 host 删记录 */
  onRemoved: () => void
}) {
  const { t } = useLhLocale()
  const { mounted, phase } = useTransition(visible, TRANSITION_DURATION, true)
  // 进入过才允许触发移除：避免首次挂载前的 transient unmounted 态误删
  const [hasEntered, setHasEntered] = useState(false)

  useEffect(() => {
    if (mounted) {
      setHasEntered(true)
    } else if (hasEntered) {
      onRemoved()
    }
  }, [mounted, hasEntered, onRemoved])

  if (!mounted) return null

  const aria = getNotificationAria(record.type)
  const classNames = getNotificationClassNames({
    type: record.type,
    showClose: record.showClose,
    clickable: Boolean(record.onClick),
  })

  return (
    <div
      className={[...classNames, `lh-notification-slide-${phase}`].join(' ')}
      style={sxToStyle(record.sx as LhSxProps)}
      {...aria}
      aria-live={aria.role === 'alert' ? 'assertive' : 'polite'}
      onClick={record.onClick}
    >
      <LhIcon
        name={getNotificationIconName(record.type) as LhIconName}
        className="lh-notification__icon"
      />
      <div className="lh-notification__body">
        <span className="lh-notification__title">{record.title}</span>
        {record.content && record.content !== record.title ? (
          <p className="lh-notification__content">{record.content}</p>
        ) : null}
      </div>
      {record.showClose ? (
        <button
          type="button"
          className="lh-notification__close"
          aria-label={closeLabel || t('notification.close', '关闭通知')}
          onClick={(e) => {
            e.stopPropagation()
            onRequestClose()
          }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7a1 1 0 0 0-1.41 1.41L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.88a1 1 0 0 0 0-1.41z"
            />
          </svg>
        </button>
      ) : null}
    </div>
  )
}

/** 通知队列 host（挂在单例容器内），按位置分组渲染到四角容器 */
function NotificationHost() {
  const [items, setItems] = useState<LhNotificationRecord[]>([])
  const [closing, setClosing] = useState<Set<number>>(new Set())

  const markClosing = useCallback((id: number) => {
    setClosing((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setClosing((prev) => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id)
      removed?.onClose?.()
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  useEffect(
    () =>
      subscribeActions(HOST_KEY, (action) => {
        const act = action as NotificationAction
        if (act.type === 'add') {
          setItems((prev) => [...prev, act.record])
        } else if (act.type === 'close') {
          // 标记退场：条目内部播 leave 动画，结束后才真正删记录
          markClosing(act.id)
        } else if (act.type === 'clear') {
          setItems((prev) => {
            for (const item of prev) item.onClose?.()
            return []
          })
          setClosing(new Set())
        }
      }),
    [markClosing],
  )

  // 自动关闭定时器（duration=0 表示不自动关闭；已在退场中的不再计时）
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const item of items) {
      if (item.duration > 0 && !closing.has(item.id)) {
        timers.push(setTimeout(() => markClosing(item.id), item.duration))
      }
    }
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [items, closing, markClosing])

  if (items.length === 0) return null

  const groups = groupNotificationsByPosition(items)

  return (
    <>
      {(Object.keys(groups) as LhNotificationPosition[]).map((position) => {
        const group = groups[position]
        if (!group.length) return null
        return (
          <div
            key={position}
            className={`lh-notification lh-notification--${position}`}
            role="region"
            aria-live="polite"
          >
            {group.map((record) => (
              <NotificationItem
                key={record.id}
                record={record}
                visible={!closing.has(record.id)}
                onRequestClose={() => markClosing(record.id)}
                onRemoved={() => removeItem(record.id)}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}
