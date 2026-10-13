/**
 * Navbar 主题预设切换器（Docusaurus 自定义 navbar item）
 *
 * 文件名即 navbar items 里的 type（docusaurus.config.ts 的 `{ type: 'PresetThemeSwitcher' }`）。
 *
 * - storageKey 与 docusaurus.config.ts 的 PRESET_FOUC_SCRIPT 共用 'lh-docs-preset'：
 *   防闪烁脚本在首屏绘制前已按 localStorage 的值注入 <style id="lh-preset-theme">，
 *   切换器再写同一个键，刷新后预设不闪回默认色。
 * - 标签文本读 useLhLocale 的当前语言（订阅 version，站点切语言即时更新）；
 *   localStorage 只能在浏览器读，label 用 mounted 门控，避免 hydration 不匹配。
 * - 色点用 var(--lh-primary-color)，FOUC 脚本已注入该变量，SSR HTML 里就有正确颜色。
 */
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLhLocale, useLhPresetTheme } from '@lh-ui/react'
import type { LhThemePresetName } from '@lh-ui/share/theme'
import styles from './PresetThemeSwitcher.module.css'

interface PresetThemeSwitcherProps {
  /** Docusaurus 移动端视图传入（桌面 / 移动复用同一组件） */
  mobile?: boolean
  className?: string
}

export default function PresetThemeSwitcher({ mobile, className }: PresetThemeSwitcherProps) {
  const { preset, setPreset, presets } = useLhPresetTheme({ storageKey: 'lh-docs-preset' })
  // useLhLocale 内部 useSyncExternalStore 订阅 version，语言变更即触发本组件重渲染
  const { getLocale } = useLhLocale()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 点击外部收起
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const isEn = getLocale() === 'en-US'
  const current = presets.find((p) => p.name === preset)
  // mounted 前用中性占位，SSR 与首次客户端渲染一致；mounted 后出真实标签
  const currentLabel = mounted ? (isEn ? current?.labelEn : current?.label) : ''

  const handleSelect = (name: LhThemePresetName) => {
    setPreset(name)
    setOpen(false)
  }

  return (
    <div
      ref={wrapperRef}
      className={[styles.wrapper, mobile ? styles.mobile : '', className ?? ''].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.swatch} aria-hidden="true" />
        <span className={styles.label}>{currentLabel}</span>
        <svg
          className={styles.caret}
          viewBox="0 0 24 24"
          width="10"
          height="10"
          aria-hidden="true"
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <ul className={styles.menu} role="listbox" aria-label="Theme presets">
          {presets.map((p) => {
            const selected = p.name === preset
            return (
              <li key={p.name} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={[styles.option, selected ? styles.optionActive : ''].filter(Boolean).join(' ')}
                  onClick={() => handleSelect(p.name)}
                >
                  <span
                    className={styles.optionSwatch}
                    style={{ backgroundColor: p.vars['--lh-primary-color'] } as CSSProperties}
                    aria-hidden="true"
                  />
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>{isEn ? p.labelEn : p.label}</span>
                    <span className={styles.optionDesc}>{isEn ? p.labelEn : p.name}</span>
                  </span>
                  {selected && (
                    <svg className={styles.check} viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                      <path
                        d="M5 13l4 4L19 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
