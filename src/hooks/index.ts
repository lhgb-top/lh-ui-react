/**
 * @lh-ui/react Hooks
 *
 * 全部 hook 的纯逻辑都调 @lh-ui/share/core 的纯函数；本文件只做 React 响应式接线。
 * 概念映射（plus → 本库）：composables（ref/computed/watch）→ hooks
 * （useState/useMemo/useEffect），纯函数部分直接 import core，不复制逻辑。
 */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { RefObject } from 'react'
import { toCssVarName, stripCssVarName } from '@lh-ui/share/utils/css-var'
import { createNamespace } from '@lh-ui/share/utils/namespace'
import {
  LH_THEME_PRESETS,
  getThemeVars,
  buildPresetStyleText,
  LH_PRESET_THEME_STYLE_ID,
} from '@lh-ui/share/theme'
import type { LhThemePreset, LhThemePresetName } from '@lh-ui/share/theme'
import { LH_GRID_BREAKPOINTS, resolveBreakpoint } from '@lh-ui/share/core/grid'
import type { LhGridBreakpoint } from '@lh-ui/share/core/grid'
import { computePosition, getWindowViewport, isOutsideViewport } from '@lh-ui/share/core/shared/popper'
import type { LhPlacement } from '@lh-ui/share/core/shared/popper'
import {
  focusFirst,
  saveActiveElement,
  restoreActiveElement,
  setInertOutside,
  supportsInert,
  trapTabKey,
} from '@lh-ui/share/core/shared/focus-trap'
import type { LhConfigContext, LhThemeableComponent } from '../components/config-provider/types'

// ============================================================================
// 基础
// ============================================================================

/**
 * useIsomorphicLayoutEffect - SSR 安全的 layout effect
 *
 * useLayoutEffect 在 SSR 有警告（服务端没有 DOM）；布局类 effect 统一封装本 hook，
 * 服务端退化为 useEffect，客户端保持 useLayoutEffect（同步读取布局、避免闪烁）。
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * useLhNamespace - BEM 命名空间（plus 同名 composable 的 React 形态）
 *
 * createNamespace 本就是纯字符串函数（share/utils/namespace），这里薄包装保证
 * 与 plus 的 useLhNamespace 调用约定一致。
 */
export function useLhNamespace(block: string) {
  return useMemo(() => createNamespace(block), [block])
}

/**
 * useLhSize - 有效尺寸（props > ConfigProvider > 默认值）
 */
export function useLhSize(
  localSize: string | undefined,
  configSize: string | undefined,
): string {
  return useMemo(() => localSize || configSize || 'medium', [localSize, configSize])
}

/**
 * useLhDisabled - 是否禁用（组件 props > ConfigProvider，暂无全局开关则取 props）
 */
export function useLhDisabled(
  localDisabled: boolean | undefined,
  configDisabled?: boolean | undefined,
): boolean {
  return useMemo(() => localDisabled ?? configDisabled ?? false, [localDisabled, configDisabled])
}

// ============================================================================
// 主题
// ============================================================================

/**
 * useLhComponentTheme - 组件主题层级覆盖
 *
 * 优先级：组件自身 props > ConfigProvider componentTheme[组件名] > ConfigProvider 全局 themeVars。
 * patternComponents 白名单控制全局 themeVars 中的 bg-pattern 是否生效。
 * 与 plus 同名 composable 逻辑一致，入参 ctx 改普通对象。
 */
