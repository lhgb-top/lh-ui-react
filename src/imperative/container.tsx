/**
 * 命令式服务容器（Message / Notification / Loading 共用）
 *
 * 单例 createRoot：首次调用才创建 root 并 append 容器 div（惰性初始化）。
 * 服务函数只投递 action，host 组件内部 state 管理队列——
 * 避免多个 createRoot 导致 StrictMode / 并发下多实例。
 * SSR 环境调用时 warn + no-op。
 *
 * 一个 root 承载全部 host：服务调用时把对应 host 注册进 hosts 表，
 * renderAll 用 fragment 重新渲染；host 卸载时从表里移除。
 *
 * action 投递用「频道 + 待发队列」：dispatch 先入队再通知已订阅的 host；
 * host 在 useEffect 里订阅并冲刷队列。React 18 的 createRoot.render 是异步的，
 * 首次挂载时 host 的 effect 尚未执行，队列保证 action 不丢；
 * 冲刷后清空队列，StrictMode 双订阅不会重放旧 action。
 *
 * 对应 plus 的 mountLhComponent（Vue 的 createApp 挂载）。
 */
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'

let root: Root | null = null
let containerEl: HTMLDivElement | null = null

/** 已注册的 host：key → 元素，一个 root 用 fragment 承载全部 */
const hosts = new Map<string, React.ReactNode>()

/** 频道：监听器 + 待发 action 队列 */
const channels = new Map<string, { listeners: Set<(action: unknown) => void>; pending: unknown[] }>()

function getChannel(key: string) {
  let channel = channels.get(key)
  if (!channel) {
    channel = { listeners: new Set(), pending: [] }
    channels.set(key, channel)
  }
  return channel
}

/** 容器挂载点 */
export function getContainer(): HTMLDivElement | null {
  if (typeof document === 'undefined') return null
  if (!containerEl) {
    containerEl = document.createElement('div')
    containerEl.className = 'lh-imperative-container'
    document.body.appendChild(containerEl)
  }
  return containerEl
}

/** 确保 root 已创建；SSR 返回 null 并警告 */
function ensureRoot(): Root | null {
  if (typeof document === 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[lh-ui/react] 命令式服务在 SSR 环境下不可用，调用已忽略。')
    }
    return null
  }
  if (!root) {
    const el = getContainer()
    if (!el) return null
    root = createRoot(el)
  }
  return root
}

function renderAll(): void {
  const r = ensureRoot()
  if (!r) return
  r.render(<>{Array.from(hosts.values())}</>)
}

/** 注册 host（服务首次调用时执行）；已注册则更新元素 */
export function mountHost(key: string, host: React.ReactNode): void {
  hosts.set(key, host)
  renderAll()
}

/** 移除 host（全部清空时连 root 一起卸载） */
export function unmountHost(key: string): void {
  if (!hosts.has(key)) return
  hosts.delete(key)
  if (hosts.size === 0) {
    destroyContainer()
  } else {
    renderAll()
  }
}

/**
 * 订阅频道 action；订阅时冲刷待发队列（冲刷后清空，StrictMode 安全）
 * @returns 取消订阅函数
 */
export function subscribeActions(
  key: string,
  listener: (action: unknown) => void,
): () => void {
  const channel = getChannel(key)
  channel.listeners.add(listener)
  const pending = channel.pending
  channel.pending = []
  for (const action of pending) listener(action)
  return () => {
    channel.listeners.delete(listener)
  }
}

/** 投递 action：入队并通知已订阅的 host */
export function dispatchAction(key: string, action: unknown): void {
  const channel = getChannel(key)
  channel.pending.push(action)
  for (const listener of channel.listeners) listener(action)
}

/** 显式卸载容器（测试 / destroyAll 用） */
export function destroyContainer(): void {
  if (root) {
    root.unmount()
    root = null
  }
  if (containerEl) {
    containerEl.remove()
    containerEl = null
  }
}
