/**
 * Loading 命令式服务
 *
 * 用法：
 * ```ts
 * import { loading } from '@lh-ui/react'
 * const handle = loading.show({ text: '上传中…' })
 * handle.close()
 *
 * // 挂到指定区域而非全屏
 * loading.show({ target: cardRef.current, lock: true })
 * ```
 *
 * 与 message / notification **不同**：loading 要挂到任意目标元素（全屏或局部），
 * 无法共用单容器，故走 per-instance createRoot（对齐 plus 的 mountLhComponent
 * 挂到 target 的语义）。每个实例持有自己的 root 与还原句柄，close 时先挂
 * `--leaving` 播 `lh-loading-fade-out`（200ms）再卸载。
 *
 * SSR 环境调用时 warn + no-op。
 */
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import {
  ensurePositioned,
  getLoadingClassNames,
  isLoadingFullscreen,
  resolveLoadingTarget,
} from '@lh-ui/share/core/loading'
import { useLhLocale } from '../locale'

const LEAVE_DURATION = 200

export interface LhLoadingOptions {
  /** 挂载目标：选择器字符串 / 元素；不传为全屏（body） */
  target?: string | HTMLElement
  /** 加载提示文案（未传时取语言包 loading.text） */
  text?: string
  /** 遮罩背景色（CSS background 值） */
  background?: string
  /** 是否锁定滚动（全屏锁 body，指定目标锁目标自身），默认 true */
  lock?: boolean
}

interface ActiveInstance {
  root: Root
  target: HTMLElement
  restorePosition: () => void
  originalOverflow: string
  inerted: HTMLElement | null
}

const activeInstances = new Map<HTMLElement, ActiveInstance>()

function isBrowser(): boolean {
  return typeof document !== 'undefined'
}

/** 遮罩组件（复用 button 的 spinner 画法：share 无独立 LhSpinner 组件） */
function LhLoadingMask({
  text,
  background,
  fullscreen,
}: {
  text?: string
  background?: string
  fullscreen: boolean
}) {
  const { t } = useLhLocale()
  const label = text || t('loading.text', '加载中…')
  const classNames = getLoadingClassNames({ fullscreen, withText: true })

  return (
    <div
      className={classNames.join(' ')}
      style={background ? { backgroundColor: background } : undefined}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <svg className="lh-button__spinner" viewBox="0 0 100 100" aria-hidden="true">
        <circle className="lh-button__path" cx="50" cy="50" r="20" fill="none" strokeWidth="16" />
      </svg>
      <span className="lh-loading__text">{label}</span>
    </div>
  )
}

/**
 * 显示加载遮罩并返回关闭句柄。同一目标重复调用时先卸载旧实例。
 */
function show(options: LhLoadingOptions = {}): { close: () => void } {
  if (!isBrowser()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[lh-ui/react] loading 服务在 SSR 环境下不可用，调用已忽略。')
    }
    return { close: () => {} }
  }

  const target = resolveLoadingTarget(options.target)
  const lock = options.lock ?? true

  // 同一目标已有遮罩：先同步卸载，避免叠加
  const existing = activeInstances.get(target)
  if (existing) {
    existing.root.unmount()
    activeInstances.delete(target)
  }

  const restorePosition = ensurePositioned(target).restore
  const originalOverflow = target.style.overflow
  const fullscreen = isLoadingFullscreen(target)
  let inerted: HTMLElement | null = null

  if (lock) {
    target.style.overflow = 'hidden'
    // 非全屏遮罩用 inert 冻结目标内容交互；全屏遮罩已用固定层截获交互，无需 inert。
    // 不支持 inert 的浏览器忽略该属性，无副作用（交互仍被遮罩层截获）
    if (!fullscreen) {
      target.setAttribute('inert', '')
      inerted = target
    }
  }

  const root = createRoot(target)
  // 文案默认值在 render 期取语言包（LhLoadingMask 内 useLhLocale），与组件响应式一致
  root.render(
    <LhLoadingMask text={options.text} background={options.background} fullscreen={fullscreen} />,
  )

  const instance: ActiveInstance = {
    root,
    target,
    restorePosition,
    originalOverflow,
    inerted,
  }
  activeInstances.set(target, instance)

  return {
    close: () => {
      const current = activeInstances.get(target)
      if (!current || current !== instance) return
      activeInstances.delete(target)

      // 退场动画：挂 --leaving 播 lh-loading-fade-out，结束后再卸载
      const mask = target.querySelector<HTMLElement>('.lh-loading')
      if (mask) {
        mask.classList.add('lh-loading--leaving')
        setTimeout(() => {
          current.root.unmount()
          restoreInstance(current)
        }, LEAVE_DURATION)
      } else {
        current.root.unmount()
        restoreInstance(current)
      }
    },
  }
}

/** 还原目标元素的 position / overflow / inert */
function restoreInstance(instance: ActiveInstance): void {
  instance.restorePosition()
  if (instance.inerted) {
    instance.inerted.removeAttribute('inert')
  }
  // overflow 只在曾被本服务改写时还原（用户若自行设过 hidden，仍如实还原回原值）
  if (instance.originalOverflow === '') {
    instance.target.style.removeProperty('overflow')
  } else {
    instance.target.style.overflow = instance.originalOverflow
  }
}

export const loading = {
  show,
  /** 关闭全部活动实例（跳过退场动画，供测试 / 强制清理用） */
  closeAll: () => {
    for (const instance of activeInstances.values()) {
      instance.root.unmount()
      restoreInstance(instance)
    }
    activeInstances.clear()
  },
}