export function useLhComponentTheme(
  componentName: LhThemeableComponent,
  props: { themeVars?: Record<string, string>; bgPattern?: string },
  ctx: LhConfigContext | null | undefined,
) {
  return useMemo(() => {
    const result: Record<string, string> = {}

    // 检查组件是否在 patternComponents 白名单中
    const isPatternAllowed =
      !ctx?.patternComponents || ctx.patternComponents.includes(componentName)

    // 1. 全局 themeVars（仅 bg-pattern 受白名单控制）
    if (ctx?.themeVars) {
      for (const [key, value] of Object.entries(ctx.themeVars)) {
        if (key === 'bg-pattern' && !isPatternAllowed) continue
        result[toCssVarName(key)] = value
      }
    }

    // 2. componentTheme[组件名]（覆盖全局，仅 bg-pattern 受白名单控制）
    const componentTheme = ctx?.componentTheme?.[componentName]
    if (componentTheme) {
      for (const [key, value] of Object.entries(componentTheme)) {
        if (key === 'bg-pattern' && !isPatternAllowed) continue
        result[toCssVarName(key)] = value
      }
    }

    // 3. 组件自身 themeVars（最高优先级，不受白名单限制）
    if (props.themeVars) {
      for (const [key, value] of Object.entries(props.themeVars)) {
        result[toCssVarName(key)] = value
      }
    }

    // 4. 组件自身 bgPattern（最高优先级，不受白名单限制）
    if (props.bgPattern) {
      result['--lh-bg-pattern'] = props.bgPattern
    }

    // 保持 Record<string, string>：一旦转 CSSProperties，csstype 就会渗进
    // 各 hook 的推断返回类型，发布的 .d.ts 不可移植（TS2742）
    return { componentStyle: result }
  }, [componentName, props.themeVars, props.bgPattern, ctx])
}

/**
 * LhThemeType - 主题明暗类型
 */
export type LhThemeType = 'light' | 'dark'

/**
 * useLhTheme - 运行时明暗主题切换
 *
 * 通过设置 document.documentElement 的 data-theme 属性与 class 来切换明暗主题。
 * 主题状态持久化到 localStorage。全部 DOM 操作在 useEffect 内执行（SSR 安全）。
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, setTheme } = useLhTheme()
 * <LhButton onClick={toggleTheme}>{theme === 'dark' ? '切换明色' : '切换暗色'}</LhButton>
 * ```
 */
export function useLhTheme(options?: { initialTheme?: LhThemeType; storageKey?: string }) {
  const storageKey = options?.storageKey ?? 'lh-ui-theme'
  const [theme, setThemeState] = useState<LhThemeType>(() => {
    if (options?.initialTheme) return options.initialTheme
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored === 'dark' || stored === 'light') return stored
      } catch {
        /* localStorage 在 SSR / 隐私模式下可能不可用 */
      }
    }
    return 'light'
  })

  const applyTheme = useCallback(
    (t: LhThemeType) => {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      if (t === 'dark') {
        root.setAttribute('data-theme', 'dark')
        root.classList.add('dark')
      } else {
        root.removeAttribute('data-theme')
        root.classList.remove('dark')
      }
      try {
        localStorage.setItem(storageKey, t)
      } catch {
        /* localStorage 可能不可用 */
      }
    },
    [storageKey],
  )

  // 初始化时应用主题（effect 内执行，SSR 不跑）
  useEffect(() => {
    applyTheme(theme)
    // 仅首挂载应用一次，后续由 setTheme 驱动
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setTheme = useCallback(
    (t: LhThemeType) => {
      setThemeState(t)
      applyTheme(t)
    },
    [applyTheme],
  )

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return next
    })
  }, [applyTheme])

  return { theme, setTheme, toggleTheme }
}

/**
 * useLhPresetTheme - 预设主题切换
 *
 * 与 useLhTheme（明暗模式）互补：useLhTheme 切 data-theme 暗色变量，
 * 本 hook 把预设色板变量写到 `:root`，换的是 --lh-* 配色。
 *
 * 默认把预设 vars 写入 `<style id="lh-preset-theme">`（:root 级），全局生效；
 * **只能写 <style> 元素，不能写 documentElement 内联 style**——内联优先级高于
 * 一切样式表，会压过 var-dark.scss 的整段暗色变量，导致暗色模式配色失真。
 * 每次应用都把元素挪到 head 末尾：开发模式下组件样式由 Vite 在运行时注入，
 * 注入位置可能晚于本元素，同等特异性下后注入者胜出。
 *
 * 返回的 themeVars 已按 ConfigProvider 约定去掉 --lh- 前缀，
 * 需要局部作用域时传给 `<LhConfigProvider themeVars={themeVars}>`。
 *
 * @example
 * ```tsx
 * const { preset, setPreset, presets, themeVars } = useLhPresetTheme()
 * <button onClick={() => setPreset('songhua')}>松花绿</button>
 * ```
 */
