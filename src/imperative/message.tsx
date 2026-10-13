/**
 * Message 命令式服务
 *
 * 用法：
 * ```ts
 * import { message } from '@lh-ui/react'
 * message.success('保存成功')
 * message.loading('加载中…', { duration: 0 })
 * ```
 *
 * 单容器原则：服务函数只投递 action，MessageHost 内部 state 管理队列。
 * 对应 plus 的 Message 服务（store + mountComponent 形态）。
 */
import { useCallback, useEffect, useState } from 'react'
import {
  LH_MESSAGE_MAX_DEFAULT,
  clampMessageQueue,
  createMessageRecord,
  getMessageClassNames,
  getMessageIconName,
  getMessageRole,
} from '@lh-ui/share/core/message'
import type { LhMessageRecord, LhMessageType } from '@lh-ui/share/core/message'
import type { LhIconName } from '@lh-ui/share/core/icon'
import { sxToStyle } from '@lh-ui/share/core/shared'
import type { LhSxProps } from '@lh-ui/share/core/shared'
import { useLhLocale } from '../locale'
import { LhIcon } from '../components/icon'
import {
  destroyContainer,
  dispatchAction,
  mountHost,
  subscribeActions,
  unmountHost,
} from './container'

const HOST_KEY = 'message'
let _seq = 0

/** 消息选项 */
export interface LhMessageOptions {
  /** 自动关闭毫秒数，0 表示不自动关闭；loading 语义默认不自动关闭 */
  duration?: number
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 距视口顶部偏移 px */
  offset?: number
  /** 关闭按钮的 aria-label */
  closeLabel?: string
  /** sx 样式 */
  sx?: LhSxProps
  /** 关闭时回调 */
  onClose?: () => void
}

type MessageAction =
  | { type: 'add'; record: LhMessageRecord }
  | { type: 'close'; id: number }
  | { type: 'clear' }

function dispatch(action: MessageAction): void {
  dispatchAction(HOST_KEY, action)
}

/** 创建一条消息并投递进队列 */
function createMessage(
  messageType: LhMessageType,
  content: string,
  options: LhMessageOptions = {},
): { close: () => void } {
  const record = createMessageRecord(
    {
      type: messageType,
      content,
      showClose: options.showClose ?? false,
      duration: options.duration,
      offset: options.offset,
      onClose: options.onClose,
    },
    ++_seq,
  )

  mountHost(HOST_KEY, <MessageHost />)
  dispatch({ type: 'add', record })

  return {
    close: () => dispatch({ type: 'close', id: record.id }),
  }
}

export const message = {
  info: (content: string, options?: LhMessageOptions) => createMessage('info', content, options),
  success: (content: string, options?: LhMessageOptions) =>
    createMessage('success', content, options),
  warning: (content: string, options?: LhMessageOptions) =>
    createMessage('warning', content, options),
  error: (content: string, options?: LhMessageOptions) =>
    createMessage('error', content, options),
  danger: (content: string, options?: LhMessageOptions) =>
    createMessage('danger', content, options),
  loading: (content: string, options?: LhMessageOptions) =>
    createMessage('loading', content, options),
  /** 关闭全部消息并卸载容器 */
  destroyAll: () => {
    dispatch({ type: 'clear' })
    unmountHost(HOST_KEY)
    destroyContainer()
  },
}

/** 单条消息项 */
function MessageItem({
  record,
  closeLabel,
  onClose,
}: {
  record: LhMessageRecord
  closeLabel?: string
  onClose: () => void
}) {
  const { t } = useLhLocale()
  // loading 语义由 loading 图标呈现（share 图标集已含 loading），其余走 core 映射
  // share 的 getMessageIconName 返回类型标宽为 string，实际取值均在 LhIconName 联合内
  const iconName = (record.type === 'loading' ? 'loading' : getMessageIconName(record.type)) as LhIconName | null
  const role = getMessageRole(record.type)

  return (
    <div
      className={getMessageClassNames({ type: record.type, showClose: record.showClose }).join(' ')}
      style={{ ...sxToStyle(record.sx as LhSxProps), marginTop: record.offset }}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
    >
      {iconName ? <LhIcon name={iconName} className="lh-message__icon" /> : null}
      <span className="lh-message__content">{record.content}</span>
      {record.showClose ? (
        <button
          type="button"
          className="lh-message__close"
          aria-label={closeLabel || t('message.close', '关闭提示')}
          onClick={onClose}
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

/** 消息队列 host（挂在单例容器内） */
function MessageHost() {
  const [items, setItems] = useState<LhMessageRecord[]>([])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id)
      removed?.onClose?.()
      return prev.filter((item) => item.id !== id)
    })
  }, [])

  useEffect(
    () =>
      subscribeActions(HOST_KEY, (action) => {
        const act = action as MessageAction
        if (act.type === 'add') {
          setItems((prev) => {
            const next = [...prev, act.record]
            // 队列超限裁剪：被移除的记录触发其 onClose
            const { kept, removed } = clampMessageQueue(next, LH_MESSAGE_MAX_DEFAULT)
            for (const item of removed) item.onClose?.()
            return kept
          })
        } else if (act.type === 'close') {
          removeItem(act.id)
        } else if (act.type === 'clear') {
          setItems((prev) => {
            for (const item of prev) item.onClose?.()
            return []
          })
        }
      }),
    [removeItem],
  )

  // 自动关闭定时器（duration=0 表示不自动关闭）
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const item of items) {
      if (item.duration > 0) {
        timers.push(setTimeout(() => removeItem(item.id), item.duration))
      }
    }
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [items, removeItem])

  if (items.length === 0) return null

  return (
    <div className="lh-message">
      {items.map((record) => (
        <MessageItem key={record.id} record={record} onClose={() => removeItem(record.id)} />
      ))}
    </div>
  )
}

export { LH_MESSAGE_MAX_DEFAULT }
