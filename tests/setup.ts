import '@testing-library/jest-dom/vitest'

/**
 * jsdom 不提供 requestAnimationFrame / cancelAnimationFrame，
 * useTransition 的双 rAF 相位推进依赖它们，补一个同步 polyfill。
 * 生产环境（浏览器）不会走到这里。
 */
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) =>
    setTimeout(() => cb(Date.now()), 16) as unknown as number
  globalThis.cancelAnimationFrame = (handle: number) =>
    clearTimeout(handle as unknown as ReturnType<typeof setTimeout>)
}

/**
 * jsdom 的 getBoundingClientRect 一律返回 0（无布局），
 * useLhPopper 的几何计算在此环境下退化为定位到视口原点，
 * 弹层测试只断言「渲染与交互」，不断言具体坐标。
 */