export function useLhPresetTheme(options?: {
  initialPreset?: LhThemePresetName
  storageKey?: string
  /** 是否把变量写到 :root，默认 true。设为 false 可只取 themeVars 自己接管应用 */
  applyToRoot?: boolean
}) {
  const storageKey = options?.storageKey ?? 'lh-ui-preset'
  const applyToRoot = options?.applyToRoot ?? true
  const [preset, setPresetState] = useState<LhThemePresetName>(() => {
    if (options?.initialPreset) return options.initialPreset
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        const matched = stored ? LH_THEME_PRESETS.find((p: LhThemePreset) => p.name === stored) : undefined
        if (matched) return matched.name
      } catch {
        /* localStorage 可能不可用 */
      }
    }
    return LH_THEME_PRESETS[0].name
  })

  const applyPreset = useCallback(
    (name: LhThemePresetName) => {
      const vars = getThemeVars(name)
      if (!vars) return
      // applyToRoot: false 时不写 :root 也不持久化——该模式只负责产出 themeVars，
      // 作用域与持久化都应由调用方自己接管，避免污染全局 key
      if (!applyToRoot) return
      if (typeof document !== 'undefined') {
        let styleEl = document.getElementById(
          LH_PRESET_THEME_STYLE_ID,
        ) as HTMLStyleElement | null
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = LH_PRESET_THEME_STYLE_ID
        }
        styleEl.textContent = buildPresetStyleText(vars)
        // 始终挪到 head 末尾（对已位于末尾的元素幂等）
        document.head.appendChild(styleEl)
      }
      try {
        localStorage.setItem(storageKey, name)
      } catch {
        /* localStorage 可能不可用 */
      }
    },
    [applyToRoot, storageKey],
  )

  // 初始化时应用一次
  useEffect(() => {
    applyPreset(preset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setPreset = useCallback(
    (name: LhThemePresetName) => {
      setPresetState(name)
      applyPreset(name)
    },
    [applyPreset],
  )

  /** ConfigProvider 兼容的 themeVars（键已去掉 --lh- 前缀） */
  const themeVars = useMemo(() => {
    const vars = getThemeVars(preset) ?? {}
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(vars)) {
      result[stripCssVarName(key)] = value
    }
    return result
  }, [preset])

  return { preset, setPreset, presets: LH_THEME_PRESETS, themeVars }
}

// ============================================================================
// z-index 与弹层栈
// ============================================================================

let _zIndexCounter = 2000

/**
 * useLhZIndex - 递增的 z-index 管理
 *
 * 模块级计数器，每个实例挂载时取一个递增值，保证后打开的弹层压在先打开的之上。
 */
export function useLhZIndex() {
  const [zIndex] = useState(() => ++_zIndexCounter)
  const nextZIndex = useCallback(() => ++_zIndexCounter, [])
  return { zIndex, nextZIndex }
}

/**
 * useLhOverlayStack - 弹层打开顺序栈
 *
 * 模块级栈记录当前打开的弹层（dialog / drawer 等）：多弹层叠加时 Esc 只关栈顶，
 * 避免一次按键把底下所有弹层一起带走。每个实例 open 时 register、关闭时 unregister，
 * 组件卸载时 effect cleanup 自动出栈兜底。
 */
const _overlayStack: symbol[] = []

export function useLhOverlayStack() {
  const idRef = useRef<symbol | null>(null)
  if (idRef.current === null) {
    idRef.current = Symbol('lh-overlay')
  }
  const id = idRef.current

  const register = useCallback(() => {
    if (!_overlayStack.includes(id)) _overlayStack.push(id)
  }, [id])

  const unregister = useCallback(() => {
    const index = _overlayStack.lastIndexOf(id)
    if (index >= 0) _overlayStack.splice(index, 1)
  }, [id])

  /** 本实例是否处于栈顶（只有栈顶响应 Esc） */
  const isTopmost = useCallback(() => {
    return _overlayStack[_overlayStack.length - 1] === id
  }, [id])

  // 卸载时出栈兜底
  useEffect(() => unregister, [unregister])

  return { register, unregister, isTopmost }
}

// ============================================================================
// 断点
// ============================================================================

let _breakpointListeners: (() => void)[] | null = null
let _currentBreakpoint: LhGridBreakpoint = 'xs'

function _initBreakpoint() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  const recompute = () => {
    _currentBreakpoint = resolveBreakpoint(window.innerWidth)
    for (const listener of _breakpointListeners ?? []) listener()
  }
  recompute()
  // 每个断点阈值各挂一个 matchMedia（跨档与直接缩放都可靠）
  for (const key of Object.keys(LH_GRID_BREAKPOINTS) as LhGridBreakpoint[]) {
    const threshold = LH_GRID_BREAKPOINTS[key]
    if (threshold <= 0) continue
    const mql = window.matchMedia(`(min-width: ${threshold}px)`)
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', recompute)
    else mql.addListener(recompute)
  }
}

