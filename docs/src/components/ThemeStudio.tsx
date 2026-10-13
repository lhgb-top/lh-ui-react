/**
 * 主题定制台（docs 站交互组件，移植自 lh-ui-plus 的 ThemeStudio.vue）
 *
 * 预设选择 → 分组逐令牌编辑 → 预览区实时生效（含明 / 暗切换）→ 导出一份 scss：
 *   @use '@lh-ui/share/styles/index.scss'; + :root 令牌块 + 暗色适配块。
 *
 * 预览采用「局部 CSS 变量注入」（style 写在预览容器 div 上，与 ConfigProvider
 * 同机制），**不写 documentElement 内联 style**——内联特异性 1,0,0,0 高于一切
 * 样式表，会压过 var-dark.scss 的整段暗色变量；导出文本由 buildPresetStyleText
 * 生成，暗色块与 share 预设机制完全一致，故「预览看到的」和「导出文件里的」同源。
 *
 * 明 / 暗切换：预览容器加 data-theme="dark"，share var-dark.scss 的
 * [data-theme='dark'] 选择器在任意元素上生效，配合 buildPresetDarkVars 的令牌覆盖。
 *
 * 双语文案走本库自己的 useLhLocale（docs.studio.* 命名空间，见 src/locale/），
 * 与 demo 文案同一套机制；令牌组 / 令牌标签的双语（label / labelEn）随组件常量携带。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import {
  LhButton,
  LhTag,
  LhInput,
  LhSwitch,
  LhCheckbox,
  useLhLocale,
} from '@lh-ui/react'
import {
  LH_THEME_PRESETS,
  buildPresetDarkVars,
  buildPresetStyleText,
} from '@lh-ui/share/theme'
import type { LhThemePresetName } from '@lh-ui/share/theme'
import styles from './ThemeStudio.module.css'

interface TokenField {
  key: string
  label: string
  labelEn: string
  /** 空值表示跟随默认链路（如 selected-color → primary-color-active） */
  optional?: boolean
}

interface TokenGroup {
  title: string
  titleEn: string
  tokens: TokenField[]
}

/** 令牌默认值（styles/theme/common/var.scss 的青花瓷明色基线） */
const DEFAULTS: Record<string, string> = {
  '--lh-primary-color': '#2B4C7C',
  '--lh-primary-color-hover': '#3D649E',
  '--lh-primary-color-active': '#1F3A5F',
  '--lh-primary-color-bg': '#E8EDF3',
  '--lh-primary-color-border': '#D4DCE8',
  '--lh-color-on-primary': '#FFFFFF',
  '--lh-selected-color': '',
  '--lh-success-color': '#5B8C5A',
  '--lh-warning-color': '#C4A35A',
  '--lh-danger-color': '#B23A3A',
  '--lh-info-color': '#7A7A7A',
  '--lh-text-primary': '#2C2C2C',
  '--lh-text-regular': '#5A5A5A',
  '--lh-text-secondary': '#8A8A8A',
  '--lh-bg-color': '#FAF6F0',
  '--lh-bg-color-page': '#F5F0EB',
  '--lh-border-color-base': '#D8D3CC',
  '--lh-border-color-light': '#E5E0D8',
}

const GROUPS: TokenGroup[] = [
  {
    title: '主色',
    titleEn: 'Primary',
    tokens: [
      { key: '--lh-primary-color', label: '主色', labelEn: 'Primary' },
      { key: '--lh-primary-color-hover', label: '悬停', labelEn: 'Hover' },
      { key: '--lh-primary-color-active', label: '按压', labelEn: 'Active' },
      { key: '--lh-primary-color-bg', label: '主色底', labelEn: 'Primary bg' },
      { key: '--lh-primary-color-border', label: '主色边框', labelEn: 'Primary border' },
    ],
  },
  {
    title: '主色衍生',
    titleEn: 'Primary-derived',
    tokens: [
      { key: '--lh-color-on-primary', label: '主色底文字', labelEn: 'Text on primary' },
      {
        key: '--lh-selected-color',
        label: '选中态文字',
        labelEn: 'Selected text',
        optional: true,
      },
    ],
  },
  {
    title: '功能色',
    titleEn: 'Functional',
    tokens: [
      { key: '--lh-success-color', label: '成功', labelEn: 'Success' },
      { key: '--lh-warning-color', label: '警告', labelEn: 'Warning' },
      { key: '--lh-danger-color', label: '危险', labelEn: 'Danger' },
      { key: '--lh-info-color', label: '信息', labelEn: 'Info' },
    ],
  },
  {
    title: '文本',
    titleEn: 'Text',
    tokens: [
      { key: '--lh-text-primary', label: '主要文字', labelEn: 'Primary text' },
      { key: '--lh-text-regular', label: '常规文字', labelEn: 'Regular text' },
      { key: '--lh-text-secondary', label: '次要文字', labelEn: 'Secondary text' },
    ],
  },
  {
    title: '背景',
    titleEn: 'Background',
    tokens: [
      { key: '--lh-bg-color', label: '容器背景', labelEn: 'Container bg' },
      { key: '--lh-bg-color-page', label: '页面背景', labelEn: 'Page bg' },
    ],
  },
  {
    title: '边框',
    titleEn: 'Border',
    tokens: [
      { key: '--lh-border-color-base', label: '基础边框', labelEn: 'Base border' },
      { key: '--lh-border-color-light', label: '浅边框', labelEn: 'Light border' },
    ],
  },
]

