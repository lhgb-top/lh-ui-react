/**
 * React 语言适配层
 *
 * share 的 `@lh-ui/share/locales` 导出的是纯事件发射器单例（框架无关，
 * 无任何响应式）；本文件把它包成 React 可用的响应式 hook：
 * `useLhLocale()` 内部用 useSyncExternalStore 订阅 version，语言变更触发重渲染。
 *
 * 其余方法直接转发给 share 单例（t / tm 是箭头函数属性，this 已绑定，可直接解构）。
 *
 * @example
 * ```tsx
 * const { t, getLocale } = useLhLocale()
 * return <input placeholder={t('input.placeholder')} />
 * ```
 */
import { useSyncExternalStore } from 'react'
import {
  lhlocale as sharedLocale,
  zhCN,
  enUS,
  type LhLocaleType,
  type LhLocaleMessages,
  type LhLocalePath as LhLocalePath,
  type LhTranslate,
  type LhTranslateArray,
} from '@lh-ui/share/locales'

export interface UseLhLocaleReturn {
  /** 版本号：任何语言变更都会自增，订阅它的组件重渲染 */
  version: number
  /** 翻译文案（箭头函数属性，this 已绑定，可直接解构） */
  t: LhTranslate
  /** 取数组文案（月份名 / 星期名等） */
  tm: LhTranslateArray
  /** 当前语言 */
  getLocale: () => LhLocaleType
}

export function useLhLocale(): UseLhLocaleReturn {
  const version = useSyncExternalStore(
    // subscribe 是类方法，裸引用会丢失 this，必须包一层保留单例绑定
    (listener) => sharedLocale.subscribe(listener),
    () => sharedLocale.version,
    () => sharedLocale.version, // SSR 快照：服务端与客户端首次渲染必须一致
  )

  return {
    version,
    t: sharedLocale.t,
    tm: sharedLocale.tm,
    // getLocale 是类方法，裸引用会丢失 this，包一层保留单例绑定
    getLocale: () => sharedLocale.getLocale(),
  }
}

/**
 * 命令式语言单例：组件外或事件处理器内直接调用
 *
 * 注意：render 期不得调用（会改全局状态，违反 render 纯净纪律）；
 * 需要响应式文案时用 useLhLocale() 的 t / tm。
 */
export { sharedLocale as lhlocale }

export { zhCN, enUS }
export type { LhLocaleType, LhLocaleMessages, LhLocalePath, LhTranslate, LhTranslateArray }