/**
 * useLhBreakpoint - 全局共享的响应式断点
 *
 * 模块级单例：所有消费方订阅同一份断点状态与同一组 matchMedia 监听，
 * 视口跨档时全站联动。阈值取 core/grid 的 LH_GRID_BREAKPOINTS（Tailwind 风格）。
 * SSR / 无 matchMedia 环境安全降级为 xs。
 */
export function useLhBreakpoint() {
  const subscribe = useCallback((listener: () => void) => {
    if (_breakpointListeners === null) {
      _breakpointListeners = []
      _initBreakpoint()
    }
    _breakpointListeners.push(listener)
    return () => {
      const index = _breakpointListeners?.indexOf(listener) ?? -1
      if (index >= 0) _breakpointListeners!.splice(index, 1)
    }
  }, [])

  const breakpoint = useSyncExternalStore(
    subscribe,
    () => _currentBreakpoint,
    () => _currentBreakpoint, // SSR 快照
  )

  return { breakpoint }
}

// ============================================================================
// 受控 / 非受控值
// ============================================================================

/**
 * useControlled - 受控 / 非受控统一管理（plus 的 useLhVModel 等价物）
 *
 * - 传 value + onChange → 受控，值完全由外部决定；
 * - 只传 defaultValue → 非受控，内部 state 暂存；
 * - 受控与非受控混用（同时传 value 与 defaultValue）时开发态警告一次。
 *
 * 返回 [当前值, 设置函数]：设置函数非受控时改内部 state 并触发 onChange，
 * 受控时不改内部 state（交由外部 value 回灌），仍触发 onChange。
 */
export function useControlled<T>(options: {
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
}): [T, (value: T) => void] {
  const { value, defaultValue, onChange } = options
  const isControlled = value !== undefined
  const [internal, setInternal] = useState<T | undefined>(defaultValue)
  const warnedRef = useRef(false)

  if (
    process.env.NODE_ENV !== 'production' &&
    !warnedRef.current &&
    isControlled &&
    defaultValue !== undefined
  ) {
    warnedRef.current = true
    // 受控与非受控混用：defaultValue 会被忽略，提醒一次
    console.warn(
      '[lh-ui/react] 同时传入 value 与 defaultValue：组件将按受控模式运行，defaultValue 被忽略。',
    )
  }

  const currentValue = isControlled ? (value as T) : (internal as T)

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [currentValue, setValue]
}

// ============================================================================
// 过渡（自研，替代 react-transition-group）
// ============================================================================

export type LhTransitionPhase =
  | 'enter-from'
  | 'enter-active'
  | 'enter-to'
  | 'leave-from'
  | 'leave-active'
  | 'leave-to'

interface TransitionState {
  /** 是否挂载（leave 动画结束后才卸载） */
  mounted: boolean
  /** 当前相位类名后缀（与 SCSS 的 `<name>-<phase>` 完全一致） */
  phase: LhTransitionPhase
}

