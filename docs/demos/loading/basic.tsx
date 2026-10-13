import { useState } from 'react'
import { loading, notification, LhButton, useLhLocale } from '@lh-ui/react'

export default function LoadingBasic() {
  const [busy, setBusy] = useState(false)
  const { t } = useLhLocale()

  const showFullscreen = () => {
    const handle = loading.show({ text: t('docs.loading.fullscreenText') })
    setTimeout(() => handle.close(), 1500)
  }

  const showLocal = () => {
    setBusy(true)
    const handle = loading.show({ target: 'loading-demo-card', text: t('docs.loading.localText') })
    setTimeout(() => {
      handle.close()
      setBusy(false)
      notification.success({
        title: t('docs.loading.doneTitle'),
        content: t('docs.loading.doneContent'),
      })
    }, 1500)
  }

  return (
    <div className="demo-column">
      <div className="demo-row">
        <LhButton onClick={showFullscreen}>{t('docs.loading.fullscreenBtn')}</LhButton>
        <LhButton onClick={showLocal} disabled={busy}>
          {t('docs.loading.localBtn')}
        </LhButton>
      </div>
      <div
        id="loading-demo-card"
        style={{
          position: 'relative',
          width: 320,
          height: 120,
          padding: 16,
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 8,
        }}
      >
        <p style={{ margin: 0 }}>{t('docs.loading.cardText1')}</p>
        <p style={{ margin: '8px 0 0', color: 'var(--ifm-color-emphasis-600)' }}>
          {t('docs.loading.cardText2')}
        </p>
      </div>
    </div>
  )
}
