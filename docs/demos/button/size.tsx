import { LhButton, useLhLocale } from '@lh-ui/react'

export default function ButtonSize() {
  const { t } = useLhLocale()

  return (
    <div className="demo-col" style={{ width: '100%' }}>
      <div className="demo-row">
        <LhButton size="large">{t('docs.button.large')}</LhButton>
        <LhButton>{t('docs.button.default')}</LhButton>
        <LhButton size="small">{t('docs.button.small')}</LhButton>
      </div>
      <div className="demo-row">
        <LhButton type="primary" loading>
          {t('docs.button.loading')}
        </LhButton>
        <LhButton type="primary" disabled>
          {t('docs.button.disabled')}
        </LhButton>
        <LhButton type="primary" icon="search">
          {t('docs.button.icon')}
        </LhButton>
        <LhButton type="primary" round>
          {t('docs.button.round')}
        </LhButton>
        <LhButton type="primary" plain>
          {t('docs.button.plain')}
        </LhButton>
      </div>
    </div>
  )
}