/**
 * useTransition - 显隐过渡状态机
 *
 * 类名与 SCSS 完全一致（`*-enter-from` / `*-enter-active` / `*-enter-to`，
 * leave 同构），share 的样式源零改动即可复用。React 侧负责相位推进与卸载时机：
 *
 *   visible=true:  挂载 → enter-from →（双 rAF）→ enter-active
 *   visible=false: leave-from →（双 rAF）→ leave-active → duration 后 leave-to 并卸载
 *
 * 双 rAF 保证浏览器采样到起始帧再切到过渡态；duration 由组件传入（与 SCSS 的
 * transition-duration 对齐）。StrictMode 安全：effect cleanup 取消所有 rAF / timer，
 * 双调用不产生重复 DOM 或相位跳变。
 *
 * @param visible 是否可见
 * @param duration 离开动画时长（ms），用于延迟卸载
 * @param appear  首次挂载是否播放进入动画（默认 false）
 *
 * @example
 * ```tsx
 * const { mounted, phase } = useTransition(open, 300)
 * return mounted ? <div className={`lh-dialog-fade-${phase}`}>...</div> : null
 * ```
 */
export function useTransition(visible: boolean, duration: number, appear = false) {
  const [state, setState] = useState<TransitionState>(() => ({
    mounted: visible,
    // appear=false 时初始即终态（无首次进入动画）；appear=true 从 enter-from 起步
    phase: visible ? (appear ? 'enter-from' : 'enter-to') : 'leave-to',
  }))
  const firstRunRef = useRef(true)

  useEffect(() => {
    let raf1 = 0
    let raf2 = 0
    let timer: ReturnType<typeof setTimeout> | null = null

    // 首次挂载且 visible=true 时：appear=false 直接保持终态，不播放进入动画
    if (firstRunRef.current) {
      firstRunRef.current = false
      if (visible && !appear) return
    }

    if (visible) {
      setState({ mounted: true, phase: 'enter-from' })
      // 双 rAF：第一帧渲染 enter-from 起始样式，第二帧切 enter-active 触发过渡
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setState((prev) => (prev.mounted ? { ...prev, phase: 'enter-active' } : prev))
        })
      })
    } else {
      setState((prev) =>
        prev.mounted ? { ...prev, phase: 'leave-from' } : { mounted: false, phase: 'leave-to' },
      )
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setState((prev) => (prev.mounted ? { ...prev, phase: 'leave-active' } : prev))
        })
      })
      // 离开动画结束后卸载
      timer = setTimeout(() => {
        timer = null
        setState({ mounted: false, phase: 'leave-to' })
      }, duration)
    }

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (timer) clearTimeout(timer)
    }
    // appear 只影响首次挂载，不进依赖
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration])

  return { mounted: state.mounted, phase: state.phase }
}

// ============================================================================
// 弹层基建：供 Tooltip / Dialog / Select / Popover 共用
// ============================================================================

/** useLhPopper 入参 */
export interface UseLhPopperOptions {
  /** 触发器元素引用 */
  triggerRef: RefObject<HTMLElement | null>
  /** 弹出层元素引用 */
  popperRef: RefObject<HTMLElement | null>
  /** 弹出层是否可见（可见时才计算与监听重定位） */
  visible: boolean
  /** 期望方位 */
  placement: LhPlacement
  /** 与触发器的间距，默认 8 */
  gap?: number
  /** 视口安全边距，默认 8 */
  padding?: number
  /** 主轴溢出翻转，默认开启 */
  flip?: boolean
  /** 交叉轴溢出夹回，默认开启 */
  shift?: boolean
  /**
   * 滚动 / 调整窗口导致触发器完全离开视口时的回调。
   *
   * 弹出层是 fixed 定位且跟随触发器重算位置；触发器滚出视口后，它会被
   * 钳在视口边缘并浮在页面内容之上（观感上「层级太高」）。组件层据此
   * 自行决定是否关闭（hover 类提示应关闭，受控弹层可忽略）。
   */
  onScrollOut?: () => void
  /**
   * 弹出层宽度跟随触发器。
   *
   * teleport 到 body 后弹出层脱离了原父容器的宽度约束源，会收缩到内容宽。
   * 下拉选择这类场景需要面板与触发器同宽，开启后由 inline width 接管。
   * 提示类（tooltip）通常比触发器窄，保持默认 false。
   */
  matchTriggerWidth?: boolean
}