const ALL_TOKENS = GROUPS.flatMap((g) => g.tokens.map((t) => t.key))
const HEX_RE = /^#[0-9a-fA-F]{6}$/
type PresetSelection = LhThemePresetName | 'custom'

/**
 * 颜色输入框的取值：只接受 hex（#rrggbb）。
 * 空串（可选令牌跟随默认链路）或键入的 color-mix() 等文本直接写进
 * <input type="color"> 会被浏览器拒绝并刷 "does not conform to the required
 * format" 警告，故统一回退到中性占位色；真实值仍由 vars 保存与导出。
 */
function colorInputValue(v: string | undefined): string {
  return HEX_RE.test(v ?? '') ? (v as string) : '#cccccc'
}

export default function ThemeStudio() {
  const { t, getLocale } = useLhLocale()
  const isEn = getLocale() === 'en-US'

  const [vars, setVars] = useState<Record<string, string>>(() => ({ ...DEFAULTS }))
  const [selectedPreset, setSelectedPreset] = useState<PresetSelection>('cerblue')
  const [isDark, setIsDark] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 挂载时用站点当前生效值初始化（站点可能已切到别的预设） */
  useEffect(() => {
    const next: Record<string, string> = { ...DEFAULTS }
    for (const token of ALL_TOKENS) {
      const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
      // 只采纳 hex：getComputedStyle 返回的是 var() 已代换的计算值，暗色下
      // --lh-primary-color-bg / --lh-selected-color 会是 color-mix(...) 文本，
      // 原样写进 <input type="color"> 会被浏览器拒绝。非 hex 的留给预览自身的暗色块。
      if (HEX_RE.test(value)) next[token] = value
    }
    setVars(next)

    // 令牌采集后反查命中的预设，下拉框才和站点当前预设同步。
    // 站点暗色下 buildPresetStyleText 的暗色块会把部分令牌覆盖成 color-mix(...)
    // （深主色预设连主色本身都被提亮），这些令牌采集不进 vars，也没有可比的 hex 文本，
    // 所以期望值要走一遍同样的暗色适配，且只比较两边都能以 hex 观测到的令牌。
    const siteDark =
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark'
    const isHex = (v: unknown): boolean => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)
    const matched = LH_THEME_PRESETS.find((preset) => {
      const expected = siteDark ? { ...preset.vars, ...buildPresetDarkVars(preset.vars) } : preset.vars
      return Object.keys(preset.vars).every((key) => {
        const current = next[key]
        const want = expected[key]
        if (!isHex(current) || !isHex(want)) return true
        return current.toLowerCase() === want.toLowerCase()
      })
    })
    setSelectedPreset(matched ? matched.name : 'custom')
  }, [])

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current)
    }
  }, [])

  const applyPreset = (name: LhThemePresetName) => {
    setSelectedPreset(name)
    const preset = LH_THEME_PRESETS.find((p) => p.name === name)
    if (!preset) return
    // 预设只覆盖它声明的令牌，其余保持站点当前值
    setVars((prev) => ({ ...prev, ...preset.vars }))
  }

  const onPresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    applyPreset(e.target.value as LhThemePresetName)
  }

  const onColorInput = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    setVars((prev) => ({ ...prev, [key]: e.target.value }))
    setSelectedPreset('custom')
  }

  const onHexInput = (key: string, e: ChangeEvent<HTMLInputElement>) => {
    setVars((prev) => ({ ...prev, [key]: e.target.value }))
    setSelectedPreset('custom')
  }

  const resetAll = () => {
    setVars({ ...DEFAULTS })
    setSelectedPreset('cerblue')
  }

  /** 导出用的非空令牌集 */
  const exportVars = useMemo(() => {
    const out: Record<string, string> = {}
    for (const [key, value] of Object.entries(vars)) {
      if (value.trim()) out[key] = value.trim()
    }
    return out
  }, [vars])

  /**
   * 预览容器的局部令牌注入；暗色块与导出文本同源（都走 buildPresetDarkVars），
   * 保证「预览区看到的」和「导出文件里的」完全一致
   */
  const previewStyle = useMemo(() => {
    const style: Record<string, string> = { ...exportVars }
    if (isDark) Object.assign(style, buildPresetDarkVars(exportVars))
    return style
  }, [exportVars, isDark])

  const scssText = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10)
    return `/* lh-ui 自定义主题 —— 由主题定制台生成（${date}）
 * 令牌定义见 @lh-ui/share/styles/theme/common/var.scss；暗色块与预设机制同源
 *（浅主色下 --lh-color-on-primary / --lh-selected-color 需显式声明，否则白字不达 AA） */
@use '@lh-ui/share/styles/index.scss';

${buildPresetStyleText(exportVars)}
`
  }, [exportVars])

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(scssText)
      setCopied(true)
      if (copyTimer.current) clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      // 回退：选中文本域内容
      const ta = document.querySelector<HTMLTextAreaElement>('#theme-studio-export-code')
      ta?.select()
      document.execCommand('copy')
    }
  }

  const downloadExport = () => {
    const blob = new Blob([scssText], { type: 'text/scss;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lh-theme.scss'
    a.click()
    URL.revokeObjectURL(url)
  }

  const tField = (token: TokenField) => (isEn ? token.labelEn : token.label)
  const tGroup = (g: TokenGroup) => (isEn ? g.titleEn : g.title)

  return (
    <div className={styles.studio}>
      <div className={styles.toolbar}>
        <label className={styles.field}>
          <span>{t('docs.studio.preset')}</span>
          <select className={styles.select} value={selectedPreset} onChange={onPresetChange}>
            {LH_THEME_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {isEn ? p.labelEn : p.label}（{p.name}）
              </option>
            ))}
            <option value="custom">{t('docs.studio.custom')}</option>
          </select>
        </label>
        <button type="button" className={styles.btn} onClick={resetAll}>
          {t('docs.studio.reset')}
        </button>
      </div>

      <div className={styles.panel}>
        {GROUPS.map((g) => (
          <div key={g.title} className={styles.group}>
            <div className={styles.groupTitle}>{tGroup(g)}</div>
            {g.tokens.map((token) => (
              <div key={token.key} className={styles.token}>
                <input
                  className={styles.color}
                  type="color"
                  value={colorInputValue(vars[token.key])}
                  disabled={!vars[token.key]}
                  aria-label={token.key}
                  onChange={(e) => onColorInput(token.key, e)}
                />
                <input
                  className={styles.hex}
                  value={vars[token.key]}
                  placeholder={token.optional ? t('docs.studio.followDefault') : token.key}
                  onChange={(e) => onHexInput(token.key, e)}
                />
                <span className={styles.tokenName}>{tField(token)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.previewHead}>
        <span>{t('docs.studio.preview')}</span>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnToggle} ${isDark ? styles.btnToggleDark : ''}`}
          onClick={() => setIsDark((prev) => !prev)}
        >
          {isDark ? '🌙 ' + t('docs.studio.dark') : '☀️ ' + t('docs.studio.light')}
        </button>
      </div>
      <div
        className={styles.preview}
        data-theme={isDark ? 'dark' : undefined}
        style={previewStyle as CSSProperties}
      >
        <LhButton type="primary">{t('docs.button.primary')}</LhButton>
        <LhButton>{t('docs.button.default')}</LhButton>
        <LhButton type="success">{t('docs.button.success')}</LhButton>
        <LhButton type="warning">{t('docs.button.warning')}</LhButton>
        <LhButton type="danger">{t('docs.button.danger')}</LhButton>
        <LhTag type="primary">{t('docs.tag.primary')}</LhTag>
        <LhTag type="success">{t('docs.tag.success')}</LhTag>
        <LhTag type="danger">{t('docs.tag.danger')}</LhTag>
        <LhInput placeholder={t('docs.input.controlledPlaceholder')} style={{ width: 180 }} />
        <LhSwitch defaultChecked />
        <LhCheckbox defaultChecked>{t('docs.checkbox.checked')}</LhCheckbox>
        <p className={styles.sampleText}>
          <strong>{t('docs.studio.samplePrimary')}</strong>
          {'·'}
          {t('docs.studio.sampleRegular')}
          {'·'}
          <span className={styles.secondary}>{t('docs.studio.sampleSecondary')}</span>
        </p>
      </div>
      <p className={styles.hint}>{t('docs.studio.hint')}</p>

      <div className={styles.exportHead}>{t('docs.studio.exportTitle')}</div>
      <div className={styles.export}>
        <div className={styles.exportActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={copyExport}
          >
            {copied ? t('docs.studio.copied') : t('docs.studio.copy')}
          </button>
          <button type="button" className={styles.btn} onClick={downloadExport}>
            {t('docs.studio.download')}
          </button>
        </div>
        <textarea
          id="theme-studio-export-code"
          className={styles.exportCode}
          value={scssText}
          readOnly
          rows={10}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