/**
 * useLhPopper - 弹出层定位
 *
 * 把 core 的纯函数几何计算接到 React 引用上：可见时计算 fixed 定位，
 * 并在窗口 resize、滚动、触发器或弹出层尺寸变化时重定位。
 */
export function useLhPopper(options: UseLhPopperOptions) {
  const [popperStyle, setPopperStyle] = useState<Record<string, string>>({})
  const [actualPlacement, setActualPlacement] = useState<LhPlacement>(options.placement)

  const updatePosition = useCallback(() => {
    const trigger = options.triggerRef.current
    const popper = options.popperRef.current
    if (!trigger || !popper || !options.visible) return

    const { top, left, placement, arrowOffset } = computePosition(
      trigger.getBoundingClientRect(),
      // 弹出层取布局尺寸而非 getBoundingClientRect：进出过渡带 transform: scale(0.96)，
      // 变形中的视口尺寸是缩放后的，按它算出的位置在过渡结束后会 stale（差约 4%）
      {
        top: 0,
        left: 0,
        width: popper.offsetWidth,
        height: popper.offsetHeight,
        right: popper.offsetWidth,
        bottom: popper.offsetHeight,
      },
      getWindowViewport(),
      {
        placement: options.placement,
        gap: options.gap ?? 8,
        padding: options.padding ?? 8,
        flip: options.flip ?? true,
        shift: options.shift ?? true,
      },
    )

    setPopperStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      // teleport 后弹出层失去原容器宽度约束，下拉类场景需显式跟齐触发器
      ...(options.matchTriggerWidth
        ? { width: `${trigger.getBoundingClientRect().width}px` }
        : {}),
      // 箭头通过 CSS 变量传给 SCSS，未定位时回退到 50% 居中
      '--lh-arrow-offset': `${arrowOffset}px`,
    })
    setActualPlacement(placement)
  }, [
    options.triggerRef,
    options.popperRef,
    options.visible,
    options.placement,
    options.gap,
    options.padding,
    options.flip,
    options.shift,
  ])

  const onScrollOrResize = useCallback(() => {
    if (!options.visible) return
    const trigger = options.triggerRef.current
    if (trigger && isOutsideViewport(trigger.getBoundingClientRect(), getWindowViewport())) {
      options.onScrollOut?.()
      return
    }
    updatePosition()
  }, [options.triggerRef, options.visible, options.onScrollOut, updatePosition])

  // 可见性 / 方位变化时重定位
  useEffect(() => {
    if (!options.visible) {
      setPopperStyle({})
      setActualPlacement(options.placement)
      return
    }
    // 弹出层在本次 commit 的 DOM 变更后已落位，effect 内可直接读取 ref。
    // 但调用方常配合 useTransition：visible=true 的首次渲染弹出层尚未挂载
    // （mounted 在二次渲染才置真），此时 popperRef.current 为 null 会提前返回，
    // 而 visible 依赖不再变化、effect 不会重跑，定位就永远不算了。
    // 兜底：本轮没拿到弹出层就排到下一个任务重试。用 setTimeout 而非 rAF——
    // 部分内嵌 WebView 环境的 rAF 不触发，setTimeout 在所有环境可靠。
    if (!options.popperRef.current) {
      const timer = setTimeout(() => {
        if (options.visible) updatePosition()
      })
      return () => clearTimeout(timer)
    }
    updatePosition()
  }, [options.visible, options.placement, updatePosition])

  // 全局监听（resize + 捕获阶段 scroll）+ 尺寸观测
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.addEventListener('resize', onScrollOrResize)
    window.addEventListener('scroll', onScrollOrResize, true)

    let resizeObserver: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (options.visible) updatePosition()
      })
      if (options.triggerRef.current) resizeObserver.observe(options.triggerRef.current)
      if (options.popperRef.current && options.visible) resizeObserver.observe(options.popperRef.current)
    }

    return () => {
      window.removeEventListener('resize', onScrollOrResize)
      window.removeEventListener('scroll', onScrollOrResize, true)
      resizeObserver?.disconnect()
    }
  }, [options.triggerRef, options.popperRef, options.visible, onScrollOrResize, updatePosition])

  return { popperStyle, actualPlacement, updatePosition }
}

/** useLhClickOutside 入参 */
export interface UseLhClickOutsideOptions {
  /** 监听的事件类型：mousedown 在点击处理器之前触发，适合即时收起 */
  eventType?: 'mousedown' | 'click'
}

/**
 * useLhClickOutside - 点击外部判定
 *
 * 传入需要「算作内部」的元素引用，点击落在它们之外时触发回调。
 * handler 用 ref 稳定化，监听器只挂一次，避免依赖变化导致的反复解绑。
 */
export function useLhClickOutside(
  getEls: () => (HTMLElement | null | undefined)[],
  handler: (event: MouseEvent) => void,
  options: UseLhClickOutsideOptions = {},
) {
  const eventType = options.eventType ?? 'mousedown'
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (typeof document === 'undefined') return
    const listener = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (!target) return
      const els = getEls().filter((el): el is HTMLElement => !!el)
      if (els.some((el) => el.contains(target))) return
      handlerRef.current(event)
    }
    document.addEventListener(eventType, listener)
    return () => document.removeEventListener(eventType, listener)
  }, [eventType, getEls])
}

/** useLhFocusTrap 入参 */
export interface UseLhFocusTrapOptions {
  /** 是否用 inert 锁住容器以外的内容（不支持 inert 的环境自动回退纯焦点圈） */
  inertOutside?: boolean
}

/**
 * useLhFocusTrap - 焦点圈
 *
 * trap(el) 后：记录先前焦点、把焦点移入容器、Tab 键在容器内循环；
 * release() 时归还焦点。组件卸载时自动释放。
 */
export function useLhFocusTrap(options: UseLhFocusTrapOptions = {}) {
  const trappedRef = useRef<HTMLElement | null>(null)
  const savedActiveRef = useRef<HTMLElement | null>(null)
  const lockedRef = useRef<HTMLElement[]>([])

  const onKeydown = useCallback((event: KeyboardEvent) => {
    if (trappedRef.current) trapTabKey(trappedRef.current, event)
  }, [])

  /** 释放焦点圈并归还焦点 */
  const release = useCallback(
    (returnFocus = true): void => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', onKeydown)
      }
      if (lockedRef.current.length) {
        lockedRef.current = setInertOutside(
          trappedRef.current as HTMLElement,
          false,
          lockedRef.current,
        )
      }
      if (returnFocus) restoreActiveElement(savedActiveRef.current)
      savedActiveRef.current = null
      trappedRef.current = null
    },
    [onKeydown],
  )

  /** 圈住指定元素并把焦点移入 */
  const trap = useCallback(
    (el: HTMLElement | null, focusTarget?: HTMLElement | null): void => {
      if (trappedRef.current) release(false)
      if (!el) return
      trappedRef.current = el
      savedActiveRef.current = saveActiveElement()

      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', onKeydown)
      }

      if (options.inertOutside && supportsInert()) {
        lockedRef.current = setInertOutside(el, true, lockedRef.current)
      }

      if (focusTarget) {
        // 弹层此时尚未落位（同 tick 内才写入定位样式），不阻止滚动会把页面拽到
        // portal 临时挂载点（body 末尾）
        focusTarget.focus({ preventScroll: true })
      } else {
        // 首帧 focus 尚未布局，延迟到下一帧
        requestAnimationFrame(() => focusFirst(el))
      }
    },
    [options.inertOutside, onKeydown, release],
  )

  // 卸载时释放（不归还焦点，避免组件卸载后焦点跳到已移除的元素）
  useEffect(() => () => release(false), [release])

  return { trappedRef, trap, release }
}

/** 触发方式 */
export type LhTriggerType = 'hover' | 'click' | 'focus' | 'manual' | 'contextmenu'

/** useLhTrigger 入参 */
export interface UseLhTriggerOptions {
  /** 触发方式 */
  trigger: LhTriggerType
  /** 当前可见状态（由组件持有） */
  visible: boolean
  /** 可见状态变更回调（组件据此 setState） */
  onVisibleChange?: (visible: boolean) => void
  /** 是否禁用 */
  disabled?: boolean
  /** 受控模式：为真时 hover/click/focus 都不再直接改 visible */
  isControlled?: boolean
  /** 显隐延迟 */
  delay?: { show: number; hide: number }
  /** visible 变为 true 时触发 */
  onShow?: () => void
  /** visible 变为 false 时触发 */
  onHide?: () => void
}

/**
 * useLhTrigger - 统一的显隐触发逻辑
 *
 * 把 hover / click / focus / manual 四种模式、显隐延迟双 timer、
 * 受控模式判定收敛到一处，组件只需绑定返回的事件处理器。
 */
export function useLhTrigger(options: UseLhTriggerOptions) {
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const clearTimers = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const setVisible = useCallback((value: boolean) => {
    const opts = optionsRef.current
    if (opts.visible === value) return
    opts.onVisibleChange?.(value)
    if (value) opts.onShow?.()
    else opts.onHide?.()
  }, [])

  /** 显示（禁用时不变更状态） */
  const show = useCallback(() => {
    const opts = optionsRef.current
    if (opts.disabled) return
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    // 延迟只用于防误触的 hover/focus；click 与 manual 立即响应
    const useDelay = opts.trigger === 'hover' || opts.trigger === 'focus'
    const showDelay = useDelay ? (opts.delay?.show ?? 0) : 0
    if (showDelay > 0) {
      showTimerRef.current = setTimeout(() => {
        showTimerRef.current = null
        setVisible(true)
      }, showDelay)
    } else {
      setVisible(true)
    }
  }, [setVisible])

  /** 隐藏 */
  const hide = useCallback(() => {
    const opts = optionsRef.current
    if (opts.disabled) return
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    const useDelay = opts.trigger === 'hover' || opts.trigger === 'focus'
    const hideDelay = useDelay ? (opts.delay?.hide ?? 0) : 0
    if (hideDelay > 0) {
      hideTimerRef.current = setTimeout(() => {
        hideTimerRef.current = null
        setVisible(false)
      }, hideDelay)
    } else {
      setVisible(false)
    }
  }, [setVisible])

  const toggle = useCallback(() => {
    if (optionsRef.current.visible) hide()
    else show()
  }, [show, hide])

  // —— 事件处理器，按 trigger 取舍；受控模式下全部不响应（由外部控制显隐） ——

  const onTriggerMouseenter = useCallback(() => {
    const opts = optionsRef.current
    if (opts.isControlled || opts.trigger !== 'hover') return
    show()
  }, [show])

  const onTriggerMouseleave = useCallback(() => {
    const opts = optionsRef.current
    if (opts.isControlled || opts.trigger !== 'hover') return
    hide()
  }, [hide])

  const onTriggerClick = useCallback(() => {
    const opts = optionsRef.current
    if (opts.isControlled || opts.trigger !== 'click') return
    toggle()
  }, [toggle])

  const onTriggerFocusin = useCallback(() => {
    // hover 模式下键盘焦点进入同样展示（无障碍）；click 模式不响应焦点
    const opts = optionsRef.current
    if (opts.isControlled || (opts.trigger !== 'focus' && opts.trigger !== 'hover')) return
    show()
  }, [show])

  const onTriggerFocusout = useCallback(() => {
    const opts = optionsRef.current
    if (opts.isControlled || (opts.trigger !== 'focus' && opts.trigger !== 'hover')) return
    hide()
  }, [hide])

  const onTriggerContextmenu = useCallback(
    (e: MouseEvent) => {
      const opts = optionsRef.current
      if (opts.isControlled || opts.trigger !== 'contextmenu') return
      e.preventDefault()
      toggle()
    },
    [toggle],
  )

  // 卸载时清理未触发的定时器
  useEffect(() => clearTimers, [clearTimers])

  return {
    show,
    hide,
    toggle,
    onTriggerMouseenter,
    onTriggerMouseleave,
    onTriggerClick,
    onTriggerFocusin,
    onTriggerFocusout,
    onTriggerContextmenu,
  }
}
